import machine, time
i2c = machine.I2C(0, scl=machine.Pin(22), sda=machine.Pin(21), freq=10000)
while True:
    print([hex(i) for i in i2c.scan()])
    time.sleep(0.5)