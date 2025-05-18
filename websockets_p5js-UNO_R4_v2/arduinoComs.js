// ==============================================================
//
// arduinoComs.js
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


// Arduino Definitions
// Enumerators
let INPUT = 0;
let OUTPUT = 1;
let INPUT_PULLUP = 2;
let INPUT_PULLDOWN = 3;
let LOW = 0;
let HIGH = 1;
// Arduino UNO R4 pin numbers
let A0 = 14;
let A1 = 15;
let A2 = 16;
let A3 = 17;
let A4 = 18;
let A5 = 19;

let websock;
// keep track of message transmit times for all pins
// limit messages on each pin to avoid overloading Arduino
const pinMessageTimes = [];
// discard messages with smaller intervals than messageInterval
let messageInterval = 100;

function InitWebSocket(deviceIP)
{
    websock = new WebSocket(deviceIP);
    websock.onmessage = function(evt)
    {
        let JSONobj = JSON.parse(evt.data);
        messageIn(JSONobj);
    }
}

function pinMode(thePin, theValue){
    messageOut("pinMode", thePin, theValue);
}

function digitalWrite(thePin, theValue){
    // filter excessive messages
    let lastMessage = pinMessageTimes[thePin];
    if (lastMessage == undefined || Date.now() - lastMessage > messageInterval) {
        messageOut("digitalWrite", thePin, theValue);
        pinMessageTimes[thePin] = Date.now();
        // console.log("message sent");
    } else {
        // console.log("message discarded");
    }
}

function analogWrite(thePin, theValue) {
    theValue = Math.floor(theValue);
    // filter excessive messages
    let lastMessage = pinMessageTimes[thePin];
    if (lastMessage == undefined || Date.now() - lastMessage > messageInterval) {
        messageOut("analogWrite", thePin, theValue);
        pinMessageTimes[thePin] = Date.now();
        // console.log("message sent");
    } else {
        // console.log("message discarded");
    }
}

function messageIn(JSONobj){
    console.log(JSONobj);
    // go through all the messages in data
    for(let i = 0; i < JSONobj.data.length; i++){
        let theAction = JSONobj.data[i].action;
        let thePin = JSONobj.data[i].pin;
        let theValue = JSONobj.data[i].value;

        switch(thePin) {
            case A0:
                // analogRead on pin A0
                dialValue = theValue;
                break;
            case 12:
                // digitalRead on pin 12

                break;
            default:
            // code block
        }
    }
}

function messageOut(theAction, thePin, theValue, theInterval){
        // construct the messages data
        let JSONobj = {
            'header': {
                'version': 0.3,
            },
            'data': [
                {
                    'action': theAction,
                    'pin': thePin,
                    'value': theValue,
                    'interval': theInterval,
                },
            ],
        };

        const JSONmsg = JSON.stringify(JSONobj);
        sendMessageWhenReady(websock, JSONmsg);
}

function sendMessageWhenReady(websocket, message) {
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(message);
    } else {
        websocket.addEventListener('open', () => {
            websocket.send(message);
        }, { once: true });
    }
}