// ==============================================================
// P5js to Arduino Control
// Basic example showing how to use JS2Arduino - arduinoComs.js
// by Scott Mitchell
// GPL-3.0 License
// ==============================================================

let ArduinoIP = 'ws://10.1.1.134:81/';

let arduino;

// pin globals
const LEDR = 4;
const LEDG = 5;
const LEDB = 6;
const POTPIN = A0;

function setup() {
    createCanvas(600, 600);

    // connect to Arduino
    arduino = new Arduino();
    arduino.connect(ArduinoIP);

    // configure pins
    arduino.pinMode(LEDR, OUTPUT);
    arduino.pinMode(LEDG, OUTPUT);
    arduino.pinMode(LEDB, OUTPUT);
    // arduino.pinMode(POTPIN, ANALOG_INPUT, 200);
}

function draw() {
    background(0);

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