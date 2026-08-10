"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { fetchSchemes, type Scheme } from "@/lib/api";

// Icon map for ministry context
const ministryIcons: Record<string, string> = {
  agriculture: "agriculture",
  health: "health_and_safety",
  rural: "home_work",
  education: "school",
  housing: "home_work",
  finance: "account_balance",
  women: "diversity_3",
  labour: "engineering",
  social: "groups",
  default: "account_balance",
};

function getMinistryIcon(ministry: string): string {
  const lower = ministry.toLowerCase();
  for (const [key, icon] of Object.entries(ministryIcons)) {
    if (lower.includes(key)) return icon;
  }
  return ministryIcons.default;
}

function getMatchColor(pct: number) {
  if (pct >= 85) return { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/20", icon: "check_circle", bar: "bg-secondary" };
  if (pct >= 70) return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", icon: "check_circle", bar: "bg-primary" };
  return { bg: "bg-saffron/10", text: "text-tertiary", border: "border-saffron/20", icon: "info", bar: "bg-saffron" };
}

function SchemeModal({ scheme, color, onClose }: { scheme: Scheme; color: ReturnType<typeof getMatchColor>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-gutter bg-on-background/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-elevation-3 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 bg-white border-b ${color.border} z-20`}>
          <div className={`${color.bg} w-full h-full absolute inset-0 opacity-50`} />
          <div className="relative px-lg py-md flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h2 className="font-headline-lg text-2xl font-bold text-on-surface">{scheme.title}</h2>
                <p className="font-label-md text-label-md text-on-surface-variant mt-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>{getMinistryIcon(scheme.ministry)}</span>
                  {scheme.ministry}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white border border-outline-variant hover:bg-surface-container transition-colors shrink-0 shadow-elevation-1">
                <span className="material-symbols-outlined text-on-surface text-[20px]">close</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className={`bg-white ${color.text} border ${color.border} px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-elevation-1`}>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{color.icon}</span>
                <span className="font-label-md font-bold">{scheme.match_percentage}% Match</span>
              </div>
              {!scheme.is_user_eligible && (
                <span className="font-label-sm text-error flex items-center gap-1.5 bg-error/10 px-3 py-1.5 rounded-lg border border-error/20 shadow-elevation-1 font-bold">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Ineligible
                </span>
              )}
              {scheme.source_type === "Live Web" && (
                <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-outline-variant shadow-elevation-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-india-green animate-pulse" />
                  Live Web Result
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-lg space-y-lg flex-grow">

          <div>
            <h3 className="font-headline-md text-xl text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">fact_check</span>
              Eligibility
            </h3>
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/50">
              <p className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {scheme.eligibility_summary}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-headline-md text-xl text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">featured_play_list</span>
              Key Benefits
            </h3>
            <ul className="space-y-3 bg-surface-container-lowest p-md rounded-xl border border-outline-variant/50">
              {scheme.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 font-body-md text-on-surface-variant">
                  <span className={`material-symbols-outlined text-[20px] ${color.text} mt-0.5 shrink-0`} style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background/90 backdrop-blur-md px-lg py-md border-t border-outline-variant flex gap-md">
          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label-md py-3 rounded-xl hover:shadow-elevation-2 transition-all text-center shadow-elevation-1"
            >
              Visit Source Website
            </a>
          )}
          <Link
            href={`/chat?query=Tell me about this scheme. Here is the summary: ${encodeURIComponent(scheme.eligibility_summary.slice(0, 300))}`}
            className="flex-1 bg-white border border-outline-variant text-primary font-label-md py-3 rounded-xl hover:bg-primary/5 transition-all text-center shadow-elevation-1"
          >
            Ask AI Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}

function SchemeCard({ scheme, color, onClick }: { scheme: Scheme; color: ReturnType<typeof getMatchColor>; onClick: () => void }) {
  const visibleBenefits = scheme.benefits.slice(0, 3);
  const hasMore = scheme.benefits.length > 3;

  return (
    <div 
      className="glass-card rounded-xl p-md flex flex-col h-full group relative overflow-hidden cursor-pointer hover:shadow-elevation-2 transition-all duration-300"
      onClick={onClick}
    >
      {/* Accent left bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${color.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex justify-between items-start mb-sm pl-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline-md text-[18px] font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {scheme.title}
          </h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>{getMinistryIcon(scheme.ministry)}</span>
            <span className="truncate">{scheme.ministry}</span>
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-3">
          <div className={`${color.bg} ${color.text} border ${color.border} px-2.5 py-1 rounded-full flex items-center gap-1 shadow-elevation-1`}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{color.icon}</span>
            <span className="font-label-sm text-label-sm font-bold">{scheme.match_percentage}%</span>
          </div>
          {!scheme.is_user_eligible && (
            <span className="font-label-sm text-[10px] text-error font-bold mt-1.5 flex items-center gap-0.5 bg-error/10 px-2 py-0.5 rounded-full border border-error/20">
              <span className="material-symbols-outlined text-[12px]">cancel</span>
              Ineligible
            </span>
          )}
          {scheme.source_type === "Live Web" && (
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-india-green animate-pulse" />
              <span className="text-[10px]">Live</span>
            </span>
          )}
        </div>
      </div>

      <div className="mb-sm pl-3">
        <h4 className="font-label-md text-label-md text-on-surface mb-1">Eligibility:</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 group-hover:text-on-surface transition-colors">
          {scheme.eligibility_summary}
        </p>
      </div>

      <div className="mb-md pl-3 flex-grow">
        <h4 className="font-label-md text-label-md text-on-surface mb-2">Key Benefits:</h4>
        <ul className="space-y-1.5">
          {visibleBenefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <span className={`material-symbols-outlined text-[16px] ${color.text} mt-0.5 shrink-0`} style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              <span className="line-clamp-2 group-hover:text-on-surface transition-colors">{benefit}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <span className="mt-2 font-label-sm text-label-sm text-primary inline-flex items-center gap-1 group-hover:underline">
            Click to read {scheme.benefits.length - 3} more benefits...
          </span>
        )}
        {!hasMore && (
          <span className="mt-2 font-label-sm text-label-sm text-primary inline-flex items-center gap-1 group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view full details
          </span>
        )}
      </div>

      <div className="flex gap-sm pl-3 pt-sm border-t border-outline-variant/40 mt-auto" onClick={(e) => e.stopPropagation()}>
        {scheme.source_url && (
          <a
            href={scheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label-md text-label-md py-2.5 rounded-xl hover:shadow-elevation-2 transition-all text-center shadow-elevation-1"
          >
            Visit Source
          </a>
        )}
        <Link
          href={`/chat?query=Tell me about this scheme. Here is the summary: ${encodeURIComponent(scheme.eligibility_summary.slice(0, 300))}`}
          className="flex-1 bg-white border border-outline-variant text-primary font-label-md text-label-md py-2.5 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all text-center shadow-elevation-1"
        >
          Ask AI
        </Link>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const loadSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (stateFilter) params.state = stateFilter;
      params.eligible_only = eligibleOnly;

      // Load profile from localStorage if available
      const savedProfile = localStorage.getItem("janmitra_profile");
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (!stateFilter && profile.state) params.state = profile.state;
          if (!categoryFilter && profile.occupation) params.category = profile.occupation;
          if (profile.age) params.age = profile.age;
          if (profile.gender) params.gender = profile.gender;
          if (profile.income) params.income = profile.income;
        } catch { /* ignore parse errors */ }
      }

      const data = await fetchSchemes(params as Parameters<typeof fetchSchemes>[0]);
      setSchemes(data);
    } catch (err) {
      console.error("Failed to fetch schemes:", err);
      setError(err instanceof Error ? err.message : "Failed to load schemes");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, stateFilter, eligibleOnly]);

  useEffect(() => {
    loadSchemes();
  }, [loadSchemes]);

  // Client-side text filter
  const filteredSchemes = schemes.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.ministry.toLowerCase().includes(q) ||
      s.eligibility_summary.toLowerCase().includes(q) ||
      s.benefits.some((b) => b.toLowerCase().includes(q))
    );
  });

  const clearFilters = () => {
    setCategoryFilter("");
    setStateFilter("");
    setEligibleOnly(true);
    setSearchQuery("");
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* ═══════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════ */}
      <header className="sticky top-0 w-full bg-white/90 backdrop-blur-md border-b border-outline-variant z-50 shadow-elevation-1">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-gradient-to-br from-primary to-surface-tint rounded-xl flex items-center justify-center shadow-elevation-1">
                <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[16px] font-bold text-primary leading-tight">JanMitra AI</span>
                <span className="text-[9px] text-on-surface-variant leading-tight font-medium tracking-wide hidden sm:block">SCHEME ASSISTANT</span>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-lg">
            <Link href="/schemes" className="text-primary font-bold border-b-2 border-primary h-16 flex items-center transition-transform">Explore Schemes</Link>
            <Link href="/chat" className="text-on-surface-variant hover:text-primary transition-colors h-16 flex items-center relative group">
              Chat
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center bg-surface-container-lowest rounded-xl px-4 py-2 border border-outline-variant shadow-elevation-1 focus-within:border-primary focus-within:shadow-glow-primary transition-all">
              <span className="material-symbols-outlined text-outline text-lg mr-2">search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-body-sm font-body-sm text-on-surface placeholder:text-outline-variant w-48"
                placeholder="Search schemes..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/profile" className="font-label-md text-label-md font-semibold text-primary bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/10 transition-all shadow-elevation-1">
              Profile
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter pb-lg pt-8 flex flex-col md:flex-row gap-gutter relative">
        {/* ═══════════════════════════════════════════
            FILTER SIDEBAR
            ═══════════════════════════════════════════ */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-[calc(4rem+28px)] glass-card rounded-xl p-md">
            <h2 className="font-headline-md text-[18px] font-semibold text-on-surface mb-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
              Filters
            </h2>
            <div className="space-y-sm">
              {/* Category Filter */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Category</label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="">All Categories</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Housing">Housing</option>
                    <option value="Finance">Finance</option>
                    <option value="Women">Women &amp; Child</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              {/* State Filter */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">State</label>
                <div className="relative">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="">All States</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              {/* Eligibility Filter */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Show Schemes</label>
                <div className="relative">
                  <select
                    value={eligibleOnly ? "eligible" : "all"}
                    onChange={(e) => setEligibleOnly(e.target.value === "eligible")}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="eligible">Only Eligible Schemes</option>
                    <option value="all">All Schemes</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="w-full mt-md font-label-md text-label-md text-primary bg-primary/5 hover:bg-primary/10 rounded-xl py-2.5 transition-all border border-primary/10"
            >
              Clear Filters
            </button>
          </div>
        </aside>
        
        {/* ═══════════════════════════════════════════
            MAIN CONTENT
            ═══════════════════════════════════════════ */}
        <div className="flex-grow flex flex-col">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-md font-label-sm text-label-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Schemes</span>
          </div>

          <div className="mb-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Recommended Schemes</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {loading
                ? "Searching our knowledge base for relevant schemes..."
                : error
                ? "There was a problem loading schemes."
                : filteredSchemes.length > 0
                ? `Found ${filteredSchemes.length} scheme${filteredSchemes.length !== 1 ? "s" : ""} based on your profile and filters.`
                : "No schemes found. Try adjusting your filters or complete your profile."}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-error-container border border-error/20 rounded-xl p-md mb-lg flex items-start gap-3 shadow-elevation-1">
              <span className="material-symbols-outlined text-error mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
              <div>
                <p className="font-label-md text-label-md text-on-error-container mb-1">Could not load schemes</p>
                <p className="font-body-sm text-body-sm text-on-error-container/80">{error}</p>
                <button
                  onClick={loadSchemes}
                  className="mt-2 font-label-md text-label-md text-error hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-md">
                  <div className="flex justify-between mb-sm">
                    <div>
                      <div className="h-6 skeleton-shimmer rounded-lg w-48 mb-2" />
                      <div className="h-4 skeleton-shimmer rounded-lg w-36" />
                    </div>
                    <div className="h-7 skeleton-shimmer rounded-full w-20" />
                  </div>
                  <div className="h-4 skeleton-shimmer rounded-lg w-full mb-2" />
                  <div className="h-4 skeleton-shimmer rounded-lg w-3/4 mb-4" />
                  <div className="h-4 skeleton-shimmer rounded-lg w-2/3 mb-2" />
                  <div className="h-4 skeleton-shimmer rounded-lg w-1/2 mb-4" />
                  <div className="flex gap-sm pt-sm border-t border-outline-variant/30">
                    <div className="flex-1 h-10 skeleton-shimmer rounded-xl" />
                    <div className="flex-1 h-10 skeleton-shimmer rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Schemes Grid */}
          {!loading && filteredSchemes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start stagger-children">
              {filteredSchemes.map((scheme) => (
                <SchemeCard 
                  key={scheme.id} 
                  scheme={scheme} 
                  color={getMatchColor(scheme.match_percentage)}
                  onClick={() => setSelectedScheme(scheme)} 
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSchemes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-xl text-center">
              <div className="h-20 w-20 bg-surface-container rounded-2xl flex items-center justify-center mb-md shadow-elevation-1">
                <span className="material-symbols-outlined text-5xl text-outline-variant">search_off</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">No Schemes Found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-lg">
                We couldn&apos;t find any matching schemes. Try adjusting your filters, or{" "}
                <Link href="/profile" className="text-primary hover:underline font-medium">complete your profile</Link>{" "}
                for personalized recommendations.
              </p>
              <div className="flex gap-sm">
                <button
                  onClick={clearFilters}
                  className="bg-white border border-outline-variant text-primary font-label-md text-label-md px-6 py-2.5 rounded-xl hover:bg-primary/5 transition-all shadow-elevation-1"
                >
                  Clear Filters
                </button>
                <Link
                  href="/chat"
                  className="bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-xl hover:shadow-elevation-2 transition-all shadow-elevation-1"
                >
                  Ask AI Instead
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Scheme Modal */}
      {selectedScheme && (
        <SchemeModal 
          scheme={selectedScheme} 
          color={getMatchColor(selectedScheme.match_percentage)} 
          onClose={() => setSelectedScheme(null)} 
        />
      )}
      
      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="bg-inverse-surface text-inverse-on-surface mt-auto w-full">
        <div className="w-full py-lg px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-inverse-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <span className="font-headline-md text-[16px] font-bold text-inverse-primary">JanMitra AI</span>
          </div>
          <div className="flex gap-md font-body-sm text-body-sm">
            <Link href="/privacy" className="text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Privacy Policy</Link>
            <Link href="/accessibility" className="text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Accessibility</Link>
            <Link href="/contact" className="text-inverse-on-surface/60 hover:text-inverse-primary transition-colors">Contact Us</Link>
          </div>
          <div className="font-body-sm text-body-sm text-inverse-on-surface/50">
            © 2026 JanMitra AI. All rights reserved.
          </div>
        </div>
        <div className="tricolor-bar" aria-hidden="true" />
      </footer>
    </div>
  );
}
