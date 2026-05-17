import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { FilterState } from '@/lib/types';
import { DEFAULT_FILTER_STATE } from '@/lib/constants';
import { ALL_COMPETITIONS, getHiddenGems, getUpcomingDeadlines, getStats, filterCompetitions } from '@/data';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { CountdownCards } from '@/components/CountdownCards';
import { HiddenGems } from '@/components/HiddenGems';
import { CompetitionCard } from '@/components/CompetitionCard';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [showAll, setShowAll] = useState(false);

  const stats = getStats();
  const hiddenGems = getHiddenGems(6);
  const deadlines = getUpcomingDeadlines(6);
  const filtered = filterCompetitions(ALL_COMPETITIONS, filters);
  const displayCount = showAll ? filtered.length : Math.min(filtered.length, 18);

  const hasActiveFilters = filters.search || filters.recurrenceCategory || filters.difficulty || filters.effortLevel || filters.aiPolicy || filters.mode || filters.skillDomains.length > 0;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-[#07090f]/80 border-b border-[#1e2d45]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-[#e8edf5]">HACK</span>
            <span className="text-[#00e5a0]">TRACK</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#6b7a99] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#00e5a0] rounded-full badge-pulse" />
              {stats.totalCompetitions} tracked
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <HeroSection stats={stats} />

        {/* Countdown section - only when no filters active */}
        {!hasActiveFilters && deadlines.length > 0 && (
          <CountdownCards competitions={deadlines} />
        )}

        {/* Hidden gems - only when no filters active */}
        {!hasActiveFilters && (
          <HiddenGems competitions={hiddenGems} />
        )}

        {/* Filter + Grid */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
            <span className="text-[#4d9fff]">🎯</span> All Competitions
          </h2>

          <FilterBar filters={filters} onChange={setFilters} totalResults={filtered.length} />

          {filtered.length === 0 ? (
            <div className="glass-card rounded-lg p-12 text-center">
              <p className="text-[#6b7a99] text-sm">No competitions match your filters.</p>
              <button onClick={() => setFilters(DEFAULT_FILTER_STATE)} className="mt-3 text-[#00e5a0] text-xs font-mono uppercase hover:underline">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {filtered.slice(0, displayCount).map(c => (
                  <CompetitionCard key={c.id} competition={c} />
                ))}
              </div>
              {filtered.length > displayCount && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-6 py-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-md text-[12px] font-mono uppercase tracking-wider text-[#00e5a0] hover:border-[#00e5a0] transition-colors"
                  >
                    Show All {filtered.length} Competitions
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2d45] mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-[11px] font-mono text-[#6b7a99]">
            <span className="text-[#00e5a0] font-semibold">HACKTRACK</span> — Global Competition Intelligence Platform
          </p>
          <p className="text-[10px] font-mono text-[#3d4655] mt-2">
            ⚡ Conceived & engineered by S.J. · Tracking {stats.platformsTracked} platforms · {stats.totalCompetitions} competitions
          </p>
          <p className="text-[9px] font-mono text-[#3d4655] mt-1">
            Sources: Devpost · Kaggle · Unstop · Zindi · AIcrowd · DrivenData · HeroX · Topcoder · and {stats.platformsTracked - 8}+ more
          </p>
        </div>
      </footer>
    </div>
  );
}
