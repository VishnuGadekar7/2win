"use client";

import { useState, useEffect } from "react";

interface Device {
  id: string;
  device_uid: string;
  device_name: string;
  created_at: string;
  active: boolean;
}

interface NewDevice {
  device_id: string;
  device_uid: string;
  device_key: string;
  device_name: string;
}

export default function DeviceManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDevice, setNewDevice] = useState<NewDevice | null>(null);
  const [error, setError] = useState("");

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/devices", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDevices(data);
      } else {
        setError(data.detail || "Failed to fetch devices");
      }
    } catch (err) {
      setError("Error fetching devices");
    }
  };

  const registerDevice = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/devices/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          device_name: newDeviceName || "ESP32 Health Monitor",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewDevice(data);
        setNewDeviceName("");
        fetchDevices();
      } else {
        setError(data.detail || "Failed to register device");
      }
    } catch (err) {
      setError("Error registering device");
    }

    setLoading(false);
  };

  const revokeDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to revoke this device?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/devices/${deviceId}/revoke`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDevices();
      } else {
        setError("Failed to revoke device");
      }
    } catch (err) {
      setError("Error revoking device");
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Register New Device */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Register New Device</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Device Name (optional)"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={registerDevice}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Registering..." : "Register Device"}
          </button>
        </div>
      </div>

      {/* New Device Key Display */}
      {newDevice && (
        <div className="glass rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400 mb-3">Device Registered Successfully!</h3>
          <p className="text-sm text-slate-300 mb-4">
            Copy this device key and configure your ESP32. This key will not be shown again.
          </p>
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 font-mono text-sm break-all">
            {newDevice.device_key}
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p><strong>Device ID:</strong> {newDevice.device_uid}</p>
            <p><strong>Device Name:</strong> {newDevice.device_name}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(newDevice.device_key);
              alert("Device key copied to clipboard!");
            }}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Copy Key
          </button>
          <button
            onClick={() => setNewDevice(null)}
            className="mt-4 ml-3 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Device List */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Your Devices</h3>

        {devices.length === 0 ? (
          <p className="text-slate-400">No devices registered yet.</p>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="border border-slate-600 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{device.device_name}</h4>
                    <div className="mt-2 space-y-1 text-sm text-slate-400">
                      <p><strong>Device ID:</strong> {device.device_uid}</p>
                      <p><strong>Status:</strong>
                        <span className={`ml-2 ${device.active ? 'text-green-400' : 'text-red-400'}`}>
                          {device.active ? 'Active' : 'Revoked'}
                        </span>
                      </p>
                      <p><strong>Registered:</strong> {new Date(device.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {device.active && (
                    <button
                      onClick={() => revokeDevice(device.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
