// ─── Master Competition Data — Merges all parts ───
import { COMPETITIONS } from './competitions';
import { COMPETITIONS_PART2 } from './competitions-part2';
import { COMPETITIONS_PART3 } from './competitions-part3';
import { COMPETITIONS_PART4 } from './competitions-part4';
import type { Competition, PlatformStats, FilterState, FilterRule, FilterGroup } from '../lib/types';
import { isFilterGroup } from '../lib/types';

// Merge all competition data into a single array
export const ALL_COMPETITIONS: Competition[] = [
  ...COMPETITIONS,
  ...COMPETITIONS_PART2,
  ...COMPETITIONS_PART3,
  ...COMPETITIONS_PART4,
];

// ─── Computed helpers ───

export function getHiddenGems(limit = 6, competitions: Competition[] = ALL_COMPETITIONS): Competition[] {
  return [...competitions]
    .filter(c => (c.rarityScore ?? 0) >= 7 && c.validity === 'active')
    .sort((a, b) => (b.rarityScore ?? 0) - (a.rarityScore ?? 0))
    .slice(0, limit);
}

export function getUpcomingDeadlines(limit = 5, competitions: Competition[] = ALL_COMPETITIONS): Competition[] {
  const now = new Date().toISOString();
  return competitions
    .filter(c => c.submissionDeadline && c.submissionDeadline > now)
    .sort((a, b) => (a.submissionDeadline ?? '').localeCompare(b.submissionDeadline ?? ''))
    .slice(0, limit);
}

export function getFreshlyOpened(limit = 6, competitions: Competition[] = ALL_COMPETITIONS): Competition[] {
  return competitions
    .filter(c => c.status === 'open' && c.recurrenceCategory === '2026_specific')
    .slice(0, limit);
}

export function getStats(competitions: Competition[] = ALL_COMPETITIONS): PlatformStats {
  const active = competitions.filter(c => c.status === 'open' || c.status === 'upcoming');
  const platforms = new Set(competitions.map(c => c.platform));
  const totalBounty = competitions.reduce((sum, c) => sum + (c.prizePoolUsd || 0), 0);
  const gems = competitions.filter(c => (c.rarityScore ?? 0) >= 7);
  return {
    totalCompetitions: competitions.length,
    activeNow: active.length,
    totalBountyUsd: totalBounty,
    platformsTracked: platforms.size,
    hiddenGems: gems.length,
  };
}

// ─── Advanced Query Builder Evaluator ───

function getFieldValue(c: Competition, field: string): any {
  // Support nested paths like 'skillDomains', 'careerOutcomes', etc.
  const map: Record<string, () => any> = {
    title: () => c.title,
    organizer: () => c.organizer ?? '',
    description: () => c.description,
    platform: () => c.platform,
    status: () => c.status,
    difficulty: () => c.difficulty,
    mode: () => c.mode,
    effortLevel: () => c.effortLevel,
    aiPolicy: () => c.aiPolicy,
    recurrenceCategory: () => c.recurrenceCategory,
    competitionDensity: () => c.competitionDensity,
    prizePoolUsd: () => c.prizePoolUsd ?? 0,
    rarityScore: () => c.rarityScore ?? 0,
    trustScore: () => c.trustScore ?? 0,
    studentOnly: () => c.studentOnly,
    apiCreditsIncluded: () => c.apiCreditsIncluded,
    gpuCreditsIncluded: () => c.gpuCreditsIncluded,
    teamSizeMin: () => c.teamSizeMin,
    tags: () => (c.tags || []).join(' '),
    skillDomains: () => (c.skillDomains || []).join(' '),
    careerOutcomes: () => (c.careerOutcomes || []).join(' '),
  };
  return map[field] ? map[field]() : undefined;
}

function evaluateRule(c: Competition, rule: FilterRule): boolean {
  const val = getFieldValue(c, rule.field);
  const target = rule.value;
  switch (rule.operator) {
    case '==': return String(val).toLowerCase() === String(target).toLowerCase();
    case '!=': return String(val).toLowerCase() !== String(target).toLowerCase();
    case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase());
    case 'not_contains': return !String(val).toLowerCase().includes(String(target).toLowerCase());
    case '>': return Number(val) > Number(target);
    case '<': return Number(val) < Number(target);
    case 'is_true': return val === true;
    case 'is_false': return val === false;
    default: return true;
  }
}

export function evaluateFilterGroup(c: Competition, group: FilterGroup): boolean {
  if (!group.rules || group.rules.length === 0) return true;
  if (group.combinator === 'AND') {
    return group.rules.every(r => isFilterGroup(r) ? evaluateFilterGroup(c, r) : evaluateRule(c, r));
  } else {
    return group.rules.some(r => isFilterGroup(r) ? evaluateFilterGroup(c, r) : evaluateRule(c, r));
  }
}

export function filterCompetitions(competitions: Competition[], filters: FilterState): Competition[] {
  let result = [...competitions];

  // ── Advanced mode: AST evaluator replaces all individual filters ──
  if (filters.advancedMode && filters.advancedQuery) {
    result = result.filter(c => evaluateFilterGroup(c, filters.advancedQuery!));
  } else {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (c.platform || '').toLowerCase().includes(q) ||
        (c.organizer || '').toLowerCase().includes(q)
      );
    }

    if (filters.platforms.length > 0) result = result.filter(c => filters.platforms.includes(c.platform));
    if (filters.skillDomains.length > 0) result = result.filter(c => filters.skillDomains.some(d => (c.skillDomains || []).includes(d)));
    if (filters.difficulty) result = result.filter(c => c.difficulty === filters.difficulty);
    if (filters.effortLevel) result = result.filter(c => c.effortLevel === filters.effortLevel);
    if (filters.aiPolicy) result = result.filter(c => c.aiPolicy === filters.aiPolicy);
    if (filters.mode) result = result.filter(c => c.mode === filters.mode);
    if (filters.competitionDensity) result = result.filter(c => c.competitionDensity === filters.competitionDensity);
    if (filters.recurrenceCategory) result = result.filter(c => c.recurrenceCategory === filters.recurrenceCategory);
    if (filters.careerOutcome) result = result.filter(c => (c.careerOutcomes || []).includes(filters.careerOutcome!));
    if (filters.creditsProvided) result = result.filter(c => c.apiCreditsIncluded || c.gpuCreditsIncluded);

    if (filters.status !== 'all') {
      const now = new Date().getTime();
      result = result.filter(c => {
        const isEnded = c.submissionDeadline ? new Date(c.submissionDeadline).getTime() < now : false;
        if (filters.status === 'ongoing') return !isEnded;
        if (filters.status === 'ended') return isEnded;
        return true;
      });
    }
  }

  // Sorting
  result.sort((a, b) => {
    const dir = filters.sortOrder === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'deadline':
        return dir * ((a.submissionDeadline ?? 'z').localeCompare(b.submissionDeadline ?? 'z'));
      case 'prize':
        return dir * ((b.prizePoolUsd ?? 0) - (a.prizePoolUsd ?? 0));
      case 'rarity':
        return dir * ((b.rarityScore ?? 0) - (a.rarityScore ?? 0));
      case 'title':
        return dir * a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return result;
}
