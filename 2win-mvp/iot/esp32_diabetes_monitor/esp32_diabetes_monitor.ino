/*
 * ESP32 Diabetes Health Monitor
 * Collects sensor data and uploads to 2WIN.AI backend for health prediction
 * 
 * Sensors:
 * - MAX30205: Body Temperature
 * - DHT11: Ambient Temperature & Humidity  
 * - MPU6050: Motion/Activity detection
 * - Pulse Sensor: Heart rate (simulated if no sensor)
 * - Battery monitoring
 *
 * ═══════════════════════════════════════════════════════════════
 *  HOW TO SET UP:
 *  1. Set your WiFi name & password below
 *  2. Set BACKEND_URL to your PC's IP (run 'ipconfig' to find it)
 *  3. Register a device via the 2WIN.AI web app (Profile → Devices)
 *  4. Paste the device_key you get into DEVICE_KEY below
 *  5. Flash this sketch to your ESP32
 *  6. Open Serial Monitor at 115200 baud to see output
 * ═══════════════════════════════════════════════════════════════
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <MAX30205.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>

// ═══════════════════════════════════════════
// ✏️  EDIT THESE 3 VALUES BEFORE FLASHING
// ═══════════════════════════════════════════

const char* WIFI_SSID     = "YOUR_WIFI_SSID";       // ← your WiFi name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // ← your WiFi password
const char* DEVICE_KEY    = "YOUR_DEVICE_KEY";       // ← from web app device registration

// Backend URL — use your PC's local IP (find with 'ipconfig' command)
// Example: "http://192.168.1.5:8000"
// For deployed server: "https://your-render-url.onrender.com"
const char* BACKEND_URL = "http://192.168.1.X:8000"; // ← your PC IP + port 8000

// ═══════════════════════════════════════════

// Sensor Objects
MAX30205 tempSensor;
DHT dht(4, DHT11);  // DHT11 on GPIO 4
Adafruit_MPU6050 mpu;

// Device Config
String DEVICE_UID;
const int UPLOAD_INTERVAL = 30000;       // Upload every 30 seconds
const int SENSOR_READ_INTERVAL = 5000;   // Read sensors every 5 seconds

// Sensor flags
bool hasMAX30205 = false;
bool hasMPU6050 = false;

// Data Structure
struct HealthData {
  float bodyTemperature;
  float ambientTemperature;
  float humidity;
  int heartRate;
  int stepsPerMinute;
  float activityIntensity;
  int batteryLevel;
  int signalStrength;
};

HealthData currentData;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║   ESP32 2WIN.AI Health Monitor       ║");
  Serial.println("╚══════════════════════════════════════╝");
  
  DEVICE_UID = "ESP32_" + WiFi.macAddress();
  Serial.print("Device UID: ");
  Serial.println(DEVICE_UID);
  
  // Initialize sensors
  initializeSensors();
  
  // Connect to WiFi
  connectWiFi();
  
  // LED for status
  pinMode(LED_BUILTIN, OUTPUT);
  
  Serial.println("✅ Setup complete. Starting data collection...");
  Serial.println();
}

void loop() {
  static unsigned long lastSensorRead = 0;
  static unsigned long lastUpload = 0;
  
  unsigned long now = millis();
  
  // Read sensors every 5 seconds
  if (now - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    printHealthData();
    lastSensorRead = now;
  }
  
  // Upload data every 30 seconds
  if (now - lastUpload >= UPLOAD_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      uploadToBackend();
      lastUpload = now;
    } else {
      Serial.println("⚠️  WiFi disconnected. Reconnecting...");
      connectWiFi();
    }
  }
  
  // Heartbeat LED
  static unsigned long lastBlink = 0;
  if (now - lastBlink >= 2000) {
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
    lastBlink = now;
  }
  
  delay(100);
}

// ═══════════════════════════════════════════
// SENSOR INITIALIZATION
// ═══════════════════════════════════════════

void initializeSensors() {
  Wire.begin();
  
  // MAX30205 (Body Temperature)
  if (tempSensor.begin()) {
    hasMAX30205 = true;
    Serial.println("✅ MAX30205 body temperature sensor found");
  } else {
    Serial.println("⚠️  MAX30205 not found — will simulate body temp");
  }
  
  // DHT11 (Ambient Temp/Humidity)
  dht.begin();
  Serial.println("✅ DHT11 initialized");
  
  // MPU6050 (Motion/Activity)
  if (mpu.begin()) {
    hasMPU6050 = true;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DPS);
    Serial.println("✅ MPU6050 motion sensor found");
  } else {
    Serial.println("⚠️  MPU6050 not found — will simulate activity");
  }
}

// ═══════════════════════════════════════════
// SENSOR READING
// ═══════════════════════════════════════════

void readSensors() {
  // Body Temperature
  if (hasMAX30205) {
    float tempC = tempSensor.getTemperature();
    currentData.bodyTemperature = tempC * 9.0 / 5.0 + 32.0; // Convert C → F
  } else {
    currentData.bodyTemperature = 98.6 + (random(-50, 50) / 100.0);
  }
  
  // Ambient Temperature & Humidity (DHT11)
  float ambientTemp = dht.readTemperature(true); // true = Fahrenheit
  float humidity = dht.readHumidity();
  
  currentData.ambientTemperature = isnan(ambientTemp) ? (70.0 + random(-100, 100) / 100.0) : ambientTemp;
  currentData.humidity = isnan(humidity) ? (45.0 + random(-100, 100) / 100.0) : humidity;
  
  // Heart Rate (simulated — replace with pulse sensor if available)
  currentData.heartRate = 65 + random(0, 30);
  
  // Motion / Activity (MPU6050)
  if (hasMPU6050) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    currentData.activityIntensity = sqrt(
      a.acceleration.x * a.acceleration.x +
      a.acceleration.y * a.acceleration.y +
      a.acceleration.z * a.acceleration.z
    );
  } else {
    currentData.activityIntensity = random(0, 100) / 100.0;
  }
  
  // Steps per minute (estimated from activity intensity)
  currentData.stepsPerMinute = (currentData.activityIntensity > 2.0) ? (80 + random(0, 40)) : 0;
  
  // Battery level
  currentData.batteryLevel = map(analogRead(A0), 0, 4095, 0, 100);
  
  // WiFi signal
  currentData.signalStrength = WiFi.RSSI();
}

// ═══════════════════════════════════════════
// UPLOAD TO 2WIN BACKEND (FastAPI)
// ═══════════════════════════════════════════

void uploadToBackend() {
  Serial.println("📤 Uploading to 2WIN backend...");
  
  // Build JSON: { "device_key": "...", "readings": [...] }
  DynamicJsonDocument doc(2048);
  doc["device_key"] = DEVICE_KEY;
  
  JsonArray readings = doc.createNestedArray("readings");
  
  // Heart rate
  JsonObject hr = readings.createNestedObject();
  hr["device_id"] = DEVICE_UID;
  hr["metric"] = "heart_rate";
  hr["value"] = currentData.heartRate;
  hr["unit"] = "bpm";
  
  // Body temperature
  JsonObject bt = readings.createNestedObject();
  bt["device_id"] = DEVICE_UID;
  bt["metric"] = "body_temperature";
  bt["value"] = currentData.bodyTemperature;
  bt["unit"] = "°F";
  
  // SpO2 (simulated — replace if you add a MAX30102 sensor)
  JsonObject sp = readings.createNestedObject();
  sp["device_id"] = DEVICE_UID;
  sp["metric"] = "spo2";
  sp["value"] = 95 + random(0, 4);  // 95-98%
  sp["unit"] = "%";
  
  // Steps per minute
  JsonObject steps = readings.createNestedObject();
  steps["device_id"] = DEVICE_UID;
  steps["metric"] = "steps_per_minute";
  steps["value"] = currentData.stepsPerMinute;
  steps["unit"] = "steps/min";
  
  // Ambient temperature
  JsonObject at = readings.createNestedObject();
  at["device_id"] = DEVICE_UID;
  at["metric"] = "ambient_temperature";
  at["value"] = currentData.ambientTemperature;
  at["unit"] = "°F";
  
  // Humidity
  JsonObject hm = readings.createNestedObject();
  hm["device_id"] = DEVICE_UID;
  hm["metric"] = "humidity";
  hm["value"] = currentData.humidity;
  hm["unit"] = "%";
  
  // Serialize
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // POST to backend /api/iot/ingest
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/iot/ingest";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 second timeout
  
  Serial.print("  → POST ");
  Serial.println(url);
  
  int httpCode = http.POST(jsonPayload);
  
  if (httpCode > 0) {
    String response = http.getString();
    
    if (httpCode == 200) {
      Serial.println("  ✅ Upload successful!");
      Serial.print("  Response: ");
      Serial.println(response);
    } else {
      Serial.print("  ❌ Server returned: ");
      Serial.println(httpCode);
      Serial.print("  Body: ");
      Serial.println(response);
    }
  } else {
    Serial.print("  ❌ Connection failed: ");
    Serial.println(http.errorToString(httpCode));
    Serial.println("  Check: Is backend running? Is IP correct?");
  }
  
  http.end();
  Serial.println();
}

// ═══════════════════════════════════════════
// WIFI
// ═══════════════════════════════════════════

void connectWiFi() {
  Serial.print("📡 Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.print("   IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println(" Failed!");
    Serial.println("   Check WIFI_SSID and WIFI_PASSWORD");
  }
}

// ═══════════════════════════════════════════
// DEBUG OUTPUT
// ═══════════════════════════════════════════

void printHealthData() {
  Serial.println("┌─── Sensor Readings ───────────────┐");
  Serial.print("│ Body Temp:    "); Serial.print(currentData.bodyTemperature, 1); Serial.println(" °F");
  Serial.print("│ Ambient Temp: "); Serial.print(currentData.ambientTemperature, 1); Serial.println(" °F");
  Serial.print("│ Humidity:     "); Serial.print(currentData.humidity, 1); Serial.println(" %");
  Serial.print("│ Heart Rate:   "); Serial.print(currentData.heartRate); Serial.println(" BPM");
  Serial.print("│ Steps/min:    "); Serial.print(currentData.stepsPerMinute); Serial.println();
  Serial.print("│ Activity:     "); Serial.print(currentData.activityIntensity, 2); Serial.println(" m/s²");
  Serial.print("│ Battery:      "); Serial.print(currentData.batteryLevel); Serial.println(" %");
  Serial.print("│ WiFi Signal:  "); Serial.print(currentData.signalStrength); Serial.println(" dBm");
  Serial.println("└───────────────────────────────────┘");
}
