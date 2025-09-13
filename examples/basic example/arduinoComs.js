// ==============================================================
// arduinoComs.js
// P5js to Arduino WebSocket communication
// Works with UNO R4 WiFi and ESP32
// Version v0.12
// by Scott Mitchell
// GPL-3.0 License
// ==============================================================

// ---------------------------
// Protocol enums
// ---------------------------

// ==============================================================
// defs.js
// Protocol IDs and Action Codes (match defs.h on Arduino)
// ==============================================================

// -------------------------------------------------------------------
// Core Actions
// -------------------------------------------------------------------
const PIN_MODE       = 1;
const DIGITAL_WRITE  = 2;
const DIGITAL_READ   = 3;
const ANALOG_WRITE   = 4;
const ANALOG_READ    = 5;
const END            = 6;  // Stop a registered action

const INPUT = 0;
const OUTPUT = 1;
const INPUT_PULLUP = 2;
const INPUT_PULLDOWN = 3;
const OUTPUT_OPENDRAIN = 4;
const ANALOG_INPUT = 8;
const ANALOG_OUTPUT = 10;

const LOW = 0;
const HIGH = 1;

// Arduino UNO R4 pin numbers
const D0 = 0, D1 = 1, D2 = 2, D3 = 3, D4 = 4, D5 = 5, D6 = 6, D7 = 7,
    D8 = 8, D9 = 9, D10 = 10, D11 = 11, D12 = 12, D13 = 13,
    A0 = 14, A1 = 15, A2 = 16, A3 = 17, A4 = 18, A5 = 19;

// ---------------------------
// Arduino wrapper
// ---------------------------

class Arduino {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.registeredEvents = [];
        this.messageTimes = [];
        this.messageOutInterval = 100;
        this.defaultReadingInterval = 200;
        this.messageQueue = [];

        // Reconnection properties
        this.deviceIP = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.reconnectTimeout = null;
        this.isReconnecting = false;

        this.extensions = {}; // container for attached extensions
    }

    connect(deviceIP) {
        this.deviceIP = deviceIP;
        this.reconnectAttempts = 0;
        this._connect();
    }

    _connect() {
        if (this.isReconnecting) return;

        console.log(`Attempting to connect to ${this.deviceIP}...`);

        try {
            this.socket = new WebSocket(this.deviceIP);

            this.socket.onopen = () => {
                console.log("WebSocket connected successfully");
                this.connected = true;
                this.isReconnecting = false;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000; // Reset delay

                // Clear any pending reconnect timeout
                if (this.reconnectTimeout) {
                    clearTimeout(this.reconnectTimeout);
                    this.reconnectTimeout = null;
                }

                // Flush queued messages
                while (this.messageQueue.length) {
                    const msg = this.messageQueue.shift();
                    this.socket.send(JSON.stringify(msg));
                    console.log('Queued message sent:', JSON.stringify(msg));
                }
            };

            this.socket.onclose = (event) => {
                console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
                this.connected = false;
                this._handleDisconnection();
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.connected = false;
            };

            this.socket.onmessage = (evt) => {
                const msg = JSON.parse(evt.data);
                this.messageIn(msg);
            };

        } catch (error) {
            console.error("Failed to create WebSocket:", error);
            this._handleDisconnection();
        }
    }

    _handleDisconnection() {
        if (this.isReconnecting) return;

        this.connected = false;
        this.isReconnecting = true;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
            this.isReconnecting = false;
            return;
        }

        this.reconnectAttempts++;

        // Calculate exponential backoff delay
        const delay = Math.min(
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);

        this.reconnectTimeout = setTimeout(() => {
            this.isReconnecting = false;
            this._connect();
        }, delay);
    }

    // Method to manually trigger reconnection
    reconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.isReconnecting = false;
        this.reconnectAttempts = 0;

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }

        this._connect();
    }

    // Method to stop all reconnection attempts
    disconnect() {
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.isReconnecting = false;

        if (this.socket) {
            this.socket.close();
        }

        console.log("Manually disconnected - auto-reconnection disabled");
    }

    // Get connection status info
    getStatus() {
        return {
            connected: this.connected,
            isReconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            deviceIP: this.deviceIP
        };
    }

    // ---------------------------
    // Core send method (multiple data objects supported)
    // ---------------------------
    send(data) {
        const payload = Array.isArray(data) ? data : [data];
        const msg = { header: { version: 1 }, data: payload };

        if (!this.connected) {
            // queue the message
            this.messageQueue.push(msg);
            console.log('Message queued (not connected):', JSON.stringify(msg));
            return;
        }

        try {
            this.socket.send(JSON.stringify(msg));
            console.log('Message sent:', JSON.stringify(msg));
        } catch (error) {
            console.error('Failed to send message:', error);
            // Queue the message for retry
            this.messageQueue.push(msg);
        }
    }

    // Event registration
    registerEvent(pin, type, interval, value = null, threshold = 0) {
        let event = this.registeredEvents.find(e => e.id === pin && e.type === type);

        if (!event) {
            event = {
                id: pin,
                type: type,
                interval: interval,
                lastUpdate: 0,
                value: value,
                lastSentValue: null,
                threshold: threshold // Minimum change to trigger send
            };
            this.registeredEvents.push(event);
        } else {
            // Update existing event
            event.interval = interval;
            event.threshold = threshold;
        }

        return event;
    }

    // Helper to check if we should send based on timing and value change
    shouldSend(event, newValue) {
        const now = Date.now();
        const timePassed = now - event.lastUpdate >= event.interval;

        if (!timePassed) return false;

        // For output events, check if value changed significantly
        if (event.type === DIGITAL_WRITE || event.type === ANALOG_WRITE) {
            if (event.lastSentValue === null) return true; // First send

            if (event.type === DIGITAL_WRITE) {
                return newValue !== event.lastSentValue; // Digital: exact match required
            } else {
                return Math.abs(newValue - event.lastSentValue) > event.threshold; // Analog: threshold
            }
        }

        return true; // For all other events, always send if time passed
    }

    // ---------------------------
    // Arduino-like API methods (unchanged)
    // ---------------------------
    pinMode(pin, mode, interval = this.defaultReadingInterval) {
        // Remove any existing event for this pin
        this.registeredEvents = this.registeredEvents.filter(e => e.id !== pin);

        // Just send the request to Arduino
        this.send({
            id: pin,
            action: PIN_MODE,
            params: [mode]
        });

        return this;
    }

    digitalWrite(pin, value, interval = this.messageOutInterval, threshold = 0) {
        const event = this.registerEvent(pin, DIGITAL_WRITE, interval, value, threshold);

        // if new registration or passes send check then send message
        if (event.lastUpdate === 0 || this.shouldSend(event, value)) {
            this.send({ id: pin, action: DIGITAL_WRITE, params: [value] });
            event.lastUpdate = Date.now();
            event.lastSentValue = value;
        }
    }

    analogWrite(pin, value, interval = this.messageOutInterval, threshold = 2) {
        // Ensure value is an integer first
        const intValue = Math.round(value);

        // Register and work with the cleaned integer value consistently
        const event = this.registerEvent(pin, ANALOG_WRITE, interval, intValue, threshold);

        // if new registration or passes send check then send message
        if (event.lastUpdate === 0 || this.shouldSend(event, intValue)) {
            this.send({ id: pin, action: ANALOG_WRITE, params: [intValue] });
            event.lastUpdate = Date.now();
            event.lastSentValue = intValue;
        }
    }

    digitalRead(pin, interval = this.defaultReadingInterval) {
        const event = this.registerEvent(pin, DIGITAL_READ, interval);

        if (event.lastUpdate === 0) { // New registration
            this.send({ id: pin, action: DIGITAL_READ, params: [interval] });
            event.lastUpdate = Date.now();
        }

        return event.value ?? 0;
    }

    analogRead(pin, interval = this.defaultReadingInterval) {
        const event = this.registerEvent(pin, ANALOG_READ, interval);

        if (event.lastUpdate === 0) { // New registration
            this.send({ id: pin, action: ANALOG_READ, params: [interval] });
            event.lastUpdate = Date.now();
        }

        return event.value ?? 0;
    }

    // ---------------------------
    // Internal helpers
    // ---------------------------
    _modeToType(mode) {
        switch (mode) {
            case INPUT:
            case INPUT_PULLUP:
            case INPUT_PULLDOWN: return DIGITAL_READ;
            case OUTPUT:
            case OUTPUT_OPENDRAIN: return DIGITAL_WRITE;
            case ANALOG_INPUT: return ANALOG_READ;
            default: return null;
        }
    }

    messageIn(msg) {
        if (!msg.data) return;

        msg.data.forEach(item => {
            let event = this.registeredEvents.find(e => e.id === item.id);
            if (event) {
                event.value = item.value;
            } else {
                this.registeredEvents.push({
                    id: item.id,
                    type: item.type,
                    value: item.value
                });
            }
        });
    }

    // ---------------------------
    // Extension handling
    // ---------------------------
    attach(id, extension) {
        this.extensions[id] = extension;
        if (extension.name) {
            this[extension.name] = extension; // shortcut property
        }
        return this; // chainable
    }
}
