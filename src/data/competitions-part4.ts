// Part 4: Remaining Aggregators and Platforms
import type { Competition } from '../lib/types';

const C = (id:string, slug:string, title:string, platform:string, org:string, desc:string, url:string, s:any): Competition => ({
  id, slug, title, platform, organizer:org, description:desc, url,
  status:s.st||'open', registrationStatus:s.rs||'open', submissionDeadline:s.dl,
  startDate:s.sd, endDate:s.ed,
  prizePoolUsd:s.p||0, prizeDisplay:s.pd||'', participantsEstimate:s.pe||'',
  teamSizeMin:s.tmin||1, teamSizeMax:s.tmax||5,
  skillDomains:s.sk||[], careerOutcomes:s.co||['cash'],
  effortLevel:s.ef||'weekend', difficulty:s.df||'intermediate', competitionDensity:s.cd||'medium',
  recurrenceCategory:s.rc||'always_open', aiPolicy:s.ai||'allowed',
  apiCreditsIncluded:s.api||false, gpuCreditsIncluded:s.gpu||false,
  mode:s.m||'remote', studentOnly:s.so||false, teamType:s.tt||'both', hardwareRequired:s.hw||false,
  tags:s.tg||[], recurrence:s.r||'always_open', validity:s.v||'active',
  rarityScore:s.rs2||5, trustScore:s.ts||5, countryRestrictions:s.cr,
  beginnerFriendlyScore:s.bf||5, recruiterVisibility:s.rv||5, resumeValue:s.rsv||5,
});

export const COMPETITIONS_PART4: Competition[] = [
  C('91', 'hackerrank', 'HackerRank Corporate Challenges', 'hackerrank', 'HackerRank', 'Corporate evaluation hub. Used for major hiring hackathons like GSIH + Google Big Code.', 'https://hackerrank.com', {
    pd: 'Corporate hiring + cash', pe: '1,000+', sk: ['competitive_programming'], co: ['recruitment_pipeline'],
    df: 'advanced', cd: 'high', ai: 'no_ai', tt: 'individual', tg: ['Hiring', 'DSA', 'No AI'], rs2: 4, rv: 9, rsv: 8
  }),
  C('92', 'startup-grants-india', 'Startup Grants India', 'other', 'Startup Grants India', 'India niche + low-participation tracker for startup funding challenges and grants.', 'https://startupgrantsindia.com/competitions', {
    pd: 'Startup funding + grants', pe: '50–200', sk: ['web_app', 'social_impact'], co: ['startup_funding'],
    ef: 'multi_month', df: 'intermediate', cd: 'very_low', tg: ['India', 'Startup', 'Grants', 'Low Competition'], cr: ['India'], rs2: 8
  }),
  C('93', 'where-u-elevate', 'Where U Elevate', 'other', 'Where U Elevate', 'Tracks enterprise-tier tech challenges + corporate dev sprints across India.', 'https://whereuelevate.com', {
    pd: 'Enterprise rewards', pe: '200–500', sk: ['web_app', 'ai_ml'], co: ['cash', 'recruitment_pipeline'],
    ef: '1_week', df: 'intermediate', cd: 'medium', tg: ['India', 'Enterprise', 'Hiring'], cr: ['India'], rs2: 6
  }),
  C('94', 'halite-archived', 'Halite (Archived)', 'kaggle', 'Two Sigma', 'Two Sigma algorithmic game competition. Check for revival or successors on Kaggle.', 'https://kaggle.com', {
    st: 'archived', rs: 'closed', pd: 'N/A', pe: 'N/A', sk: ['game_ai', 'reinforcement_learning'], co: ['recruitment_pipeline'],
    ef: 'passive', df: 'advanced', cd: 'medium', v: 'historical', tg: ['Archived', 'Two Sigma', 'Game AI'], rs2: 5
  }),
  C('95', 'mlh-discord', 'MLH Discord + Newsletter', 'mlh', 'Major League Hacking', 'Advance registration alerts for upcoming MLH hackathons.', 'https://mlh.io', {
    pd: 'N/A (Directory)', pe: 'N/A', sk: ['web_app'], co: ['networking'], ef: 'passive', df: 'beginner', cd: 'low',
    tg: ['Newsletter', 'Student', 'Alerts'], bf: 10, rs2: 5
  }),
];
