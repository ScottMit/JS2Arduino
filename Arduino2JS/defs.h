// ==============================================================
// defs.h
// Protocol IDs and Action Codes
// Version v0.13
// by Scott Mitchell
// GPL-3.0 License
// ==============================================================

#ifndef DEFS_H
#define DEFS_H

// -------------------------------------------------------------------
// Core Actions (1-99)
// -------------------------------------------------------------------
#define PIN_MODE       1
#define DIGITAL_WRITE  2
#define DIGITAL_READ   3
#define ANALOG_WRITE   4
#define ANALOG_READ    5
#define END            6    // Stop a registered action

// -------------------------------------------------------------------
// Pin Mode Constants
// -------------------------------------------------------------------
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define INPUT_PULLDOWN 3
#define OUTPUT_OPENDRAIN 4
#define ANALOG_INPUT 8
#define ANALOG_OUTPUT 10

// -------------------------------------------------------------------
// Digital Values
// -------------------------------------------------------------------
#define LOW 0
#define HIGH 1

// -------------------------------------------------------------------
// Extension Device IDs (200+)
// -------------------------------------------------------------------
#define RESERVED_START 200
#define NEO_PIXEL      200

// -------------------------------------------------------------------
// NeoPixel Extension Actions (10-19)
// -------------------------------------------------------------------
#define NEO_INIT          10     // Setup strip: params = [stripId, pin, numPixels, type]
#define NEO_SET_PIXEL     11     // Set single pixel: params = [stripId, index, r, g, b (, w)]
#define NEO_FILL          12     // Fill range: params = [stripId, color, first, count]
#define NEO_CLEAR         13     // Clear all pixels: params = [stripId]
#define NEO_BRIGHTNESS    14     // Set global brightness: params = [stripId, value]
#define NEO_SHOW          15     // Push buffer to LEDs: params = [stripId]

// -------------------------------------------------------------------
// Future Extension IDs
// -------------------------------------------------------------------
// #define SERVO_CONTROL  201
// #define LCD_DISPLAY    202
// #define SENSOR_HUB     203

#endif