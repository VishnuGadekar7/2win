
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const API_BASE_URL = "http://127.0.0.1:8000"; // Harsh's backend

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Basic validation
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setStatus("error");
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
      const requestBody = {
        email,
        password,
        name,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        age: age ? parseInt(age) : null,
      };
      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      if (response.ok) {
        setMessage(`✅ Registration successful! Welcome ${data.name}`);
        setStatus("success");
        // Clear form on successful registration
        setEmail("");
        setPassword("");
        setName("");
        setHeight("");
        setWeight("");
        setAge("");
      } else {
        setMessage(data.detail || data.message || "Registration failed");
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text mb-3">2win</h1>
          <p className="text-slate-400 text-lg">Day 1 MVP - Register Now</p>
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

        <form onSubmit={handleRegister} className="space-y-6">
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-slate-400">Password must be at least 8 characters long</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Age
            </label>
            <input
              type="number"
              placeholder="35"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-8">
          Backend: localhost:8000/health • Day 1 MVP • Team Nodemons
        </p>
      </div>
    </main>
  );
}

