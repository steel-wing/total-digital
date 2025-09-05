#include <pebble.h>
#include <math.h>
#include "total-digital.h"

// important variables for below
static Window *window;
static Layer *watchface_layer;

// struct for holding the values of our settings
ClaySettings settings;

// the original values
static void default_settings() {
    settings.background_color = GColorBlack;
    settings.hour_one_color = GColorWhite;
    settings.hour_two_color = GColorWhite;
    settings.colon_one_color = GColorWhite;
    settings.minute_one_color = GColorCyan;
    settings.minute_two_color = GColorCyan;
    settings.colon_two_color = GColorLightGray;
    settings.second_one_color = GColorLightGray;
    settings.second_two_color = GColorLightGray;
    settings.width = 9;
    settings.height = 14;
    settings.stroke = 5;
    settings.diagonal = 2;
    settings.spacing = 1;
    settings.gap = 4;
    settings.xborder = 4;
    settings.yborder = 40;
    settings.xjustify = '1';
    settings.yjustify = '1';
    settings.xsquish = true;
    settings.ysquish = true;
    settings.seconds = false;
    settings.six_tail = true;
    settings.seven_tail = false;
    settings.nine_tail = true;
}

// read settings from storage
static void load_settings() {
    // load default settings
    default_settings();

    // if they exist, read settings from internal storage
    persist_read_data(SETTINGS_KEY, &settings, sizeof(settings));
}

// save settings to internal storage
static void save_settings() {
    // write the data over to internal storage
    persist_write_data(SETTINGS_KEY, &settings, sizeof(settings));
}

// a set of clever defines so we don't have to go crazy in the next function
// credit to https://github.com/sockeye-d/pebble-bezier
#define LOAD_INT(name)                                                           \
    Tuple *name = dict_find(iter, MESSAGE_KEY_##name);                           \
    if (name)                                                                    \
    settings.name = name->value->int32

#define LOAD_CHAR(name)                                                          \
    Tuple *name = dict_find(iter, MESSAGE_KEY_##name);                           \
    if (name && name->value->cstring && name->value->cstring[0] != '\0')         \
    settings.name = name->value->cstring[0]

#define LOAD_COLOR(name)                                                         \
    Tuple *name = dict_find(iter, MESSAGE_KEY_##name);                           \
    if (name)                                                                    \
    settings.name = GColorFromHEX(name->value->int32)

#define LOAD_BOOL(name)                                                          \
    Tuple *name = dict_find(iter, MESSAGE_KEY_##name);                           \
    if (name)                                                                    \
    settings.name = name->value->int32 == 1

// handle the settings sent from the phone
static void inbox_received_handler(DictionaryIterator *iter, void *context) {
    // load in the settings values
    LOAD_COLOR(background_color);
    LOAD_COLOR(hour_one_color);
    LOAD_COLOR(hour_two_color);
    LOAD_COLOR(colon_one_color);
    LOAD_COLOR(minute_one_color);
    LOAD_COLOR(minute_two_color);
    LOAD_COLOR(colon_two_color);
    LOAD_COLOR(second_one_color);
    LOAD_COLOR(second_two_color);
    LOAD_INT(width);
    LOAD_INT(height);
    LOAD_INT(stroke);
    LOAD_INT(diagonal);
    LOAD_INT(spacing);
    LOAD_INT(gap);
    LOAD_INT(xborder);
    LOAD_INT(yborder);
    LOAD_CHAR(xjustify);
    LOAD_CHAR(yjustify);
    LOAD_BOOL(xsquish);
    LOAD_BOOL(ysquish);
    LOAD_BOOL(seconds);
    LOAD_BOOL(six_tail);
    LOAD_BOOL(seven_tail);
    LOAD_BOOL(nine_tail);
    save_settings();

    // mark the layer as dirty so it gets refreshed immediately
    layer_mark_dirty(watchface_layer);
}

// update the illumination table based on user settings
static void populate_illumination_table(void) {
    bool template[10][7] = {
    //   a, b, c, d, e, f, g 
        {1, 1, 1, 1, 1, 1, 0},   // 0
        {0, 1, 1, 0, 0, 0, 0},   // 1          aaaa
        {1, 1, 0, 1, 1, 0, 1},   // 2         f    b
        {1, 1, 1, 1, 0, 0, 1},   // 3         f    b
        {0, 1, 1, 0, 0, 1, 1},   // 4          gggg
        {1, 0, 1, 1, 0, 1, 1},   // 5         e    c
        {1, 0, 1, 1, 1, 1, 1},   // 6         e    c
        {1, 1, 1, 0, 0, 0, 0},   // 7          dddd 
        {1, 1, 1, 1, 1, 1, 1},   // 8
        {1, 1, 1, 1, 0, 1, 1},   // 9
    };

    // copy template into ILLUMINATION_TABLE memory
    memcpy(ILLUMINATION_TABLE, template, sizeof(template));

    // manually correct individual values following settings
    ILLUMINATION_TABLE[6][0] = settings.six_tail;
    ILLUMINATION_TABLE[7][5] = settings.seven_tail;
    ILLUMINATION_TABLE[9][3] = settings.nine_tail;
}

// cheeky way to generate adaptive colon cells
static void generate_colon_cell(void) {
    COLON_CELL = generate_cell(settings.stroke, settings.stroke, settings.diagonal);
}

// builds an individual cell (horizontal default)
static GPathInfo generate_cell(int width, int height, int diagonal) {
    height--;
    width++;
    GPathInfo output;

    // special case where height is now 0 (1 was requested)
    if (height >= 0) {
        output = (GPathInfo){4, (GPoint []) {
            {1, 0},
            {width - 1, 0},
            {width - 1, 1},
            {1, 1}}};
    } else {
        output = (GPathInfo){8, (GPoint []) {
            {diagonal, 0},
            {width - diagonal, 0},
            {width, diagonal},
            {width, height - diagonal},
            {width - diagonal, height},
            {diagonal, height},
            {0, height - diagonal},
            {diagonal, 0}}};
    }

    return output;
}

// draws a single cell
static void draw_cell(GContext *ctx, bool active, GPoint origin, const GPathInfo *path_info, GColor color) {
    // only draw this if we should
    if (active) {
        // generate a path and orient it where we want it
        GPath *path = gpath_create(path_info);
        gpath_move_to(path, origin);

        // make the fill color black (we aren't doing a stroke here)
        graphics_context_set_fill_color(ctx, color);

        // actually draw the path with the points provided
        gpath_draw_filled(ctx, path);

        // destroy the path in memory to avoid leaks
        gpath_destroy(path);
    }
}

static void draw_digit(GContext *ctx, int digit, GPoint number_origin, int stroke, int width, int height, int diagonal, int spacing, GColor color) {
    // iterate across all 7 segments
    for (int segment = 0; segment < 7; segment++) {
        bool is_on = ILLUMINATION_TABLE[digit][segment];

        // make a copy so we don't ruin anything
        GPoint origin = number_origin;

        // handle diagonals reaching out of their cells
        if (stroke - diagonal + spacing < 0) {
	        origin.x += diagonal - stroke - spacing;
	        origin.y += diagonal - stroke - spacing;
	    }

        // go through each segment and draw it in the right location
        switch (segment) {
            case 0:  // 'a' (horizontal)
                origin.x += stroke - diagonal + spacing;
                draw_cell(ctx, is_on, origin, &HORIZONTAL_CELL, color);
                break;
            case 1:  // 'b' (vertical)
                origin.x += width + stroke + 2 * (spacing - diagonal);
                origin.y += stroke - diagonal + spacing;
                draw_cell(ctx, is_on, origin, &VERTICAL_CELL, color);
                break;
            case 2:  // 'c' (vertical)
                origin.x += width + stroke + 2 * (spacing - diagonal);
                origin.y += height + 2 * stroke + 3 * (spacing - diagonal);
                draw_cell(ctx, is_on, origin, &VERTICAL_CELL, color);
                break;
            case 3:  // 'd' (horizontal)
                origin.x += stroke - diagonal + spacing;
                origin.y += 2 * (height + stroke) + 4 * (spacing - diagonal);
                draw_cell(ctx, is_on, origin, &HORIZONTAL_CELL, color);
                break;
            case 4:  // 'e' (vertical)
                origin.y += height + 2 * stroke + 3 * (spacing - diagonal);
                draw_cell(ctx, is_on, origin, &VERTICAL_CELL, color);
                break;
            case 5:  // 'f' (vertical)
                origin.y += stroke - diagonal + spacing;
                draw_cell(ctx, is_on, origin, &VERTICAL_CELL, color);
                break;
            case 6:  // 'g' (horizontal)
                origin.x += stroke - diagonal + spacing;
                origin.y += height + stroke + 2 * (spacing - diagonal);
                draw_cell(ctx, is_on, origin, &HORIZONTAL_CELL, color);
                break;
        }
    }
}

static void draw_colon(GContext *ctx, GPoint colon_origin, int stroke, int height, int diagonal, int spacing, GColor color) {
    bool is_on = true;
    GPoint origin = colon_origin;

    // shift down and draw the colon
    origin.y += (height + stroke) / 2 - diagonal + spacing;
    draw_cell(ctx, is_on, origin, &COLON_CELL, color);
    origin.y += height + stroke + 2 * (spacing - diagonal);
    draw_cell(ctx, is_on, origin, &COLON_CELL, color);
}

// get the width of an individual number
static int number_width(int val, int stroke, int width, int diagonal, int spacing) {
    // crazy logic for handling weird cases beyond negatives
    int correction = 0;
    if (stroke - diagonal + spacing < 0) {
    correction = 2 * (diagonal - spacing - stroke);
    }

    // special cases for each of the numbers
    if (val == 3 || (val == 7 && !settings.seven_tail)) {
        return width + stroke + spacing - diagonal + correction;
    } else if (val == 1) {
        return stroke + correction;
    } else {
        return width + 2 * (spacing + stroke - diagonal) + correction;
    }
}

// get the height of our current numbers
static int number_height(int stroke, int height, int diagonal, int spacing) {
    // once again, handle odd cell geometry
    int correction =  0;
	if (stroke - diagonal + spacing < 0) {
	    correction = 2 * (diagonal - spacing - stroke);
	}
	
    // we don't want any special cases here, all numbers have the same height
    return 2 * height + 3 * stroke + 4 * (spacing - diagonal) + correction;
}

// just a formality
static int colon_width(int stroke) {
    return stroke;
}

// handle everything being drawn
static void watchface_update(Layer *layer, GContext *ctx) {
    // get current time
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    bool military = clock_is_24h_style();

    // get the right hour digits
    if (!military) {
        // 13:00 - 23:00 -> 1:00 - 11:00
        if (t->tm_hour > 12) {
            t->tm_hour -= 12;
        // 0:00 -> 12:00
        } else if (t->tm_hour == 0) {
            t->tm_hour += 12;
        }
    }
    
    // break it down
    int h1 = t->tm_hour / 10;
    int h2 = t->tm_hour % 10;
    int m1 = t->tm_min / 10;
    int m2 = t->tm_min % 10;
    int s1 = t->tm_sec / 10;
    int s2 = t->tm_sec % 10;
    
    // get screen dimensions (makes this reactive to alerts)
    GRect bounds = layer_get_unobstructed_bounds(layer);
    int width = bounds.size.w;
    int height = bounds.size.h;

    // set background color
    graphics_context_set_fill_color(ctx, settings.background_color);
    graphics_fill_rect(ctx, bounds, 0, GCornerNone);

    // get our initial, expected number sizes
    int first_w = number_width(h1, settings.stroke, settings.width, settings.diagonal, settings.spacing);
    int num_w = number_width(8, settings.stroke, settings.width, settings.diagonal, settings.spacing);
    int num_h = number_height(settings.stroke, settings.height, settings.diagonal, settings.spacing);
    int col_w = colon_width(settings.stroke);
    int exact_w = first_w + 2 * num_w + col_w + 3 * settings.gap;   // h:mm assumption

    // conditional repositionings
    if (military || h1 != 0) {
        exact_w += num_w + settings.gap;                                     // updated to hh:mm 
    } 
    
    if (settings.seconds) {
        exact_w += 2 * num_w + col_w + 3 * settings.gap;            // updated to x:mm:ss
    }

    // squish time in x direction
    if (settings.xsquish && (exact_w > width - 2 * settings.xborder)) {
        int remainder = exact_w - width + 2 * settings.xborder;

        // handle cases with different numbers of digits. Yes this is nasty but it works
        int cutback = 0;
        if (military || h1 != 0) {
            cutback = 4;
        } else if (!military && h1 == 0) {
            cutback = 3;
        } 
        
        if (h1 == 1) {
            cutback -= 1;
        } 
        
        if (settings.seconds) {
            cutback += 2;
        }

        // if a number is too wide, reduce the width of its horizontal cells
        settings.width -= ceil(remainder / cutback);

        // recalculate number values with this in mind
        first_w = number_width(h1, settings.stroke, settings.width, settings.diagonal, settings.spacing);
        num_w = number_width(8, settings.stroke, settings.width, settings.diagonal, settings.spacing);
        exact_w = first_w + 2 * num_w + col_w + 3 * settings.gap;   // h:mm assumption
        if (military || h1 != 0) {
            exact_w += num_w + settings.gap;                                     // updated to hh:mm 
        } 
        
        if (settings.seconds) {
            exact_w += 2 * num_w + col_w + 3 * settings.gap;            // updated to x:mm:ss
        }
    }

    // squish the time vertically if the numbers get too tall
    if (settings.ysquish && num_h > height - 2 * settings.yborder) {
        int overhead = num_h - height + 2 * settings.yborder;
        settings.height -= ceil(overhead / 2);
        num_h = number_height(settings.stroke, settings.height, settings.diagonal, settings.spacing);
    }

    // now that squishing is handled, we can actually set up to draw the time
    if (!military && h1 == 0) {
        exact_w += num_w + settings.gap;         // shift us to hh:mm from h:mm if that's the case
    }

    // shift pointers to where the number starts (favor top right corner in odd cases)
    int correction = num_w - first_w;   // handles 1, 3, 7 without tail
    int x = (width - exact_w) / 2 - correction + 1;
    int y = height / 2 - num_h / 2;

    // handle justification
    if (settings.xjustify == 0) {
        x = settings.xborder - correction + 1;
    } else if (settings.xjustify == 2) {
        x = width - exact_w - correction - settings.xborder + 1;
    }

    if (settings.yjustify == 0) {
        y = settings.yborder + 1;
    } else if (settings.yjustify == 2) {
        y = height - num_h - settings.yborder + 1;
    }

    // get preliminaries ready for drawing
    GPoint drawpoint = GPoint(x, y);
    generate_colon_cell();
    HORIZONTAL_CELL = generate_cell(12, 3, 1);
    VERTICAL_CELL = generate_cell(3, 12, 1);
    populate_illumination_table();

    // debug cell for now
    GPoint topleft = GPoint(0, 0);
    draw_cell(ctx, true, topleft, &HORIZONTAL_CELL, GColorWhite);

    // begin drawing the time 
    if (military || h1 != 0) {
        draw_digit(ctx, h1, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.hour_one_color);
        drawpoint.x += num_w + settings.gap;
        draw_digit(ctx, h2, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.hour_two_color);
    } else {
	    // shift over the missing first number
	    if (settings.xjustify == 1) {
	      drawpoint.x += (num_w + settings.gap) / 2;
	    } else if (settings.xjustify == 2){
	      drawpoint.x += num_w + settings.gap;
	    }
        draw_digit(ctx, h2, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.hour_two_color);
	}

    // draw colon and minutes
    drawpoint.x += num_w + settings.gap;
    draw_colon(ctx, drawpoint, settings.stroke, settings.height, settings.diagonal, settings.spacing, settings.colon_one_color);
    drawpoint.x += col_w + settings.gap;
    draw_digit(ctx, m1, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.minute_one_color);
    drawpoint.x += num_w + settings.gap;
    draw_digit(ctx, m2, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.minute_two_color);

    // handle seconds if requested
    if (settings.seconds) {
        drawpoint.x += num_w + settings.gap;
        draw_colon(ctx, drawpoint, settings.stroke, settings.height, settings.diagonal, settings.spacing, settings.colon_two_color);
        drawpoint.x += col_w + settings.gap;
        draw_digit(ctx, s1, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.second_one_color);
        drawpoint.x += num_w + settings.gap;
        draw_digit(ctx, s2, drawpoint, settings.stroke, settings.width, settings.height, settings.diagonal, settings.spacing, settings.second_two_color);
    }
}


// signals to redraw the screen after our time unit has passed
static void handle_tick(struct tm *tick_time, TimeUnits units_changed) {
    layer_mark_dirty(window_get_root_layer(window));
}

// window load function to initialize the watchface
void window_load(Window *window) {
    // get info for window size
    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_bounds(window_layer);

    // construct the layer and set up its update proceedures
    watchface_layer = layer_create(bounds);
    layer_set_update_proc(watchface_layer, watchface_update);
    layer_add_child(window_get_root_layer(window), watchface_layer);
}

// window unload function to clean up
void window_unload(Window *window) {
    layer_destroy(watchface_layer);
}

// init() to handle settings and setup
static void init(void) {
    // get our settings in
    load_settings();

    // handle getting the settings from the phone
    app_message_register_inbox_received(inbox_received_handler);
    app_message_open(dict_calc_buffer_size(12), 0);

    // construct window and get it into position
    window = window_create();
    window_set_window_handlers(window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload,
    });
    window_stack_push(window, true);

    // subscribe us to the service we want
    if(settings.seconds) {
        tick_timer_service_subscribe(SECOND_UNIT, handle_tick);
    } else {
        tick_timer_service_subscribe(MINUTE_UNIT, handle_tick);
    }
} 

// just destroys the window once its time
static void deinit() {
    if (window) {
        window_destroy(window);
    }
}

// gotta love best practice. how cute is this little guy
int main(void) {
    init();
    app_event_loop();
    deinit();
}