// ==============================================================
// NeoPixel Extension for Arduino WebSocket
// Matches Adafruit NeoPixel Library API with Event System
// Works with UNO R4 WiFi and ESP32
// Version v0.12
// by Scott Mitchell
// GPL-3.0 License
// ==============================================================

// -------------------------------------------------------------------
// Extension ID and Actions (unchanged)
// -------------------------------------------------------------------
const NEO_PIXEL = 200;
const NEO_INIT       = 10;
const NEO_SET_PIXEL  = 11;
const NEO_FILL       = 12;
const NEO_CLEAR      = 13;
const NEO_BRIGHTNESS = 14;
const NEO_SHOW       = 15;

// -------------------------------------------------------------------
// NeoPixel pixel types (match Adafruit_NeoPixel.h)
// -------------------------------------------------------------------
const NEO_RGB   = 0x06;
const NEO_RBG   = 0x09;
const NEO_GRB   = 0x52;
const NEO_GBR   = 0xA1;
const NEO_BRG   = 0x58;
const NEO_BGR   = 0xA4;

const NEO_KHZ800 = 0x0000;
const NEO_KHZ400 = 0x0100;

class NeoPixel {
    constructor(arduino) {
        this.arduino = arduino;
        this.deviceId = NEO_PIXEL;
        this.name = "neoPixel";

        // State tracking for change detection
        this.pixelBuffer = new Map();
        this.currentBrightness = 255;
        this.numPixels = 0;

        // Default threshold for change detection
        this.defaultThreshold = 5;   // 5-unit color change threshold
    }

    // ===================================================================
    // CORE ADAFRUIT NEOPIXEL API (matches Arduino library exactly)
    // ===================================================================

    // Initialize strip - matches Adafruit_NeoPixel constructor + begin()
    init(pin, numPixels, type = NEO_GRB + NEO_KHZ800) {
        this.numPixels = numPixels;
        this.pixelBuffer.clear();

        this.arduino.send({
            id: this.deviceId,
            action: NEO_INIT,
            params: [pin, numPixels, type]
        });
        return this;
    }

    // Helper to convert RGB to 24-bit integer (matches strip.Color())
    Color(r, g, b, w = 0) {
        return ((w & 0xFF) << 24) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }

    // Set a single pixel color - matches strip.setPixelColor()
    setPixelColor(index, r_or_color, g, b, w) {
        let r, g_val, b_val, w_val = 0;

        if (arguments.length === 2) {
            // setPixelColor(index, color) - 24/32-bit color
            const color = r_or_color >>> 0;
            w_val = (color >> 24) & 0xFF;
            r = (color >> 16) & 0xFF;
            g_val = (color >> 8) & 0xFF;
            b_val = color & 0xFF;
        } else if (arguments.length >= 4) {
            // setPixelColor(index, r, g, b [, w])
            r = r_or_color;
            g_val = g;
            b_val = b;
            w_val = w || 0;
        } else {
            throw new Error("Invalid arguments for setPixelColor");
        }

        // Ensure all values are integers
        r = Math.round(r);
        g_val = Math.round(g_val);
        b_val = Math.round(b_val);
        w_val = Math.round(w_val);

        // Check for significant change
        const lastColor = this.pixelBuffer.get(index) || { r: 0, g: 0, b: 0, w: 0 };
        const colorDiff = Math.sqrt(
            Math.pow(r - lastColor.r, 2) +
            Math.pow(g_val - lastColor.g, 2) +
            Math.pow(b_val - lastColor.b, 2) +
            Math.pow(w_val - lastColor.w, 2)
        );

        // Only send if color changed significantly
        if (colorDiff > this.defaultThreshold) {
            const params = w_val > 0 ?
                [index, r, g_val, b_val, w_val] :
                [index, r, g_val, b_val];

            this.arduino.send({
                id: this.deviceId,
                action: NEO_SET_PIXEL,
                params: params
            });

            this.pixelBuffer.set(index, { r, g: g_val, b: b_val, w: w_val });
        }

        return this;
    }

    // Fill range of pixels - matches strip.fill()
    fill(color, first = 0, count = 0) {
        this.arduino.send({
            id: this.deviceId,
            action: NEO_FILL,
            params: [Math.round(color), Math.round(first), Math.round(count)]
        });

        // Update local buffer for change detection
        const startPixel = Math.round(first);
        const numToFill = Math.round(count) || (this.numPixels - startPixel);
        const { r, g, b, w } = this.colorToRGBW(color);

        for (let i = startPixel; i < startPixel + numToFill && i < this.numPixels; i++) {
            this.pixelBuffer.set(i, { r, g, b, w });
        }

        return this;
    }

    // Clear all pixels - matches strip.clear()
    clear() {
        this.arduino.send({
            id: this.deviceId,
            action: NEO_CLEAR,
            params: []
        });

        // Update local buffer
        this.pixelBuffer.clear();
        for (let i = 0; i < this.numPixels; i++) {
            this.pixelBuffer.set(i, { r: 0, g: 0, b: 0, w: 0 });
        }

        return this;
    }

    // Set global brightness - matches strip.setBrightness()
    setBrightness(value) {
        const intValue = Math.round(value);

        // Only send if brightness changed significantly
        if (Math.abs(intValue - this.currentBrightness) >= this.defaultThreshold) {
            this.arduino.send({
                id: this.deviceId,
                action: NEO_BRIGHTNESS,
                params: [intValue]
            });
            this.currentBrightness = intValue;
        }

        return this;
    }

    // Push buffer to LEDs - matches strip.show()
    show() {
        this.arduino.send({
            id: this.deviceId,
            action: NEO_SHOW,
            params: []
        });
        return this;
    }

    // ===================================================================
    // ADDITIONAL ADAFRUIT-STYLE METHODS
    // ===================================================================

    // Get pixel color from buffer (like strip.getPixelColor() but local)
    getPixelColor(index) {
        if (index < 0 || index >= this.numPixels) return 0;
        const pixel = this.pixelBuffer.get(index) || { r: 0, g: 0, b: 0, w: 0 };
        return this.Color(pixel.r, pixel.g, pixel.b, pixel.w);
    }

    // Get number of pixels (like strip.numPixels())
    numPixels() {
        return this.numPixels;
    }

    // ===================================================================
    // CONFIGURATION & UTILITY METHODS
    // ===================================================================

    // Configure change detection sensitivity
    setThreshold(threshold) {
        this.defaultThreshold = Math.round(threshold);
        return this;
    }

    // Helper method to convert 32-bit color to RGBW components
    colorToRGBW(color) {
        return {
            w: (color >> 24) & 0xFF,
            r: (color >> 16) & 0xFF,
            g: (color >> 8) & 0xFF,
            b: color & 0xFF
        };
    }
}

// ===================================================================
// EXAMPLE USAGE (matches Adafruit NeoPixel patterns)
// ===================================================================

/*
// Standard Adafruit NeoPixel usage pattern:
const arduino = new Arduino();
arduino.connect('ws://192.168.1.100:81');
arduino.attach('neo', new NeoPixel(arduino));

// Initialize (like in Arduino setup())
arduino.neo.init(6, 16);           // pin 6, 16 pixels
arduino.neo.setBrightness(100);    // Set brightness
arduino.neo.clear();               // Clear strip
arduino.neo.show();                // Display

// Set individual pixels (like in Arduino loop())
arduino.neo.setPixelColor(0, arduino.neo.Color(255, 0, 0));  // Red
arduino.neo.setPixelColor(1, arduino.neo.Color(0, 255, 0));  // Green
arduino.neo.setPixelColor(2, arduino.neo.Color(0, 0, 255));  // Blue
arduino.neo.show();

// Fill range
let red = arduino.neo.Color(255, 0, 0);
arduino.neo.fill(red, 0, 8);       // Fill first 8 pixels red
arduino.neo.show();

// Rainbow pattern (classic Adafruit example)
function rainbow(wait) {
    for (let j = 0; j < 256; j++) {
        for (let i = 0; i < arduino.neo.numPixels; i++) {
            arduino.neo.setPixelColor(i, wheel((i + j) & 255));
        }
        arduino.neo.show();
        // In p5.js you'd use setTimeout or handle timing in draw()
    }
}

function wheel(pos) {
    if (pos < 85) {
        return arduino.neo.Color(pos * 3, 255 - pos * 3, 0);
    } else if (pos < 170) {
        pos -= 85;
        return arduino.neo.Color(255 - pos * 3, 0, pos * 3);
    } else {
        pos -= 170;
        return arduino.neo.Color(0, pos * 3, 255 - pos * 3);
    }
}
*/