#include <pebble.h>
#include "toal-digital.h"

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
    settings.xjustify = 'c';
    settings.yjustify = 'c';
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
#define LOAD_INT(name)                                                         \
  Tuple *name = dict_find(iter, MESSAGE_KEY_##name);                           \
  if (name)                                                                    \
  settings.name = name->value->int32

#define LOAD_COLOR(name)                                                       \
  Tuple *name = dict_find(iter, MESSAGE_KEY_##name);                           \
  if (name)                                                                    \
  settings.name = GColorFromHEX(name->value->int32)

#define LOAD_BOOL(name)                                                        \
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
    LOAD_INT(xjustify);
    LOAD_INT(yjustify);
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

// https://developer.rebble.io/developer.pebble.com/docs/c/Graphics/Drawing_Paths/index.html
// Definitely going to want to reference this one a ton


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


static void generate_colon_cell(void);


static void generate_vertical_cell(void);


static void generate_horizontal_cell(void);


static void draw_digit(GContext *ctx, GPoint origin, int stroke, int width, int height, int diagonal, int spacing, GColor color);


static int number_width(int val, int stroke, int width, int diagonal, int spacing);


static int number_height(int stroke, int height, int diagonal, int spacing);


static int colon_width(int stroke);


static void watchface_update(Layer *layer, GContext *ctx);


// signals to redraw the screen after a minute has occured
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
    if(setting.seconds) {
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