#include <WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";   // Change this to your Wi-Fi name
const char* password = "YOUR_WIFI_PASSWORD";  // Change this to your Wi-Fi password

WiFiServer server(80);
#define SENSOR_PIN 34  // Pulse Sensor connected to GPIO34

void setup() {
    Serial.begin(115200);
    pinMode(SENSOR_PIN, INPUT);

    // Connect to Wi-Fi
    Serial.print("Connecting to Wi-Fi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nConnected to Wi-Fi!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());  // Get ESP32 IP Address

    server.begin();
}

void loop() {
    WiFiClient client = server.available();  // Check if a client is connected
    if (client) {
        Serial.println("Client Connected!");
        while (client.connected()) {
            if (client.available()) {
                String request = client.readStringUntil('\r');  // Read HTTP request
                client.flush();

                // Read pulse sensor value
                int pulseValue = analogRead(SENSOR_PIN);
                Serial.print("Pulse: ");
                Serial.println(pulseValue);

                // Send response (Pulse data)
                client.println("HTTP/1.1 200 OK");
                client.println("Content-Type: text/plain");
                client.println("Connection: close");
                client.println();
                client.println(pulseValue);
                break;
            }
        }
        client.stop();
    }
}
