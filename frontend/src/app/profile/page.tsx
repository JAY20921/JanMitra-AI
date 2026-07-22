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

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Top Navigation */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center space-x-lg">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
              </div>
              <span className="font-headline-md text-headline-md font-bold text-primary">JanMitra AI</span>
            </Link>
            <nav className="hidden md:flex space-x-gutter">
              <Link href="/schemes" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md py-4">Explore Schemes</Link>
              <Link href="/chat" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md py-4">Chat</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-md">
            <Link href="/profile" className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary py-4">Profile</Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 max-w-container-max w-full mx-auto relative pt-lg pb-xl px-gutter md:px-lg">
        {/* Main Content Canvas */}
        <main className="w-full max-w-2xl mx-auto flex flex-col items-center">
          {/* Header Section */}
          <div className="text-center mb-xl w-full">
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs hidden md:block">Complete Your Profile</h1>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs md:hidden">Complete Your Profile</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Help us find the most relevant government schemes for you.</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="w-full mb-lg">
            <div className="flex justify-between items-center mb-xs">
              <span className="font-label-md text-label-md text-on-surface">Profile Completion</span>
              <span className="font-label-md text-label-md text-primary">{isHydrated ? `${completion}%` : "..."}</span>
            </div>
            <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
                style={{ width: isHydrated ? `${completion}%` : "0%" }}
              ></div>
            </div>
          </div>
          
          {/* Save Status Banner */}
          {saveStatus === "saved" && (
            <div className="w-full mb-sm bg-secondary/10 border border-secondary/20 text-secondary rounded-lg px-4 py-2 flex items-center gap-2 font-label-md text-label-md animate-fadeIn">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Profile saved successfully! Your scheme recommendations will now be personalized.
            </div>
          )}
          {saveStatus === "error" && (
            <div className="w-full mb-sm bg-error-container border border-error/20 text-on-error-container rounded-lg px-4 py-2 flex items-center gap-2 font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">error</span>
              Failed to save profile. Please try again.
            </div>
          )}

          {/* Profile Form Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg w-full shadow-sm">
            <form className="space-y-gutter" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Grid for 2 column layout on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* State */}
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-xs">State of Residence</label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200 appearance-none cursor-pointer"
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
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200"
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
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200 appearance-none cursor-pointer"
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
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200 appearance-none cursor-pointer"
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
              
              {/* Full width fields */}
              {/* Occupation */}
              <div>
                <label className="block font-label-md text-on-surface-variant mb-xs">Occupation / Profession</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200 appearance-none cursor-pointer"
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
              <div>
                <label className="block font-label-md text-on-surface-variant mb-xs">Annual Household Income (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">₹</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 pl-10 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200"
                    placeholder="e.g. 250000"
                    type="number"
                    value={profile.income}
                    onChange={(e) => handleChange("income", e.target.value)}
                  />
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Used to determine eligibility for financial assistance schemes.</p>
              </div>
              {/* Education Level */}
              <div>
                <label className="block font-label-md text-on-surface-variant mb-xs">Highest Education Level</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all duration-200 appearance-none cursor-pointer"
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
              {/* Submit Action */}
              <div className="pt-sm border-t border-outline-variant mt-lg flex flex-col sm:flex-row justify-between items-center gap-sm">
                <Link
                  href="/schemes"
                  className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  View My Recommendations
                </Link>
                <button
                  onClick={handleSave}
                  className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-lg hover:bg-surface-tint transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm flex items-center"
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
      
      {/* Footer */}
      <footer className="bg-surface-container-highest w-full border-t border-outline-variant mt-auto">
        <div className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center space-y-md md:space-y-0">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 JanMitra AI. Government of India.
          </div>
          <div className="flex space-x-md">
            <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100">Privacy Policy</Link>
            <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100">Accessibility</Link>
            <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
