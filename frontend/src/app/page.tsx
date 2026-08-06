import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          HEADER / NAVIGATION
          ═══════════════════════════════════════════ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-outline-variant sticky top-1 z-50 shadow-elevation-1">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-xs cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-surface-tint rounded-xl flex items-center justify-center shadow-elevation-1">
              <span className="material-symbols-outlined text-on-primary text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-[18px] font-bold text-primary leading-tight">JanMitra AI</span>
              <span className="text-[10px] text-on-surface-variant leading-tight font-medium tracking-wide">GOVERNMENT SCHEME ASSISTANT</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-gutter">
            <Link className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors py-2 relative group" href="/schemes">
              Explore Schemes
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors py-2 relative group" href="/chat">
              Chat with AI
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>
          <div className="flex items-center gap-sm">
            <Link href="/profile" className="font-label-md text-label-md text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-elevation-1">
              <span className="hidden sm:inline">My Profile</span>
              <span className="material-symbols-outlined sm:hidden text-[20px]">person</span>
            </Link>
            <button className="md:hidden text-on-surface p-2 hover:bg-surface-variant rounded-lg transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <section className="hero-gradient hero-pattern relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter py-xl lg:py-[80px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
              <div className="flex flex-col gap-md max-w-2xl relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/10 px-4 py-2 rounded-full w-fit shadow-elevation-1 animate-fade-in-up">
                  <span className="h-2 w-2 rounded-full bg-india-green animate-pulse" />
                  <span className="font-label-sm text-label-sm text-primary font-semibold">India AI Mission Initiative</span>
                </div>

                {/* Heading */}
                <h1 className="font-headline-xl text-headline-xl text-on-surface leading-tight">
                  Find Government Schemes
                  <span className="block gradient-text">You&apos;re Eligible For</span>
                </h1>

                {/* Hindi subtitle */}
                <p className="font-body-lg text-body-lg text-on-surface-variant" style={{ fontFamily: "var(--font-devanagari)" }}>
                  सरकारी योजनाएं खोजें जिनके लिए आप पात्र हैं
                </p>

                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                  Powered by AI. Verified using official government documents. Available in 7+ Indian languages.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-sm pt-sm">
                  <Link href="/chat" className="bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label-md text-label-md px-7 py-3.5 rounded-xl hover:shadow-elevation-3 transition-all duration-300 shadow-elevation-2 flex items-center justify-center gap-2 hover:-translate-y-0.5">
                    <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>chat</span>
                    Start Chatting
                  </Link>
                  <Link href="/schemes" className="bg-white border border-outline-variant text-primary font-label-md text-label-md px-7 py-3.5 rounded-xl hover:bg-surface-container-low hover:border-primary/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-elevation-1 hover:shadow-elevation-2">
                    <span className="material-symbols-outlined text-[18px]">policy</span>
                    Explore Schemes
                  </Link>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center">
                <div className="absolute inset-4 bg-gradient-to-br from-primary/8 to-saffron/5 rounded-2xl -z-10 transform translate-x-3 translate-y-3 blur-sm" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Illustration of diverse Indian citizens using technology" className="w-full h-full object-cover rounded-2xl shadow-elevation-3 border border-outline-variant/50" src="/images/hero.png" />
              </div>
            </div>
          </div>

          {/* Decorative wave divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1200 60" fill="none" className="w-full h-[40px]" preserveAspectRatio="none">
              <path d="M0 30L50 25C100 20 200 10 300 15C400 20 500 40 600 45C700 50 800 40 900 30C1000 20 1100 10 1150 5L1200 0V60H0Z" fill="#f8f9ff"/>
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            STATS BAR
            ═══════════════════════════════════════════ */}
        <section className="max-w-container-max mx-auto px-gutter -mt-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm stagger-children">
            {[
              { number: "1000+", label: "Schemes Indexed", icon: "description", color: "from-primary/10 to-primary/5" },
              { number: "36", label: "States & UTs", icon: "map", color: "from-india-green/10 to-india-green/5" },
              { number: "3-Tier", label: "RAG Pipeline", icon: "hub", color: "from-saffron/10 to-saffron/5" },
              { number: "7+", label: "Languages", icon: "translate", color: "from-primary/10 to-primary/5" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-md text-center group">
                <span className={`material-symbols-outlined text-primary text-[32px] mb-2 block transition-transform duration-300 group-hover:scale-110`} style={{fontVariationSettings: "'FILL' 1"}}>{stat.icon}</span>
                <div className="font-headline-md text-headline-md text-primary">{stat.number}</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FEATURES GRID
            ═══════════════════════════════════════════ */}
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <div className="flex flex-col gap-xs text-center mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Why Choose JanMitra AI?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Built on the pillars of Institutional Trust and Radical Clarity to ensure you get accurate, helpful information.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md stagger-children">
            {[
              { icon: "verified_user", title: "Verified Sources", desc: "Responses generated exclusively from verified government portals and official documents.", accent: "bg-primary" },
              { icon: "fact_check", title: "Zero Hallucinations", desc: "Strict guardrails ensure the AI provides factual information without inventing policies.", accent: "bg-india-green" },
              { icon: "translate", title: "Multi-Language", desc: "Interact comfortably in Hindi, Tamil, Bengali, Marathi, and more regional languages.", accent: "bg-saffron" },
              { icon: "lightbulb", title: "Simple Explanations", desc: "Complex bureaucratic jargon translated into easy-to-understand, actionable steps.", accent: "bg-primary" },
              { icon: "rule", title: "Eligibility Guidance", desc: "Answer a few simple questions to automatically determine your eligibility for schemes.", accent: "bg-india-green" },
              { icon: "library_books", title: "Official Citations", desc: "Every claim backed by direct links to the official source document.", accent: "bg-saffron" },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-lg flex flex-col gap-sm relative overflow-hidden group">
                {/* Accent top bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${feature.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className={`h-12 w-12 ${feature.accent}/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <span className={`material-symbols-outlined ${feature.accent === "bg-primary" ? "text-primary" : feature.accent === "bg-india-green" ? "text-secondary" : "text-tertiary"}`} style={{fontVariationSettings: "'FILL' 1"}}>{feature.icon}</span>
                </div>
                <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">{feature.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TRUST BANNER — Data Source Logos
            ═══════════════════════════════════════════ */}
        <section className="bg-surface-container-low border-y border-outline-variant/50 py-lg">
          <div className="max-w-container-max mx-auto px-gutter">
            <p className="font-label-sm text-label-sm text-on-surface-variant text-center mb-md uppercase tracking-widest">Verified Data Sources</p>
            <div className="flex flex-wrap justify-center items-center gap-lg">
              {[
                { name: "India.gov.in", icon: "public" },
                { name: "PIB", icon: "newspaper" },
                { name: "MyScheme", icon: "assured_workload" },
                { name: "eGazette", icon: "gavel" },
                { name: "NIC", icon: "dns" },
              ].map((source) => (
                <div key={source.name} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-outline-variant/30 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>{source.icon}</span>
                  <span className="font-label-md text-label-md text-on-surface">{source.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA SECTION
            ═══════════════════════════════════════════ */}
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <div className="bg-gradient-to-br from-primary via-surface-tint to-primary rounded-2xl p-lg md:p-xl text-center flex flex-col items-center gap-md relative overflow-hidden shadow-elevation-3">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <span className="material-symbols-outlined text-on-primary/80 text-[48px] animate-float relative z-10" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
            <h2 className="font-headline-lg text-headline-lg text-on-primary relative z-10">Ready to find your benefits?</h2>
            <p className="font-body-md text-body-md text-on-primary/80 max-w-lg relative z-10">Complete your profile in under 2 minutes and get personalized scheme recommendations powered by our 3-tier RAG pipeline.</p>
            <div className="flex flex-col sm:flex-row gap-sm pt-sm relative z-10">
              <Link href="/profile" className="bg-white text-primary font-label-md text-label-md px-7 py-3.5 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center gap-2 hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Complete Profile
              </Link>
              <Link href="/chat" className="bg-white/15 border border-white/30 text-on-primary font-label-md text-label-md px-7 py-3.5 rounded-xl hover:bg-white/25 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Ask a Question
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="bg-inverse-surface text-inverse-on-surface mt-auto">
        <div className="w-full max-w-container-max mx-auto px-gutter py-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Brand */}
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-xs">
                <div className="h-9 w-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-inverse-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
                </div>
                <span className="font-headline-md text-[18px] font-bold text-inverse-primary">JanMitra AI</span>
              </div>
              <p className="font-body-sm text-body-sm text-inverse-on-surface/60 max-w-xs">
                AI-powered assistant to help Indian citizens discover government welfare schemes they may be eligible for.
              </p>
            </div>
            {/* Quick Links */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-md text-label-md text-inverse-on-surface/80 mb-1">Quick Links</span>
              <Link className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors" href="/chat">Chat with AI</Link>
              <Link className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors" href="/schemes">Explore Schemes</Link>
              <Link className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors" href="/profile">My Profile</Link>
            </div>
            {/* Legal */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-md text-label-md text-inverse-on-surface/80 mb-1">Legal</span>
              <Link href="/privacy" className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Privacy Policy</Link>
              <Link href="/accessibility" className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Accessibility</Link>
              <Link href="/contact" className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Contact Us</Link>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="mt-lg pt-md border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-xs">
            <p className="font-body-sm text-body-sm text-inverse-on-surface/50">© 2026 JanMitra AI. All rights reserved.</p>
            <p className="font-label-sm text-label-sm text-inverse-on-surface/40 text-center md:text-right max-w-md">
              Disclaimer: This is not an official Government of India website. Built for educational and research purposes.
            </p>
          </div>
        </div>
        {/* Bottom tricolor */}
        <div className="tricolor-bar" aria-hidden="true" />
      </footer>
    </>
  );
}
