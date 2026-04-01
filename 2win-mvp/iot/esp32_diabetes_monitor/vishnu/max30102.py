# max30102.py — MicroPython driver for MAX30102
# Fixes: real SpO2 calculation, correct FIFO byte order,
#        5% peak threshold, full error handling

import time


class MAX30102:
    # Register addresses
    REG_FIFO_WR_PTR  = 0x04
    REG_FIFO_OVF_CTR = 0x05
    REG_FIFO_RD_PTR  = 0x06
    REG_FIFO_DATA    = 0x07
    REG_FIFO_CONFIG  = 0x08
    REG_MODE_CONFIG  = 0x09
    REG_SPO2_CONFIG  = 0x0A
    REG_LED1_PA      = 0x0C   # Red LED
    REG_LED2_PA      = 0x0D   # IR LED

    # Finger detection threshold
    IR_FINGER_THRESHOLD = 50000

    def __init__(self, i2c, address=0x57):
        self.i2c      = i2c
        self.address  = address

        # Heart rate state
        self._bpm           = 0
        self._spo2          = 0
        self._available     = False
        self.beats          = []
        self.last_beat_time = 0
        self.ir_avg         = 0

        # Rolling buffers for SpO2 (last 50 samples)
        self.ir_buffer  = []
        self.red_buffer = []

        # Verify sensor is reachable
        self._verify_sensor()

    # ── Internal helpers ────────────────────────────────────────────────────

    def _verify_sensor(self):
        """Ping the sensor to confirm it is on the bus."""
        try:
            devices = self.i2c.scan()
            if self.address not in devices:
                raise RuntimeError(
                    "MAX30102 not found at 0x{:02X}. Check wiring.".format(self.address)
                )
            print("[MAX30102] Found at 0x{:02X}".format(self.address))
        except RuntimeError:
            raise
        except Exception as e:
            raise RuntimeError("[MAX30102] I2C scan failed: {}".format(e))

    def _write_register(self, reg, value):
        try:
            self.i2c.writeto_mem(self.address, reg, bytes([value]))
        except Exception as e:
            raise OSError("[MAX30102] Write to reg 0x{:02X} failed: {}".format(reg, e))

    def _read_register(self, reg):
        try:
            return self.i2c.readfrom_mem(self.address, reg, 1)[0]
        except Exception as e:
            raise OSError("[MAX30102] Read from reg 0x{:02X} failed: {}".format(reg, e))

    def _read_fifo_bytes(self):
        try:
            return self.i2c.readfrom_mem(self.address, self.REG_FIFO_DATA, 6)
        except Exception as e:
            raise OSError("[MAX30102] FIFO read failed: {}".format(e))

    # ── SpO2 calculation ────────────────────────────────────────────────────

    def _calculate_spo2(self):
        """
        Ratio-of-ratios method.
        R = (AC_red / DC_red) / (AC_ir / DC_ir)
        SpO2 = 110 - 25 * R   (empirical linear approximation)
        """
        if len(self.ir_buffer) < 20 or len(self.red_buffer) < 20:
            return 0

        try:
            ir_max  = max(self.ir_buffer)
            ir_min  = min(self.ir_buffer)
            red_max = max(self.red_buffer)
            red_min = min(self.red_buffer)

            ir_dc  = sum(self.ir_buffer)  / len(self.ir_buffer)
            red_dc = sum(self.red_buffer) / len(self.red_buffer)

            if ir_dc == 0 or red_dc == 0:
                return 0

            ir_ac  = (ir_max  - ir_min)  / 2.0
            red_ac = (red_max - red_min) / 2.0

            if ir_ac == 0:
                return 0

            R    = (red_ac / red_dc) / (ir_ac / ir_dc)
            spo2 = 110.0 - 25.0 * R

            # Clamp to physiologically valid range
            if spo2 > 100:
                spo2 = 100.0
            if spo2 < 80:
                return 0   # likely noise — report nothing

            return int(spo2)

        except Exception as e:
            print("[MAX30102] SpO2 calculation error:", e)
            return 0

    # ── Public API ──────────────────────────────────────────────────────────

    def setup_sensor(self):
        """
        Initialise MAX30102 registers for SpO2 mode.
        Must be called once after power-on.
        Returns True on success, False on failure.
        """
        try:
            # Soft reset — bit 6 of MODE_CONFIG
            self._write_register(self.REG_MODE_CONFIG, 0x40)
            time.sleep(0.1)

            # FIFO: sample average = 8, FIFO rollover enabled, FIFO almost full = 17
            self._write_register(self.REG_FIFO_CONFIG, 0x7F)

            # Mode: SpO2 (Red + IR), value 0x03
            self._write_register(self.REG_MODE_CONFIG, 0x03)

            # SpO2 config: ADC range 4096nA, 400 samples/s, pulse width 411µs
            self._write_register(self.REG_SPO2_CONFIG, 0x27)

            # LED brightness: 0xFF ≈ 50mA (full power for wrist/finger)
            self._write_register(self.REG_LED1_PA, 0xFF)   # Red
            self._write_register(self.REG_LED2_PA, 0xFF)   # IR

            # Clear FIFO pointers
            self._write_register(self.REG_FIFO_WR_PTR,  0x00)
            self._write_register(self.REG_FIFO_OVF_CTR, 0x00)
            self._write_register(self.REG_FIFO_RD_PTR,  0x00)

            print("[MAX30102] Setup complete.")
            return True

        except Exception as e:
            print("[MAX30102] Setup failed:", e)
            return False

    def reset_buffers(self):
        """Clear all state — call when finger is removed."""
        self.ir_avg         = 0
        self._bpm           = 0
        self._spo2          = 0
        self._available     = False
        self.beats          = []
        self.ir_buffer      = []
        self.red_buffer     = []

    def check(self):
        """
        Drain the FIFO and update heart-rate / SpO2.
        Call this as fast as possible in your main loop (every 10 ms is good).
        """
        try:
            write_ptr = self._read_register(self.REG_FIFO_WR_PTR)
            read_ptr  = self._read_register(self.REG_FIFO_RD_PTR)

            while write_ptr != read_ptr:
                raw = self._read_fifo_bytes()

                # FIFO byte order in SpO2 mode: [Red(3 bytes), IR(3 bytes)]
                red_raw = (raw[0] << 16 | raw[1] << 8 | raw[2]) & 0x03FFFF
                ir_raw  = (raw[3] << 16 | raw[4] << 8 | raw[5]) & 0x03FFFF

                if ir_raw < self.IR_FINGER_THRESHOLD:
                    # No finger — clear everything
                    self.reset_buffers()
                else:
                    # ── Feed rolling buffers ───────────────────────────
                    self.ir_buffer.append(ir_raw)
                    self.red_buffer.append(red_raw)
                    if len(self.ir_buffer) > 50:
                        self.ir_buffer.pop(0)
                        self.red_buffer.pop(0)

                    # ── Baseline tracking ──────────────────────────────
                    if self.ir_avg == 0:
                        self.ir_avg = ir_raw
                    self.ir_avg = self.ir_avg * 0.99 + ir_raw * 0.01

                    # ── Peak detection (5% above baseline) ────────────
                    if ir_raw > self.ir_avg * 1.05:
                        now   = time.ticks_ms()
                        delta = time.ticks_diff(now, self.last_beat_time)

                        # Valid inter-beat interval: 300 ms – 1500 ms (40–200 BPM)
                        if 300 < delta < 1500:
                            bpm = 60000.0 / delta
                            self.beats.append(bpm)
                            if len(self.beats) > 5:
                                self.beats.pop(0)

                            self._bpm   = sum(self.beats) / len(self.beats)
                            self._spo2  = self._calculate_spo2()
                            self._available = True

                        if delta > 300:
                            self.last_beat_time = now

                # Advance FIFO read pointer
                read_ptr = (read_ptr + 1) % 32
                self._write_register(self.REG_FIFO_RD_PTR, read_ptr)

        except OSError as e:
            print("[MAX30102] I2C error during check:", e)
            self._available = False
        except Exception as e:
            print("[MAX30102] Unexpected error during check:", e)
            self._available = False

    def available(self):
        """Returns True when a valid HR + SpO2 reading is ready."""
        return self._available

    def get_heart_rate(self):
        """Returns heart rate in BPM (int). Returns 0 if no valid reading."""
        return int(self._bpm)

    def get_spo2(self):
        """Returns blood oxygen saturation in % (int). Returns 0 if no valid reading."""
        return int(self._spo2)

    def get_ir(self):
        """Returns last raw IR value. Use to check finger presence (>50000 = finger on)."""
        try:
            write_ptr = self._read_register(self.REG_FIFO_WR_PTR)
            read_ptr  = self._read_register(self.REG_FIFO_RD_PTR)
            if write_ptr == read_ptr:
                return 0
            raw    = self._read_fifo_bytes()
            ir_raw = (raw[3] << 16 | raw[4] << 8 | raw[5]) & 0x03FFFF
            return ir_raw
        except Exception:
            return 0
