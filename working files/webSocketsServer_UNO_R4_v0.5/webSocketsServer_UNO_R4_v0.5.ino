// ==============================================================
// Arduino UNO R4 WiFi WebSocket Server
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

// v 0.6 set intervals for messages - not done
// v 0.5 added Enumerators to Javascript so INPUT/OUTPUT etc. are passed as integers
// v 0.4 display IP address on R4 Matrix.
// v 0.3 JSON messages address pins
// v 0.2 Added JSON messages
// v 0.1 Basic functionality

#include <Arduino.h>
#include <stdarg.h>
#include <stdio.h>
#include "WiFiS3.h"
#include <WebSocketsServer.h>
#include <ArduinoJson.h>;
#include <millisDelay.h>
// libraries for Arduino UNO R4
// include ArduinoGraphics BEFORE Arduino_LED_Matrix
#include "ArduinoGraphics.h"
#include "Arduino_LED_Matrix.h"
#include "TextAnimation.h"
// enter your sensitive data in secrets.h
#include "secrets.h"

WebSocketsServer webSocket = WebSocketsServer(81);

const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;
IPAddress myIP;
bool serialMonitorIP = true;

ArduinoLEDMatrix matrix;
// 100 frames maximum.
// Compute as maximum length of text you want to print (eg. 20 chars)
// multiplied by font width (eg. 5 for Font_5x7), so 20 chars * 5 px = 100.
TEXT_ANIMATION_DEFINE(anim, 100)
bool matrixDisplayReady = true;

// millisDelay IPtimer;
unsigned long defaultInterval = 500;

struct Actions {
    const char* type;
    byte pin;
    unsigned long lastUpdate;
    unsigned long interval;
    float value;
};

// allocate memory and limit actions to 100
Actions registeredActions[100];


// void updateServoPositions() {
//     for (byte n = 0; n < 1; n++) {
//         if (myServo[n].curPosition < myServo[n].endPosition) {
//             myServo[n].curPosition += myServo[n].step;
//             if (myServo[n].curPosition > myServo[n].endPosition) {
//                 myServo[n].curPosition = myServo[n].endPosition;
//             }
//             myServo[n].servo.write(myServo[n].curPosition);
//         }
//     }
// }


void setup() {
  Serial.begin(115200);

  matrix.begin();
  matrixText("Web Socket Server", SCROLL_LEFT);

  int cnt = 1000;  // Will wait for up to ~1 second for Serial to connect.
  while (!Serial && cnt--) {
    delay(1);
  }

  Serial.println();
  for (uint8_t t = 4; t > 0; t--) {
    Serial.println("[SETUP] BOOT WAIT ...");
    Serial.flush();
    delay(1000);
  }

  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true)
      ;
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  Serial.println("[Wifi]: Connecting");

  int status = WL_IDLE_STATUS;

  // attempt to connect to WiFi network:
  while (status != WL_CONNECTED) {
    Serial.print("[Wifi]: Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, password);
    delay(1000);
  }

  Serial.println("Connected!");

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // try ever 5000 again if connection failed
  // webSocket.setReconnectInterval(5000); // this is for client only
}

void loop() {
  webSocket.loop();

  if (matrixDisplayReady) {
    matrixDisplayReady = false;
    displayIP();
  }
  // if (IPtimer.justFinished()) {
  //   // display IP address
  //   displayIP();
  // }
  // delay(100);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {

  switch (type) {
    case WStype_DISCONNECTED:
      // Serial.println(" Disconnected!");
      break;
    case WStype_CONNECTED:
      {
        Serial.println("Connected");
        break;
      }
    case WStype_TEXT:
      {
        Serial.print("payload = ");
        Serial.println((const char*)payload);

        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload);
        if (error) {
          Serial.print("deserializeJson() failed: ");
          Serial.println(error.c_str());
        } else {
          for (int i = 0; i < doc["data"].size(); i++) {
            // Serial.print("item ");
            // Serial.println(i);

            const char* theAction = doc["data"][i]["action"];
            int thePin = doc["data"][i]["pin"];

            if (strcmp(theAction, "pinMode") == 0) {
              // setup pins
              int theMode = doc["data"][i]["value"];
              unsigned long theInterval = doc["data"][i]["interval"];
              if(theInterval == NULL) theInterval = defaultInterval;
              // setup pin
              pinMode(thePin, theMode);
              // setup interval read
              
              // if interval is 0 then read only on demand
              Serial.print("pin ");
              Serial.print(thePin);
              Serial.print(" set to ");
              Serial.println(theMode);

            } else if (strcmp(theAction, "digitalRead") == 0) {
              // read the pin and return a value
              int returnValue = digitalRead(thePin);
              returnMessage("digitalRead", thePin, returnValue);
              Serial.print("pin ");
              Serial.print(thePin);
              Serial.print(" digitalRead value: ");
              Serial.println(returnValue);

            } else if (strcmp(theAction, "analogRead") == 0) {
              // read the pin and return a value
              int returnValue = analogRead(thePin);
              returnMessage("analogRead", thePin, returnValue);
              Serial.print("pin ");
              Serial.print(thePin);
              Serial.print(" analogRead value: ");
              Serial.println(returnValue);

            } else if (strcmp(theAction, "digitalWrite") == 0) {
              // set the pin to the value
              int theValue = doc["data"][i]["value"];
              digitalWrite(thePin, theValue);
              Serial.print("pin ");
              Serial.print(thePin);
              Serial.print(" digitalWrite value: ");
              Serial.println(theValue);

            } else if (strcmp(theAction, "analogWrite") == 0) {
              // set the pin to the value
              int theValue = doc["data"][i]["value"];
              analogWrite(thePin, theValue);
              Serial.print("pin ");
              Serial.print(thePin);
              Serial.print(" analogWrite value: ");
              Serial.println(theValue);
            }
          }
        }
      }
      break;
    case WStype_BIN:
      {
        Serial.print(num);
        Serial.print(" get binary length: ");
        Serial.println(length);
        // hexdump(payload, length);

        // send message to client
        // webSocket.sendBIN(num, payload, length);
        break;
      }
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
  }
}

void returnMessage(const char* theAction, int pinNum, int returnValue) {
  // Allocate the JSON document
  JsonDocument doc;
  // Add values in the document
  doc["header"]["version"] = 0.3;
  doc["data"][0]["action"] = theAction;
  doc["data"][0]["pin"] = pinNum;
  doc["data"][0]["value"] = returnValue;
  // turn JSON into a string
  char JSONtxt[256];
  serializeJson(doc, JSONtxt);
  webSocket.broadcastTXT(JSONtxt);
}

void displayIP() {
  myIP = WiFi.localIP();
  const char* ipStr = ipAddressToString(myIP);
  matrixText(ipStr, SCROLL_LEFT);
  if (serialMonitorIP) {
    Serial.print("IP Address: ");
    Serial.println(ipStr);
    if (strcmp(ipStr, "0.0.0.0") == 0) {
      Serial.println("try again in 2 sec");
    } else serialMonitorIP = false;
  }
}

void matrixCallback() {
  // callback is executed in IRQ and should run as fast as possible
  matrixDisplayReady = true;
}

void matrixText(const char* text, int scroll) {
  matrix.beginDraw();
  matrix.stroke(0xFFFFFFFF);
  matrix.textFont(Font_4x6);
  if (scroll) matrix.textScrollSpeed(80);
  matrix.setCallback(matrixCallback);
  matrix.beginText(0, 1, 0xFFFFFF);
  matrix.print("   ");
  matrix.println(text);
  matrix.endTextAnimation(scroll, anim);
  matrix.loadTextAnimationSequence(anim);
  matrix.play();
}

const char* ipAddressToString(const IPAddress& ip) {
  static char ipString[16];  // Buffer to hold the string representation (max 15 chars + null terminator)
  sprintf(ipString, "%d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3]);
  return ipString;
}