import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-xs cursor-pointer">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">JanMitra AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-gutter">
            <Link className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed-dim transition-colors py-2" href="/schemes">Explore Schemes</Link>
            <Link className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed-dim transition-colors py-2" href="/chat">Chat with AI</Link>
          </nav>
          <div className="flex items-center gap-sm">
            <Link href="/profile" className="font-label-md text-label-md text-primary bg-primary-container/10 hover:bg-primary-container/20 px-4 py-2 rounded-xl transition-colors">
              <span className="hidden sm:inline">My Profile</span>
              <span className="material-symbols-outlined sm:hidden text-[20px]">person</span>
            </Link>
            <button className="md:hidden text-on-surface p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl flex flex-col gap-xl">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center py-lg">
          <div className="flex flex-col gap-md max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">India AI Mission Initiative</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Find Government Schemes You May Be Eligible For</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Powered by AI. Verified using official government documents.</p>
            <div className="flex flex-col sm:flex-row gap-sm pt-sm">
              <Link href="/chat" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-surface-tint transition-colors shadow-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>chat</span>
                Start Chatting
              </Link>
              <Link href="/schemes" className="bg-surface border border-outline-variant text-primary font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">policy</span>
                Explore Schemes
              </Link>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl -z-10 transform translate-x-3 translate-y-3"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Illustration of diverse Indian citizens using technology" className="w-full h-full object-cover rounded-2xl shadow-sm border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUT0tov59DPhB5l6eSYmuxFifm9egjmSIURPmQF4xOnxrA2tkGRcIVOyMAJhZPElKr6iW6ZKXzFIFR-_theT2D4n3QBZlfdMsfHF4qPkjHstf3s470YvyWzQK4Fa3sSB4I_GRQ-g6Tj0wHvYzsEZJndBLCaM7-lVBuVyOYoUmaIPiWPzTBOs2UtgEpc55M0LSoXnt4SvU0OeShdXbBMe4Pf3Mh9kpW65-mwhSq_pgoBC7WeZL2f2sNqouiL7lzR3vPnGeCjOQI1WU" />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { number: "1000+", label: "Schemes Indexed", icon: "description" },
            { number: "36", label: "States Covered", icon: "map" },
            { number: "3-Tier", label: "RAG Pipeline", icon: "hub" },
            { number: "0", label: "Hallucinations", icon: "verified" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-[28px] mb-2 block" style={{fontVariationSettings: "'FILL' 1"}}>{stat.icon}</span>
              <div className="font-headline-md text-headline-md text-primary">{stat.number}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Features Grid */}
        <section className="flex flex-col gap-lg py-lg">
          <div className="flex flex-col gap-xs text-center md:text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Why Choose JanMitra AI?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Built on the pillars of Institutional Trust and Radical Clarity to ensure you get accurate, helpful information.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {[
              { icon: "verified_user", title: "Verified Sources", desc: "Responses are generated exclusively from verified government portals and official documents.", color: "bg-primary-container text-on-primary-container" },
              { icon: "fact_check", title: "No Hallucinations", desc: "Strict guardrails ensure the AI provides factual information without inventing policies.", color: "bg-secondary-container text-on-secondary-container" },
              { icon: "translate", title: "Multi-language", desc: "Interact comfortably in Hindi, Tamil, Bengali, Marathi, and more regional languages.", color: "bg-tertiary-fixed text-on-tertiary-fixed" },
              { icon: "lightbulb", title: "Simple Explanations", desc: "Complex bureaucratic jargon is translated into easy-to-understand, actionable steps.", color: "bg-surface-variant text-on-surface-variant" },
              { icon: "rule", title: "Eligibility Guidance", desc: "Answer a few simple questions to automatically determine your eligibility for welfare schemes.", color: "bg-primary text-on-primary" },
              { icon: "library_books", title: "Official Citations", desc: "Every claim is backed by direct links to the official source document.", color: "bg-error-container text-on-error-container" },
            ].map((feature) => (
              <div key={feature.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                <div className={`h-12 w-12 ${feature.color} rounded-lg flex items-center justify-center mb-1 group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{feature.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{feature.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary rounded-2xl p-lg md:p-xl text-center flex flex-col items-center gap-md mb-lg">
          <span className="material-symbols-outlined text-on-primary text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
          <h2 className="font-headline-lg text-headline-lg text-on-primary">Ready to find your benefits?</h2>
          <p className="font-body-md text-body-md text-on-primary/80 max-w-lg">Complete your profile in under 2 minutes and get personalized scheme recommendations powered by our RAG pipeline.</p>
          <div className="flex flex-col sm:flex-row gap-sm pt-sm">
            <Link href="/profile" className="bg-on-primary text-primary font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-on-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Complete Profile
            </Link>
            <Link href="/chat" className="bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-primary-container/80 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Ask a Question
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline mt-auto">
        <div className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex flex-col items-center md:items-start gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">JanMitra AI</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-inverse-on-surface opacity-80">© 2024 JanMitra AI. Government of India.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-md">
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">Accessibility</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">Contact Us</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
