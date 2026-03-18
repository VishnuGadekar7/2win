"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus(null);

    const result = await login(email, password);

    if (result.ok) {
      setMessage("✅ Login successful! Redirecting...");
      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setMessage(result.error || "Login failed.");
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[hsl(260_10%_4%)] text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md glass rounded-[2rem] p-8 sm:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-white/5 relative z-10 transition-all">
        <div className="text-center mb-10">
          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-background mx-auto mb-4 shadow-[0_0_30px_rgba(var(--primary),0.4)]">
              2
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[9px]">Neural Sync Required</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-8 flex items-center space-x-3 animate-fade-in text-[10px] font-black uppercase tracking-widest ${status === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${status === "success" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@nexus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 
                         focus:outline-none focus:border-primary/50 transition-all duration-300 font-medium text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                tabIndex={-1}
              >
                Reset Key
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 
                         focus:outline-none focus:border-primary/50 transition-all duration-300 font-medium text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-8 rounded-xl font-black text-background transition-all duration-300 shadow-[0_15px_30px_rgba(var(--primary),0.15)] text-[10px] uppercase tracking-widest mt-4 ${loading
              ? "bg-primary/50 cursor-not-allowed opacity-50"
              : "bg-primary hover:bg-primary/90 hover:shadow-[0_20px_40px_rgba(var(--primary),0.25)] transform hover:-translate-y-0.5 active:scale-95"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Synchronizing...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px]">
          <span className="text-foreground/30 font-bold uppercase tracking-widest">New to 2win?</span>{" "}
          <Link
            href="/register"
            className="text-primary font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-2"
          >
            Register Twin
          </Link>
        </div>

        <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/20 font-black text-center mt-10">
          Neural-Tech • v1.0.42
        </p>
      </div>
    </main>
  );
}
