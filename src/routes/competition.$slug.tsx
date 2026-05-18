import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { ALL_COMPETITIONS } from '@/data';
import { fetchCompetition, fetchCompetitions } from '@/lib/api';
import type { Competition } from '@/lib/types';
import {
  AI_POLICY_LABELS,
  CAREER_OUTCOME_LABELS,
  DIFFICULTY_LABELS,
  EFFORT_LEVEL_LABELS,
  PLATFORMS,
  SKILL_DOMAIN_LABELS,
} from '@/lib/constants';
import { CountdownTimer } from '@/components/CompetitionCard';
import { useBookmarks } from '@/hooks/useBookmarks';

export const Route = createFileRoute('/competition/$slug')({
  component: CompetitionDetailPage,
});

function CompetitionDetailPage() {
  const { slug } = Route.useParams();
  const staticMatch = useMemo(() => ALL_COMPETITIONS.find(item => item.slug === slug) ?? null, [slug]);

  const [competition, setCompetition] = useState<Competition | null>(staticMatch);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'static'>(staticMatch ? 'static' : 'api');
  const [error, setError] = useState<string | null>(null);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      try {
        const list = await fetchCompetitions();
        const bySlug = list.hackathons.find(item => item.slug === slug);

        if (!bySlug) {
          throw new Error('Competition not found in live API');
        }

        const full = await fetchCompetition(bySlug.id);
        if (!active) return;

        setCompetition(full);
        setSource('api');
        setError(null);
      } catch {
        if (!active) return;

        if (staticMatch) {
          setCompetition(staticMatch);
          setSource('static');
          setError('Live API unavailable for this page. Showing local backup data.');
        } else {
          setCompetition(null);
          setError('Competition not found. It may have been removed.');
        }
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [slug, staticMatch]);

  if (!competition && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-[#6b7a99] font-mono">Loading competition details...</p>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-4xl mx-auto glass-card rounded-lg p-6">
          <Link to="/" className="text-[11px] font-mono text-[#6b7a99] hover:text-[#00e5a0]">
            ← Back
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#e8edf5]">Competition not found</h1>
          {error && <p className="mt-2 text-sm text-[#8896b0]">{error}</p>}
        </div>
      </div>
    );
  }

  const platformInfo = PLATFORMS[competition.platform] || PLATFORMS.other;
  const bookmarked = isBookmarked(competition.id);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-[11px] font-mono text-[#6b7a99] hover:text-[#00e5a0]">
          ← Back
        </Link>

        <article className="glass-card rounded-lg p-6 sm:p-7 mt-4 space-y-6 border border-[#1e2d45]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{ background: platformInfo.color + '22', color: platformInfo.color, border: `1px solid ${platformInfo.color}33` }}
                >
                  {platformInfo.name}
                </span>
                <span className={source === 'api' ? 'text-[10px] font-mono text-[#00e5a0]' : 'text-[10px] font-mono text-[#f0c040]'}>
                  ● {source === 'api' ? 'Live' : 'Offline'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#e8edf5]">{competition.title}</h1>
              {competition.organizer && <p className="text-sm text-[#6b7a99] mt-1">{competition.organizer}</p>}
            </div>

            <button
              type="button"
              onClick={() => toggleBookmark(competition.id)}
              className="inline-flex items-center gap-2 rounded-md border border-[#1e2d45] bg-[#0d1120] px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#e8edf5] hover:border-[#f0c040]"
            >
              <Star className={`h-3.5 w-3.5 ${bookmarked ? 'fill-[#f0c040] text-[#f0c040]' : 'text-[#6b7a99]'}`} />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-[#f0c04033] bg-[#f0c04012] px-3 py-2 text-[11px] font-mono text-[#f0c040]">
              {error}
            </div>
          )}

          <p className="text-sm text-[#8896b0] leading-relaxed">{competition.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#111827] rounded-md p-3">
              <span className="text-[10px] text-[#6b7a99] uppercase tracking-wider block">Prize</span>
              <span className="text-lg font-semibold text-[#00e5a0]">{competition.prizeDisplay || 'N/A'}</span>
            </div>
            <div className="bg-[#111827] rounded-md p-3">
              <span className="text-[10px] text-[#6b7a99] uppercase tracking-wider block">Deadline</span>
              {competition.submissionDeadline ? (
                <CountdownTimer deadline={competition.submissionDeadline} />
              ) : (
                <span className="text-sm font-semibold text-[#c78cff]">Always Open</span>
              )}
            </div>
            <div className="bg-[#111827] rounded-md p-3">
              <span className="text-[10px] text-[#6b7a99] uppercase tracking-wider block">Rarity</span>
              <span className="text-sm font-semibold text-[#ff5c35]">💎 {competition.rarityScore ?? 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {competition.skillDomains.map(domain => (
              <span
                key={domain}
                className="text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider bg-[rgba(77,159,255,0.12)] text-[#4d9fff] border border-[rgba(77,159,255,0.25)]"
              >
                {SKILL_DOMAIN_LABELS[domain] ?? domain}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <DetailRow label="Difficulty" value={DIFFICULTY_LABELS[competition.difficulty] ?? competition.difficulty} />
            <DetailRow label="Effort" value={EFFORT_LEVEL_LABELS[competition.effortLevel] ?? competition.effortLevel} />
            <DetailRow label="AI Policy" value={AI_POLICY_LABELS[competition.aiPolicy] ?? competition.aiPolicy} />
            <DetailRow
              label="Team Size"
              value={competition.teamSizeMax ? `${competition.teamSizeMin}-${competition.teamSizeMax}` : String(competition.teamSizeMin)}
            />
          </div>

          <div>
            <h2 className="font-display text-lg font-bold mb-2">Career Outcomes</h2>
            <ul className="space-y-1 text-sm text-[#8896b0]">
              {competition.careerOutcomes.map(outcome => (
                <li key={outcome}>• {CAREER_OUTCOME_LABELS[outcome] ?? outcome}</li>
              ))}
            </ul>
          </div>

          <a
            href={competition.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#00e5a0] px-4 py-2 text-[12px] font-mono uppercase tracking-wider text-[#07090f] hover:opacity-90"
          >
            Open Competition →
          </a>
        </article>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111827] rounded-md p-3 border border-[#1e2d45]">
      <span className="text-[10px] text-[#6b7a99] uppercase tracking-wider block">{label}</span>
      <span className="text-sm font-medium text-[#e8edf5]">{value}</span>
    </div>
  );
}
