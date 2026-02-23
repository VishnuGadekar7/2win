# IoT Device Integration Setup Guide

## 🚀 **Complete IoT Diabetes Monitoring System**

This guide helps you set up the complete IoT device integration for diabetes prediction.

---

## 📋 **System Overview**

```
ESP32 Device → Supabase Database → ML Prediction → Dashboard Display
     ↓                ↓                    ↓              ↓
  Sensor Data    →    Data Storage    →  Risk Analysis   →  Health Insights
```

---

## 🔧 **Step 1: ESP32 Hardware Setup**

### **Required Components:**
- ESP32 Development Board
- MAX30201 Temperature Sensor (Body temperature)
- DHT11 Sensor (Ambient temperature & humidity)
- MPU6050 (Motion/activity detection)
- Pulse Sensor (Optional - heart rate)
- Battery monitoring circuit
- LED indicator
- Breadboard and connecting wires

### **Wiring Diagram:**
```
ESP32 Pin Connections:
├── D4 → DHT11 Data Pin
├── D21 → MAX30201 SDA
├── D22 → MAX30201 SCL  
├── SCL → MPU6050 SCL
├── SDA → MPU6050 SDA
├── A0 → Battery voltage divider
└── LED_BUILTIN → Status LED
```

### **Installation:**
1. Install Arduino IDE
2. Add ESP32 board support
3. Install required libraries:
   ```bash
   # In Arduino IDE Library Manager
   - WiFi (built-in)
   - HTTPClient (built-in)
   - ArduinoJson by Benoit Blanchon
   - MAX30205 by Adafruit
   - DHT sensor library by Adafruit
   - Adafruit MPU6050
   ```

---

## 🔧 **Step 2: Configure ESP32 Firmware**

### **Update Configuration:**
Edit `esp32_diabetes_monitor.ino`:

```cpp
// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Configuration  
const char* SUPABASE_URL = "https://pagibeepfdiecyvactne.supabase.co";
const char* SUPABASE_KEY = "your-service-role-key";

// Device Key (32 characters from backend)
const char* DEVICE_KEY = "YOUR_32_CHAR_DEVICE_KEY";
```

### **Get Device Key:**
1. Register device via backend API:
   ```bash
   curl -X POST "http://localhost:8000/api/devices/register" \
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"device_name": "ESP32 Monitor 1", "device_type": "esp32_health"}'
   ```
2. Copy the returned 32-character device key
3. Update `DEVICE_KEY` in the Arduino code

---

## 🔧 **Step 3: Upload and Test**

### **Upload to ESP32:**
1. Connect ESP32 to computer
2. Select correct board in Arduino IDE
3. Upload the firmware
4. Open Serial Monitor (115200 baud)

### **Expected Serial Output:**
```
=== ESP32 Diabetes Health Monitor ===
Device UID: ESP32_abc123def456
Sensors initialized.
Connecting to WiFi.....
WiFi connected!
IP address: 192.168.1.100

=== Health Data ===
Body Temp: 98.6°F
Ambient Temp: 72.3°F
Humidity: 45.2%
Heart Rate: 72 BPM
Activity: 1.2 m/s²
Steps/min: 0 steps/min
Battery: 87%
Signal: -45 dBm
===================

Data uploaded successfully!
```

---

## 🔧 **Step 4: Backend Integration**

### **Update Database Schema:**
Ensure all tables are created in Supabase:
```sql
-- Run this in Supabase SQL Editor
-- Tables: users, devices, device_keys, readings, predictions, medical_alerts
```

### **Start Backend Server:**
```bash
cd backend
uvicorn main:app --reload
```

### **API Endpoints Available:**
- `POST /api/iot/ingest` - Batch data upload
- `POST /api/iot/ingest-single` - Single reading
- `POST /api/iot/device-register` - Register new device
- `GET /api/iot/device-status/{device_uid}` - Device status
- `GET /api/iot/health-summary/{user_id}` - Health summary
- `GET /api/health/predictions` - ML predictions
- `GET /api/health/metrics` - Real-time metrics

---

## 📊 **Step 5: Data Flow Verification**

### **Test Data Upload:**
```bash
# Test single reading upload
curl -X POST "http://localhost:8000/api/iot/ingest-single" \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "ESP32_test123",
       "metric": "body_temperature", 
       "value": 98.6,
       "unit": "fahrenheit",
       "ts": "2024-02-01T12:00:00.000Z"
     }'

# Test batch upload
curl -X POST "http://localhost:8000/api/iot/ingest" \
     -H "Content-Type: application/json" \
     -d '{
       "device_key": "YOUR_32_CHAR_DEVICE_KEY",
       "readings": [
         {
           "device_id": "ESP32_test123",
           "metric": "body_temperature",
           "value": 98.6,
           "unit": "fahrenheit", 
           "ts": "2024-02-01T12:00:00.000Z"
         }
       ]
     }'
```

### **Verify Data in Supabase:**
1. Go to Supabase Dashboard
2. Check `readings` table
3. Verify new entries appear
4. Check `predictions` table for ML results

---

## 🤖 **Step 6: ML Prediction System**

### **Automatic Predictions:**
The system automatically:
1. **Collects** sensor data every 30 seconds
2. **Analyzes** data every 6 hours  
3. **Calculates** diabetes risk score (0-100%)
4. **Stores** predictions with confidence scores
5. **Generates** health alerts for abnormal readings

### **Prediction Factors:**
- **Blood Glucose Levels** - Primary diabetes indicator
- **BMI Calculation** - Weight/height ratio
- **Age Risk** - Age-related factors
- **Activity Patterns** - Exercise vs sedentary
- **Temperature Trends** - Body temperature stability
- **Heart Rate Variability** - Cardiovascular health

### **Risk Levels:**
- **Low (0-30%)** - Healthy lifestyle
- **Medium (30-70%)** - Some risk factors
- **High (70-100%)** - Immediate medical attention

---

## 📱 **Step 7: Dashboard Integration**

### **Real-time Updates:**
The dashboard automatically:
1. **Fetches** new health metrics every 30 seconds
2. **Updates** predictions every 5 minutes
3. **Shows** medical alerts instantly
4. **Displays** body part health status
5. **Visualizes** trend data and risk scores

### **Features Available:**
- Interactive human body with health zones
- Real-time sensor data charts
- Diabetes risk prediction with confidence
- Medical alert notifications
- Activity and sleep tracking
- Historical health trends

---

## 🚨 **Step 8: Monitoring & Alerts**

### **Automatic Alert Generation:**
The system creates alerts for:
- **High Blood Sugar** (>140 mg/dL warning, >250 mg/dL critical)
- **Abnormal Temperature** (<97°F or >99.5°F)
- **Irregular Heart Rate** (<50 or >120 BPM)
- **Low Device Battery** (<10%)
- **Device Disconnection** (>5 minutes no data)

### **Alert Types:**
- **Critical** - Immediate medical attention needed
- **Warning** - Monitor closely
- **Info** - General notifications
- **Success** - Positive achievements

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **ESP32 Won't Connect:**
```bash
# Check WiFi credentials
# Verify antenna connection
# Try closer router proximity
# Check 2.4GHz band availability
```

#### **Data Not Uploading:**
```bash
# Verify Supabase credentials
# Check internet connectivity
# Validate JSON format
# Review device key authentication
```

#### **Predictions Not Generating:**
```bash
# Check minimum data points (need 10+ readings)
# Verify user profile completeness
# Review ML model logs
# Check database permissions
```

#### **Dashboard Not Updating:**
```bash
# Check backend server status
# Verify API endpoints accessible
# Review browser console errors
# Check WebSocket connections
```

---

## 📈 **Performance Optimization**

### **Data Collection:**
- **Upload Interval**: 30 seconds (configurable)
- **Batch Size**: Up to 50 readings per batch
- **Compression**: JSON data minimization
- **Error Handling**: Automatic retry with backoff

### **Battery Life:**
- **Deep Sleep**: ESP32 sleep between readings
- **WiFi Management**: Connection pooling
- **Sensor Power**: Turn off unused sensors
- **Expected Battery Life**: 2-3 weeks with USB power bank

---

## 🔐 **Security Features**

### **Device Authentication:**
- **32-Character Keys** - Cryptographically secure
- **Key Hashing** - SHA256 storage in database
- **Device Registration** - One-time setup process
- **Key Revocation** - Instant disable lost devices

### **Data Security:**
- **HTTPS Encryption** - All API communications
- **Row Level Security** - User data isolation
- **JWT Authentication** - Secure user sessions
- **Input Validation** - Prevent injection attacks

---

## 🚀 **Production Deployment**

### **Scaling Considerations:**
1. **Load Balancing** - Multiple backend instances
2. **Database Optimization** - Indexes and partitioning
3. **CDN Integration** - Faster API responses
4. **Monitoring** - System health and performance
5. **Backup Strategy** - Data redundancy

### **Monitoring Setup:**
```bash
# System metrics
- CPU and memory usage
- Database query performance
- API response times
- Error rates and types
- Device connectivity status
```

---

## 📞 **Support & Documentation**

### **Code Documentation:**
- **ESP32 Firmware**: `iot/esp32_diabetes_monitor/`
- **Backend APIs**: `backend/iot_api.py`
- **ML Models**: `backend/ml_models/diabetes_predictor.py`
- **Data Service**: `backend/services/data_ingestion.py`

### **API Documentation:**
Visit `http://localhost:8000/docs` for interactive API documentation.

### **Database Schema:**
Refer to `backend/supabase_schema.sql` for complete database structure.

---

## ✅ **Success Criteria**

Your IoT integration is complete when:
- [ ] ESP32 successfully connects to WiFi
- [ ] Device key authentication works
- [ ] Sensor data uploads to Supabase
- [ ] ML predictions generate automatically
- [ ] Dashboard shows real-time data
- [ ] Health alerts trigger correctly
- [ ] Diabetes risk scores update regularly

---

**🎉 Congratulations! You now have a complete IoT diabetes monitoring system with real-time prediction capabilities!**
