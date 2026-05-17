import { useState } from 'react';
import type { FilterState, SkillDomain, Difficulty, EffortLevel, AiPolicy, RecurrenceCategory } from '@/lib/types';
import { SKILL_DOMAIN_LABELS, DIFFICULTY_LABELS, EFFORT_LEVEL_LABELS, AI_POLICY_LABELS, RECURRENCE_LABELS, DEFAULT_FILTER_STATE } from '@/lib/constants';

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded transition-all duration-150 ${
        active
          ? 'bg-[#00e5a0] text-[#07090f] font-semibold'
          : 'bg-[#0d1120] border border-[#1e2d45] text-[#6b7a99] hover:border-[#00e5a0] hover:text-[#e8edf5]'
      }`}
    >
      {label}
    </button>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string | null; options: [string, string][]; onChange: (v: string | null) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-[#6b7a99] uppercase tracking-widest">{label}</label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        className="bg-[#0d1120] border border-[#1e2d45] text-[#e8edf5] text-[11px] font-mono px-2 py-1.5 rounded outline-none focus:border-[#00e5a0] transition-colors"
      >
        <option value="">All</option>
        {options.map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({ filters, onChange, totalResults }: Props) {
  const [expanded, setExpanded] = useState(false);

  const recurrenceOptions: [string, string][] = Object.entries(RECURRENCE_LABELS);
  const difficultyOptions: [string, string][] = Object.entries(DIFFICULTY_LABELS);
  const effortOptions: [string, string][] = Object.entries(EFFORT_LEVEL_LABELS);
  const aiOptions: [string, string][] = Object.entries(AI_POLICY_LABELS);
  const domainOptions: [string, string][] = Object.entries(SKILL_DOMAIN_LABELS);

  const activeFilterCount = [
    filters.recurrenceCategory,
    filters.difficulty,
    filters.effortLevel,
    filters.aiPolicy,
    filters.mode,
    filters.competitionDensity,
    ...filters.skillDomains,
  ].filter(Boolean).length;

  const reset = () => onChange(DEFAULT_FILTER_STATE);

  return (
    <div className="glass-card rounded-lg p-4 mb-6 animate-in">
      {/* Search + Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a99] w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder="Search competitions, platforms, prizes..."
            className="w-full bg-[#07090f] border border-[#1e2d45] rounded-md pl-10 pr-4 py-2.5 text-[13px] font-mono text-[#e8edf5] outline-none focus:border-[#00e5a0] transition-colors placeholder:text-[#6b7a99]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-md text-[11px] font-mono uppercase tracking-wider text-[#6b7a99] hover:border-[#00e5a0] hover:text-[#e8edf5] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            </svg>
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={reset} className="text-[10px] text-[#ff5c35] font-mono uppercase hover:underline">
              Clear
            </button>
          )}
          <span className="text-[11px] font-mono text-[#6b7a99]">
            {totalResults} results
          </span>
        </div>
      </div>

      {/* Recurrence chips — always visible */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Chip label="All" active={!filters.recurrenceCategory} onClick={() => onChange({ ...filters, recurrenceCategory: null })} />
        {recurrenceOptions.map(([k, v]) => (
          <Chip
            key={k}
            label={v}
            active={filters.recurrenceCategory === k}
            onClick={() => onChange({ ...filters, recurrenceCategory: filters.recurrenceCategory === k ? null : k as RecurrenceCategory })}
          />
        ))}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-[#1e2d45] animate-fade-in">
          <Select label="Skill Domain" value={filters.skillDomains[0] || null} options={domainOptions} onChange={v => onChange({ ...filters, skillDomains: v ? [v as SkillDomain] : [] })} />
          <Select label="Difficulty" value={filters.difficulty} options={difficultyOptions} onChange={v => onChange({ ...filters, difficulty: v as Difficulty | null })} />
          <Select label="Effort" value={filters.effortLevel} options={effortOptions} onChange={v => onChange({ ...filters, effortLevel: v as EffortLevel | null })} />
          <Select label="AI Policy" value={filters.aiPolicy} options={aiOptions} onChange={v => onChange({ ...filters, aiPolicy: v as AiPolicy | null })} />
          <Select
            label="Mode"
            value={filters.mode}
            options={[['remote', '🌐 Remote'], ['physical', '📍 Physical'], ['hybrid', '🔄 Hybrid']]}
            onChange={v => onChange({ ...filters, mode: v as any })}
          />
          <Select
            label="Sort By"
            value={filters.sortBy}
            options={[['deadline', 'Deadline'], ['prize', 'Prize Pool'], ['rarity', 'ROI Score'], ['title', 'Name']]}
            onChange={v => onChange({ ...filters, sortBy: (v || 'deadline') as any })}
          />
        </div>
      )}
    </div>
  );
}
