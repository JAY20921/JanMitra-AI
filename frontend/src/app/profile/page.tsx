"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface ProfileData {
  state: string;
  age: string;
  gender: string;
  category: string;
  occupation: string;
  income: string;
  education: string;
}

const INITIAL_PROFILE: ProfileData = {
  state: "",
  age: "",
  gender: "",
  category: "",
  occupation: "",
  income: "",
  education: "",
};

const PROFILE_FIELDS: (keyof ProfileData)[] = ["state", "age", "gender", "category", "occupation", "income", "education"];

function calculateCompletion(profile: ProfileData): number {
  const filled = PROFILE_FIELDS.filter((key) => profile[key] !== "").length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("janmitra_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore parse errors */ }
    setIsHydrated(true);
  }, []);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaveStatus("idle");
  };

  const handleSave = () => {
    try {
      localStorage.setItem("janmitra_profile", JSON.stringify(profile));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  };

  const completion = calculateCompletion(profile);
  const filledCount = PROFILE_FIELDS.filter((key) => profile[key] !== "").length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* ═══════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════ */}
      <header className="sticky top-0 w-full bg-white/90 backdrop-blur-md border-b border-outline-variant z-50 shadow-elevation-1">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center space-x-lg">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-gradient-to-br from-primary to-surface-tint rounded-xl flex items-center justify-center shadow-elevation-1">
                <span className="material-symbols-outlined text-on-primary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[16px] font-bold text-primary leading-tight">JanMitra AI</span>
                <span className="text-[9px] text-on-surface-variant leading-tight font-medium tracking-wide hidden sm:block">SCHEME ASSISTANT</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-gutter">
              <Link href="/schemes" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md py-4 relative group">
                Explore Schemes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/chat" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md py-4 relative group">
                Chat
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-md">
            <span className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary py-4">Profile</span>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 max-w-container-max w-full mx-auto relative pt-lg pb-xl px-gutter md:px-lg">
        <main className="flex-grow w-full max-w-2xl mx-auto px-gutter pb-xl pt-8 relative">
          {/* ═══════════════════════════════════════════
              HEADER SECTION
              ═══════════════════════════════════════════ */}
          <div className="text-center mb-lg w-full">
            <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-surface-tint/10 rounded-2xl flex items-center justify-center mx-auto mb-md shadow-elevation-1">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs hidden md:block">Complete Your Profile</h1>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs md:hidden">Complete Your Profile</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Help us find the most relevant government schemes for you.</p>
          </div>

          {/* ═══════════════════════════════════════════
              WHY IT MATTERS CARD
              ═══════════════════════════════════════════ */}
          <div className="w-full mb-lg glass-card rounded-xl p-md flex items-start gap-3">
            <div className="h-10 w-10 bg-saffron/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface mb-1">Why does this matter?</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Your profile data stays locally on your browser. It helps us filter through 1000+ schemes to find exactly what you&apos;re eligible for. No data is sent to any server.</p>
            </div>
          </div>
          
          {/* ═══════════════════════════════════════════
              PROGRESS INDICATOR
              ═══════════════════════════════════════════ */}
          <div className="w-full mb-lg">
            <div className="flex justify-between items-center mb-xs">
              <span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">task_alt</span>
                Profile Completion
              </span>
              <span className={`font-label-md text-label-md font-bold ${completion === 100 ? "text-secondary" : "text-primary"}`}>
                {isHydrated ? `${filledCount}/${PROFILE_FIELDS.length} fields` : "..."}
              </span>
            </div>
            <div className="h-2.5 w-full bg-surface-variant rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  completion === 100
                    ? "bg-gradient-to-r from-secondary to-india-green"
                    : "bg-gradient-to-r from-primary to-surface-tint"
                }`}
                style={{ width: isHydrated ? `${completion}%` : "0%" }}
              />
            </div>
            {completion === 100 && isHydrated && (
              <p className="font-label-sm text-label-sm text-secondary mt-2 flex items-center gap-1 animate-fadeIn">
                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                Profile complete! Your recommendations will be fully personalized.
              </p>
            )}
          </div>
          
          {/* Save Status Banner */}
          {saveStatus === "saved" && (
            <div className="w-full mb-sm bg-secondary/8 border border-secondary/15 text-secondary rounded-xl px-4 py-3 flex items-center gap-2 font-label-md text-label-md animate-fadeIn shadow-elevation-1">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Profile saved successfully! Your scheme recommendations will now be personalized.
            </div>
          )}
          {saveStatus === "error" && (
            <div className="w-full mb-sm bg-error-container border border-error/15 text-on-error-container rounded-xl px-4 py-3 flex items-center gap-2 font-label-md text-label-md shadow-elevation-1">
              <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
              Failed to save profile. Please try again.
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PROFILE FORM CARD
              ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-xl p-lg w-full">
            <form className="space-y-gutter" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Section 1: Personal Info */}
              <div>
                <div className="flex items-center gap-2 mb-md">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-label-md text-label-md text-primary font-bold">1</span>
                  </div>
                  <h2 className="font-headline-md text-[18px] font-semibold text-on-surface">Personal Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {/* State */}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-xs">State of Residence</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                        value={profile.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                      >
                        <option value="">Select your state</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  {/* Age */}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-xs">Age</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                      max="100"
                      min="18"
                      placeholder="e.g. 35"
                      type="number"
                      value={profile.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                    />
                  </div>
                  {/* Gender */}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-xs">Gender</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                        value={profile.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  {/* Category */}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-xs">Category</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                        value={profile.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                      >
                        <option value="">Select category</option>
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC</option>
                        <option value="st">ST</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Economic Info */}
              <div>
                <div className="flex items-center gap-2 mb-md pt-sm border-t border-outline-variant/40">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-label-md text-label-md text-primary font-bold">2</span>
                  </div>
                  <h2 className="font-headline-md text-[18px] font-semibold text-on-surface">Economic Details</h2>
                </div>
                {/* Occupation */}
                <div className="mb-gutter">
                  <label className="block font-label-md text-on-surface-variant mb-xs">Occupation / Profession</label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                      value={profile.occupation}
                      onChange={(e) => handleChange("occupation", e.target.value)}
                    >
                      <option value="">Select occupation</option>
                      <option value="farmer">Farmer / Agriculture</option>
                      <option value="student">Student</option>
                      <option value="business">Business / Self-Employed</option>
                      <option value="salaried">Salaried Employee</option>
                      <option value="unemployed">Unemployed</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                  </div>
                </div>
                {/* Annual Income */}
                <div className="mb-gutter">
                  <label className="block font-label-md text-on-surface-variant mb-xs">Annual Household Income (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">₹</span>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 pl-10 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                      placeholder="e.g. 250000"
                      type="number"
                      value={profile.income}
                      onChange={(e) => handleChange("income", e.target.value)}
                    />
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    Used locally to determine eligibility. Never sent to a server.
                  </p>
                </div>
                {/* Education Level */}
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-xs">Highest Education Level</label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                      value={profile.education}
                      onChange={(e) => handleChange("education", e.target.value)}
                    >
                      <option value="">Select education</option>
                      <option value="none">No Formal Education</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary (10th)</option>
                      <option value="higher_secondary">Higher Secondary (12th)</option>
                      <option value="graduate">Graduate &amp; Above</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-md border-t border-outline-variant/40 flex flex-col sm:flex-row justify-between items-center gap-sm">
                <Link
                  href="/schemes"
                  className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  View My Recommendations
                </Link>
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl hover:shadow-elevation-3 transition-all duration-300 shadow-elevation-2 flex items-center hover:-translate-y-0.5"
                  type="submit"
                >
                  Save Profile
                  <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      
      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="bg-inverse-surface text-inverse-on-surface w-full mt-auto">
        <div className="w-full py-lg px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center space-y-md md:space-y-0">
          <div className="font-body-sm text-body-sm text-inverse-on-surface/50">
            © 2026 JanMitra AI. All rights reserved.
          </div>
          <div className="flex space-x-md">
            <Link href="/privacy" className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Privacy Policy</Link>
            <Link href="/accessibility" className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Accessibility</Link>
            <Link href="/contact" className="font-body-sm text-body-sm text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Contact Us</Link>
          </div>
        </div>
        <div className="tricolor-bar" aria-hidden="true" />
      </footer>
    </div>
  );
}
