# Ultrasonic Sensor Distance Visualization Example

An interactive p5.js example demonstrating real-time ultrasonic distance sensing using the Arduino2JS WebSocket communication system. Visualize distance measurements as live graphics in your web browser.

## What This Example Does

This example creates a real-time distance visualization system:
- **Live distance measurement** - HC-SR04 ultrasonic sensor measures distance to objects
- **Visual distance bar** - Animated bar graph shows current distance reading
- **Color-coded feedback** - Distance bar changes color from red (close) to green (far)
- **Real-time updates** - Distance measurements update continuously in the browser
- **Range indicators** - Scale markers show distance measurements in centimeters

## Hardware Requirements

- **Arduino UNO R4 WiFi** OR **ESP32 development board**
- **WiFi network** (Arduino and computer must be on the same network)
- **HC-SR04 Ultrasonic Sensor** (or compatible ultrasonic distance sensor)
- **Breadboard and jumper wires**

### Ultrasonic Sensor Wiring

#### Arduino UNO R4 WiFi
- **Sensor VCC** → **5V** (Arduino)
- **Sensor GND** → **GND** (Arduino)
- **Sensor Trig** → **Pin 6** (configurable in code)
- **Sensor Echo** → **Pin 7** (configurable in code)

#### ESP32
- **Sensor VCC** → **5V** (or 3.3V - check sensor specs)
- **Sensor GND** → **GND** (Arduino)
- **Sensor Trig** → **Pin 6** (configurable in code)
- **Sensor Echo** → **Pin 7** (configurable in code)

### Sensor Types Supported
- **HC-SR04** (most common, 4-wire)
- **HC-SR05** (5-wire version)
- **US-100** (compatible mode)
- **3-wire sensors** (single pin for trigger/echo)

## Software Requirements

- **Arduino IDE** (for uploading firmware)
- **Web browser** (Chrome, Firefox, Safari, etc.)
- **Text editor** (for updating the IP address)

### Arduino Libraries Required
- **WebSocketsServer** (by Markus Sattler)
- **ArduinoJson** (by Benoit Blanchon)
- No additional sensor libraries needed - ultrasonic support is built into the Arduino2JS system

Install via Arduino IDE: Tools → Manage Libraries

## Quick Start

### 1. Set Up Arduino Hardware

1. **Connect the ultrasonic sensor:**
   - VCC (red) → 5V pin
   - GND (black) → GND pin
   - Trig (usually blue/green) → Pin 6
   - Echo (usually white/yellow) → Pin 7

2. **Test sensor placement:**
   - Point sensor away from obstacles for testing
   - Sensor works best with flat surfaces perpendicular to the sensor
   - Effective range: 2cm to 200cm (depending on sensor model)

### 2. Set Up Arduino Software

1. Download the Arduino2JS folder and open `Arduino2JS.ino` in Arduino IDE
2. Make sure `UltrasonicExtension.h` is included in your Arduino2JS folder
3. Install the required libraries (WebSocketsServer, ArduinoJson)
4. Update your WiFi credentials in the `secrets.h` tab:
   ```cpp
   #define SECRET_SSID "YourWiFiName" 
   #define SECRET_PASS "YourWiFiPassword"
   ```
5. Upload the sketch to your Arduino
6. Note the IP address from Serial Monitor or LED matrix (UNO R4)

### 3. Set Up Web Interface

1. Open `sketch.js` in a text editor
2. Update this line with your Arduino's IP address:
   ```javascript
   let ArduinoIP = '192.168.1.134';
   ```
3. **Optional:** Adjust sensor pins if needed:
   ```javascript
   arduino.ultrasonicSensor.attach(6, 7); // Trig pin 6, Echo pin 7
   ```
4. Make sure `ultrasonic.js` is included in your project folder
5. Open `index.html` in your web browser

### 4. Test It

- **Distance bar should appear** on the right side of the canvas
- **Move objects** in front of the sensor - the bar should change height and color
- **Check console** for connection status and distance readings
- **Effective range** is typically 2-200cm depending on your sensor

## How It Works

The example demonstrates complete ultrasonic sensor control:

```javascript
// Connect to Arduino and attach ultrasonic sensor
arduino = new Arduino();
arduino.connect(ArduinoIP);
arduino.attach('ultrasonicSensor', new Ultrasonic(arduino));

// Attach sensor (4-wire mode: separate trigger and echo pins)
arduino.ultrasonicSensor.attach(6, 7); // Trig pin 6, Echo pin 7

// For 3-wire sensors (single pin for trigger/echo):
// arduino.ultrasonicSensor.attach(6); // Single pin mode

// Set timeout for longer range detection
arduino.ultrasonicSensor.setTimeout(40); // 40ms timeout

// Read distance
let distance = arduino.ultrasonicSensor.read(); // Returns distance in cm

// Read in different units
let distanceInches = arduino.ultrasonicSensor.read(INCH);

// Convenience methods
let distanceCM = arduino.ultrasonicSensor.readCM();
let distanceInches = arduino.ultrasonicSensor.readInches();

// Check if object is within range
if (arduino.ultrasonicSensor.isInRange(50)) { // Within 50cm
    console.log("Object detected nearby");
}
```

## Code Explanation

### sketch.js Features
- **Real-time Reading**: Continuously reads distance from ultrasonic sensor
- **Visual Mapping**: Maps distance (0-200cm) to bar height and color
- **Color Coding**: Uses HSB color mode for smooth color transitions
- **Connection Status**: Shows Arduino connection status
- **Responsive Design**: Clean, centered layout with scale markers

### Interactive Elements
- **Distance Bar**: Height represents current distance measurement
- **Color Gradient**: Red (close) to green (far) color coding
- **Scale Markers**: Distance markers every 50cm for reference
- **Status Display**: Connection status and current distance reading
- **Range Detection**: Visual feedback when objects are detected

## Advanced Features

### Multiple Sensors
```javascript
// Attach multiple ultrasonic sensors
arduino.attach('frontSensor', new Ultrasonic(arduino));
arduino.attach('backSensor', new Ultrasonic(arduino));

// Configure each independently  
arduino.frontSensor.attach(6, 7);  // Front sensor
arduino.backSensor.attach(8, 9);   // Back sensor

// Read from each sensor
let frontDistance = arduino.frontSensor.readCM();
let backDistance = arduino.backSensor.readCM();
```

### 3-Wire Sensor Support
```javascript
// For sensors with combined trigger/echo pin
arduino.ultrasonicSensor.attach(6); // Single pin mode
```

### Advanced Configuration
```javascript
// Set custom timeout (default is 20ms)
arduino.ultrasonicSensor.setTimeout(50); // 50ms for longer range

// Set reading throttle to reduce update frequency
arduino.ultrasonicSensor.setReadThrottle(100); // Update every 100ms max
```

### Proximity Detection
```javascript
// Check if object is within specified range
if (arduino.ultrasonicSensor.isInRange(30, CM)) {
    console.log("Object within 30cm");
}

// Get sensor state information
let state = arduino.ultrasonicSensor.getState();
console.log("Sensor info:", state);
```

## Troubleshooting

**"Distance bar doesn't move"**
- Check sensor wiring (VCC to 5V, GND to GND, Trig to pin 6, Echo to pin 7)
- Verify sensor is pointed at an object within range (2-200cm)
- Try moving a large flat object (like a book) in front of the sensor
- Check browser console for distance readings

**"Distance readings are erratic"**
- Ensure sensor is mounted stable and level
- Point sensor at flat, perpendicular surfaces for best results
- Avoid soft materials (fabric, foam) which absorb ultrasonic waves
- Increase timeout: `arduino.ultrasonicSensor.setTimeout(50)`

**"No distance readings (always 0 or -1)"**
- Check power connections (VCC and GND)
- Verify trigger and echo pins are connected correctly
- Try swapping trigger and echo pin connections
- Some sensors require 5V VCC - check sensor specifications

**"Web interface doesn't show sensor data"**
- Check browser console for connection errors
- Verify IP address matches Arduino's IP
- Make sure `ultrasonic.js` is loaded in your HTML
- Confirm Arduino shows "Client connected" message

**"Sensor works intermittently"**
- Power supply issue - ensure Arduino has adequate power via USB
- Try external 5V power supply for Arduino if using many devices
- Check for loose connections on breadboard
- Add small delay between readings if updating too frequently

**"Arduino won't connect to WiFi"**
- Double-check WiFi credentials in `secrets.h`
- Try 2.4GHz network (avoid 5GHz-only networks)
- Check Serial Monitor for connection status

## Understanding the Code

This example demonstrates several key concepts:

1. **Extension System**: Uses the Arduino2JS Ultrasonic extension for sensor control
2. **Real-time Visualization**: Live data streaming from Arduino to web browser
3. **Sensor Configuration**: Proper timeout and pin configuration for reliable readings
4. **Visual Mapping**: Converting distance measurements to visual representations
5. **Error Handling**: Graceful handling of sensor timeouts and connection issues

## Sensor Specifications

### HC-SR04 Specifications
- **Operating Voltage**: 5V DC
- **Operating Current**: 15mA
- **Frequency**: 40KHz
- **Range**: 2cm - 4m
- **Accuracy**: ±3mm
- **Measuring Angle**: 15°
- **Trigger Pulse**: 10µs TTL pulse
- **Echo Pulse**: Proportional to distance

## Next Steps

Once this example works, you can:

1. **Add multiple sensors** - Create 360° distance monitoring
2. **Combine with other devices** - Control LEDs or servos based on distance
3. **Create proximity alarms** - Visual/audio alerts when objects get too close
4. **Data logging** - Record distance measurements over time
5. **Advanced visualizations** - 3D distance plots, radar-style displays
6. **Robotics projects** - Obstacle avoidance, room mapping

## Configuration Options

### Sensor Configuration
```javascript
// Different sensor modes
arduino.ultrasonicSensor.attach(6, 7);  // 4-wire mode (separate trigger/echo)
arduino.ultrasonicSensor.attach(6);     // 3-wire mode (combined trigger/echo)

// Timeout configuration
arduino.ultrasonicSensor.setTimeout(30);  // 30ms timeout (default: 20ms)
arduino.ultrasonicSensor.setTimeout(100); // 100ms for very long range
```

### Performance Tuning
```javascript
// Reduce update frequency for better performance
arduino.ultrasonicSensor.setReadThrottle(50); // Max one reading every 50ms

// Adjust visualization range
let maxDistance = 100; // Show distances up to 100cm instead of 200cm
```

## File Structure
```
examples/ultrasonic-sensor/
├── index.html          # Web interface with p5.js
├── sketch.js           # Ultrasonic sensor code (edit IP here!)
├── style.css           # Basic styling  
├── ../../JS2Arduino/   # Arduino communication libraries
│   ├── arduinoComs.js  # Core communication
│   └── ultrasonic.js   # Ultrasonic extension
└── README.md           # This file
```

## Learn More

This example uses the Arduino2JS system's Ultrasonic extension. See the main project README for:
- Complete API documentation
- Multiple device support examples
- Advanced sensor techniques
- Troubleshooting guide

## Hardware Notes

### Power Requirements
- **HC-SR04**: 5V VCC recommended, 15mA current draw
- **3.3V operation**: Some sensors work with 3.3V but may have reduced range
- **Multiple sensors**: Arduino 5V pin can typically handle 2-3 sensors

### Signal Quality
- **Flat surfaces**: Work best for accurate readings
- **Angle sensitivity**: ±15° cone for most sensors
- **Soft materials**: Fabric, foam may not reflect ultrasonic waves well
- **Temperature effects**: Readings may vary with temperature changes

### Mounting Tips
- **Stable mounting**: Vibration can cause erratic readings
- **Avoid obstacles**: Clear path between sensor and target
- **Multiple sensors**: Space apart to avoid interference
- **Cable length**: Keep wires short (under 12 inches) for best signal quality