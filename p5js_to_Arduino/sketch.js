// ==============================================================
// arduinoComs.js
// P5js to Arduino WebSocket communication
// Works with UNO R4 WiFi and ESP32
// Example Sketch using P5js
// by Scott Mitchell
// GPL-3.0 License
// ==============================================================


let ArduinoIP = 'ws://10.1.1.161:81/';
// let ArduinoIP = 'ws://10.1.1.134:81/';

let arduino;

let lastMousePressed = false;

// pin globals
const LED1 = 14;
// const LED1 = 11;
const NEOPIN = 5;
const SENSOR = 36; // ESP32
// const SENSOR = A0; // A0 = 14 on UNO R4

function setup() {
    createCanvas(400, 400);

    // HSB mode for rainbow
    // colorMode(HSB, 255);

    // connect to Arduino
    arduino = new Arduino();
    arduino.connect(ArduinoIP);

    // configure pins
    // arduino.pinMode(LED1, OUTPUT);
    arduino.pinMode(LED1, OUTPUT);
    arduino.pinMode(NEOPIN, OUTPUT);
    // arduino.pinMode(SENSOR, ANALOG_INPUT, 200);

    // Attach NeoPixel helper to Arduino
    arduino.neoPixel = new NeoPixel(arduino);

    // Init strip: pin 6, 8 pixels
    arduino.neoPixel.init(NEOPIN, 8);

    // Clear everything
    arduino.neoPixel.clear();
    arduino.neoPixel.show();
}

function draw() {
    background(220);
    textSize(16);
    text("Click mouse to toggle LED on pin 13", 20, height/2);

    let dial = arduino.analogRead(SENSOR);
    let brightness = map(dial, 0, 4095, 0, 255);
    arduino.analogWrite(LED1, brightness);
    let x = map(dial,0,4095,0,width);
    circle(x,100,10);
}

function mousePressed() {
    // Fill all LEDs with blue
    let c = arduino.neoPixel.Color(255, 0, 0);
    arduino.neoPixel.fill(c, 0, 8);
    arduino.neoPixel.show();
}

function mouseReleased() {
    arduino.neoPixel.clear();
    arduino.neoPixel.setPixelColor(0, 255, 0, 0);
    arduino.neoPixel.show();
}