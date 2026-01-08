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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text mb-3">2win</h1>
          <p className="text-slate-400 text-lg">Welcome back!</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-center space-x-3 ${status === "success"
                ? "bg-emerald-900/50 border border-emerald-500/50 text-emerald-200"
                : "bg-red-900/50 border border-red-500/50 text-red-200"
              }`}
          >
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign up
          </Link>
        </p>

        <p className="text-xs text-slate-500 text-center mt-8">
          Backend: https://twowin-8mg4.onrender.com • Day 1 MVP • Team Nodemons
        </p>
      </div>
    </main>
  );
}
