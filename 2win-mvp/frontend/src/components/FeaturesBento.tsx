"use client";
import {
  Activity, Heart, Brain, Cpu, Bell, BarChart3, Zap, Shield
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: Heart,
    name: "Digital Twin Visualization",
    description:
      "An interactive SVG model of your body updates in real time — hotspots glow based on live sensor data from your wearable.",
    href: "/dashboard",
    cta: "See your twin",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-24 h-40 rounded-full border-2 border-purple-400 relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border border-purple-400" />
          <div className="absolute top-10 left-2 w-4 h-12 rounded border border-purple-400" />
          <div className="absolute top-10 right-2 w-4 h-12 rounded border border-purple-400" />
          <div className="absolute bottom-0 left-4 w-5 h-14 rounded border border-purple-400" />
          <div className="absolute bottom-0 right-4 w-5 h-14 rounded border border-purple-400" />
        </div>
      </div>
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Activity,
    name: "Real-Time Vitals",
    description:
      "Heart rate, SpO₂, HRV, and RR intervals streamed from your ESP32 wearable every 5–10 seconds.",
    href: "/dashboard",
    cta: "View vitals",
    background: (
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg viewBox="0 0 200 80" className="w-full mt-8" fill="none">
          <polyline points="0,40 20,40 30,10 40,70 50,40 70,40 80,20 90,60 100,40 120,40 130,15 140,65 150,40 170,40 180,25 190,55 200,40"
            stroke="#a855f7" strokeWidth="2" fill="none"/>
        </svg>
      </div>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Brain,
    name: "Hybrid AI Predictions",
    description:
      "Disease risk scores blended from a rule-based engine (40%) and a trained ML model (60%) — updated daily.",
    href: "/dashboard",
    cta: "See predictions",
    background: (
      <div className="absolute inset-0 flex items-end justify-center opacity-10 pb-8">
        <div className="flex items-end gap-2">
          {[60, 45, 75, 30, 55].map((h, i) => (
            <div key={i} className="w-6 rounded-t bg-purple-400" style={{ height: h }} />
          ))}
        </div>
      </div>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Zap,
    name: "Edge Processing",
    description:
      "HRV, stress, and activity features computed on the ESP32 before transmission — reducing battery drain and cloud cost.",
    href: "/dashboard",
    cta: "Learn more",
    background: (
      <div className="absolute top-4 right-4 opacity-10">
        <Cpu className="w-24 h-24 text-purple-400" />
      </div>
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "Clinical Alerts",
    description:
      "Automated alerts when risk scores cross HIGH threshold — with root cause explanation and actionable recommendations.",
    href: "/dashboard",
    cta: "View alerts",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <Bell className="w-32 h-32 text-purple-400" />
      </div>
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function FeaturesBento() {
  return (
    <section className="w-full py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-widest text-purple-400 uppercase mb-3">
          Platform capabilities
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Everything your health twin needs
        </h2>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          From raw sensor data to disease risk predictions — the full pipeline
          runs continuously in the background.
        </p>
      </div>
      <BentoGrid className="lg:grid-rows-3">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
}
