import { useState, useEffect } from 'react';
import type { Competition } from '@/lib/types';
import { PLATFORMS, RECURRENCE_COLORS, DIFFICULTY_COLORS, AI_POLICY_LABELS } from '@/lib/constants';

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState<'ok' | 'soon' | 'hot'>('ok');

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 7) setUrgency('ok');
      else if (d > 2) setUrgency('soon');
      else setUrgency('hot');
      setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [deadline]);

  const colors = { ok: '#f0c040', soon: '#ff8c42', hot: '#ff5c35' };
  return (
    <span className="font-mono text-xs font-semibold" style={{ color: colors[urgency] }}>
      {timeLeft}
    </span>
  );
}

export function CompetitionCard({ competition: c }: { competition: Competition }) {
  const platformInfo = PLATFORMS[c.platform] || PLATFORMS.other;
  const recColor = RECURRENCE_COLORS[c.recurrenceCategory] || '#6b7a99';
  const diffColor = DIFFICULTY_COLORS[c.difficulty] || '#6b7a99';
  const isGem = (c.rarityScore ?? 0) >= 7;

  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block glass-card rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-1 neon-glow-hover"
      style={{ borderTop: `2px solid ${recColor}` }}
    >
      <div className="p-5 flex flex-col gap-3">
        {/* Top: badges */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ background: platformInfo.color + '22', color: platformInfo.color, border: `1px solid ${platformInfo.color}33` }}
          >
            {platformInfo.name}
          </span>
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ background: recColor + '22', color: recColor, border: `1px solid ${recColor}33` }}
          >
            {c.recurrenceCategory.replace(/_/g, ' ')}
          </span>
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ background: diffColor + '18', color: diffColor, border: `1px solid ${diffColor}25` }}
          >
            {c.difficulty}
          </span>
          {c.aiPolicy !== 'allowed' && (
            <span className="text-[9px] px-2 py-0.5 rounded uppercase tracking-wider bg-[rgba(0,229,160,0.08)] text-[#00e5a0] border border-[rgba(0,229,160,0.15)]">
              {AI_POLICY_LABELS[c.aiPolicy]}
            </span>
          )}
          {isGem && (
            <span className="text-[9px] px-2 py-0.5 rounded uppercase tracking-wider bg-[rgba(255,92,53,0.12)] text-[#ff5c35] border border-[rgba(255,92,53,0.25)] font-bold">
              💎 Hidden Gem
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold leading-tight group-hover:text-[#00e5a0] transition-colors">
          {c.title}
        </h3>
        {c.organizer && (
          <p className="text-[11px] text-[#6b7a99] -mt-2">{c.organizer}</p>
        )}

        {/* Description */}
        <p className="text-[12px] text-[#8896b0] leading-relaxed line-clamp-3">
          {c.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#111827] rounded-md p-2">
            <span className="text-[9px] text-[#6b7a99] uppercase tracking-wider block">Prize</span>
            <span className="text-[12px] font-semibold text-[#00e5a0]">{c.prizeDisplay || 'N/A'}</span>
          </div>
          <div className="bg-[#111827] rounded-md p-2">
            <span className="text-[9px] text-[#6b7a99] uppercase tracking-wider block">
              {c.submissionDeadline ? 'Deadline' : 'Availability'}
            </span>
            {c.submissionDeadline ? (
              <CountdownTimer deadline={c.submissionDeadline} />
            ) : (
              <span className="text-[12px] font-semibold text-[#c78cff]">Always Open</span>
            )}
          </div>
          {c.participantsEstimate && (
            <div className="bg-[#111827] rounded-md p-2">
              <span className="text-[9px] text-[#6b7a99] uppercase tracking-wider block">Participants</span>
              <span className="text-[12px] font-medium">{c.participantsEstimate}</span>
            </div>
          )}
          <div className="bg-[#111827] rounded-md p-2">
            <span className="text-[9px] text-[#6b7a99] uppercase tracking-wider block">Mode</span>
            <span className="text-[12px] font-medium capitalize">{c.mode}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {c.tags.slice(0, 5).map(tag => (
            <span key={tag} className="text-[10px] text-[#6b7a99] bg-[#111827] border border-[#1e2d45] rounded px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#1e2d45] mt-auto">
          {c.rarityScore && (
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#6b7a99] uppercase">ROI Score</span>
              <span className="text-xs font-bold text-[#00e5a0]">{c.rarityScore.toFixed(1)}</span>
            </div>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-[#00e5a0] font-medium group-hover:underline ml-auto">
            Visit →
          </span>
        </div>
      </div>
    </a>
  );
}
