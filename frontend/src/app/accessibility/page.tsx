import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <header className="bg-white/90 backdrop-blur-md border-b border-outline-variant sticky top-1 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 bg-gradient-to-br from-primary to-surface-tint rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">account_balance</span>
            </div>
            <span className="font-headline-md text-[16px] font-bold text-primary">JanMitra AI</span>
          </Link>
          <Link href="/" className="font-label-md text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-gutter py-xl">
        <h1 className="font-headline-lg text-4xl font-bold text-on-surface mb-md flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[40px]" style={{fontVariationSettings: "'FILL' 1"}}>accessibility_new</span>
          Accessibility Statement
        </h1>
        
        <div className="space-y-6 font-body-md text-on-surface-variant">
          <section>
            <p className="mb-4">
              JanMitra AI is committed to ensuring digital accessibility for all users, including those with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-2">Standards Configuration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>High-contrast color modes (WCAG AA compliant).</li>
              <li>Semantic HTML5 for screen reader compatibility.</li>
              <li>Keyboard navigable interfaces.</li>
              <li>Clear typography using readable sans-serif fonts (Inter, Noto Sans).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-2">Feedback</h2>
            <p>
              We welcome your feedback on the accessibility of JanMitra AI. If you encounter any accessibility barriers, please let us know through our <Link href="/contact" className="text-primary hover:underline">Contact Us</Link> page.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-inverse-surface text-inverse-on-surface w-full mt-auto py-lg text-center">
        <p className="font-body-sm">© 2026 JanMitra AI. All rights reserved.</p>
        <div className="tricolor-bar mt-lg" />
      </footer>
    </div>
  );
}
