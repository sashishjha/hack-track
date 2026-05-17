import type { PlatformStats } from '@/lib/types';

export function HeroSection({ stats }: { stats: PlatformStats }) {
  return (
    <header className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center animate-in">
      {/* Title */}
      <h2 className="font-display text-[clamp(2rem,8vw,5rem)] font-extrabold leading-[0.95] mb-4 tracking-tight">
        <span className="text-[#e8edf5]">HACK</span>
        <span className="text-gradient">TRACK</span>
      </h2>
      <p className="text-sm sm:text-base text-[#6b7a99] max-w-2xl mx-auto mb-8 leading-relaxed">
        Live global competition intelligence for builders, hackers, researchers & engineers.
        <br className="hidden sm:block" />
        Aggregating {stats.totalCompetitions}+ competitions across {stats.platformsTracked} platforms.
      </p>

      {/* Stats bar */}
      <div className="flex justify-center gap-0 max-w-2xl mx-auto glass-card rounded-lg overflow-hidden mb-8">
        <StatItem label="Tracked" value={`${stats.totalCompetitions}+`} />
        <StatItem label="Active Now" value={String(stats.activeNow)} highlight />
        <StatItem label="Total Bounty" value={formatBounty(stats.totalBountyUsd)} />
        <StatItem label="Hidden Gems" value={String(stats.hiddenGems)} accent />
      </div>

      {/* Creator tag */}
      <p className="text-[10px] font-mono text-[#6b7a99] uppercase tracking-[3px]">
        ⚡ conceived & engineered by <span className="text-[#00e5a0]">S.J.</span>
      </p>
    </header>
  );
}

function StatItem({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className="flex-1 py-4 px-3 border-r border-[#1e2d45] last:border-r-0 text-center">
      <span className={`font-display text-xl sm:text-2xl font-extrabold block ${highlight ? 'text-[#00e5a0]' : accent ? 'text-[#ff5c35]' : 'text-[#e8edf5]'}`}>
        {value}
      </span>
      <span className="text-[9px] text-[#6b7a99] uppercase tracking-widest">{label}</span>
    </div>
  );
}

function formatBounty(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M+`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K+`;
  return `$${usd}`;
}
