"use client";

import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState("");

  const demos = [
    {
      id: "iot-dashboard",
      title: "IoT Health Dashboard",
      description: "Real-time visualization of sensor data from ESP32 devices",
      status: "coming-soon"
    },
    {
      id: "prediction-model",
      title: "Diabetes Prediction Model",
      description: "ML-powered risk assessment based on health metrics",
      status: "coming-soon"
    },
    {
      id: "device-simulation",
      title: "Device Data Simulator",
      description: "Simulate IoT device data for testing",
      status: "in-development"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">
            2win Demo Center
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore the capabilities of our digital twin health prediction platform
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <div
              key={demo.id}
              className="glass rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{demo.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${demo.status === 'coming-soon'
                    ? 'bg-slate-700/50 text-slate-300'
                    : demo.status === 'in-development'
                      ? 'bg-amber-900/50 text-amber-300'
                      : 'bg-green-900/50 text-green-300'
                  }`}>
                  {demo.status === 'coming-soon' && 'Coming Soon'}
                  {demo.status === 'in-development' && 'In Development'}
                  {demo.status === 'available' && 'Available'}
                </span>
              </div>

              <p className="text-slate-300 mb-6">{demo.description}</p>

              <button
                disabled={demo.status !== 'available'}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${demo.status === 'available'
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {demo.status === 'available' ? 'Launch Demo' : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>

        {/* Current Features Section */}
        <div className="mt-16 glass rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Currently Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">User Authentication</h3>
                <p className="text-slate-300">Secure login and registration system</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Device Management</h3>
                <p className="text-slate-300">Register and manage IoT devices</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Profile Management</h3>
                <p className="text-slate-300">Update personal health information</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">IoT Data Pipeline</h3>
                <p className="text-slate-300">Infrastructure for device data ingestion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Development Progress */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Development Progress</h2>
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-300">Overall Completion</span>
                <span className="text-cyan-400 font-semibold">40%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Week 1 MVP • Team Nodemon • AISSMS IOIT Pune
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}