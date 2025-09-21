# Servo Motor Control Example

An interactive p5.js example demonstrating real-time servo motor control using the Arduino2JS WebSocket communication system. Control servo motors directly from your web browser with multiple interaction modes.

## What This Example Does

This example creates an interactive servo controller with multiple control modes:
- **Mouse control mode** - Move your mouse horizontally to control servo angle (0-180°)
- **Auto sweep mode** - Continuous automatic sweeping back and forth
- **Manual position control** - Move servo to specific positions (left, center, right)
- **Real-time visualization** - Visual servo arm shows current position and angle

## Hardware Requirements

- **Arduino UNO R4 WiFi** OR **ESP32 development board**
- **WiFi network** (Arduino and computer must be on the same network)
- **Servo motor** (SG90, MG996R, or any standard hobby servo)
- **Power considerations:**
  - Most small servos (SG90): Arduino 5V pin provides enough power
  - Larger servos (MG996R): External 5V/6V power supply recommended
- **Breadboard and jumper wires**

### Servo Wiring

#### Arduino UNO R4 WiFi
- **Servo Red wire (VCC)** → **5V** (Arduino)
- **Servo Brown/Black wire (GND)** → **GND** (Arduino)  
- **Servo Orange/Yellow wire (Signal)** → **Pin 5** (configurable in code)

#### ESP32
- **Servo Red wire (VCC)** → **5V** (or external 5V supply)
- **Servo Brown/Black wire (GND)** → **GND** (Arduino + external supply if used)
- **Servo Orange/Yellow wire (Signal)** → **Pin 5** (configurable in code)

### Servo Types Supported
- **SG90** (micro servo, most common for projects)
- **MG996R** (metal gear servo, more torque)
- **HS-311** (standard hobby servo)
- Any servo compatible with Arduino Servo library

## Software Requirements

- **Arduino IDE** (for uploading firmware)
- **Web browser** (Chrome, Firefox, Safari, etc.)
- **Text editor** (for updating the IP address)

### Arduino Libraries Required
- **WebSocketsServer** (by Markus Sattler)
- **ArduinoJson** (by Benoit Blanchon)
- **Servo** (built into Arduino IDE - no need to install)

Install WebSocketsServer and ArduinoJson via Arduino IDE: Tools → Manage Libraries

## Quick Start

### 1. Set Up Arduino Hardware

1. **Connect the servo motor:**
   - Red wire (VCC) → 5V pin
   - Brown/Black wire (GND) → GND pin  
   - Orange/Yellow wire (Signal) → Pin 5

2. **For larger servos (MG996R, etc.):**
   - Use external 5V/6V power supply (2A recommended)
   - Connect all grounds together (Arduino GND, servo GND, supply GND)
   - Signal wire still connects to Arduino pin

### 2. Set Up Arduino Software

1. Download the Arduino2JS folder and open `Arduino2JS.ino` in Arduino IDE
2. Install the required libraries (WebSocketsServer, ArduinoJson)
3. Make sure ServoExtension.h is included in your Arduino2JS folder
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
3. **Optional:** Adjust servo pin if needed:
   ```javascript
   arduino.myServo.attach(5);  // Pin 5 is default
   ```
4. Make sure `servo.js` is included in your project folder
5. Open `index.html` in your web browser

### 4. Test It

- **Press 'M'** - Mouse control mode (move mouse left/right to control servo)
- **Press 'S'** - Auto sweep mode (continuous back and forth motion)
- **Press 'C'** - Center servo (90°)
- **Press 'L'** - Move servo left (0°)
- **Press 'R'** - Move servo right (180°)
- **Watch the visualization** - Servo arm animation shows current position

## How It Works

The example demonstrates complete servo control with Arduino-like functions:

```javascript
// Connect to Arduino and add servo
arduino = new Arduino();
arduino.connect(ArduinoIP);
arduino.add('myServo', new Servo(arduino));

// Attach servo to pin (like Arduino servo.attach())
arduino.myServo.attach(5);

// Write angle (like Arduino servo.write())
arduino.myServo.write(90);  // Move to 90 degrees

// Convenience methods
arduino.myServo.center();   // Move to center (90°)
arduino.myServo.min();      // Move to minimum (0°)
arduino.myServo.max();      // Move to maximum (180°)

// Advanced control
arduino.myServo.writeMicroseconds(1500);  // Direct pulse width control
let angle = arduino.myServo.read();       // Read current angle
let attached = arduino.myServo.attached(); // Check if attached

// Detach when done (like Arduino servo.detach())
arduino.myServo.detach();
```

## Code Explanation

### sketch.js Features
- **Multiple Control Modes**: Mouse, auto-sweep, and manual positioning
- **State Machine**: Clean switching between different interaction modes
- **Real-time Visualization**: Animated servo arm showing current angle
- **Smooth Sweeping**: Continuous back-and-forth motion with proper state management
- **Keyboard Controls**: Easy mode switching and direct positioning

### Interactive Elements
- **Mouse Control**: Horizontal mouse movement maps to servo angle (0-180°)
- **Auto Sweep**: Continuous sweeping with smooth transitions
- **Visual Servo**: Animated representation of actual servo position
- **Status Display**: Instructions and current mode information

## Advanced Features

### Multiple Servos
```javascript
// Add multiple servo motors
arduino.add('pan', new Servo(arduino));
arduino.add('tilt', new Servo(arduino));

// Configure each independently  
arduino.pan.attach(5);   // Pan servo on pin 5
arduino.tilt.attach(6);  // Tilt servo on pin 6

// Control separately
arduino.pan.write(90);    // Center pan
arduino.tilt.write(45);   // Tilt down
```

### Custom Sweep Patterns
```javascript
// Smooth sweep with custom timing
await arduino.myServo.sweep(0, 180, 3000);  // 0° to 180° over 3 seconds

// Multi-step sweep with pauses
await arduino.myServo.sweep(0, 90, 1000);
await new Promise(resolve => setTimeout(resolve, 500)); // Pause
await arduino.myServo.sweep(90, 180, 1000);
```

### Microsecond Control
```javascript
// Direct pulse width control for precise positioning
arduino.myServo.writeMicroseconds(1000);  // Minimum position
arduino.myServo.writeMicroseconds(1500);  // Center position
arduino.myServo.writeMicroseconds(2000);  // Maximum position
```

### Performance Tuning
```javascript
// Adjust update throttling
arduino.myServo.setWriteThrottle(50);     // Minimum 50ms between commands

// Set angle threshold (reduces unnecessary updates)
arduino.myServo.setThreshold(2);          // Only send if angle changes by 2°
```

## Troubleshooting

**"Servo doesn't move"**
- Check power connections (red to 5V, brown/black to GND)
- Verify signal pin connection (orange/yellow to pin 5)
- Try different servo - some servos may be damaged
- Check that servo.attach() is called before servo.write()

**"Servo jitters or moves erratically"**
- Power issue - use external 5V supply for larger servos
- Add 100µF capacitor across servo power pins
- Keep signal wires short and away from power wires
- Try increasing write threshold: `arduino.myServo.setThreshold(3)`

**"Servo moves to wrong positions"**
- Some servos have different pulse width ranges
- Try custom attach: `arduino.myServo.attach(5, 500, 2500)`
- Calibrate with writeMicroseconds() to find actual range

**"Web interface doesn't control servo"**
- Check browser console for connection errors
- Verify IP address matches Arduino's IP
- Make sure servo.js is loaded in your HTML
- Press 'M' to ensure you're in mouse control mode

**"Auto sweep doesn't work smoothly"**
- There is a known bug with WebSockets on the Arduino UNO R4 which may impact performance
- Try reducing sweep speed: `arduino.myServo.sweep(0, 180, 4000)`
- Increase steps for smoother motion: `arduino.myServo.sweep(0, 180, 2000, 100)`

**"Arduino won't connect to WiFi"**
- Double-check WiFi credentials in `secrets.h`
- Try 2.4GHz network (avoid 5GHz-only networks)
- Check Serial Monitor for connection status

## Understanding the Code

This example demonstrates several important concepts:

1. **Arduino Library Compatibility**: JavaScript functions match Arduino Servo library exactly
2. **State Management**: Clean switching between different control modes
3. **Asynchronous Control**: Smooth sweeping with proper timing and cancellation
4. **Real-time Feedback**: Visual representation of servo position
5. **Performance Optimization**: Throttling and thresholding to prevent servo overload

## Next Steps

Once this example works, you can:

1. **Add more servos** - Create pan/tilt camera mounts, robotic arms
2. **Combine with sensors** - Servo position based on temperature, light, distance
3. **Create servo sequences** - Pre-programmed movement patterns
4. **Web interface enhancements** - Sliders, preset positions, recording/playback
5. **Robotic projects** - Walking robots, animatronics, automated systems
6. **Integration** - Combine with NeoPixels for visual feedback

## Control Modes

### Mouse Control (Press 'M')
- Move mouse horizontally across canvas
- Left edge = 0°, right edge = 180°
- Real-time servo response to mouse movement

### Auto Sweep (Press 'S')
- Continuous back-and-forth motion
- 0° to 180° in 2 seconds, pause, then back
- Press any other key to stop

### Manual Control
- **'C'** - Center position (90°)
- **'L'** - Left position (0°)
- **'R'** - Right position (180°)

## Configuration Options

### Servo Attachment
```javascript
// Basic attachment (pin only)
arduino.myServo.attach(5);

// Custom pulse width range (for non-standard servos)
arduino.myServo.attach(5, 500, 2500);  // 500-2500μs range
```

### Performance Tuning
```javascript
// Throttle updates (minimum time between commands)
arduino.myServo.setWriteThrottle(30);  // 30ms minimum between writes

// Angle threshold (prevent micro-movements)
arduino.myServo.setThreshold(1);       // Only send if angle changes by 1°
```

### Sweep Customization
```javascript
// Different sweep patterns
arduino.myServo.sweep(0, 180, 1000);     // Fast sweep (1 second)
arduino.myServo.sweep(45, 135, 3000, 100); // Slow, smooth sweep (100 steps)
```

## File Structure
```
examples/servo-control/
├── index.html          # Web interface with p5.js
├── sketch.js           # Servo control code (edit IP here!)
├── style.css           # Basic styling  
├── ../../JS2Arduino/   # Arduino communication libraries
│   ├── arduinoComs.js  # Core communication
│   └── servo.js        # Servo extension
└── README.md           # This file
```

## Learn More

This example uses the Arduino2JS system's Servo extension. See the main project README for:
- Complete API documentation
- Multiple device support examples
- Advanced servo techniques
- Troubleshooting guide

## Hardware Notes

### Power Requirements
- **Small servos (SG90)**: Arduino 5V pin usually sufficient (500mA max)
- **Standard servos (MG996R)**: External 5V/6V supply recommended (1-2A)
- **Multiple servos**: Always use external power supply
- Always connect all grounds together

### Servo Signal Quality
- Keep signal wires short (under 12 inches ideal)
- Use twisted pair for longer runs
- Avoid running signal wires parallel to power wires
- Add ferrite beads on signal wires if experiencing interference

### Common Servo Specifications
- **SG90**: 0°-180°, 4.8-6V, 10g weight, plastic gears
- **MG996R**: 0°-180°, 4.8-7.2V, 55g weight, metal gears
- **HS-311**: 0°-180°, 4.8-6V, 43g weight, standard size