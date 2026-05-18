import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import type { Competition } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';

function LiveCountdown({ deadline, label }: { deadline: string; label: string }) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [deadline]);

  return (
    <div className="flex gap-2 sm:gap-3">
      {[
        { v: parts.d, l: 'Days' },
        { v: parts.h, l: 'Hrs' },
        { v: parts.m, l: 'Min' },
        { v: parts.s, l: 'Sec' },
      ].map(({ v, l }) => (
        <div key={l} className="text-center">
          <span className="font-display text-xl sm:text-2xl font-bold text-[#00e5a0] block leading-none">{String(v).padStart(2, '0')}</span>
          <span className="text-[8px] text-[#6b7a99] uppercase tracking-widest">{l}</span>
        </div>
      ))}
    </div>
  );
}

export function CountdownCards({ competitions }: { competitions: Competition[] }) {
  if (competitions.length === 0) return null;
  return (
    <section className="mb-10 animate-in">
      <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
        <span className="text-[#f0c040]">🔥</span> Upcoming Deadlines
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
        {competitions.map(c => {
          const p = PLATFORMS[c.platform] || PLATFORMS.other;
          return (
            <Link key={c.id} to="/competition/$slug" params={{ slug: c.slug }}
              className="glass-card rounded-lg p-4 hover:-translate-y-0.5 transition-all duration-200 neon-glow-hover group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
                    style={{ background: p.color + '22', color: p.color }}>
                    {p.name}
                  </span>
                </div>
                <span className="text-[10px] text-[#00e5a0] font-semibold">{c.prizeDisplay}</span>
              </div>
              <h3 className="font-display text-sm font-bold mb-3 group-hover:text-[#00e5a0] transition-colors line-clamp-1">{c.title}</h3>
              <LiveCountdown deadline={c.submissionDeadline!} label={c.title} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
