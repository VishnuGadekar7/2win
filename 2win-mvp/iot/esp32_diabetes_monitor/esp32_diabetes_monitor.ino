/*
 * ESP32 Diabetes Health Monitor
 * Collects sensor data and uploads to Supabase for diabetes prediction
 * 
 * Sensors:
 * - MAX30201: Body Temperature
 * - DHT11: Ambient Temperature & Humidity  
 * - MPU6050: Motion/Activity detection
 * - Pulse Sensor: Heart rate (optional)
 * - Battery monitoring
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <MAX30205.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <EEPROM.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Configuration
const char* SUPABASE_URL = "https://pagibeepfdiecyvactne.supabase.co";
const char* SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZ2liZWVwZmRpZWN5dmFjdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MTg4MjQsImV4cCI6MjA4Mjk5NDgyNH0.HJY3i-FWxOynDjQWbby8pek7Dgw5oXqra42q1JGLuPs";
const char* DEVICE_KEY = "YOUR_DEVICE_KEY"; // 32-character key from backend

// Sensor Objects
MAX30205 tempSensor;
DHT dht(D4, DHT11); // DHT11 on pin D4
Adafruit_MPU6050 mpu;

// Device Configuration
String DEVICE_UID = "ESP32_" + WiFi.macAddress();
String DEVICE_NAME = "Diabetes Monitor 1.0";
const int UPLOAD_INTERVAL = 30000; // 30 seconds
const int SENSOR_READ_INTERVAL = 5000; // 5 seconds

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
  unsigned long timestamp;
};

HealthData currentData;
WiFiClient client;
HTTPClient http;

void setup() {
  Serial.begin(115200);
  EEPROM.begin(512);
  
  Serial.println("=== ESP32 Diabetes Health Monitor ===");
  Serial.print("Device UID: ");
  Serial.println(DEVICE_UID);
  
  // Initialize sensors
  initializeSensors();
  
  // Connect to WiFi
  connectWiFi();
  
  // Initialize device key if not exists
  initializeDeviceKey();
  
  Serial.println("Setup complete. Starting data collection...");
}

void loop() {
  static unsigned long lastSensorRead = 0;
  static unsigned long lastUpload = 0;
  static unsigned long lastHeartbeat = 0;
  
  unsigned long currentTime = millis();
  
  // Read sensors every 5 seconds
  if (currentTime - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorRead = currentTime;
    
    // Print data to Serial for debugging
    printHealthData();
  }
  
  // Upload data every 30 seconds
  if (currentTime - lastUpload >= UPLOAD_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      uploadToSupabase();
      lastUpload = currentTime;
    } else {
      Serial.println("WiFi disconnected. Attempting reconnection...");
      connectWiFi();
    }
  }
  
  // Heartbeat LED every 2 seconds
  if (currentTime - lastHeartbeat >= 2000) {
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
    lastHeartbeat = currentTime;
  }
  
  delay(100);
}

void initializeSensors() {
  // Initialize MAX30201 (Body Temperature)
  if (!tempSensor.begin(0x57)) {
    Serial.println("MAX30201 not found. Using simulated data.");
  } else {
    tempSensor.setDeviceMode(MAX30205_MODE_CONTINUOUS);
    tempSensor.setConversionRate(MAX30205_CONVERSION_RATE_4_HZ);
  }
  
  // Initialize DHT11 (Ambient Temp/Humidity)
  dht.begin();
  
  // Initialize MPU6050 (Motion/Activity)
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found. Using simulated activity data.");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DPS);
  }
  
  // Initialize LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  
  Serial.println("Sensors initialized.");
}

void readSensors() {
  // Read body temperature
  if (tempSensor.begin()) {
    currentData.bodyTemperature = tempSensor.readThermocoupleTemperature();
  } else {
    // Simulate body temperature (98.6°F ± 0.5°F)
    currentData.bodyTemperature = 98.6 + (random(-50, 50) / 100.0);
  }
  
  // Read ambient temperature and humidity
  float ambientTemp = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (!isnan(ambientTemp)) {
    currentData.ambientTemperature = ambientTemp;
  } else {
    currentData.ambientTemperature = 70.0 + (random(-100, 100) / 100.0);
  }
  
  if (!isnan(humidity)) {
    currentData.humidity = humidity;
  } else {
    currentData.humidity = 45.0 + (random(-100, 100) / 100.0);
  }
  
  // Simulate heart rate (60-100 BPM)
  currentData.heartRate = 60 + random(0, 40);
  
  // Read activity from MPU6050 or simulate
  sensors_event_t a, g, temp;
  if (mpu.begin()) {
    mpu.getEvent(&a, &g, &temp);
    currentData.activityIntensity = sqrt(a.acceleration.x*a.acceleration.x + 
                                        a.acceleration.y*a.acceleration.y + 
                                        a.acceleration.z*a.acceleration.z);
  } else {
    currentData.activityIntensity = random(0, 100) / 100.0;
  }
  
  // Simulate steps per minute based on activity
  if (currentData.activityIntensity > 2.0) {
    currentData.stepsPerMinute = 80 + random(0, 40);
  } else {
    currentData.stepsPerMinute = 0;
  }
  
  // Read battery level
  currentData.batteryLevel = map(analogRead(A0), 0, 4095, 100, 0);
  
  // Read WiFi signal strength
  currentData.signalStrength = WiFi.RSSI();
  
  // Set timestamp
  currentData.timestamp = millis();
}

void uploadToSupabase() {
  if (strlen(DEVICE_KEY) != 32) {
    Serial.println("Device key not configured. Skipping upload.");
    return;
  }
  
  // Create JSON payload
  DynamicJsonDocument doc(2048);
  
  // Create readings array
  JsonArray readings = doc.createNestedArray("readings");
  
  // Add body temperature reading
  JsonObject bodyTemp = readings.createNestedObject();
  bodyTemp["device_id"] = DEVICE_UID;
  bodyTemp["metric"] = "body_temperature";
  bodyTemp["value"] = currentData.bodyTemperature;
  bodyTemp["unit"] = "fahrenheit";
  bodyTemp["ts"] = getCurrentISO8601();
  
  // Add ambient temperature reading
  JsonObject ambientTemp = readings.createNestedObject();
  ambientTemp["device_id"] = DEVICE_UID;
  ambientTemp["metric"] = "ambient_temperature";
  ambientTemp["value"] = currentData.ambientTemperature;
  ambientTemp["unit"] = "fahrenheit";
  ambientTemp["ts"] = getCurrentISO8601();
  
  // Add humidity reading
  JsonObject humidityObj = readings.createNestedObject();
  humidityObj["device_id"] = DEVICE_UID;
  humidityObj["metric"] = "ambient_humidity";
  humidityObj["value"] = currentData.humidity;
  humidityObj["unit"] = "percent";
  humidityObj["ts"] = getCurrentISO8601();
  
  // Add heart rate reading
  JsonObject heartRateObj = readings.createNestedObject();
  heartRateObj["device_id"] = DEVICE_UID;
  heartRateObj["metric"] = "heart_rate";
  heartRateObj["value"] = currentData.heartRate;
  heartRateObj["unit"] = "bpm";
  heartRateObj["ts"] = getCurrentISO8601();
  
  // Add activity reading
  JsonObject activityObj = readings.createNestedObject();
  activityObj["device_id"] = DEVICE_UID;
  activityObj["metric"] = "steps_per_minute";
  activityObj["value"] = currentData.stepsPerMinute;
  activityObj["unit"] = "steps/min";
  activityObj["ts"] = getCurrentISO8601();
  
  // Add battery reading
  JsonObject batteryObj = readings.createNestedObject();
  batteryObj["device_id"] = DEVICE_UID;
  batteryObj["metric"] = "device_battery";
  batteryObj["value"] = currentData.batteryLevel;
  batteryObj["unit"] = "percent";
  batteryObj["ts"] = getCurrentISO8601();
  
  // Add signal strength reading
  JsonObject signalObj = readings.createNestedObject();
  signalObj["device_id"] = DEVICE_UID;
  signalObj["metric"] = "signal_strength";
  signalObj["value"] = currentData.signalStrength;
  signalObj["unit"] = "dbm";
  signalObj["ts"] = getCurrentISO8601();
  
  // Serialize JSON
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send to Supabase Edge Function
  String url = String(SUPABASE_URL) + "/rest/v1/readings";
  
  http.begin(url);
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Prefer", "return=minimal");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("Upload response code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 201) {
      Serial.println("Data uploaded successfully!");
    } else {
      Serial.print("Upload failed. Response: ");
      Serial.println(http.getString());
    }
  } else {
    Serial.println("Failed to connect to Supabase");
  }
  
  http.end();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi...");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void initializeDeviceKey() {
  // Check if device key is stored in EEPROM
  String storedKey = "";
  for (int i = 0; i < 32; i++) {
    char c = EEPROM.read(i);
    if (c == 0) break;
    storedKey += c;
  }
  
  if (storedKey.length() == 32) {
    Serial.println("Device key found in EEPROM.");
    return;
  }
  
  // If no key stored, wait for user to configure
  Serial.println("No device key found. Please configure via web interface or serial.");
  Serial.println("Device key format: 32-character alphanumeric string");
  Serial.println("Example: ABC123DEF456GHI789JKL012MNO345");
  
  // Wait for key input via serial (for testing)
  while (storedKey.length() != 32 && Serial.available()) {
    if (Serial.available()) {
      String input = Serial.readStringUntil('\n');
      input.trim();
      
      if (input.length() == 32) {
        // Store key in EEPROM
        for (int i = 0; i < 32; i++) {
          EEPROM.write(i, input.charAt(i));
        }
        EEPROM.commit();
        
        Serial.println("Device key stored successfully!");
        storedKey = input;
      } else {
        Serial.println("Invalid key format. Must be 32 characters.");
      }
    }
    delay(100);
  }
}

String getCurrentISO8601() {
  // Get current time (simplified - in production, use NTP)
  unsigned long currentTime = millis();
  unsigned long seconds = currentTime / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;
  unsigned long days = hours / 24;
  
  // Create ISO8601 timestamp (simplified)
  char timestamp[32];
  sprintf(timestamp, "2024-02-01T%02d:%02d:%02d.000Z", 
          (hours % 24), (minutes % 60), (seconds % 60));
  
  return String(timestamp);
}

void printHealthData() {
  Serial.println("\n=== Health Data ===");
  Serial.print("Body Temp: ");
  Serial.print(currentData.bodyTemperature);
  Serial.println("°F");
  
  Serial.print("Ambient Temp: ");
  Serial.print(currentData.ambientTemperature);
  Serial.println("°F");
  
  Serial.print("Humidity: ");
  Serial.print(currentData.humidity);
  Serial.println("%");
  
  Serial.print("Heart Rate: ");
  Serial.print(currentData.heartRate);
  Serial.println(" BPM");
  
  Serial.print("Activity: ");
  Serial.print(currentData.activityIntensity);
  Serial.println(" m/s²");
  
  Serial.print("Steps/min: ");
  Serial.print(currentData.stepsPerMinute);
  Serial.println(" steps/min");
  
  Serial.print("Battery: ");
  Serial.print(currentData.batteryLevel);
  Serial.println("%");
  
  Serial.print("Signal: ");
  Serial.print(currentData.signalStrength);
  Serial.println(" dBm");
  
  Serial.println("===================");
}
