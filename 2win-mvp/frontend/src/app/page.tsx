export default function Home() {
  return (
    <main
      className="
        min-h-screen w-full flex flex-col
        bg-gradient-to-br
        from-[hsl(260_10%_5%)]
        via-[hsl(260_100%_9%)/0.8]
        to-[hsl(260_10%_5%)]
      "
    >
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[hsl(260_100%_9%/0.3)] backdrop-blur-xl rounded-2xl border border-[hsl(260_100%_9%/0.25)]
            p-2 sm:p-3 flex items-center justify-center gap-6 sm:gap-8">
            <h1 className="text-lg sm:text-xl font-black gradient-text">
              2win
            </h1>

            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/login"
                className="text-foreground/90 hover:text-foreground font-medium
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg
                hover:bg-[hsl(260_100%_9%/0.4)] transition"
              >
                Login
              </a>

              <a
                href="/login"
                className="btn-primary px-5 sm:px-6 py-1.5 sm:py-2 text-sm shadow-lg"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="pt-32 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">

        {/* ================= HERO ================= */}
        <section className="py-32 text-center max-w-4xl mx-auto space-y-8">
          <span className="inline-block px-4 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-medium text-primary">
            Team Nodemon • Week 1 MVP Live
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight gradient-text">
            Digital Twin Health <br className="hidden lg:inline" />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Predictor
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-foreground/90 max-w-2xl mx-auto">
            Predict diabetes 3 years early with AI-powered digital twin technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <a href="/login" className="btn-primary px-10 py-5 text-lg shadow-2xl">
              Start Free Trial
            </a>

            <button className="glass border border-primary/50 px-10 py-5 text-lg font-semibold">
              Watch Demo
            </button>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-32">
          <div className="relative glass rounded-3xl p-10 lg:p-16 border border-white/10 overflow-hidden">

            <div className="absolute inset-0
              bg-[radial-gradient(circle_at_70%_50%,hsl(270_100%_70%/0.15),transparent_60%)]
              pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black gradient-text mb-6">
                  Health Prediction, Perfected
                </h2>

                <p className="text-lg text-foreground/80 mb-10 max-w-lg">
                  A next-generation digital twin platform combining real-time data,
                  predictive AI, and personalized health intelligence.
                </p>

                <div className="space-y-6">
                  {[
                    ['Early Detection', 'Predict diabetes risk up to 3 years in advance.'],
                    ['Real-time Monitoring', 'Continuous tracking via wearables and IoT.'],
                    ['Personalized Intelligence', 'AI-driven diet & lifestyle optimization.']
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-4">
                      <div className="w-3 h-3 mt-2 rounded-full bg-primary animate-pulse" />
                      <div>
                        <h4 className="font-semibold">{title}</h4>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-primary/20"
                    style={{
                      width: `${220 + i * 120}px`,
                      height: `${220 + i * 120}px`,
                      animation: `ping ${3 + i}s infinite`
                    }}
                  />
                ))}

                <div className="w-24 h-24 rounded-2xl bg-primary/20 border border-primary flex items-center justify-center shadow-2xl">
                  🤖
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-32 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black gradient-text mb-8">
            Ready to Meet Your Digital Twin?
          </h2>

          <p className="text-xl text-foreground/80 mb-12">
            Join 10K+ users already preventing health risks with AI precision
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="btn-primary px-12 py-6 text-xl shadow-2xl">
              Start Free Trial
            </a>

            <a href="/demo" className="glass border border-primary/50 px-12 py-6 text-lg font-semibold">
              Book Demo Call
            </a>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0
            bg-[radial-gradient(circle_at_50%_0%,hsl(270_100%_70%/0.12),transparent_60%)]
            pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs mb-6">
                ✨ Need Any Help?
              </span>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text mb-6">
                Contact With Us
              </h2>

              <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                Build SaaS AI applications faster with our pre-configured stack.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 sm:p-12 border border-primary/25 shadow-2xl">
              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80 ml-1">Name</label>
                    <input
                      placeholder="John Doe"
                      className="w-full rounded-xl bg-secondary/40 border border-border/50 px-6 py-4 text-foreground focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80 ml-1">Email</label>
                    <input
                      placeholder="john@example.com"
                      type="email"
                      className="w-full rounded-xl bg-secondary/40 border border-border/50 px-6 py-4 text-foreground focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 ml-1">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Your message here..."
                    className="w-full rounded-xl bg-secondary/40 border border-border/50 px-6 py-4 text-foreground focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/30"
                  />
                </div>

                <div className="pt-4 text-center">
                  <button className="btn-primary px-12 py-4 text-lg hover:scale-105 transition-transform duration-200">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
