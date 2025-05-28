// ==============================================================
// Arduino UNO R4 WiFi WebSocket Server
// by Scott Mitchell
//
// ==============================================================
//
// version B1 - working code v0.7
//  - basic pin functionality

#include <Arduino.h>
#include <stdarg.h>
#include <stdio.h>
#include "WiFiS3.h"
#include <WebSocketsServer.h>
#include <ArduinoJson.h>;
// libraries for Arduino UNO R4
// include ArduinoGraphics BEFORE Arduino_LED_Matrix
#include "ArduinoGraphics.h"
#include "Arduino_LED_Matrix.h"
#include "TextAnimation.h"
// enter your sensitive data in secrets.h
#include "secrets.h"
#include "defs.h"


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
bool matrixDisplayReady = true; // why is this true?

struct Actions {
  int16_t id;
  int16_t type;
  int16_t mode;
  int16_t pins[10];
  unsigned long lastUpdate;
  unsigned long interval;
};

// allocate memory and limit actions to 100
#define NUM_ACTIONS 100
Actions registeredActions[NUM_ACTIONS];


void setup() {
  Serial.begin(115200);

  matrix.begin();
  matrixText("Web Socket Server", SCROLL_LEFT);

  int cnt = 1000;  // Will wait for up to ~1 second for Serial to connect.
  while (!Serial && cnt--) {
    delay(1);
  }

  // fill actions with NULL values
  for (int i = 0; i < NUM_ACTIONS; i++) {
    registeredActions[i].id = NULL;
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

  Serial.println("WiFi Connected!");

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

  for (int i = 0; i < NUM_ACTIONS; i++) {
    if (registeredActions[i].id != NULL) {
      // Serial.println(i);
      if (millis() - registeredActions[i].lastUpdate > registeredActions[i].interval) {
        // Serial.print("registered id: ");
        // Serial.println(registeredActions[i].id);
        // Serial.print(" interval: ");
        // Serial.println(registeredActions[i].interval);

        if (registeredActions[i].id < 100) {
          switch (registeredActions[i].type) {
            case DIGITAL_READ:
              {
                float theValue = (float)digitalRead(registeredActions[i].id);
                // int theValue = digitalRead(registeredActions[i].id);
                returnMessage(registeredActions[i].id, DIGITAL_READ, theValue);
                // Serial.print("Digital Read: ");
                // Serial.println(theValue);

                break;
              }
            case ANALOG_READ:
              {
                float theValue = (float)analogRead(registeredActions[i].id);
                returnMessage(registeredActions[i].id, ANALOG_READ, theValue);
                // Serial.print("Analog Read: ");
                // Serial.println(theValue);

                break;
              }
          }

        } else {
          // handle other sensors
        }
        registeredActions[i].lastUpdate = millis();
      }
    }
  }
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
        // Serial.print("payload = ");
        // Serial.println((const char*)payload);

        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload);
        if (error) {
          Serial.print("deserializeJson() failed: ");
          Serial.println(error.c_str());
        } else {
          for (int i = 0; i < doc["data"].size(); i++) {
            // Serial.print("item ");
            // Serial.println(i);

            int id = doc["data"][i]["id"];
            int theAction = doc["data"][i]["action"];
            int theMode = doc["data"][i]["mode"];
            // if interval is 0 then read only on demand

            // id numbers 0 - 99 are pins
            if (id < 100) {
              int thePin = doc["data"][i]["pins"][0];
              switch (theAction) {
                case PIN_MODE:
                  {
                    // get index in registeredActions
                    int actionIndex = getIndex(id);
                    // update the id (for when it's a new action)
                    registeredActions[actionIndex].id = id;

                    switch (theMode) {
                      case INPUT:
                      case INPUT_PULLUP:
                      case INPUT_PULLDOWN:
                        {
                          registeredActions[actionIndex].type = DIGITAL_READ;
                          pinMode(thePin, theMode);
                          break;
                        }
                      case OUTPUT:
                      case OUTPUT_OPENDRAIN:
                        {
                          // registeredActions[actionIndex].type = DIGITAL_WRITE;
                          pinMode(thePin, theMode);
                          break;
                        }
                      case ANALOG_INPUT:
                        {
                          registeredActions[actionIndex].type = ANALOG_READ;
                          // no pinMode setup for analog pins
                          break;
                        }
                    }
                    registeredActions[actionIndex].mode = theMode;
                    registeredActions[actionIndex].pins[0] = thePin;
                    registeredActions[actionIndex].lastUpdate = millis();
                    unsigned long theInterval = doc["data"][i]["interval"];
                    registeredActions[actionIndex].interval = theInterval;
                    // Serial.print("pin ");
                    // Serial.print(thePin);
                    // Serial.print(" set to: ");
                    // Serial.println(theMode);
                    break;
                  }
                case DIGITAL_READ:
                  {
                    // read the pin and return a value
                    float returnValue = (float)digitalRead(thePin);
                    returnMessage(id, DIGITAL_READ, returnValue);
                    // Serial.print("pin ");
                    // Serial.print(thePin);
                    // Serial.print(" digitalRead value: ");
                    // Serial.println(returnValue);
                    break;
                  }
                case DIGITAL_WRITE:
                  {
                    // set the pin to the value
                    int theValue = doc["data"][i]["value"];
                    digitalWrite(thePin, theValue);
                    // Serial.print("pin ");
                    // Serial.print(thePin);
                    // Serial.print(" digitalWrite value: ");
                    // Serial.println(theValue);
                    break;
                  }
                case ANALOG_READ:
                  {
                    // read the pin and return a value
                    float returnValue = (float)analogRead(thePin);
                    returnMessage(id, ANALOG_READ, returnValue);
                    // Serial.print("pin ");
                    // Serial.print(thePin);
                    // Serial.print(" analogRead value: ");
                    // Serial.println(returnValue);
                    break;
                  }
                case ANALOG_WRITE:
                  {
                    // set the pin to the value
                    int theValue = doc["data"][i]["value"];
                    analogWrite(thePin, theValue);
                    // Serial.print("pin ");
                    // Serial.print(thePin);
                    // Serial.print(" analogWrite value: ");
                    // Serial.println(theValue);
                    break;
                  }
              }
            } else {
              // process sensor actions id 100+
              //
              // get index in registeredActions
              int actionIndex = getIndex(id);
              // update the id (for when it's a new action)
              registeredActions[actionIndex].id = id;
              // fill the registeredAction pins
              JsonArray thePins = doc["data"][i]["pins"].as<JsonArray>();
              int index = 0;
              for (JsonVariant value : thePins) {
                registeredActions[actionIndex].pins[index] = value;
                index++;
                if (index >= 10) break;
              }
            }
          }
        }
        break;
      }
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

void returnMessage(int id, int theType, float returnValue) {
  // Allocate the JSON document
  JsonDocument doc;
  // Add values in the document
  doc["header"]["version"] = 0.7;
  doc["data"][0]["id"] = id;
  doc["data"][0]["type"] = theType;
  doc["data"][0]["value"] = returnValue;
  // turn JSON into a string
  char JSONtxt[256];
  serializeJson(doc, JSONtxt);
  // Serial.println("broadcasting...");
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

int getIndex(int theId) {
  // return the index for this id or, if it's not there, the first empty index
  int theIndex = 0;
  for (int i = NUM_ACTIONS - 1; i >= 0; i--) {
    if (registeredActions[i].id == theId) {
      theIndex = i;
      break;
    }
    if (registeredActions[i].type == NULL) theIndex = i;
  }
  return theIndex;
}
