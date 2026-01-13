export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[hsl(260_10%_5%)] via-[hsl(260_100%_9%)/0.8] to-[hsl(260_10%_5%)] flex flex-col">
      {/* Translucent Navbar - Matches screenshot exactly */}
      {/* Fixed Translucent Navbar - Perfect screenshot match */}
<nav className="w-full px-4 sm:px-6 py-4 backdrop-blur-xl z-50">
  <div className="max-w-4xl mx-auto">
    <div className="bg-[hsl(260_100%_9%/0.12)] backdrop-blur-xl rounded-2xl border border-[hsl(260_100%_9%/0.25)] p-2 sm:p-3 flex items-center justify-center gap-6 sm:gap-8">
      <h1 className="text-lg sm:text-xl font-black gradient-text drop-shadow-lg whitespace-nowrap">
        2win
      </h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <a 
          href="/login" 
          className="text-foreground/90 hover:text-foreground font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[hsl(260_100%_9%/0.4)] transition-all duration-200 text-sm sm:text-base"
        >
          Login
        </a>
        <a 
          href="/login" 
          className="btn-primary px-5 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          Get Started
        </a>
      </div>
    </div>
  </div>
</nav>


      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-32 space-y-8">
          <div className="inline-block">
            <span className="px-4 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-medium text-primary">
              Team Nodemon • Week 1 MVP Live
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight gradient-text">
            Digital Twin Health<br className="hidden lg:inline" />
            <span className="text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text">
              Predictor
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Predict diabetes 3 years early with AI-powered digital twin technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <a
              href="/login"
              className="group btn-primary px-10 py-5 text-lg shadow-2xl flex items-center justify-center gap-2"
            >
              Start Free Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <button className="px-10 py-5 glass border border-primary/50 hover:border-primary font-semibold text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <span>Watch Demo</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Team Nodemons • AISSMS IOIT Pune</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary">localhost:8000/health</span>
              <span className="text-xs bg-primary/10 px-2 py-1 rounded">LIVE</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full mb-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black gradient-text max-w-2xl mx-auto">
              Health Prediction, Perfected
            </h2>
            <p className="text-xl text-foreground/80 mt-6 max-w-lg mx-auto">
              Three core pillars powering your health future
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🩺',
                title: 'Early Detection',
                desc: 'AI predicts diabetes risk 3 years before symptoms using digital twin technology from your wearable data'
              },
              {
                icon: '📱',
                title: 'Real-time Tracking',
                desc: 'Live health data from ESP32, Apple Health, Google Fit • Steps, sleep, water, nutrition monitoring'
              },
              {
                icon: '📈',
                title: 'Personalized Plans',
                desc: 'Custom workout, diet & lifestyle recommendations powered by your unique digital twin'
              }
            ].map((feature, idx) => (
              <div key={idx} className="glass p-8 lg:p-10 group hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-2xl">
                <div className="w-20 h-20 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/25 transition-all duration-300">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6 text-center">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center lg:text-lg">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full mb-32">
          {[
            { num: '3X', label: 'Earlier Detection', gradient: true },
            { num: '95%', label: 'Accuracy', color: 'primary' },
            { num: '10K+', label: 'Users Week 1', color: 'primary' },
            { num: '24/7', label: 'Live Monitoring', color: 'primary' }
          ].map((stat, idx) => (
            <div key={idx} className="glass p-8 text-center group hover:scale-105 transition-all">
              <div className={`text-3xl lg:text-4xl font-black mb-3 ${
                stat.gradient ? 'gradient-text' : `text-${stat.color}`
              }`}>
                {stat.num}
              </div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-black gradient-text mb-8">
            Ready to Meet Your Digital Twin?
          </h2>
          <p className="text-xl text-foreground/80 mb-12 leading-relaxed">
            Join 10K+ users already preventing health risks with AI precision
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="btn-primary px-12 py-6 text-xl shadow-2xl">
              Start Free Trial
            </a>
            <a href="/demo" className="px-12 py-6 glass border-2 border-primary/50 hover:border-primary text-lg font-semibold hover:scale-[1.02] transition-all">
              Book Demo Call
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
