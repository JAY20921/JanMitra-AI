import Link from "next/link";

export default function PrivacyPolicyPage() {
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
        <h1 className="font-headline-lg text-4xl font-bold text-on-surface mb-md">Privacy Policy</h1>
        <p className="font-body-md text-on-surface-variant mb-6">Last updated: August 2026</p>
        
        <div className="space-y-6 font-body-md text-on-surface-variant">
          <section>
            <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-2">1. Information We Collect</h2>
            <p>At JanMitra AI, we only collect the information you voluntarily provide in your profile (e.g., state, age, occupation). This information is stored <strong>locally in your browser</strong> using localStorage and is never transmitted to or stored on our servers.</p>
          </section>

          <section>
            <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-2">2. How We Use Your Information</h2>
            <p>The profile information is used exclusively within your browser to filter and recommend the most relevant government schemes. When you query the AI, only the text of your query and relevant local context are processed to generate a response.</p>
          </section>

          <section>
            <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-2">3. Third-Party Services</h2>
            <p>We use large language models (LLMs) to process your queries. Only the text of your question and the retrieved scheme context are sent to these services. We do not send your personal profile identifiers.</p>
          </section>

          <section>
            <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-2">4. Your Rights</h2>
            <p>Because your data is stored locally, you have complete control over it. You can delete or modify your profile at any time by visiting the Profile page or clearing your browser&apos;s local storage.</p>
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
