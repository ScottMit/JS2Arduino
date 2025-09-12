// ==============================================================
// defs.h
// Core Protocol IDs and Action Codes
// ==============================================================

// -------------------------------------------------------------------
// Core Pin Modes (already defined in Arduino libraries)
// -------------------------------------------------------------------
// INPUT
// OUTPUT
// INPUT_PULLUP
// INPUT_PULLDOWN  // ESP / R4 support

// -------------------------------------------------------------------
// Core Digital/Analog Values (already defined)
// -------------------------------------------------------------------
// LOW
// HIGH

// -------------------------------------------------------------------
// Core Actions
// -------------------------------------------------------------------
#define PIN_MODE          1
#define DIGITAL_WRITE     2
#define DIGITAL_READ      3
#define ANALOG_WRITE      4
#define ANALOG_READ       5
#define END               6      // Stop a registered action

// -------------------------------------------------------------------
// Device ID Ranges
// -------------------------------------------------------------------
// Pin numbers 0-99 are reserved for direct Arduino pins
#define RESERVED_START    100    // Start of extension device IDs
#define RESERVED_END      199    // End of reserved range

// -------------------------------------------------------------------
// Extension Device IDs
// -------------------------------------------------------------------
#define NEO_PIXEL         200    // NeoPixel strips

// Future extension IDs:
// #define SERVO_CONTROLLER  201
// #define SENSOR_ARRAY      202
// #define LCD_DISPLAY       203

// -------------------------------------------------------------------
// Notes:
// - Pin numbers < 100 map directly to Arduino pins
// - Device IDs >= 200 are for extensions
// - Each extension defines its own action constants in its header file
// -------------------------------------------------------------------