"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const router = useRouter();

  const RENDER_API_BASE_URL = "https://twowin-8mg4.onrender.com";
  //const RENDER_API_BASE_URL = "http://localhost:8000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      console.log("Sending login request");

      const response = await fetch(`${RENDER_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
        credentials: 'include',
      });

      const data = await response.json();
      console.log("Login response:", { status: response.status, data });

      if (response.ok) {
        setMessage("✅ Login successful! Redirecting...");
        setStatus("success");
        // Store the token in localStorage
        localStorage.setItem('token', data.access_token);
        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        let errorMsg = data.detail || "Login failed. Please check your credentials.";
        setMessage(errorMsg);
        setStatus("error");
      }
    } catch (error: any) {
      setMessage("Failed to connect to the server. Please try again later.");
      setStatus("error");
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-700/50">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black gradient-text mb-3">2win</h1>
          <p className="text-slate-300 text-lg">Welcome back!</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-8 flex items-center space-x-3 animate-fade-in ${status === "success"
              ? "bg-emerald-900/50 border border-emerald-500/50 text-emerald-200"
              : "bg-red-900/50 border border-red-500/50 text-red-200"
              }`}
          >
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 
                         focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 
                         transition-all duration-200 hover:border-slate-600"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 
                         focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 
                         transition-all duration-200 hover:border-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${loading
              ? "bg-cyan-700/80 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/30"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="text-base">Sign in</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
          >
            Sign up
          </Link>
        </div>

        <p className="text-xs text-slate-500 text-center mt-8">
          Backend: https://twowin-8mg4.onrender.com • Day 1 MVP • Team Nodemons
        </p>
      </div>
    </main>
  );
}
