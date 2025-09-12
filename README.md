# Arduino WebSocket Communication

A real-time WebSocket communication system for controlling Arduino devices (UNO R4 WiFi and ESP32) from web applications. Features a modular extension system for hardware components like NeoPixel LED strips.

## Features

- **Cross-platform Arduino support**: Works with both UNO R4 WiFi and ESP32
- **Real-time WebSocket communication**: Low-latency bidirectional data exchange
- **Arduino-like API**: Familiar `pinMode()`, `digitalWrite()`, `analogRead()` methods in JavaScript
- **Intelligent throttling**: Reduces network traffic with configurable update intervals and value change thresholds
- **Automatic reconnection**: Robust connection handling with exponential backoff
- **Modular extension system**: Easy to add support for new hardware components
- **NeoPixel support**: Example Neopixel module compatible with Adafruit NeoPixel API

## Hardware Requirements

### Arduino UNO R4 WiFi
- Arduino UNO R4 WiFi board
- WiFi network connection

### ESP32
- ESP32 development board (ESP32 Dev Module recommended)
- WiFi network connection

### Works with
- NeoPixel LED strips/rings (WS2812B compatible)
- Analog sensors (potentiometers, photoresistors, etc.)
- LEDs, etc.

## Software Requirements

- Arduino IDE with WebSocketsServer library
- Web browser with WebSocket support
- works with p5js

## Installation

1. Download the repository

### Arduino Setup

1. Install required libraries in Arduino IDE:
   ```
   - WiFiS3 (for UNO R4) or WiFi (for ESP32)
   - WebSocketsServer
   - ArduinoJson
   - Adafruit_NeoPixel (for NeoPixel support, if required)
   ```
2. Open the Arduino_to_p5js sketch in the Arduino IDE
3. Edit the `secrets.h` file with your WiFi credentials:
   ```cpp
   #define SECRET_SSID "your_wifi_name"
   #define SECRET_PASS "your_wifi_password"
   ```
4. Select your Arduino board and port
5. Upload sketch to your Arduino
6. Read the Arduino IP address
- If using an Arduino UNO R4 the IP address will be displayed on the onboard LED matrix
- If using an ESP32 the IP address will be displayed on the Arduino IDE Serial Monitor

### JavaScript Setup

1. Open the P5js_to_Arduino folder in a code editor
2. Edit the IP address in `sketch.js` to match the Arduinos IP:
   ```javascript
   let ArduinoIP = 'ws://YOUR_ARDUINO_IP:81/';
   ```
3. Open `index.html` in a web browser

## Basic Usage

### JavaScript Side

```javascript
// Create Arduino connection
const arduino = new Arduino();
arduino.connect('ws://192.168.1.100:81/');

// Basic pin control
arduino.pinMode(13, OUTPUT);
arduino.digitalWrite(13, HIGH);

// Read sensors
arduino.pinMode(A0, ANALOG_INPUT);
let sensorValue = arduino.analogRead(A0);

// PWM output
arduino.analogWrite(9, 128); // 50% brightness

// NeoPixel control
arduino.attach('neo', new NeoPixel(arduino));
arduino.neo.init(6, 8);  // Pin 6, 8 pixels
arduino.neo.setPixelColor(0, arduino.neo.Color(255, 0, 0)); // Red
arduino.neo.show();
```

### Arduino Side

The Arduino code automatically handles:
- WebSocket server setup
- JSON message parsing
- Pin mode configuration
- Digital/analog I/O operations
- Extension routing (NeoPixels, etc.)

## API Reference

### Core Arduino Methods

#### `pinMode(pin, mode, [interval])`
Configure pin mode
- `pin`: Pin number
- `mode`: INPUT, OUTPUT, ANALOG_INPUT, etc.
- `interval`: Reading interval in ms (for input pins)

#### `digitalWrite(pin, value, [interval], [threshold])`
Write digital value
- `value`: HIGH (1) or LOW (0)
- `interval`: Throttle interval in ms
- `threshold`: Change threshold (0 for exact matching)

#### `analogWrite(pin, value, [interval], [threshold])`
Write PWM value
- `value`: 0-255 (automatically rounded to integer)
- `threshold`: Minimum change to trigger update (default: 2)

#### `digitalRead(pin, [interval])`
Read digital pin (returns cached value)

#### `analogRead(pin, [interval])`
Read analog pin (returns cached value)

### NeoPixel Extension

#### `init(pin, numPixels, [type])`
Initialize NeoPixel strip
```javascript
arduino.neo.init(6, 16, NEO_GRB + NEO_KHZ800);
```

#### `setPixelColor(index, r, g, b)` or `setPixelColor(index, color)`
Set individual pixel color

#### `fill(color, [first], [count])`
Fill range of pixels

#### `clear()`
Turn off all pixels

#### `setBrightness(value)`
Set global brightness (0-255)

#### `show()`
Update LED display

#### `Color(r, g, b, [w])`
Create 32-bit color value

## Configuration

### Throttling Settings
```javascript
// Global settings
arduino.messageOutInterval = 100;     // Output throttle (ms)
arduino.defaultReadingInterval = 200; // Input polling (ms)

// Per-method settings
arduino.analogWrite(9, value, 50, 5); // 50ms interval, 5-unit threshold
```

### Connection Settings
```javascript
// Reconnection parameters
arduino.maxReconnectAttempts = 10;
arduino.reconnectDelay = 1000;        // Initial delay
arduino.maxReconnectDelay = 30000;    // Maximum delay
```

## Pin Mapping

### UNO R4 WiFi
```
Digital: D0-D13 (0-13)
Analog:  A0-A5  (14-19)
```

### ESP32
```
GPIO pins: 0-39 (avoid 6-11, 34-39 input-only)
Recommended for NeoPixels: 2, 4, 5, 12, 13
```

## Troubleshooting

### Connection Issues
- **UNO R4**: May experience frequent disconnections (known WebSocket library issue)
- **ESP32**: Use "ESP32 Dev Module" board setting, not "ESP32 Wrover Module"
- Check IP address and ensure Arduino is connected to WiFi

### NeoPixel Issues
- **Power**: Ensure adequate power supply for LED strips
- **Pins**: Use recommended GPIO pins for your platform
- **Type**: Verify pixel type (NEO_GRB vs NEO_RGB)

### Performance
- Reduce message frequency if experiencing lag
- Increase throttle intervals and thresholds
- Monitor browser console for connection status

## Protocol Details

### Message Format
```json
{
  "header": {"version": 1},
  "data": [
    {
      "id": 13,
      "action": 2,
      "params": [1]
    }
  ]
}
```

### Action Codes
```
PIN_MODE = 1
DIGITAL_WRITE = 2
DIGITAL_READ = 3
ANALOG_WRITE = 4
ANALOG_READ = 5
END = 6
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your extension in the appropriate files
4. Update documentation
5. Submit a pull request

## License

GNU GENERAL PUBLIC LICENSE Version 3 - feel free to use in your projects.

## Author

Scott Mitchell
