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
  return { bg: "bg-tertiary-fixed-dim/20", text: "text-tertiary-container", border: "border-tertiary-fixed-dim/30", icon: "info", bar: "bg-tertiary-fixed-dim" };
}

function SchemeCard({ scheme, color }: { scheme: Scheme; color: any }) {
  const [expanded, setExpanded] = useState(false);
  const visibleBenefits = expanded ? scheme.benefits : scheme.benefits.slice(0, 3);
  const hasMore = scheme.benefits.length > 3;

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-md shadow-[0px_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${color.bar}`}></div>
      <div className="flex justify-between items-start mb-sm pl-2">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
            {scheme.title}
          </h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">{getMinistryIcon(scheme.ministry)}</span>
            {scheme.ministry}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className={`${color.bg} ${color.text} border ${color.border} px-2 py-1 rounded-full flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{color.icon}</span>
            <span className="font-label-sm text-label-sm font-bold">{scheme.match_percentage}% Match</span>
          </div>
          {scheme.source_type === "Live Web" && (
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">public</span>
              Live
            </span>
          )}
        </div>
      </div>
      <div className="mb-sm pl-2">
        <h4 className="font-label-md text-label-md text-on-surface mb-1">Eligibility Summary:</h4>
        <p className={`font-body-sm text-body-sm text-on-surface-variant ${expanded ? "" : "line-clamp-2"}`}>
          {scheme.eligibility_summary}
        </p>
      </div>
      <div className="mb-md pl-2 flex-grow">
        <h4 className="font-label-md text-label-md text-on-surface mb-2">Key Benefits:</h4>
        <ul className="space-y-1">
          {visibleBenefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <span className={`material-symbols-outlined text-[16px] ${color.text} mt-0.5 shrink-0`}>check</span>
              <span className={expanded ? "" : "line-clamp-2"}>{benefit}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "Show less" : `Read ${scheme.benefits.length - 3} more...`}
          </button>
        )}
      </div>
      <div className="flex gap-sm pl-2 pt-sm border-t border-outline-variant/50 mt-auto">
        {scheme.source_url && (
          <a
            href={scheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-2.5 rounded-lg hover:bg-surface-tint transition-colors text-center"
          >
            Visit Source
          </a>
        )}
        <Link
          href={`/chat?query=Tell me about this scheme. Here is the summary: ${encodeURIComponent(scheme.eligibility_summary.slice(0, 300))}`}
          className="flex-1 bg-surface border border-outline-variant text-primary font-label-md text-label-md py-2.5 rounded-lg hover:bg-surface-container transition-colors text-center"
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
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const loadSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (stateFilter) params.state = stateFilter;

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
  }, [categoryFilter, stateFilter]);

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
    setSearchQuery("");
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full bg-surface/95 dark:bg-surface-dim/95 backdrop-blur-md border-b border-outline-variant dark:border-outline z-[100] shadow-sm">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              </div>
              <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">JanMitra AI</span>
            </Link>
          </div>
          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-lg">
            <Link href="/schemes" className="text-primary dark:text-primary-fixed-dim font-bold border-b-2 border-primary h-16 flex items-center transition-transform">Explore Schemes</Link>
            <Link href="/chat" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors h-16 flex items-center">Chat</Link>
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant">
              <span className="material-symbols-outlined text-outline text-lg mr-2" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-body-sm font-body-sm text-on-surface placeholder:text-outline-variant w-48"
                placeholder="Search schemes..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/profile" className="font-label-md text-label-md font-semibold text-primary bg-surface border border-primary px-4 py-2 rounded-lg hover:bg-surface-container transition-colors">
              Profile
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter pb-lg pt-24 flex flex-col md:flex-row gap-gutter relative">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-[calc(4rem+24px)] bg-surface rounded-xl border border-outline-variant p-sm shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Filters</h2>
            <div className="space-y-sm">
              {/* Category Filter */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Housing">Housing</option>
                  <option value="Finance">Finance</option>
                  <option value="Women">Women &amp; Child</option>
                </select>
              </div>
              {/* State Filter */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="w-full mt-sm font-label-md text-label-md text-primary bg-primary-container/10 hover:bg-primary-container/20 rounded-lg py-2 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-grow flex flex-col">
          {/* Header section */}
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
            <div className="bg-error-container border border-error/20 rounded-xl p-md mb-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5">error</span>
              <div>
                <p className="font-label-md text-label-md text-on-error-container mb-1">Could not load schemes</p>
                <p className="font-body-sm text-body-sm text-on-error-container/80">{error}</p>
                <button
                  onClick={loadSchemes}
                  className="mt-2 font-label-md text-label-md text-error hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface border border-outline-variant rounded-xl p-md animate-pulse">
                  <div className="flex justify-between mb-sm">
                    <div>
                      <div className="h-6 bg-surface-container rounded w-48 mb-2"></div>
                      <div className="h-4 bg-surface-container rounded w-36"></div>
                    </div>
                    <div className="h-7 bg-surface-container rounded-full w-24"></div>
                  </div>
                  <div className="h-4 bg-surface-container rounded w-full mb-2"></div>
                  <div className="h-4 bg-surface-container rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-surface-container rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-surface-container rounded w-1/2 mb-4"></div>
                  <div className="flex gap-sm pt-sm border-t border-outline-variant/50">
                    <div className="flex-1 h-10 bg-surface-container rounded-lg"></div>
                    <div className="flex-1 h-10 bg-surface-container rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Schemes Grid */}
          {!loading && filteredSchemes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
              {filteredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} color={getMatchColor(scheme.match_percentage)} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSchemes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-xl text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-md">search_off</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">No Schemes Found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-lg">
                We couldn&apos;t find any matching schemes. Try adjusting your filters, or{" "}
                <Link href="/profile" className="text-primary hover:underline">complete your profile</Link>{" "}
                for personalized recommendations.
              </p>
              <div className="flex gap-sm">
                <button
                  onClick={clearFilters}
                  className="bg-surface border border-outline-variant text-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:bg-surface-container transition-colors"
                >
                  Clear Filters
                </button>
                <Link
                  href="/chat"
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:bg-surface-tint transition-colors"
                >
                  Ask AI Instead
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline mt-auto w-full">
        <div className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-sm">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">JanMitra AI</span>
          </div>
          <div className="flex gap-md font-body-sm text-body-sm">
            <Link href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity">Accessibility</Link>
            <Link href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity">Contact Us</Link>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface dark:text-inverse-on-surface opacity-80">
            © 2024 JanMitra AI. Government of India.
          </div>
        </div>
      </footer>
    </div>
  );
}
