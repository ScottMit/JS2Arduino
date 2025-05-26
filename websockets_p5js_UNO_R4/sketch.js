// ==============================================================
// P5js to Arduino webSocket communication
// using UNO R4 WiFi WebSocket Server
// by Scott Mitchell
//
// ==============================================================
//
// JSON key: value pairs
// example data
// {
//  "header": {
//     "version": number,
//  }
//  "data":
//    [
//      {
//        "action": "pinMode"/"digitalRead"/"analogRead"/"digitalWrite"/"analogWrite",
//        "pin": number,
//        "value": 0/1/0-255/"INPUT"/"INPUT_PULLUP"/"OUTPUT"
//        "interval": number
//       },
//      {
//        "action": "pinMode",
//        "pin": number,
//        "value": "INPUT"
//       },
//     ]
// }
//

let ArduinoIP = 'ws://172.20.10.13:81/';

let buttonPin = 7;
let buttonState = false;
let LEDpin = 10;
let LEDstate = false;
let setIOButton;
let potPin = A0;
let dialValue = 0;
let readPotButton;

function setup() {
    createCanvas(600, 600);

    InitWebSocket(ArduinoIP);

    pinMode(LEDpin, OUTPUT);
    pinMode(buttonPin, INPUT_PULLUP);
    // pinMode(potPin, A_INPUT);

    setIOButton = createButton("set IO pins");
    setIOButton.mousePressed(() => {
        messageOut("pinMode", 11, INPUT);
        messageOut("pinMode", 12, OUTPUT);
    });

    readPotButton = createButton("read pot");
    readPotButton.mousePressed(() => {
        messageOut("analogRead", potPin);
    });
}

function draw() {
    // draw division on screen
    background(255);
    noStroke();
    fill(255, 0, 0);
    rect(0, 0, width/2, height);
    fill(0, 255, 0);
    rect(width/2, 0, width, height);

    let LEDvalue = map(mouseX, 0, width, 0, 255);
    analogWrite(LEDpin, LEDvalue);

    buttonState = digitalRead(buttonPin);
    if(buttonState) {
        fill(255, 0, 0);
    } else {
        fill(0, 0, 255);
    }
    dialValue = analogRead(potPin);
    let rad = map(dialValue, 0, 4095, 0, width*2);
    circle(width/2,  height/2, rad);
}