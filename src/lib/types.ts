// ─── Competition Intelligence Platform — Core Types ───

export type CompetitionStatus = 'open' | 'upcoming' | 'closed' | 'archived' | 'unknown';
export type RegistrationStatus = 'open' | 'closed' | 'waitlist' | 'unknown';

export type SkillDomain =
  | 'ai_ml'
  | 'reinforcement_learning'
  | 'robotics'
  | 'quant_finance'
  | 'cybersecurity'
  | 'competitive_programming'
  | 'web_app'
  | 'open_source'
  | 'data_science'
  | 'computer_vision'
  | 'nlp_llm'
  | 'embedded_iot'
  | 'blockchain_web3'
  | 'cloud_devops'
  | 'multi_agent'
  | 'game_ai'
  | 'hardware'
  | 'space_science'
  | 'social_impact'
  | 'design';

export type CareerOutcome =
  | 'cash'
  | 'internship'
  | 'full_time'
  | 'research_visibility'
  | 'startup_funding'
  | 'networking'
  | 'academic_prestige'
  | 'open_source_reputation'
  | 'recruitment_pipeline';

export type EffortLevel =
  | '2h_sprint'
  | 'weekend'
  | '1_week'
  | 'multi_month'
  | 'passive'
  | 'daily_tasks';

export type Difficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'elite'
  | 'research';

export type CompetitionDensity =
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'overcrowded';

export type AiPolicy =
  | 'allowed'
  | 'restricted'
  | 'no_ai'
  | 'ai_core'
  | 'open_model'
  | 'api_based';

export type Mode = 'remote' | 'physical' | 'hybrid';

export type TeamType = 'individual' | 'team' | 'both';

export type Recurrence =
  | 'one_time'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'always_open';

export type Validity = 'active' | 'archived' | 'recurring' | 'historical' | 'unknown';

export type RecurrenceCategory =
  | '2026_specific'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'always_open';

export interface Competition {
  id: string;
  slug: string;
  title: string;
  platform: string;
  organizer?: string;
  description: string;
  url: string;

  // Status
  status: CompetitionStatus;
  registrationStatus: RegistrationStatus;
  submissionDeadline?: string; // ISO date
  registrationDeadline?: string;
  startDate?: string;
  endDate?: string;

  // Prize & Participants
  prizePoolUsd?: number;
  prizeDisplay: string;
  participantsEstimate?: string;
  teamSizeMin: number;
  teamSizeMax?: number;

  // Categorization
  skillDomains: SkillDomain[];
  careerOutcomes: CareerOutcome[];
  effortLevel: EffortLevel;
  difficulty: Difficulty;
  competitionDensity: CompetitionDensity;
  recurrenceCategory: RecurrenceCategory;

  // AI Policy
  aiPolicy: AiPolicy;
  apiCreditsIncluded: boolean;
  gpuCreditsIncluded: boolean;

  // Access & Eligibility
  mode: Mode;
  countryRestrictions?: string[];
  studentOnly: boolean;
  teamType: TeamType;
  requiredStack?: string[];
  hardwareRequired: boolean;

  // Intelligence Scores
  rarityScore?: number;
  trustScore?: number;
  recruiterVisibility?: number;
  resumeValue?: number;
  beginnerFriendlyScore?: number;

  // Metadata
  tags: string[];
  imageUrl?: string;
  recurrence: Recurrence;
  validity: Validity;

  // UI helpers
  platformColor?: string;
  badgeVariant?: string;
}

export interface CompetitionChange {
  id: string;
  competitionId: string;
  competitionTitle: string;
  fieldName: string;
  oldValue?: string;
  newValue: string;
  detectedAt: string;
}

export interface PlatformInfo {
  id: string;
  name: string;
  baseUrl: string;
  scraperType: 'api' | 'html' | 'rss' | 'manual';
  color: string;
  icon?: string;
}

export interface FilterState {
  search: string;
  platforms: string[];
  skillDomains: SkillDomain[];
  difficulty: Difficulty | null;
  effortLevel: EffortLevel | null;
  aiPolicy: AiPolicy | null;
  mode: Mode | null;
  competitionDensity: CompetitionDensity | null;
  recurrenceCategory: RecurrenceCategory | null;
  careerOutcome: CareerOutcome | null;
  sortBy: 'deadline' | 'prize' | 'rarity' | 'freshness' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface PlatformStats {
  totalCompetitions: number;
  activeNow: number;
  totalBountyUsd: number;
  platformsTracked: number;
  hiddenGems: number;
}
