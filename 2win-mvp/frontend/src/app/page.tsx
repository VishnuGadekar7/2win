
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 via-blue-900/20 to-slate-900 flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl md:text-7xl font-black gradient-text">
          2win
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Digital Twin Health Predictor
        </p>
        <p className="text-lg text-slate-400">
          Predict diabetes 3 years early • Week 1 MVP Live
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <a href="/login" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-lg">
            Get Started
          </a>
          <button className="px-8 py-4 border-2 border-white/30 hover:border-white/50 bg-white/5 backdrop-blur-sm rounded-2xl font-semibold hover:bg-white/10 transition-all">
            Watch Demo
          </button>
        </div>

        <div className="text-sm text-slate-500 space-y-1">
          <p>Team Nodemons • AISSMS IOIT Pune • Semester 5</p>
          <p>Backend LIVE: <span className="font-mono text-cyan-400">localhost:8000/health</span></p>
        </div>
      </div>
    </main>
  );
}

