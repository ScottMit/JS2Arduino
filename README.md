# JS2Arduino

Connect your Arduino to web interfaces and create interactive projects that bridge the digital and physical worlds. Perfect for design students, makers, and anyone wanting to prototype connected devices and interfaces.

## What is this?

This project lets you control Arduino hardware (like LEDs, sensors, and motors) directly from a web page in real-time. No complex networking code needed - just connect your Arduino to WiFi and start building interactive experiences.

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
- **Data visualizations** with physical LED feedback
- **IoT prototypes** that respond to web inputs

## What You Need

### Hardware
- **Arduino UNO R4 WiFi** OR **ESP32 development board**
- **WiFi network** (your home/school network)
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
   - Open `Arduino_to_p5js.ino` in Arduino IDE

5. **Add your WiFi details:**
   - Edit the `secrets.h` file:
   ```cpp
   #define SECRET_SSID "YourWiFiName"
   #define SECRET_PASS "YourWiFiPassword"
   ```

6. **Upload to your Arduino:**
   - Connect Arduino via USB
   - Select your board type (UNO R4 WiFi or ESP32 Dev Module)
   - Click Upload

7. **Find your Arduino's IP address:**
   - **UNO R4:** Look at the LED matrix display
   - **ESP32:** Open Serial Monitor (Tools → Serial Monitor)

### Step 2: Set Up Your Web Interface

1. **Open the web folder:**
   - Navigate to `P5js_to_Arduino` folder

2. **Edit the connection:**
   - Open `sketch.js` in a text editor
   - Change this line to match your Arduino's IP:
   ```javascript
   let ArduinoIP = 'ws://192.168.1.XXX:81/';
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
arduino.connect('ws://YOUR_ARDUINO_IP:81/');

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
arduino.pinMode(A0, ANALOG_INPUT);
let lightLevel = arduino.analogRead(A0);

// Use the value (0-1023 on UNO R4, 0-4095 on ESP32)
console.log("Light level:", lightLevel);
```

### Controlling Brightness
```javascript
// Control LED brightness with a slider
arduino.pinMode(9, OUTPUT);
arduino.analogWrite(9, sliderValue); // 0-255
```

### NeoPixel LED Strips
```javascript
// Set up a strip of 8 LEDs on pin 6
arduino.attach('neo', new NeoPixel(arduino));
arduino.neo.init(6, 8);

// Make first LED red
arduino.neo.setPixelColor(0, 255, 0, 0);
arduino.neo.show(); // Always call show() to update LEDs

// Fill all LEDs blue
let blue = arduino.neo.Color(0, 0, 255);
arduino.neo.fill(blue);
arduino.neo.show();
```

## Pin Reference

### Arduino UNO R4 WiFi
```
Digital pins: 0-13 (pin 13 has built-in LED)
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
- Try refreshing the web page

### "Arduino keeps disconnecting" (UNO R4)
- This is a known issue with UNO R4 - the code handles it automatically
- Your commands still work, just some console messages appear

### "ESP32 won't start"
- If using ESP32 Wrover board, change to "ESP32 Dev Module" in Arduino IDE

### "NeoPixels don't light up"
- Check power - LED strips need lots of current
- Try different pins (2, 4, 5 work well on ESP32)
- Verify LED strip type (NEO_GRB vs NEO_RGB)

### "Sensor readings are jumpy"
- This is normal - use averaging in your code
- Increase reading intervals if too fast

## Understanding the Code

### JavaScript Side (Web Interface)
- `arduino.pinMode()` - sets up pins (like Arduino IDE)
- `arduino.digitalWrite()` - turns things on/off
- `arduino.analogWrite()` - controls brightness/speed (0-255)
- `arduino.digitalRead()` - reads buttons/switches  
- `arduino.analogRead()` - reads sensors/potentiometers

### The system automatically handles:
- Network communication
- Message timing and throttling  
- Reconnecting if connection drops
- Converting between different data formats

## Next Steps

1. **Start simple** - get an LED blinking from a web button
2. **Add sensors** - read values and display them on screen
3. **Combine both** - use sensor data to control outputs
4. **Make it visual** - use p5.js to create graphics that respond to hardware
5. **Add extensions** - try NeoPixel strips for colorful displays

## Learning Resources

- **Arduino basics**: arduino.cc/en/Tutorial
- **p5.js graphics**: p5js.org/get-started
- **Web development**: developer.mozilla.org
- **Electronics**: sparkfun.com/tutorials

## Project Structure
```
Arduino_to_p5js/           # Arduino code
├── Arduino_to_p5js.ino    # Main Arduino sketch
├── defs.h                 # Pin and command definitions
├── NeoPixelExtension.h    # NeoPixel LED support
└── secrets.h              # Your WiFi credentials

P5js_to_Arduino/           # Web interface code  
├── index.html             # Main web page
├── sketch.js              # Your project code (edit this!)
├── arduinoComs.js         # Arduino communication
└── neoPixel.js            # NeoPixel web controls
```

## Troubleshooting Help

If you're stuck:
1. Check the Arduino Serial Monitor for error messages
2. Open browser Developer Tools (F12) to see JavaScript errors
3. Try the basic LED example first
4. Make sure both devices are on the same WiFi network

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
