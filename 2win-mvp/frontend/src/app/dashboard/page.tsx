"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMetrics, usePredictions, useBodyScan, useAlerts } from "@/hooks/useHealthData";
import type { Prediction, BodyPart, HealthMetric, MedicalAlert } from "@/hooks/useHealthData";
import { DashboardSidebar } from "@/components/DashboardSidebar";

/* ─── RISK COLOR HELPERS ──────────────────────────────────────── */
const riskColor = (v: number) =>
  v > 66 ? "text-red-400" : v > 33 ? "text-amber-400" : "text-emerald-400";
const riskBg = (v: number) =>
  v > 66 ? "bg-red-500/10 border-red-500/20" : v > 33 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20";
const riskDot = (v: number) =>
  v > 66 ? "bg-red-500" : v > 33 ? "bg-amber-500" : "bg-emerald-500";
const statusIcon = (s: string) =>
  s === "critical" ? "🔴" : s === "warning" ? "🟡" : "🟢";
const trendArrow = (t: string) =>
  t === "up" ? "↑" : t === "down" ? "↓" : "→";

/* ─── BODY STATUS ─ */
const STATUS_COLOR: Record<string, string> = {
  healthy: "#1D9E75", normal: "#1D9E75", warning: "#EF9F27", critical: "#E24B4A",
};
const STATUS_GLOW: Record<string, string> = {
  healthy: "drop-shadow(0 0 6px rgba(29,158,117,0.5))",
  normal: "drop-shadow(0 0 6px rgba(29,158,117,0.5))",
  warning: "drop-shadow(0 0 8px rgba(239,159,39,0.6))",
  critical: "drop-shadow(0 0 12px rgba(226,75,74,0.7))",
};

export default function DashboardPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  // React Query hooks
  const { data: healthMetrics = [], isLoading: metricsLoading } = useMetrics();
  const { data: predictions = [], isLoading: predictionsLoading } = usePredictions();
  const { data: bodyData = [] } = useBodyScan();
  const { data: medicalAlerts = [] } = useAlerts();

  const loading = authLoading || metricsLoading || predictionsLoading;

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) router.push("/login");
  }, [authLoading, token, router]);

  /* derivations */
  const partMap = Object.fromEntries((bodyData ?? []).map((p: BodyPart) => [p.body_part, p]));
  const vitalityPred = predictions.find((p: Prediction) => p.prediction_type === "vitality_index");
  const vitalityScore = vitalityPred?.value ?? null;
  const riskPredictions = predictions.filter((p: Prediction) => p.prediction_type !== "vitality_index");
  const selectedPred = predictions.find((p: Prediction) => (p.disease || p.prediction_type) === selectedRisk);

  /* ─── LOADING ───────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-[hsl(260_10%_3%)] flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🧬</span>
          </div>
        </div>
        <div>
          <p className="text-foreground/60 text-sm font-bold">Synchronizing Bio-Data...</p>
          <p className="text-foreground/20 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Encrypted Channel Active</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950 text-foreground selection:bg-primary/30 antialiased">
      <DashboardSidebar />

      {/* ═══════ MAIN ═══════ */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 pt-14 md:pt-8 relative">

        {/* Background gradient orbs */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-primary/[0.03] blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/[0.02] blur-[120px] rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1600px] mx-auto">

          {/* ─── Header ─── */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Vitality Index</h1>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live</span>
                </div>
              </div>
              <p className="text-foreground/30 text-sm font-medium">
                {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} • {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Encrypted</span>
              </div>
              <Link href="/profile" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/10 flex items-center justify-center text-sm hover:border-primary/30 transition-all">
                🧬
              </Link>
            </div>
          </header>

          {/* ─── Top Row: Vitality + Quick Metrics ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">

            {/* Vitality Ring */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="glass p-6 h-full flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
                <div className="relative">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="hsl(260 20% 12%)" strokeWidth="8" />
                    <circle
                      cx="70" cy="70" r="60" fill="none"
                      stroke="url(#vitalityGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(vitalityScore ?? 0) / 100 * 377} 377`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="vitalityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(280 85% 65%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white leading-none">
                      {vitalityScore !== null ? Math.round(vitalityScore) : "—"}
                    </span>
                    {vitalityScore !== null && <span className="text-[10px] text-foreground/30 font-bold mt-1">/ 100</span>}
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/30 mt-4">
                  {vitalityScore !== null ? "Vitality Score" : "Awaiting Data"}
                </div>
              </div>
            </div>

            {/* Quick Metric Cards */}
            <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4">
              {healthMetrics.length > 0 ? healthMetrics.slice(0, 4).map((m: HealthMetric, i: number) => (
                <div key={m.name} className="glass p-5 group hover:border-primary/20 transition-all" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${m.status === "normal" ? "text-emerald-400/60" : m.status === "warning" ? "text-amber-400/60" : "text-red-400/60"}`}>
                      {m.status === "normal" ? "Normal" : m.status === "warning" ? "Warning" : "Critical"}
                    </span>
                    <span className={`text-xs font-bold ${m.trend === "up" ? "text-red-400/60" : m.trend === "down" ? "text-emerald-400/60" : "text-foreground/20"}`}>
                      {trendArrow(m.trend)}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white mb-1">
                    {typeof m.value === "number" ? m.value.toFixed(1) : m.value}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-foreground/25 font-semibold">{m.unit}</span>
                    <span className="text-[10px] text-foreground/20 font-medium">{m.name}</span>
                  </div>
                </div>
              )) : (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="glass p-5 flex flex-col justify-between min-h-[120px]">
                    <div className="w-12 h-2 rounded bg-white/5 animate-pulse" />
                    <div className="w-16 h-6 rounded bg-white/5 animate-pulse" />
                    <div className="w-20 h-2 rounded bg-white/5 animate-pulse" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── Middle Row: Digital Twin + Risk Matrix ─── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-6">

            {/* Digital Twin Body */}
            <div className="xl:col-span-4">
              <div className="glass p-6 min-h-[460px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/50">Digital Twin Active</span>
                </div>

                {/* SVG Human Body */}
                <div className="relative w-full max-w-[200px] aspect-[1/2.2] mt-6">
                  <svg viewBox="0 0 120 260" className="w-full h-full">
                    {/* grid lines for sci-fi feel */}
                    {[60, 100, 140, 180].map(y => (
                      <line key={y} x1="20" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.03" strokeWidth="0.5" strokeDasharray="2,4" />
                    ))}

                    {/* Body silhouette */}
                    <g className="text-white/[0.06]" fill="currentColor" stroke="currentColor" strokeWidth="0.3">
                      {/* head */}
                      <ellipse cx="60" cy="28" rx="16" ry="20" />
                      {/* neck */}
                      <rect x="55" y="48" width="10" height="12" rx="3" />
                      {/* torso */}
                      <path d="M38,60 Q38,56 42,55 L78,55 Q82,56 82,60 L82,140 Q82,148 75,150 L45,150 Q38,148 38,140 Z" />
                      {/* left arm */}
                      <path d="M38,62 L24,70 L18,110 L22,112 L30,78 L38,72" />
                      {/* right arm */}
                      <path d="M82,62 L96,70 L102,110 L98,112 L90,78 L82,72" />
                      {/* left leg */}
                      <path d="M45,150 L42,200 L38,245 L48,245 L50,200 L52,150" />
                      {/* right leg */}
                      <path d="M68,150 L70,200 L72,245 L82,245 L78,200 L75,150" />
                    </g>

                    {/* Hotspot: Head */}
                    <g className="cursor-pointer" onClick={() => setSelectedRisk("Sleep Apnea")}>
                      <circle cx="60" cy="28" r="14"
                        fill={STATUS_COLOR[partMap["head"]?.status ?? "healthy"]}
                        opacity={partMap["head"] ? 0.25 : 0.08}
                        style={{ filter: STATUS_GLOW[partMap["head"]?.status ?? "healthy"] }}
                        className="transition-all duration-700"
                      />
                      <circle cx="60" cy="28" r="3" fill="white" opacity="0.6" className="animate-pulse" />
                    </g>

                    {/* Hotspot: Chest / Heart */}
                    <g className="cursor-pointer" onClick={() => setSelectedRisk("Cvd")}>
                      <circle cx="60" cy="85" r="16"
                        fill={STATUS_COLOR[partMap["chest"]?.status ?? "healthy"]}
                        opacity={partMap["chest"] ? 0.25 : 0.08}
                        style={{ filter: STATUS_GLOW[partMap["chest"]?.status ?? "healthy"] }}
                        className="transition-all duration-700"
                      />
                      <path d="M56,85 L64,85 M60,81 L60,89" stroke="white" strokeWidth="1.5" opacity="0.5" />
                    </g>

                    {/* Hotspot: Abdomen */}
                    <g className="cursor-pointer" onClick={() => setSelectedRisk("Diabetes")}>
                      <circle cx="60" cy="130" r="14"
                        fill={STATUS_COLOR[partMap["abdomen"]?.status ?? "healthy"]}
                        opacity={partMap["abdomen"] ? 0.25 : 0.08}
                        style={{ filter: STATUS_GLOW[partMap["abdomen"]?.status ?? "healthy"] }}
                        className="transition-all duration-700"
                      />
                      <circle cx="60" cy="130" r="2.5" fill="white" opacity="0.4" />
                    </g>

                    {/* Connection lines */}
                    <line x1="74" y1="28" x2="115" y2="28" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2,3" opacity="0.3" />
                    <line x1="76" y1="85" x2="115" y2="85" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2,3" opacity="0.3" />
                    <line x1="74" y1="130" x2="115" y2="130" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2,3" opacity="0.3" />
                  </svg>

                  {/* Labels */}
                  <div className="absolute top-[8%] -right-2 lg:right-[-10px]">
                    <div className="text-[8px] font-black text-primary/60 tracking-wider">CEREBRAL</div>
                    <div className="text-[7px] text-foreground/20">{statusIcon(partMap["head"]?.status ?? "healthy")} {partMap["head"]?.status ?? "awaiting"}</div>
                  </div>
                  <div className="absolute top-[30%] -right-2 lg:right-[-10px]">
                    <div className="text-[8px] font-black text-primary/60 tracking-wider">CARDIAC</div>
                    <div className="text-[7px] text-foreground/20">{statusIcon(partMap["chest"]?.status ?? "healthy")} {partMap["chest"]?.status ?? "awaiting"}</div>
                  </div>
                  <div className="absolute top-[48%] -right-2 lg:right-[-10px]">
                    <div className="text-[8px] font-black text-primary/60 tracking-wider">METABOLIC</div>
                    <div className="text-[7px] text-foreground/20">{statusIcon(partMap["abdomen"]?.status ?? "healthy")} {partMap["abdomen"]?.status ?? "awaiting"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Cards Grid */}
            <div className="xl:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskPredictions.length > 0 ? riskPredictions.map((risk: Prediction, i: number) => {
                  const score = risk.value ?? risk.risk ?? 0;
                  const name = risk.disease || risk.prediction_type || "";
                  const isSelected = selectedRisk === name;
                  return (
                    <div
                      key={name}
                      onClick={() => setSelectedRisk(isSelected ? null : name)}
                      className={`glass p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] ${isSelected ? "ring-1 ring-primary/40 bg-primary/[0.04]" : "hover:border-white/10"}`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${riskDot(score)} ${score > 50 ? "animate-pulse" : ""}`} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                            {score > 66 ? "High" : score > 33 ? "Moderate" : "Low"}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-foreground/20">
                          {risk.confidence ? `${(risk.confidence * 100).toFixed(0)}%` : "—"}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm mb-2 capitalize">{name.replace(/_/g, " ")}</h3>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/[0.05] mb-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${score > 66 ? "bg-gradient-to-r from-red-500 to-red-400" : score > 33 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400"}`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>

                      <div className={`text-xl font-black ${riskColor(score)}`}>
                        {score.toFixed(1)}%
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full glass p-12 text-center">
                    <div className="text-4xl mb-3 opacity-20">📡</div>
                    <p className="text-foreground/30 font-bold text-xs uppercase tracking-widest">No predictions yet</p>
                    <p className="text-foreground/15 text-[11px] mt-1">Connect a device to begin health analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Bottom Row: Analysis + Alerts ─── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

            {/* Detailed Analysis */}
            <div className="xl:col-span-8">
              <div className="glass p-8 relative overflow-hidden min-h-[280px]">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/[0.02] blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    {selectedRisk ? `${selectedRisk.replace(/_/g, " ")} Analysis` : "Select a risk factor above"}
                  </h2>

                  {selectedRisk && selectedPred ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                      {/* Factors */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-4">Contributing Factors</h4>
                        <div className="space-y-2">
                          {(selectedPred.factors?.length
                            ? selectedPred.factors
                            : selectedPred.explanation?.main_factors?.map((f: any) => f.name) ?? []
                          ).map((f: string) => (
                            <div key={f} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                              <div className="w-1 h-1 rounded-full bg-primary/60" />
                              <span className="text-xs font-medium text-foreground/60">{f}</span>
                            </div>
                          ))}
                          {!(selectedPred.factors?.length || selectedPred.explanation?.main_factors?.length) && (
                            <p className="text-foreground/20 text-xs italic">No factor data available</p>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-4">Clinical Guidance</h4>
                        <div className="space-y-3">
                          {(selectedPred.recommendations?.length
                            ? selectedPred.recommendations
                            : selectedPred.explanation?.recommendations ?? []
                          ).map((r: string) => (
                            <div key={r} className="flex gap-3 items-start">
                              <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] text-emerald-400 mt-0.5 flex-shrink-0">✓</div>
                              <p className="text-[12px] text-foreground/50 leading-relaxed">{r}</p>
                            </div>
                          ))}
                          {!(selectedPred.recommendations?.length || selectedPred.explanation?.recommendations?.length) && (
                            <p className="text-foreground/20 text-xs italic">No recommendations available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center text-center opacity-15">
                      <div className="text-5xl mb-3">🔬</div>
                      <p className="font-bold uppercase tracking-widest text-[10px]">Click a risk card to view detailed analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts + Quick Actions Panel */}
            <div className="xl:col-span-4 space-y-5">

              {/* Alerts */}
              <div className="glass p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Alerts</h4>
                  {medicalAlerts.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-bold">{medicalAlerts.length}</span>
                  )}
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {medicalAlerts.length > 0 ? medicalAlerts.slice(0, 5).map((a: MedicalAlert) => (
                    <div key={a.id} className={`p-3 rounded-lg border text-[11px] font-medium leading-relaxed ${a.type === "critical" ? "bg-red-500/5 border-red-500/15 text-red-300/80" : a.type === "warning" ? "bg-amber-500/5 border-amber-500/15 text-amber-300/80" : "bg-white/[0.02] border-white/[0.04] text-foreground/40"}`}>
                      {a.message}
                    </div>
                  )) : (
                    <div className="py-6 text-center">
                      <div className="text-2xl opacity-15 mb-2">✨</div>
                      <p className="text-foreground/20 text-[10px] font-bold uppercase tracking-widest">All clear</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass p-5 bg-gradient-to-br from-primary/[0.04] to-purple-600/[0.02]">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:border-primary/20 transition-all group">
                    <span className="text-xs">👤</span>
                    <span className="text-[11px] font-semibold text-foreground/40 group-hover:text-foreground/60">Edit Health Profile</span>
                  </Link>
                  <Link href="/demo" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:border-primary/20 transition-all group">
                    <span className="text-xs">📊</span>
                    <span className="text-[11px] font-semibold text-foreground/40 group-hover:text-foreground/60">View Demo Center</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
