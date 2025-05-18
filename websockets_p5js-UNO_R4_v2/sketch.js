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

let ArduinoIP = 'ws://10.1.1.134:81/';

let LEDpin = 10;
let LEDstate = false;
let dialValue = 0;
let setIOButton;
let readPotButton;

function setup() {
    createCanvas(600, 600);

    InitWebSocket(ArduinoIP);

    pinMode(LEDpin, OUTPUT);

    setIOButton = createButton("set IO pins");
    setIOButton.mousePressed(() => {
        messageOut("pinMode", 11, INPUT);
        messageOut("pinMode", 12, OUTPUT);
    });

    readPotButton = createButton("read pot");
    readPotButton.mousePressed(() => {
        messageOut("analogRead", A0);
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

    fill(0, 0, 255);
    let rad = map(dialValue, 0, 4095, 0, width*2);
    circle(width/2,  height/2, rad);

    // if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
    //     if(mouseX > width/2) {
    //         if (!LEDstate){
    //             LEDstate = true;
    //             digitalWrite(LEDpin, HIGH);
    //         }
    //     } else {
    //         if (LEDstate){
    //             LEDstate = false;
    //             digitalWrite(LEDpin, LOW);
    //         }
    //     }
    // }
}