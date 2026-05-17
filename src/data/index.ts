// ─── Master Competition Data — Merges all parts ───
import { COMPETITIONS } from './competitions';
import { COMPETITIONS_PART2 } from './competitions-part2';
import { COMPETITIONS_PART3 } from './competitions-part3';
import { COMPETITIONS_PART4 } from './competitions-part4';
import type { Competition, PlatformStats, FilterState } from '../lib/types';

// Merge all competition data into a single array
export const ALL_COMPETITIONS: Competition[] = [
  ...COMPETITIONS,
  ...COMPETITIONS_PART2,
  ...COMPETITIONS_PART3,
  ...COMPETITIONS_PART4,
];

// ─── Computed helpers ───

export function getHiddenGems(limit = 6): Competition[] {
  return [...ALL_COMPETITIONS]
    .filter(c => (c.rarityScore ?? 0) >= 7 && c.validity === 'active')
    .sort((a, b) => (b.rarityScore ?? 0) - (a.rarityScore ?? 0))
    .slice(0, limit);
}

export function getUpcomingDeadlines(limit = 5): Competition[] {
  const now = new Date().toISOString();
  return ALL_COMPETITIONS
    .filter(c => c.submissionDeadline && c.submissionDeadline > now)
    .sort((a, b) => (a.submissionDeadline ?? '').localeCompare(b.submissionDeadline ?? ''))
    .slice(0, limit);
}

export function getFreshlyOpened(limit = 6): Competition[] {
  return ALL_COMPETITIONS
    .filter(c => c.status === 'open' && c.recurrenceCategory === '2026_specific')
    .slice(0, limit);
}

export function getStats(): PlatformStats {
  const active = ALL_COMPETITIONS.filter(c => c.status === 'open' || c.status === 'upcoming');
  const platforms = new Set(ALL_COMPETITIONS.map(c => c.platform));
  const totalBounty = ALL_COMPETITIONS.reduce((sum, c) => sum + (c.prizePoolUsd || 0), 0);
  const gems = ALL_COMPETITIONS.filter(c => (c.rarityScore ?? 0) >= 7);
  return {
    totalCompetitions: ALL_COMPETITIONS.length,
    activeNow: active.length,
    totalBountyUsd: totalBounty,
    platformsTracked: platforms.size,
    hiddenGems: gems.length,
  };
}

export function filterCompetitions(competitions: Competition[], filters: FilterState): Competition[] {
  let result = [...competitions];

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.platform.toLowerCase().includes(q) ||
      (c.organizer || '').toLowerCase().includes(q)
    );
  }

  // Platform filter
  if (filters.platforms.length > 0) {
    result = result.filter(c => filters.platforms.includes(c.platform));
  }

  // Skill domains
  if (filters.skillDomains.length > 0) {
    result = result.filter(c =>
      filters.skillDomains.some(d => c.skillDomains.includes(d))
    );
  }

  // Difficulty
  if (filters.difficulty) {
    result = result.filter(c => c.difficulty === filters.difficulty);
  }

  // Effort level
  if (filters.effortLevel) {
    result = result.filter(c => c.effortLevel === filters.effortLevel);
  }

  // AI policy
  if (filters.aiPolicy) {
    result = result.filter(c => c.aiPolicy === filters.aiPolicy);
  }

  // Mode
  if (filters.mode) {
    result = result.filter(c => c.mode === filters.mode);
  }

  // Competition density
  if (filters.competitionDensity) {
    result = result.filter(c => c.competitionDensity === filters.competitionDensity);
  }

  // Recurrence category
  if (filters.recurrenceCategory) {
    result = result.filter(c => c.recurrenceCategory === filters.recurrenceCategory);
  }

  // Career outcome
  if (filters.careerOutcome) {
    result = result.filter(c => c.careerOutcomes.includes(filters.careerOutcome!));
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
