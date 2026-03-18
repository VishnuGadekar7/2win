"use client";

import { Pricing } from "@/components/ui/pricing";
import { FeaturesBento } from "@/components/FeaturesBento";
import { ProfessionalConnect } from "@/components/ui/get-in-touch";
import DisplayCards from "@/components/ui/display-cards";
import {
  FlaskConical, Watch, Activity, Heart,
  TrendingUp, BarChart3, Zap
} from "lucide-react";


const pricingPlans = [
  {
    name: "STARTER",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "1 connected device",
      "Basic vitality scoring",
      "Daily health summaries",
      "Community support",
    ],
    description: "Get started with basic health monitoring",
    buttonText: "Start Free",
    href: "/register",
    isPopular: false,
  },
  {
    name: "PRO",
    price: "19",
    yearlyPrice: "15",
    period: "per month",
    features: [
      "Up to 5 devices",
      "Real-time risk predictions",
      "Digital Twin visualization",
      "Clinical guidance & alerts",
      "Priority support",
      "Advanced analytics",
      "Data export",
    ],
    description: "Full health intelligence for individuals",
    buttonText: "Get Pro Access",
    href: "/register",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: [
      "Everything in Pro",
      "Unlimited devices",
      "Team health dashboards",
      "API access",
      "Custom ML models",
      "Dedicated account manager",
      "SLA agreement",
      "HIPAA compliance",
    ],
    description: "For clinics and health organizations",
    buttonText: "Contact Sales",
    href: "#about",
    isPopular: false,
  },
];

export default function Home() {
  return (
    <main
      className="
        min-h-screen w-full flex flex-col
        bg-[hsl(260_10%_4%)]
        text-foreground antialiased selection:bg-primary/30
      "
    >
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[hsl(260_100%_9%/0.6)] backdrop-blur-xl rounded-3xl border border-white/10
            px-8 py-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-background shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                  2
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-white">
                2WIN<span className="text-primary italic">.AI</span>
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-10">
              {['Features', 'Dashboard', 'About', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-all">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <a
                href="/login"
                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="bg-primary hover:bg-primary/90 text-background px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-[0_10px_20px_rgba(var(--primary),0.2)] transition-all active:scale-95"
              >
                Join Now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="w-full flex-1">

        {/* ================= HERO ================= */}
        <section className="relative pt-64 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-12 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Health AI Experience
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-10">
              <span className="text-white">Predict Your</span> <br />
              <span className="gradient-text">Future Health.</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/50 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
              Leverage Digital Twin technology to predict chronic disease risks up to
              <span className="text-primary font-bold"> 3 years </span>
              before clinical symptoms appear.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/login" className="w-full sm:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                Start Neural Scan
              </a>
              <button className="w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all backdrop-blur-sm">
                Explore Technology
              </button>
            </div>
          </div>

          {/* Visual fluff for Hero */}

        </section>

        {/* ================= STATS/REASSURANCE ================= */}
        <section className="py-24 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              ['98.4%', 'Prediction Accuracy'],
              ['3 Years', 'Early Detection'],
              ['10k+', 'Alpha Users'],
              ['24/7', 'Continuous Sync']
            ].map(([val, label]) => (
              <div key={label} className="text-center group">
                <div className="text-4xl font-black text-white mb-2 group-hover:text-primary transition-colors">{val}</div>
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className="pt-24 pb-48 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-primary/5">
          <div className="max-w-6xl mx-auto">

            {/* Section header — keep exactly as is */}
            <div className="text-center mb-32">
              <span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase mb-6 block">
                Capabilities
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                Core Intelligence
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
            </div>

            {/* 3-column display cards layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 lg:gap-16 items-start">

              {/* Card 1 — Genetic Synthesis */}
              <DisplayCards
                cards={[
                  {
                    icon: <FlaskConical className="w-5 h-5 text-blue-400" />,
                    title: "Genetic Synthesis",
                    description: "High-dimensional genetic marker mapping",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-blue-400",
                    className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0 border-blue-500/20",
                  },
                  {
                    icon: <FlaskConical className="w-5 h-5 text-blue-400" />,
                    title: "DNA Profiling",
                    description: "Build your initial twin profile",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-blue-400",
                    className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0 border-blue-500/20",
                  },
                  {
                    icon: <FlaskConical className="w-5 h-5 text-blue-400" />,
                    title: "AI Analysis",
                    description: "AI analyzes your unique genetic markers",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-blue-400",
                    className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 border-blue-500/20",
                  },
                ]}
              />

              {/* Card 2 — IoT Heartbeat */}
              <DisplayCards
                cards={[
                  {
                    icon: <Watch className="w-5 h-5 text-purple-400" />,
                    title: "IoT Heartbeat",
                    description: "Real-time biological data streams",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-purple-400",
                    className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0 border-purple-500/20",
                  },
                  {
                    icon: <Activity className="w-5 h-5 text-purple-400" />,
                    title: "Wearable Sync",
                    description: "Seamless device integration",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-purple-400",
                    className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0 border-purple-500/20",
                  },
                  {
                    icon: <Heart className="w-5 h-5 text-purple-400" />,
                    title: "Metabolic Track",
                    description: "ESP32 streams HR + SpO₂ every 5s",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-purple-400",
                    className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 border-purple-500/20",
                  },
                ]}
              />

              {/* Card 3 — Risk Simulation */}
              <DisplayCards
                cards={[
                  {
                    icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
                    title: "Risk Simulation",
                    description: "What-If scenario modeling",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-orange-400",
                    className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0 border-orange-500/20",
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5 text-orange-400" />,
                    title: "CVD Forecast",
                    description: "Hybrid ML + rule-based predictions",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-orange-400",
                    className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0 border-orange-500/20",
                  },
                  {
                    icon: <Zap className="w-5 h-5 text-orange-400" />,
                    title: "Daily Risk Score",
                    description: "Updated every 24h from your wearable",
                    cta: "System Details",
                    href: "#",
                    titleClassName: "text-orange-400",
                    className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 border-orange-500/20",
                  },
                ]}
              />

            </div>
          </div>
        </section>

        {/* ================= Visual Interface Section ================= */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/2 opacity-20" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative z-10">
            <div className="lg:col-span-12 xl:col-span-8 glass p-10 md:p-20 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 group-hover:bg-primary/10 transition-all duration-1000" />

              <div className="relative z-10">
                <span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase mb-8 block">Neural Visualization</span>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight tracking-tighter">Real-time <br />Digital Twin.</h2>
                <p className="text-xl text-foreground/40 max-w-2xl font-medium leading-relaxed mb-12">
                  Watch your biological self evolve in the digital realm. Our dashboard provides a pixel-perfect representation
                  of your internal health metrics, updated in real-time with medical-grade precision.
                </p>
              </div>

              <div className="h-80 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden group/screen">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.15),transparent_70%)]" />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-6 opacity-40 group-hover/screen:scale-110 transition-transform duration-700">🖥️</div>
                  <div className="font-mono text-[10px] text-primary/40 uppercase tracking-[0.6em]">
                    Bio-Sync Active: 128-bit Encryption
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-4 glass border-primary/20 bg-primary/[0.05] p-12 md:p-16 flex flex-col items-center text-center justify-center relative group overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full opacity-50" />
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-6xl mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                ✨
              </div>
              <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">Ready to Scale?</h3>
              <p className="text-base text-foreground/40 mb-12 font-medium leading-relaxed">Limitless health predictions and personalized longevity roadmaps.</p>
              <button className="w-full bg-primary text-background font-black py-6 rounded-2xl shadow-[0_20px_40px_rgba(var(--primary),0.3)] hover:shadow-[0_40px_80px_rgba(var(--primary),0.4)] transition-all transform hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-widest">
                Unlock Pro Access
              </button>
            </div>
          </div>
        </section>

        {/* ================= BENTO FEATURES ================= */}
        <FeaturesBento />

        {/* ================= PRICING ================= */}
        <section id="pricing" className="py-12 relative overflow-hidden bg-white/[0.01]">
          <div className="absolute inset-0 bg-primary/2 opacity-10" />
          <div className="relative z-10">
            <Pricing
              plans={pricingPlans}
              title="Predictive Health Plans"
              description={"Choose the intelligence level that fits your goals.\nAll plans include 128-bit encryption, live dashboard access, and continuous biological syncing."}
            />
          </div>
        </section>

        {/* ================= GET IN TOUCH ================= */}
        <ProfessionalConnect />

        {/* ================= FOOTER ================= */}
        <footer className="py-24 border-t border-white/5 bg-black/20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div>
                <div className="text-3xl font-black text-white tracking-tighter mb-4">2WIN<span className="text-primary italic">.AI</span></div>
                <p className="text-xs text-foreground/30 font-medium max-w-xs leading-relaxed uppercase tracking-wider">Engineering the future of preventative medicine through Digital Twin visualization.</p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="flex gap-8">
                  {['Twitter', 'LinkedIn', 'Discord'].map(s => (
                    <a key={s} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors">{s}</a>
                  ))}
                </div>
                <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-[0.3em] mt-4">AISSMS IOIT • Team Nodemon • Pune 2026</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>

  );
}
