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


// Arduino Definitions/Enumerators
// define types
let PIN_MODE = 0;
let DIGITAL_READ = 1;
let DIGITAL_WRITE = 2;
let ANALOG_READ = 3;
let ANALOG_WRITE = 4;
// define modes
let INPUT = 0;
let OUTPUT = 1;
let INPUT_PULLUP = 2;
let INPUT_PULLDOWN = 3;
let OUTPUT_OPENDRAIN = 4;
let ANALOG_INPUT = 8;
// let PWM_OUTPUT = 9;
let ANALOG_OUTPUT = 10;
let LOW = 0;
let HIGH = 1;
// Arduino UNO R4 pin numbers
let D0 = 0;
let D1 = 1;
let D2 = 2;
let D3 = 3;
let D4 = 4;
let D5 = 5;
let D6 = 6;
let D7 = 7;
let D8 = 8;
let D9 = 9;
let D10 = 10;
let D11 = 11;
let D12 = 12;
let D13 = 13;
let A0 = 14;
let A1 = 15;
let A2 = 16;
let A3 = 17;
let A4 = 18;
let A5 = 19;

let websock;

let registeredEvents = [];

// limit message sending on each pin to avoid overloading Arduino
// keep track of message transmit times for all pins
const messageTimes = [];
// discard messages with small intervals between sends
let messageOutInterval = 100;
let defaultReadingInterval = 200;

function InitWebSocket(deviceIP) {
    websock = new WebSocket(deviceIP);
    websock.onmessage = function (evt) {
        let JSONobj = JSON.parse(evt.data);
        messageIn(JSONobj);
    }
}

function pinMode(thePin, theMode, theInterval) {
    // get the type
    let theType;
    switch (theMode) {
        case INPUT:
        case INPUT_PULLUP:
        case INPUT_PULLDOWN:
        {
            theType = DIGITAL_READ;
            break;
        }
        case OUTPUT:
        case OUTPUT_OPENDRAIN:
        {
            theType = DIGITAL_WRITE;
            break;
        }
        case ANALOG_INPUT:
        {
            theType = ANALOG_READ;
            break;
        }
    }
    // check to see if pin is registered
    let foundEvent = false;
    for (let event of registeredEvents) {
        if (event.id == thePin) {
            // update values
            // console.log("updating event: " + thePin);
            event.type = theType;
            event.interval = theInterval;
            event.value = null;
            foundEvent = true;
            break;
        }
    }
    if (!foundEvent) {
        // register a new event for this pin
        // console.log("making new event: " + thePin);
        let newEvent = {
            id: thePin,
            type: theType,
            interval: theInterval,
            value: null
        };
        registeredEvents.push(newEvent);
    }
    // register event on Arduino
    messageOut(thePin, PIN_MODE, [thePin], theMode, null, theInterval);
}

function digitalWrite(thePin, theValue) {
    // filter excessive messages
    let lastMessage = messageTimes[thePin];
    if (!lastMessage || Date.now() - lastMessage > messageOutInterval) {
        messageOut(thePin, DIGITAL_WRITE, [thePin], null, theValue);
        messageTimes[thePin] = Date.now();
        // console.log("message sent");
    } else {
        // console.log("message discarded");
    }
}

function analogWrite(thePin, theValue) {
    theValue = Math.floor(theValue);
    // filter excessive messages
    let lastMessageTime = messageTimes[thePin];
    if (!lastMessageTime || Date.now() - lastMessageTime > messageOutInterval) {
        messageOut(thePin, ANALOG_WRITE, [thePin], null, theValue);
        messageTimes[thePin] = Date.now();
        // console.log("message sent");
    } else {
        // console.log("message discarded");
    }
}

function digitalRead(thePin, theInterval) {
    let returnValue;
    // check for pin in registered events
    let eventFound = false;
    for (let event of registeredEvents) {
        if (event.id == thePin) {
            if (event.type == DIGITAL_READ) {
                returnValue = event.value;
                // console.log(event);
            } else {
                // change event and send pinMode message
                // console.log(event);
                event.type = DIGITAL_READ;
                event.interval = theInterval;
                event.value = null;
                // register event on Arduino. default to type INPUT
                messageOut(thePin, PIN_MODE, [thePin], INPUT, null, theInterval);
            }
            eventFound = true;
        }
    }
    // if the event wasn't registered then register a new event
    if (!eventFound) {
        let newEvent = {
            id: thePin,
            type: DIGITAL_READ,
            interval: theInterval,
            value: null
        };
        registeredEvents.push(newEvent);
        // register event on Arduino. default to type INPUT
        messageOut(thePin, PIN_MODE, [thePin], INPUT, null, theInterval);
    }
    // console.log(returnValue);
    return returnValue;
    // if there is no value then it should call a promise to get one
}

function analogRead(thePin, theInterval) {
    let returnValue;
    // check for pin in registered events
    let eventFound = false;
    for (let event of registeredEvents) {
        if (event.id == thePin) {
            if (event.type == ANALOG_READ) {
                returnValue = event.value;
            } else {
                // change event and send pinMode message
                event.type = ANALOG_READ;
                event.interval = theInterval;
                event.value = null;
                // register event on Arduino. default to type INPUT
                messageOut(thePin, PIN_MODE, [thePin], ANALOG_INPUT, null, theInterval);
            }
            eventFound = true;
        }
    }
    if (!eventFound) {
        let newEvent = {
            id: thePin,
            type: ANALOG_READ,
            interval: theInterval,
            value: null
        }
        registeredEvents.push(newEvent);
        // register event on Arduino
        messageOut(thePin, PIN_MODE, [thePin], ANALOG_INPUT, null, theInterval);
    }
    return returnValue;
    // if there is no value then it should call a promise to get one
}

function messageIn(JSONobj) {
    // console.log(JSONobj);
    // go through all the messages in data
    for (let i = 0; i < JSONobj.data.length; i++) {
        let theId = JSONobj.data[i].id;
        let theType = JSONobj.data[i].type;
        let theValue = JSONobj.data[i].value;

        // check for pin in registered events
        let foundEvent = false;
        for (let event of registeredEvents) {
            if (event.id == theId) {
                // check it matches the type
                if (event.type == theType) {
                    event.value = theValue;
                } else {
                    // console.log("no match for event type")
                }
                foundEvent = true;
            }
        }
        if (!foundEvent) {
            let newEvent = {
                id: theId,
                type: theType,
                value: theValue,
            }
            registeredEvents.push(newEvent);
        }
    }
}

function messageOut(id, theAction, thePins, theMode, theValue, theInterval) {
    // construct the messages data
    if (theInterval == null) theInterval = defaultReadingInterval;
    let JSONobj = {
        'header': {
            'version': 0.3,
        },
        'data': [
            {
                'id': id,
                'action': theAction,
                'pins': thePins,
                'mode': theMode,
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
        }, {once: true});
    }
}