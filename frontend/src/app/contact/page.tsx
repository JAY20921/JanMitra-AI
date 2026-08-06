"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

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

      <main className="flex-1 max-w-2xl mx-auto px-gutter py-xl w-full">
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-4xl font-bold text-on-surface mb-2">Contact Us</h1>
          <p className="font-body-md text-on-surface-variant">We'd love to hear from you. Please fill out this form.</p>
        </div>

        {submitted ? (
          <div className="bg-secondary/10 border border-secondary/20 text-secondary p-8 rounded-xl text-center shadow-elevation-1">
            <span className="material-symbols-outlined text-5xl mb-4" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            <h2 className="font-headline-md text-2xl mb-2">Message Sent!</h2>
            <p className="font-body-md">Thank you for reaching out. We will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-lg rounded-xl space-y-6">
            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Full Name</label>
              <input
                required
                type="text"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Message</label>
              <textarea
                required
                rows={5}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label-md px-8 py-3.5 rounded-xl hover:shadow-elevation-2 transition-all shadow-elevation-1"
            >
              Send Message
            </button>
          </form>
        )}
      </main>

      <footer className="bg-inverse-surface text-inverse-on-surface w-full mt-auto py-lg text-center">
        <p className="font-body-sm">© 2026 JanMitra AI. All rights reserved.</p>
        <div className="tricolor-bar mt-lg" />
      </footer>
    </div>
  );
}
