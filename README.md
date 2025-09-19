# JS2Arduino

Connect your Arduino to web interfaces and create interactive projects that bridge the digital and physical worlds. Perfect for design students, makers, and anyone wanting to prototype connected devices and interfaces.

## What is this?

This project lets you control Arduino hardware (like LEDs, sensors, and motors) directly from a web page in real-time. No complex networking code needed - just connect your Arduino to your WiFi network and start building interactive experiences.

**Perfect for:**
- Interactive art installations
- IoT prototypes
- Smart home experiments  
- Data visualization with physical feedback
- Learning how web interfaces connect to hardware
- Design course projects

## What You Can Build

- **Web dashboards** that display real sensor data
- **Interactive installations** controlled by web interfaces
- **Smart lighting** systems with web-based controls
- **Data visualizations** from live sensor streams
- **IoT prototypes** that respond to web inputs

## What You Need

### Hardware
- **Arduino UNO R4 WiFi** OR **ESP32 development board**
- **WiFi network** (your home/school network, your Arduino and Web browser must be one the same network)
- **Optional components:**
  - LED strips (NeoPixels/WS2812B)
  - Sensors (temperature, light, motion)
  - Regular LEDs and resistors
  - Potentiometers/knobs

### Software (all free)
- **Arduino IDE** - for programming your Arduino
- **Web browser** - Chrome, Firefox, Safari, etc.
- **Text editor** - VS Code, Atom, or even Notepad

## Quick Start (15 minutes)

### Step 1: Set Up Your Arduino

1. **Download this project** and unzip it
2. **Install Arduino IDE** from arduino.cc
3. **Install these libraries** in Arduino IDE (Tools → Manage Libraries):
   - WebSocketsServer
   - ArduinoJson
   - Adafruit_NeoPixel (if using LED strips)

4. **Open the Arduino sketch:**
   - Open `Arduino2JS.ino` in Arduino IDE

5. **Add your WiFi details:**
   - Edit the `secrets.h` file:
   ```cpp
   #define SECRET_SSID "YourWiFiName"
   #define SECRET_PASS "YourWiFiPassword"
   ```

6. **Upload to your Arduino:**
   - Connect Arduino via USB
   - Select your board type (UNO R4 WiFi or ESP32)
   - Click Upload

7. **Find your Arduino's IP address:**
   - **UNO R4:** Look at the LED matrix display
   - **ESP32:** Open Serial Monitor (Tools → Serial Monitor)

### Step 2: Set Up Your Web Interface

1. **Open the web folder:**
   - Navigate to `JS2Arduino` folder

2. **Edit the connection:**
   - Open `sketch.js` in a text editor
   - Change this line to match your Arduino's IP:
   ```javascript
   let ArduinoIP = '192.168.1.134';
   ```

3. **Test it:**
   - Open `index.html` in your web browser
   - You should see a simple interface

## Your First Project: LED Control

Let's make a web page that turns an LED on and off:

### Arduino Side (Hardware):
- Connect an LED to pin 13 (built-in LED works too)

### Web Side (JavaScript):
```javascript
// Connect to Arduino
arduino = new Arduino();
arduino.connect('YOUR_ARDUINO_IP');

// Set up the LED pin
arduino.pinMode(13, OUTPUT);

// Turn LED on
arduino.digitalWrite(13, HIGH);

// Turn LED off  
arduino.digitalWrite(13, LOW);
```

### Complete Web Example:
```html
<button onclick="arduino.digitalWrite(13, HIGH)">LED On</button>
<button onclick="arduino.digitalWrite(13, LOW)">LED Off</button>
```

That's it! Click the buttons to control your LED.

## Common Examples

### Reading a Sensor
```javascript
// Read a light sensor on pin A0
let lightLevel = arduino.analogRead(A0);

// Analog value range 0-1023 on UNO R4, 0-4095 on ESP32
console.log("Light level:", lightLevel);
```

### Controlling Brightness
```javascript
// Control LED brightness
arduino.pinMode(9, OUTPUT);
arduino.analogWrite(9, sliderValue); // 0-255
```

### NeoPixel LED Strips

#### Single Strip
```javascript
// Set up a strip of 8 LEDs on pin 6
arduino.attach('strip', new NeoPixel(arduino));
arduino.strip.init(6, 8);

// Make first LED red
arduino.strip.setPixelColor(0, 255, 0, 0);
arduino.strip.show(); // Always call show() to update LEDs

// Fill all LEDs blue
let blue = arduino.strip.Color(0, 0, 255);
arduino.strip.fill(blue);
arduino.strip.show();
```

#### Multiple Strips
```javascript
// Attach multiple NeoPixel strips
arduino.attach('mainLights', new NeoPixel(arduino));
arduino.attach('accentLights', new NeoPixel(arduino));
arduino.attach('backgroundLights', new NeoPixel(arduino));

// Initialize each strip independently
arduino.mainLights.init(6, 16);        // pin 6, 16 pixels
arduino.accentLights.init(7, 8);       // pin 7, 8 pixels  
arduino.backgroundLights.init(8, 32);  // pin 8, 32 pixels

// Set different brightness for each strip
arduino.mainLights.setBrightness(200);
arduino.accentLights.setBrightness(100);
arduino.backgroundLights.setBrightness(50);

// Control each strip independently
arduino.mainLights.fill(arduino.mainLights.Color(255, 0, 0));     // Red
arduino.accentLights.fill(arduino.accentLights.Color(0, 255, 0)); // Green
arduino.backgroundLights.fill(arduino.backgroundLights.Color(0, 0, 255)); // Blue

// Show all changes
arduino.mainLights.show();
arduino.accentLights.show();
arduino.backgroundLights.show();
```

### Multiple Device Support

You can control multiple instances of the same device type. Each extension automatically gets a unique logical ID:

```javascript
// Multiple NeoPixel strips with custom names
arduino.attach('ceiling', new NeoPixel(arduino));     // Gets logical ID 0
arduino.attach('floor', new NeoPixel(arduino));       // Gets logical ID 1
arduino.attach('wall', new NeoPixel(arduino));        // Gets logical ID 2

// Each strip can have different configurations
arduino.ceiling.init(6, 20);    // 20 LEDs on pin 6
arduino.floor.init(7, 50);      // 50 LEDs on pin 7
arduino.wall.init(8, 10);       // 10 LEDs on pin 8

// Debug: see what's attached
console.log(arduino.listExtensions());
// Output: [
//   { id: 'ceiling', logicalId: 0, deviceId: 200, type: 'NeoPixel' },
//   { id: 'floor', logicalId: 1, deviceId: 200, type: 'NeoPixel' },
//   { id: 'wall', logicalId: 2, deviceId: 200, type: 'NeoPixel' }
// ]
```

## Pin Reference

### Arduino UNO R4 WiFi
```
Digital pins: 0-13 (pin 13 has built-in LED, also addressable as D0, D1, D2, etc.)
Analog pins:  A0-A5 (also numbered 14-19)
PWM pins:     3, 5, 6, 9, 10, 11 (for analogWrite)
```

### ESP32
```
Most pins: 0-39 (avoid pins 6-11)
Good for LEDs: 2, 4, 5, 12, 13
Input only: 34-39 (can't be outputs)
```

## Common Issues & Solutions

### "Can't connect to Arduino"
- Check the IP address matches what Arduino displays
- Make sure Arduino and computer are on same WiFi network
- Make sure the html and sketch.js files are run on your local computer (not in a web IDE)
- Try refreshing the web page

### "Arduino keeps disconnecting" (UNO R4)
- This is a known issue with UNO R4 - the code handles it automatically
- Your commands still work, just some console messages appear

### "ESP32 won't start"
- Check you have the correct board selected in the Arduino IDE. If using ESP32 Wrover board, you may need to choose "ESP32 Dev Module" in Arduino IDE

### "NeoPixels don't light up"
- Check power - LED strips need lots of current
- Try different pins (2, 4, 5 work well on ESP32)
- Verify LED strip type (NEO_GRB vs NEO_RGB)
- NeoPixels Vcc should be connected to 5V, data pin can generally be driven from 5V or 3.3V logic
- Make sure you're using the updated Arduino firmware that supports multiple strips

### "Multiple NeoPixel strips interfere with each other"
- This shouldn't happen with the new system - each strip gets a unique logical ID
- Check that you're using the updated `NeoPixelExtension.h` file
- Use `arduino.listExtensions()` to verify each strip has a unique logical ID

### "Sensor readings are jumpy"
- This is normal - use averaging in your code
- Increase reading intervals if too slow

## Understanding the Code

### JavaScript Side (Web Interface)
- `arduino.pinMode()` - sets up pins (like Arduino IDE)
- `arduino.digitalWrite()` - turns things on/off
- `arduino.analogWrite()` - controls brightness/speed (0-255)
- `arduino.digitalRead()` - reads buttons/switches  
- `arduino.analogRead()` - reads sensors/potentiometers
- `arduino.attach(id, extension)` - adds device extensions like NeoPixels
- `arduino.listExtensions()` - debug info about attached extensions

### The system automatically handles:
- Network communication
- Message timing and throttling  
- Reconnecting if connection drops
- Converting between different data formats
- Unique logical IDs for multiple device instances
- Extension management and routing

## Arduino Firmware Requirements

The Arduino firmware has been updated to support multiple device instances:

- **Updated `NeoPixelExtension.h`** - Now supports up to 8 independent NeoPixel strips
- **Updated `defs.h`** - Includes new protocol definitions
- **Logical ID system** - Each device instance gets a unique identifier

Make sure you're using the latest Arduino firmware files for multiple device support.

## Next Steps

1. **Start simple** - get an LED blinking from a web button
2. **Add sensors** - read values and display them on screen
3. **Combine both** - use sensor data to control outputs
4. **Make it visual** - use p5.js to create graphics that respond to hardware
5. **Try multiple devices** - control several NeoPixel strips or other extensions
6. **Add extensions** - create your own device extensions following the NeoPixel pattern

## Learning Resources

- **Arduino basics**: arduino.cc/en/Tutorial
- **p5.js graphics**: p5js.org/get-started
- **Web development**: developer.mozilla.org
- **Electronics**: sparkfun.com/tutorials

## Project Structure
```
Arduino_to_p5js/           # Arduino code
├── Arduino2JS.ino         # Main Arduino sketch
├── defs.h                 # Pin and command definitions (UPDATED)
├── NeoPixelExtension.h    # NeoPixel LED support (UPDATED for multiple strips)
└── secrets.h              # Your WiFi credentials

JS2Arduino/                # Web interface code  
├── index.html             # Main web page
├── sketch.js              # Your project code (edit this!)
├── arduinoComs.js         # Arduino communication (UPDATED)
└── neoPixel.js            # NeoPixel web controls (UPDATED)
```

## Troubleshooting Help

If you're stuck:
1. Check the Arduino Serial Monitor for error messages
2. Open browser Developer Tools (F12) to see JavaScript errors
3. Try the basic LED example first
4. Make sure both devices are on the same WiFi network
5. Use `arduino.listExtensions()` to debug extension issues

## Contributing

Found a bug or want to add a feature? Contributions welcome!

1. Fork this repository
2. Make your changes
3. Test with both UNO R4 and ESP32 if possible
4. Submit a pull request

## License

GNU General Public License v3 - free to use and modify for any purpose.

## Author

Scott Mitchell - Created for design education and creative technology projects.