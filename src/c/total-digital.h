#pragma once
#include <pebble.h>

#define SETTINGS_KEY 1

// A structure containing our settings
typedef struct ClaySettings {
    GColor background_color;
    GColor hour_one_color;
    GColor hour_two_color;
    GColor colon_one_color;
    GColor minute_one_color;
    GColor minute_two_color;
    GColor colon_two_color;
    GColor second_one_color;
    GColor second_two_color;
    int width;
    int height;
    int stroke;
    int diagonal;
    int spacing;
    int gap;
    int xborder;
    int yborder;
    char xjustify;
    char yjustify;
    bool xsquish;
    bool ysquish;
    bool seconds;
    bool six_tail;
    bool seven_tail;
    bool nine_tail;
} __attribute__((__packed__)) ClaySettings;

static bool ILLUMINATION_TABLE[10][7];
static GPathInfo COLON_CELL;
static GPathInfo VERTICAL_CELL;
static GPathInfo HORIZONTAL_CELL;

static void default_settings(void);
static void load_settings(void);
static void save_settings(void);
static void inbox_received_handler(DictionaryIterator *iter, void *context);

static void populate_illumination_table(void);
static void generate_colon_cell(void);
static GPathInfo generate_cell(int width, int height, int diagonal);

static void draw_cell(GContext *ctx, bool active, GPoint origin, const GPathInfo *path_info, GColor color);
static void draw_digit(GContext *ctx, int digit, GPoint number_origin, int stroke, int width, int height, int diagonal, int spacing, GColor color);
static void draw_colon(GContext *ctx, GPoint colon_origin, int stroke, int height, int diagonal, int spacing, GColor color);
static int number_width(int val, int stroke, int width, int diagonal, int spacing);
static int number_height(int stroke, int height, int diagonal, int spacing);
static int colon_width(int stroke);
static void watchface_update(Layer *layer, GContext *ctx);

static void handle_tick(struct tm *tick_time, TimeUnits units_changed);
static void window_load(Window *window);
static void window_unload(Window *window);
static void init(void);
static void deinit(void);
