export class TLCMapAPI {
    constructor(iframeElement) {
        this.iframe = iframeElement;
        this.jsonData = null; 
        this.iframeLoaded = false;

        this.iframe.onload = () => {
            this.iframeLoaded = true;
            if (this.jsonData) {
                this.sendDataToMap(this.jsonData);
            }
        };

        window.addEventListener("message", this.handleMessage.bind(this), false);
    }

    // Send JSON data to the map view
    sendDataToMap(jsonData) {
        this.jsonData = jsonData;
        if (this.iframeLoaded) {
            this.iframe.contentWindow.postMessage(jsonData, "*");
        }
    }

    // Handle incoming messages from the map view
    handleMessage(event) {
        if (event.data.event) {
            this.triggerEvent(event.data.event, event.data.details);
        }
    }

    // Listen for specific events from the map
    on(eventName, handler) {
        this.eventHandlers = this.eventHandlers || {};
        this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
        this.eventHandlers[eventName].push(handler);
    }

    // Trigger event handlers
    triggerEvent(eventName, details) {
        if (this.eventHandlers && this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach((handler) =>
                handler(details)
            );
        }
    }
}
