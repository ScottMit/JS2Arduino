#ifndef NEOPIXEL_EXTENSION_H
#define NEOPIXEL_EXTENSION_H

#include <Adafruit_NeoPixel.h>
// -------------------------------------------------------------------
// NeoPixel Extension Actions
// -------------------------------------------------------------------
#define NEO_INIT          10     // Setup strip: params = [pin, numPixels, type]
#define NEO_SET_PIXEL     11     // Set single pixel: params = [index, r, g, b (, w)]
#define NEO_FILL          12     // Fill range: params = [color, first, count]
#define NEO_CLEAR         13     // Clear all pixels
#define NEO_BRIGHTNESS    14     // Set global brightness: params = [value]
#define NEO_SHOW          15     // Push buffer to LEDs

class NeoPixelExt {
private:
    static Adafruit_NeoPixel* strip;
    static int neoPin;
    static int neoNum;
    
public:
    static void handle(int action, JsonArray& params) {
        switch (action) {
            case NEO_INIT:
            {
                // Clean up existing strip
                if (strip != nullptr) {
                    delete strip;
                    strip = nullptr;
                }
                
                // params: [pin, numPixels, type]
                neoPin = (int)params[0];
                neoNum = (int)params[1];
                int typeVal = (int)params[2];
                
                // Use standard constructor (like your working example)
                strip = new Adafruit_NeoPixel(neoNum, neoPin, typeVal);
                strip->begin();
                strip->clear();
                strip->show();
                break;
            }
            
            case NEO_SET_PIXEL:
            {
                if (!strip) return;
                int index = (int)params[0];
                if (index >= 0 && index < neoNum) {
                    strip->setPixelColor(index, strip->Color((int)params[1], (int)params[2], (int)params[3]));
                }
                break;
            }
            
            case NEO_FILL:
            {
                if (!strip) return;
                uint32_t color = (uint32_t)params[0];
                int first = (params.size() > 1) ? (int)params[1] : 0;
                int count = (params.size() > 2) ? (int)params[2] : 0;
                if (first >= neoNum) break;
                if (first < 0) first = 0;
                count = min(count, neoNum - first);
                if (count <= 0) count = neoNum - first;
                strip->fill(color, first, count);
                break;
            }
            
            case NEO_CLEAR:
            {
                if (!strip) return;
                strip->clear();
                break;
            }
            
            case NEO_BRIGHTNESS:
            {
                if (!strip) return;
                strip->setBrightness((int)params[0]);
                break;
            }
            
            case NEO_SHOW:
            {
                if (!strip) return;
                strip->show();
                break;
            }
        }
    }
};

// Static member definitions
Adafruit_NeoPixel* NeoPixelExt::strip = nullptr;
int NeoPixelExt::neoPin = -1;
int NeoPixelExt::neoNum = 0;

#endif