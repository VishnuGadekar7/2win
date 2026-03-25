# mpu6050.py — MicroPython driver for MPU-6050
# Fixes: robust error handling, safe bytes_toint, I2C verification

import machine


class accel:
    # Register addresses
    REG_PWR_MGMT_1 = 0x6B
    REG_ACCEL_XOUT = 0x3B   # First of 14 bytes: Accel XYZ + Temp + Gyro XYZ

    def __init__(self, i2c, addr=0x68):
        self.iic  = i2c
        self.addr = addr
        self._verify_sensor()
        self._wake_up()

    # ── Internal helpers ────────────────────────────────────────────────────

    def _verify_sensor(self):
        """Confirm MPU-6050 is visible on the I2C bus."""
        try:
            devices = self.iic.scan()
            if self.addr not in devices:
                raise RuntimeError(
                    "MPU-6050 not found at 0x{:02X}. Check wiring and AD0 pin.".format(self.addr)
                )
            print("[MPU6050] Found at 0x{:02X}".format(self.addr))
        except RuntimeError:
            raise
        except Exception as e:
            raise RuntimeError("[MPU6050] I2C scan failed: {}".format(e))

    def _wake_up(self):
        """Take MPU-6050 out of sleep mode."""
        try:
            self.iic.writeto(self.addr, bytearray([self.REG_PWR_MGMT_1, 0x00]))
            print("[MPU6050] Woke up successfully.")
        except Exception as e:
            raise OSError("[MPU6050] Failed to wake up sensor: {}".format(e))

    # ── Raw data ────────────────────────────────────────────────────────────

    def get_raw_values(self):
        """
        Read 14 bytes starting from ACCEL_XOUT_H.
        Layout: AcX(2) AcY(2) AcZ(2) Tmp(2) GyX(2) GyY(2) GyZ(2)
        Returns bytearray or raises OSError.
        """
        try:
            self.iic.writeto(self.addr, bytearray([self.REG_ACCEL_XOUT]))
            return self.iic.readfrom(self.addr, 14)
        except Exception as e:
            raise OSError("[MPU6050] Failed to read raw values: {}".format(e))

    # ── Conversion ──────────────────────────────────────────────────────────

    @staticmethod
    def bytes_toint(hi, lo):
        """
        Combine two bytes into a signed 16-bit integer.
        hi = high byte, lo = low byte.
        """
        value = (hi << 8) | lo
        if value >= 0x8000:          # Sign bit set → negative
            value -= 0x10000
        return value

    # ── Public API ──────────────────────────────────────────────────────────

    def get_values(self):
        """
        Returns a dict with keys:
          AcX, AcY, AcZ  — raw accelerometer counts (±2 g → ÷16384 for g)
          Tmp             — temperature in °C
          GyX, GyY, GyZ  — raw gyroscope counts (±250 °/s → ÷131 for °/s)
        Raises OSError on I2C failure.
        """
        raw = self.get_raw_values()

        return {
            "AcX": self.bytes_toint(raw[0],  raw[1]),
            "AcY": self.bytes_toint(raw[2],  raw[3]),
            "AcZ": self.bytes_toint(raw[4],  raw[5]),
            "Tmp": self.bytes_toint(raw[6],  raw[7]) / 340.0 + 36.53,
            "GyX": self.bytes_toint(raw[8],  raw[9]),
            "GyY": self.bytes_toint(raw[10], raw[11]),
            "GyZ": self.bytes_toint(raw[12], raw[13]),
        }

    def get_accel_g(self):
        """
        Returns accelerometer readings converted to g-force (float).
        Scale: ±2 g default → 1 g = 16384 LSB
        Returns dict with keys: x, y, z
        """
        vals = self.get_values()
        return {
            "x": vals["AcX"] / 16384.0,
            "y": vals["AcY"] / 16384.0,
            "z": vals["AcZ"] / 16384.0,
        }
