import type { Competition } from '@/lib/types';
import { CompetitionCard } from './CompetitionCard';

interface HiddenGemsProps {
  competitions: Competition[];
  isBookmarked?: (id: string) => boolean;
  onToggleBookmark?: (id: string) => void;
}

export function HiddenGems({ competitions, isBookmarked, onToggleBookmark }: HiddenGemsProps) {
  if (competitions.length === 0) return null;

  return (
    <section className="mb-10 animate-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <span className="text-[#ff5c35]">💎</span> Hidden Gems — High ROI, Low Competition
        </h2>
        <span className="text-[10px] font-mono text-[#6b7a99] uppercase tracking-wider bg-[rgba(255,92,53,0.08)] px-3 py-1 rounded">
          Rarity Score ≥ 7
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {competitions.map(c => (
          <CompetitionCard
            key={c.id}
            competition={c}
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>
    </section>
  );
}
