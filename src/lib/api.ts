import type { Competition } from '@/lib/types';

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || '/api';

type ApiCompetition = Partial<Competition> & {
  id: string;
  slug: string;
  title: string;
  platform: string;
  description: string;
  url: string;
};

function normalizeCompetition(c: ApiCompetition): Competition {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    platform: c.platform,
    organizer: c.organizer || undefined,
    description: c.description,
    url: c.url,
    status: c.status ?? 'unknown',
    registrationStatus: c.registrationStatus ?? 'unknown',
    submissionDeadline: c.submissionDeadline || undefined,
    registrationDeadline: c.registrationDeadline || undefined,
    startDate: c.startDate || undefined,
    endDate: c.endDate || undefined,
    prizePoolUsd: c.prizePoolUsd ?? undefined,
    prizeDisplay: c.prizeDisplay || 'N/A',
    participantsEstimate: c.participantsEstimate || undefined,
    teamSizeMin: c.teamSizeMin ?? 1,
    teamSizeMax: c.teamSizeMax ?? undefined,
    skillDomains: c.skillDomains ?? [],
    careerOutcomes: c.careerOutcomes ?? [],
    effortLevel: c.effortLevel ?? 'weekend',
    difficulty: c.difficulty ?? 'intermediate',
    competitionDensity: c.competitionDensity ?? 'medium',
    recurrenceCategory: c.recurrenceCategory ?? 'always_open',
    aiPolicy: c.aiPolicy ?? 'allowed',
    apiCreditsIncluded: Boolean(c.apiCreditsIncluded),
    gpuCreditsIncluded: Boolean(c.gpuCreditsIncluded),
    mode: c.mode ?? 'remote',
    countryRestrictions: c.countryRestrictions ?? undefined,
    studentOnly: Boolean(c.studentOnly),
    teamType: c.teamType ?? 'both',
    requiredStack: c.requiredStack ?? undefined,
    hardwareRequired: Boolean(c.hardwareRequired),
    rarityScore: c.rarityScore ?? undefined,
    trustScore: c.trustScore ?? undefined,
    recruiterVisibility: c.recruiterVisibility ?? undefined,
    resumeValue: c.resumeValue ?? undefined,
    beginnerFriendlyScore: c.beginnerFriendlyScore ?? undefined,
    tags: c.tags ?? [],
    imageUrl: c.imageUrl || undefined,
    recurrence: c.recurrence ?? 'one_time',
    validity: c.validity ?? 'unknown',
    platformColor: c.platformColor ?? undefined,
    badgeVariant: c.badgeVariant ?? undefined,
  };
}

export async function fetchCompetitions(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  if (!params.has('limit')) {
    params.set('limit', '10000'); // Effectively unlimited
  }
  const query = params.toString();
  const res = await fetch(`${API_BASE}/hackathons${query ? `?${query}` : ''}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch competitions (${res.status})`);
  }

  const data = (await res.json()) as { hackathons?: ApiCompetition[] };
  return {
    hackathons: (data.hackathons ?? []).map(normalizeCompetition),
  };
}

export async function fetchCompetition(id: string) {
  const res = await fetch(`${API_BASE}/hackathons/${id}`);

  if (!res.ok) {
    throw new Error(`Competition not found (${res.status})`);
  }

  const data = (await res.json()) as ApiCompetition;
  return normalizeCompetition(data);
}

export async function triggerRefresh() {
  const res = await fetch(`${API_BASE}/hackathons/refresh-all`, {
    method: 'POST',
  });

  if (!res.ok) {
    let errorMessage = `Failed to trigger refresh (${res.status})`;

    try {
      const errorBody = await res.json() as { error?: string; message?: string };
      if (errorBody?.error || errorBody?.message) {
        errorMessage = errorBody.error || errorBody.message || errorMessage;
      }
    } catch {
      // Ignore JSON parsing issues and keep the status-based message.
    }

    throw new Error(errorMessage);
  }

  return await res.json();
}
