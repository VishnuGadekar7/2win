"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  //const RENDER_API_BASE_URL = "https://twowin-8mg4.onrender.com";
  const RENDER_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus(null);

    // Basic validation
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setStatus("error");
      setLoading(false);
      return;
    }

    try {
      // Build request body
      const requestBody: any = { email, password, name };

      if (height !== "") requestBody.height = parseFloat(height);
      if (weight !== "") requestBody.weight = parseFloat(weight);
      if (age !== "") requestBody.age = parseInt(age);

      console.log("Sending registration request:", requestBody);

      const response = await fetch(`${RENDER_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Registration response:", { status: response.status, data });

      if (response.ok) {
        setMessage(`✅ Registration successful! Welcome ${data.name}`);
        setStatus("success");
        // Clear form on success
        setEmail("");
        setPassword("");
        setName("");
        setHeight("");
        setWeight("");
        setAge("");
      } else {
        // Convert backend validation errors to readable string
        let errorMsg = "Registration failed";
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMsg = data.detail
              .map((err: any) => `${err.loc.join(" > ")}: ${err.msg}`)
              .join("; ");
          } else {
            errorMsg = data.detail;
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
        setMessage(errorMsg);
        setStatus("error");
      }
    } catch (error: any) {
      setMessage("Failed to connect to the server. Please try again later.");
      setStatus("error");
      console.error("Registration error:", error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[hsl(260_10%_4%)] text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg glass rounded-[2rem] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-white/5 relative z-10 my-6 transition-all">
        <div className="text-center mb-10">
          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-background mx-auto mb-4 shadow-[0_0_30px_rgba(var(--primary),0.4)]">
              2
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Join Nexus</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[9px]">Initialize Your Health Twin</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-8 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest animate-fade-in ${status === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${status === "success" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@nexus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
              Secure Access Key
            </label>
            <input
              type="password"
              placeholder="Entropy level: High"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              minLength={8}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                Height
              </label>
              <input
                type="number"
                placeholder="cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                Weight
              </label>
              <input
                type="number"
                placeholder="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                Age
              </label>
              <input
                type="number"
                placeholder="yr"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-background font-black py-4 px-8 rounded-xl shadow-[0_15px_30px_rgba(var(--primary),0.15)] hover:shadow-[0_20px_40px_rgba(var(--primary),0.25)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 mt-4 text-[10px] uppercase tracking-widest"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Initializing...
              </span>
            ) : (
              "Complete Initialization"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px]">
          <span className="text-foreground/30 font-bold uppercase tracking-widest">Already a member?</span>{" "}
          <Link href="/login" className="text-primary font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-2">
            Sign In Here
          </Link>
        </div>

        <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/20 font-black text-center mt-10">
          Nexus Infrastructure • Team Nodemon
        </p>
      </div>
    </main>
  );
}
