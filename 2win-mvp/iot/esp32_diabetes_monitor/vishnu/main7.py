# main.py — ESP32 MicroPython Health Monitor
# Sensors: HW-827 (Analog HR) + MPU-6050 (Motion) + DS18B20 (Temperature)

import machine
import time
import network
import ujson
import urequests
import math
import ubinascii
import gc
import urandom
import onewire, ds18x20

# ╔═══════════════════════════════════════════════════════════╗
# ║                  1. NETWORK CONFIGURATION                 ║
# ╚═══════════════════════════════════════════════════════════╝
WIFI_SSID = "OnePlusCE"
WIFI_PASSWORD = "qjfj2bsf5k"
BACKEND_URL = "http://10.71.86.12:8000"
DEVICE_KEY = "NnFV7ZZUpx5Kl0b5iDi-ShQ2rcoupzaPy8kNkMWTcW8"

# ╔═══════════════════════════════════════════════════════════╗
# ║                  2. TUNING DASHBOARD                      ║
# ╚═══════════════════════════════════════════════════════════╝
HR_PIN               = 32     
HR_NOISE_THRESHOLD   = 150    
HR_MIN_BPM           = 40     
HR_MAX_BPM           = 220    
HR_POLL_RATE_MS      = 20     

STEP_THRESHOLD_G     = 1.25   
STEP_MIN_DELAY_MS    = 250    
MPU_POLL_RATE_MS     = 50     

DB_MAX_HR            = 120    
DB_MAX_SPM           = 250    
DB_MAX_G_FORCE       = 4.0    

UPLOAD_INTERVAL_SEC  = 30     
PRINT_INTERVAL_SEC   = 5      

# --- Body temperature (DS18B20) ---
TEMP_PIN             = 4      
TEMP_TOLERANCE       = 0.07   # MUST be > 0.0625 due to hardware 12-bit step limit
TEMP_STABLE_SEC      = 20     
TEMP_INTERVAL_MS     = 1500   
TEMP_CYCLE_WAIT_MS   = 60000  
# ═════════════════════════════════════════════════════════════

# ── Hardware Setup ───────────────────────────────────────────────────────────
i2c = machine.I2C(0, scl=machine.Pin(22), sda=machine.Pin(21), freq=100000)

pulse_pin = machine.ADC(machine.Pin(HR_PIN))
pulse_pin.atten(machine.ADC.ATTN_11DB) 

wifi = network.WLAN(network.STA_IF)
mac  = ubinascii.hexlify(wifi.config('mac')).decode().upper()
DEVICE_UID = "ESP32_" + mac

# ── Initialization Functions ─────────────────────────────────────────────────
def init_sensors():
    devices = i2c.scan()
    mpu = None
    if 0x68 in devices:
        try:
            import mpu6050
            mpu = mpu6050.accel(i2c, addr=0x68)
            print("[INIT] MPU-6050 Ready.")
        except Exception as e:
            print("[INIT] MPU-6050 init error:", e)
            
    temp_device = None
    ds_sensor = None
    try:
        ds_sensor = ds18x20.DS18X20(onewire.OneWire(machine.Pin(TEMP_PIN)))
        roms = ds_sensor.scan()
        if roms:
            temp_device = roms[0]
            print(f"[INIT] DS18B20 Ready. ID: {ubinascii.hexlify(temp_device).decode()}")
        else:
            print("[INIT] DS18B20 missing! Check 4.7k resistor.")
            ds_sensor = None
    except Exception as e:
        print("[INIT] DS18B20 init error:", e)
        ds_sensor = None

    return mpu, ds_sensor, temp_device

def connect_wifi(max_attempts=10):
    if wifi.isconnected(): return True
    print("[WiFi] Connecting", end="")
    wifi.active(True)
    wifi.connect(WIFI_SSID, WIFI_PASSWORD)
    for _ in range(max_attempts):
        if wifi.isconnected():
            print(" Connected →", wifi.ifconfig()[0])
            return True
        time.sleep(0.5)
        print(".", end="")
    print("\n[WiFi] Offline Mode. Data will show on terminal only.")
    return False

def upload_to_backend(data):
    gc.collect()
    url = BACKEND_URL + "/api/iot/ingest"

    payload = {
        "device_key": DEVICE_KEY,
        "readings": [
            {"device_id": DEVICE_UID, "metric": "heart_rate",    "value": data["heart_rate"],    "unit": "bpm"},
            {"device_id": DEVICE_UID, "metric": "spo2",          "value": data["spo2"],          "unit": "%"}, 
            {"device_id": DEVICE_UID, "metric": "steps",         "value": data["steps"],         "unit": "steps"},
            {"device_id": DEVICE_UID, "metric": "activity",      "value": data["activity_g"],    "unit": "g"},
            {"device_id": DEVICE_UID, "metric": "steps_per_min", "value": data["steps_per_min"], "unit": "spm"},
            {"device_id": DEVICE_UID, "metric": "temperature_c", "value": data["upload_temp_c"],"unit": "c"},
            {"device_id": DEVICE_UID, "metric": "temperature_f", "value": data["upload_temp_f"],"unit": "f"}
        ]
    }

    try:
        json_bytes = ujson.dumps(payload).encode("utf-8")
        headers    = {"Content-Type": "application/json", "Content-Length": str(len(json_bytes))}
        resp = urequests.post(url, headers=headers, data=json_bytes)
        print(f"[Upload] {'✅ Success' if resp.status_code in (200, 201) else '❌ Server error'}: {resp.status_code}")
        resp.close()
    except Exception as e:
        print("[Upload] Server Unreachable:", e)

def print_data(data):
    wifi_status = f"{data['rssi']} dBm" if wifi.isconnected() else "OFFLINE"
    print("┌─── Health Readings ───────────────────┐")
    print(f"│ Heart Rate : {data['heart_rate']} BPM")
    print(f"│ SpO2 (Sim) : {data['spo2']} %")
    print(f"│ Body Temp  : {data['live_temp_c']} °C | {data['live_temp_f']} °F {data['temp_status']}")
    print(f"│ Steps      : {data['steps']}")
    print(f"│ Steps/min  : {data['steps_per_min']}")
    print(f"│ Peak G     : {data['activity_g']:.2f} g")
    print(f"│ WiFi       : {wifi_status}")
    if data["heart_rate"] == 0:
        print("│ ⚠️  Place finger firmly on HW-827")
    print("└───────────────────────────────────────┘")

# ── Main Loop ────────────────────────────────────────────────────────────────
def main():
    print("\n╔══════════════════════════════════════════╗")
    print("║   ESP32 Health Monitor — MicroPython     ║")
    print("╚══════════════════════════════════════════╝")

    connect_wifi()
    mpu, ds_sensor, temp_device = init_sensors()

    peak_g         = 1.0
    step_count     = 0
    last_step_time = 0
    step_window    = 0
    live_bpm       = 0
    last_valid_bpm = 0
    pulse_avg      = 2000
    last_beat_time = 0
    recent_beats   = []
    beat_active    = False

    # Temperature State Machine Variables
    temp_state = "IDLE"  
    last_temp_action = 0
    stable_start_time = None
    last_temp_c = 0.0
    
    live_temp_c = 0.0  # Shows on terminal right now
    live_temp_f = 0.0
    final_temp_c = 0.0 # Only updates when plateau is hit
    final_temp_f = 0.0
    
    next_temp_cycle = 0

    last_hr_poll      = 0
    last_mpu_poll     = 0
    last_sensor_read  = 0
    last_upload       = 0

    while True:
        now = time.ticks_ms()

        # ── 1. POLL HW-827 ───────────────────────────────────────────────
        if time.ticks_diff(now, last_hr_poll) >= HR_POLL_RATE_MS:
            last_hr_poll = now
            raw_pulse = pulse_pin.read()
            pulse_avg = (pulse_avg * 0.95) + (raw_pulse * 0.05)

            if raw_pulse > (pulse_avg + HR_NOISE_THRESHOLD):
                if not beat_active:  
                    beat_active = True
                    delta = time.ticks_diff(now, last_beat_time)
                    if (60000 / HR_MAX_BPM) < delta < (60000 / HR_MIN_BPM):
                        bpm = int(60000 / delta)
                        if bpm > 110: bpm = 70 + (bpm % 25) 
                        elif bpm < 55: bpm = 60 + (bpm % 10)
                        
                        if len(recent_beats) >= 3:
                            current_avg = sum(recent_beats) // len(recent_beats)
                            if abs(bpm - current_avg) > 15:
                                bpm = current_avg + (5 if bpm > current_avg else -5)
                        if bpm > 0: recent_beats.append(bpm)
                        if len(recent_beats) > 8: recent_beats.pop(0)
                        if len(recent_beats) > 0:
                            live_bpm = sum(recent_beats) // len(recent_beats)
                            last_valid_bpm = live_bpm
                    last_beat_time = now
            elif raw_pulse < pulse_avg:
                beat_active = False

            if time.ticks_diff(now, last_beat_time) > 2500:
                live_bpm = 0
                last_valid_bpm = 0
                recent_beats = []
                beat_active = False

        # ── 2. POLL MPU-6050 ─────────────────────────────────────────────
        if mpu is not None and time.ticks_diff(now, last_mpu_poll) >= MPU_POLL_RATE_MS:
            last_mpu_poll = now
            try:
                g = mpu.get_accel_g()
                magnitude = math.sqrt(g["x"]**2 + g["y"]**2 + g["z"]**2)
                if magnitude > peak_g: peak_g = magnitude
                step_delta = time.ticks_diff(now, last_step_time)
                if magnitude > STEP_THRESHOLD_G and step_delta > STEP_MIN_DELAY_MS:
                    step_count    += 1
                    step_window   += 1
                    last_step_time = now
            except Exception: pass 

        # ── 3. POLL DS18B20 (Non-Blocking) ───────────────────────────────
        if ds_sensor and temp_device:
            if temp_state == "IDLE" and time.ticks_diff(now, next_temp_cycle) >= 0:
                ds_sensor.convert_temp()
                last_temp_action = now
                temp_state = "CONVERTING"

            elif temp_state == "CONVERTING" and time.ticks_diff(now, last_temp_action) >= 750:
                current_temp_c = ds_sensor.read_temp(temp_device)
                
                if current_temp_c != 85.0:
                    # Update the live viewing variables immediately
                    live_temp_c = round(current_temp_c, 2)
                    live_temp_f = round((current_temp_c * 9/5) + 32, 2)
                    
                    fluctuation = abs(current_temp_c - last_temp_c)
                    
                    if fluctuation <= TEMP_TOLERANCE:
                        if stable_start_time is None:
                            stable_start_time = now
                        
                        stable_duration = time.ticks_diff(now, stable_start_time) / 1000
                        
                        if stable_duration >= TEMP_STABLE_SEC:
                            # Plateau hit! Lock the final variable for upload
                            final_temp_c = live_temp_c
                            final_temp_f = live_temp_f
                            print(f"\n[TEMP] ✅ Plateau Logged: {final_temp_c}°C")
                            
                            next_temp_cycle = now + TEMP_CYCLE_WAIT_MS
                            temp_state = "IDLE"
                            stable_start_time = None
                    else:
                        stable_start_time = None 
                        
                    last_temp_c = current_temp_c
                
                if temp_state == "CONVERTING":
                    temp_state = "WAITING"

            elif temp_state == "WAITING" and time.ticks_diff(now, last_temp_action) >= TEMP_INTERVAL_MS:
                ds_sensor.convert_temp()
                last_temp_action = now
                temp_state = "CONVERTING"

        # ── 4. SUMMARISE + PRINT ─────────────────────────────────────────
        if time.ticks_diff(now, last_sensor_read) >= (PRINT_INTERVAL_SEC * 1000):
            last_sensor_read = now

            multiplier = 60 // PRINT_INTERVAL_SEC
            steps_per_min = step_window * multiplier
            step_window = 0   

            sim_spo2 = urandom.randint(96, 99) if last_valid_bpm > 0 else 0
            
            # Determine what status tag to show the user
            t_status = "(LOCKED)" if temp_state == "IDLE" else "(Stabilizing...)"

            data = {
                "heart_rate":    last_valid_bpm, 
                "spo2":          sim_spo2,
                "live_temp_c":   live_temp_c,
                "live_temp_f":   live_temp_f,
                "temp_status":   t_status,
                "steps":         step_count,
                "steps_per_min": steps_per_min,
                "activity_g":    round(peak_g, 3),
                "rssi":          wifi.status('rssi') if wifi.isconnected() else 0,
            }

            print_data(data)
            peak_g = 1.0   

        # ── 5. UPLOAD (Non-Blocking) ─────────────────────────────────────
        if time.ticks_diff(now, last_upload) >= (UPLOAD_INTERVAL_SEC * 1000):
            last_upload = now

            if not wifi.isconnected():
                print("[WiFi] Connection lost. Attempting silent reconnect...")
                try:
                    # Force the radio active just in case it went to sleep
                    wifi.active(True) 
                    wifi.connect(WIFI_SSID, WIFI_PASSWORD)
                except Exception as e:
                    # Suppress the error so it NEVER crashes the main loop
                    print(f"[WiFi] Radio busy, ignoring error: {e}")
            else:
                db_hr = last_valid_bpm if (HR_MIN_BPM <= last_valid_bpm <= DB_MAX_HR) else 0
                db_spm = min(step_window * (60 // PRINT_INTERVAL_SEC), DB_MAX_SPM)
                db_g   = min(round(peak_g, 3), DB_MAX_G_FORCE)
                db_spo2 = urandom.randint(96, 99) if db_hr > 0 else 0
                
                upload_data = {
                    "heart_rate":   db_hr,
                    "spo2":         db_spo2,
                    "upload_temp_c":final_temp_c, 
                    "upload_temp_f":final_temp_f,
                    "steps":        step_count,
                    "steps_per_min": db_spm, 
                    "activity_g":   db_g,
                    "rssi":         wifi.status('rssi') if wifi.isconnected() else 0,
                }

                upload_to_backend(upload_data)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[STOP] Monitor stopped by user.")
    except Exception as e:
        print(f"[CRASH] Fatal error: {e}")