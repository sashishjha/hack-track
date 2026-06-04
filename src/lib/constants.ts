// ─── Constants, Taxonomies, and Color Mappings ───

import type {
  SkillDomain,
  CareerOutcome,
  EffortLevel,
  Difficulty,
  CompetitionDensity,
  AiPolicy,
  RecurrenceCategory,
  PlatformInfo,
  FilterState,
} from './types';

// ─── SKILL DOMAIN LABELS ───
export const SKILL_DOMAIN_LABELS: Record<SkillDomain, string> = {
  ai_ml: 'AI / ML',
  reinforcement_learning: 'Reinforcement Learning',
  robotics: 'Robotics',
  quant_finance: 'Quant / Finance',
  cybersecurity: 'Cybersecurity',
  competitive_programming: 'Competitive Programming',
  web_app: 'Web / App Dev',
  open_source: 'Open Source',
  data_science: 'Data Science',
  computer_vision: 'Computer Vision',
  nlp_llm: 'NLP / LLMs',
  embedded_iot: 'Embedded / IoT',
  blockchain_web3: 'Blockchain / Web3',
  cloud_devops: 'Cloud / DevOps',
  multi_agent: 'Multi-Agent Systems',
  game_ai: 'Game AI',
  hardware: 'Hardware',
  space_science: 'Space / Science',
  social_impact: 'Social Impact',
  design: 'Design',
};

// ─── CAREER OUTCOME LABELS ───
export const CAREER_OUTCOME_LABELS: Record<CareerOutcome, string> = {
  cash: '💰 Cash Prizes',
  internship: '🎓 Internship',
  full_time: '💼 Full-time Hiring',
  research_visibility: '🔬 Research Visibility',
  startup_funding: '🚀 Startup Funding',
  networking: '🤝 Networking',
  academic_prestige: '🏛️ Academic Prestige',
  open_source_reputation: '⭐ OSS Reputation',
  recruitment_pipeline: '📋 Recruitment Pipeline',
};

// ─── EFFORT LEVEL LABELS ───
export const EFFORT_LEVEL_LABELS: Record<EffortLevel, string> = {
  '2h_sprint': '⚡ 2-Hour Sprint',
  weekend: '📅 Weekend Build',
  '1_week': '📆 1-Week Project',
  multi_month: '🗓️ Multi-Month Research',
  passive: '♾️ Passive / Ongoing',
  daily_tasks: '📋 Daily Tasks',
};

// ─── DIFFICULTY LABELS ───
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
  research: 'Research-Level',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: '#00e5a0',
  intermediate: '#4d9fff',
  advanced: '#f0c040',
  elite: '#ff5c35',
  research: '#c78cff',
};

// ─── COMPETITION DENSITY LABELS ───
export const DENSITY_LABELS: Record<CompetitionDensity, string> = {
  very_low: '🏆 Very Low Competition',
  low: '💎 Hidden Gem',
  medium: '⚖️ Moderate',
  high: '🔥 High Competition',
  overcrowded: '⚠️ Overcrowded',
};

// ─── AI POLICY LABELS ───
export const AI_POLICY_LABELS: Record<AiPolicy, string> = {
  allowed: '✅ AI Allowed',
  restricted: '⚠️ AI Restricted',
  no_ai: '❌ No AI',
  ai_core: '🤖 AI Core',
  open_model: '🔓 Open Model',
  api_based: '🔌 API-Based',
};

// ─── RECURRENCE CATEGORY LABELS ───
export const RECURRENCE_LABELS: Record<RecurrenceCategory, string> = {
  '2026_specific': '🔴 2026 Deadline',
  daily: '🟠 Daily',
  weekly: '🟡 Weekly',
  monthly: '🟢 Monthly',
  annual: '🔵 Annual',
  always_open: '♾️ Always Open',
};

export const RECURRENCE_COLORS: Record<RecurrenceCategory, string> = {
  '2026_specific': '#ff5c35',
  daily: '#ff8c42',
  weekly: '#f0c040',
  monthly: '#00e5a0',
  annual: '#4d9fff',
  always_open: '#c78cff',
};

// ─── PLATFORM REGISTRY ───
export const PLATFORMS: Record<string, PlatformInfo> = {
  kaggle: { id: 'kaggle', name: 'Kaggle', baseUrl: 'https://www.kaggle.com/competitions', scraperType: 'api', color: '#20beff' },
  devpost: { id: 'devpost', name: 'Devpost', baseUrl: 'https://devpost.com/hackathons', scraperType: 'api', color: '#003e54' },
  devfolio: { id: 'devfolio', name: 'Devfolio', baseUrl: 'https://devfolio.co/hackathons', scraperType: 'html', color: '#3770ff' },
  unstop: { id: 'unstop', name: 'Unstop', baseUrl: 'https://unstop.com/hackathons', scraperType: 'html', color: '#1c3faa' },
  hackerearth: { id: 'hackerearth', name: 'HackerEarth', baseUrl: 'https://www.hackerearth.com/challenges/hackathon', scraperType: 'html', color: '#2c3454' },
  mlh: { id: 'mlh', name: 'MLH', baseUrl: 'https://mlh.io', scraperType: 'html', color: '#e73427' },
  aicrowd: { id: 'aicrowd', name: 'AIcrowd', baseUrl: 'https://www.aicrowd.com/challenges', scraperType: 'api', color: '#f54b64' },
  zindi: { id: 'zindi', name: 'Zindi', baseUrl: 'https://zindi.africa/competitions', scraperType: 'html', color: '#1b9c85' },
  drivendata: { id: 'drivendata', name: 'DrivenData', baseUrl: 'https://www.drivendata.org/competitions', scraperType: 'html', color: '#ee3524' },
  topcoder: { id: 'topcoder', name: 'Topcoder', baseUrl: 'https://www.topcoder.com/challenges', scraperType: 'api', color: '#1a8bff' },
  numerai: { id: 'numerai', name: 'Numerai', baseUrl: 'https://numer.ai', scraperType: 'api', color: '#0b0e11' },
  lablab: { id: 'lablab', name: 'Lablab.ai', baseUrl: 'https://lablab.ai/event-hackathons', scraperType: 'html', color: '#7c3aed' },
  herox: { id: 'herox', name: 'HeroX', baseUrl: 'https://www.herox.com', scraperType: 'html', color: '#ff6600' },
  solafune: { id: 'solafune', name: 'Solafune', baseUrl: 'https://solafune.com/en/competitions', scraperType: 'html', color: '#0ea5e9' },
  evalai: { id: 'evalai', name: 'EvalAI', baseUrl: 'https://eval.ai/web/challenges/challenge-page-list', scraperType: 'api', color: '#6366f1' },
  codalab: { id: 'codalab', name: 'CodaLab', baseUrl: 'https://codalab.lisn.upsaclay.fr/competitions', scraperType: 'html', color: '#059669' },
  algora: { id: 'algora', name: 'Algora', baseUrl: 'https://algora.io/bounties', scraperType: 'html', color: '#22d3ee' },
  polar: { id: 'polar', name: 'Polar.sh', baseUrl: 'https://polar.sh', scraperType: 'api', color: '#0ea5e9' },
  immunefi: { id: 'immunefi', name: 'Immunefi', baseUrl: 'https://immunefi.com', scraperType: 'html', color: '#2563eb' },
  hackerone: { id: 'hackerone', name: 'HackerOne', baseUrl: 'https://hackerone.com', scraperType: 'api', color: '#494649' },
  bugcrowd: { id: 'bugcrowd', name: 'Bugcrowd', baseUrl: 'https://bugcrowd.com', scraperType: 'html', color: '#f97316' },
  ctftime: { id: 'ctftime', name: 'CTFTime', baseUrl: 'https://ctftime.org', scraperType: 'html', color: '#dc2626' },
  codeforces: { id: 'codeforces', name: 'Codeforces', baseUrl: 'https://codeforces.com', scraperType: 'api', color: '#1f8acb' },
  leetcode: { id: 'leetcode', name: 'LeetCode', baseUrl: 'https://leetcode.com', scraperType: 'api', color: '#ffa116' },
  codechef: { id: 'codechef', name: 'CodeChef', baseUrl: 'https://www.codechef.com', scraperType: 'html', color: '#5b4638' },
  worldquant: { id: 'worldquant', name: 'WorldQuant', baseUrl: 'https://platform.worldquantbrain.com', scraperType: 'manual', color: '#0a2463' },
  imc: { id: 'imc', name: 'IMC Prosperity', baseUrl: 'https://prosperity.imc.com', scraperType: 'manual', color: '#003b5c' },
  quantiacs: { id: 'quantiacs', name: 'Quantiacs', baseUrl: 'https://quantiacs.com', scraperType: 'api', color: '#0d9488' },
  crunchdao: { id: 'crunchdao', name: 'CrunchDAO', baseUrl: 'https://crunchdao.com', scraperType: 'manual', color: '#6d28d9' },
  hackster: { id: 'hackster', name: 'Hackster.io', baseUrl: 'https://hackster.io/competitions', scraperType: 'html', color: '#2c3e50' },
  issuehunt: { id: 'issuehunt', name: 'IssueHunt', baseUrl: 'https://issuehunt.io', scraperType: 'api', color: '#059669' },
  gitcoin: { id: 'gitcoin', name: 'Gitcoin', baseUrl: 'https://gitcoin.co', scraperType: 'html', color: '#6f3ff5' },
  bountysource: { id: 'bountysource', name: 'Bountysource', baseUrl: 'https://bountysource.com', scraperType: 'html', color: '#2ea44f' },
  tianchi: { id: 'tianchi', name: 'Alibaba Tianchi', baseUrl: 'https://tianchi.aliyun.com', scraperType: 'html', color: '#ff6a00' },
  signate: { id: 'signate', name: 'SIGNATE', baseUrl: 'https://signate.jp', scraperType: 'html', color: '#00b4d8' },
  huggingface: { id: 'huggingface', name: 'Hugging Face', baseUrl: 'https://huggingface.co/competitions', scraperType: 'api', color: '#ff9d00' },
  bitgrit: { id: 'bitgrit', name: 'Bitgrit', baseUrl: 'https://bitgrit.net/competition', scraperType: 'html', color: '#4f46e5' },
  crowdanalytix: { id: 'crowdanalytix', name: 'CrowdANALYTIX', baseUrl: 'https://crowdanalytix.com/community', scraperType: 'html', color: '#0284c7' },
  reskilll: { id: 'reskilll', name: 'Reskilll', baseUrl: 'https://reskilll.com/allhacks', scraperType: 'html', color: '#f59e0b' },
  arcprize: { id: 'arcprize', name: 'ARC Prize', baseUrl: 'https://arcprize.org', scraperType: 'manual', color: '#8b5cf6' },
  nasa: { id: 'nasa', name: 'NASA', baseUrl: 'https://www.spaceappschallenge.org', scraperType: 'manual', color: '#0b3d91' },
  darpa: { id: 'darpa', name: 'DARPA', baseUrl: 'https://darpa.mil', scraperType: 'manual', color: '#1e3a5f' },
  xprize: { id: 'xprize', name: 'XPRIZE', baseUrl: 'https://xprize.org', scraperType: 'manual', color: '#e11d48' },
  goldman: { id: 'goldman', name: 'Goldman Sachs', baseUrl: 'https://www.goldmansachs.com', scraperType: 'manual', color: '#7c8b96' },
  google: { id: 'google', name: 'Google', baseUrl: 'https://www.google.com', scraperType: 'manual', color: '#4285f4' },
  microsoft: { id: 'microsoft', name: 'Microsoft', baseUrl: 'https://microsoft.com', scraperType: 'manual', color: '#00a4ef' },
  ibm: { id: 'ibm', name: 'IBM', baseUrl: 'https://ibm.com', scraperType: 'manual', color: '#0530ad' },
  nvidia: { id: 'nvidia', name: 'NVIDIA', baseUrl: 'https://nvidia.com', scraperType: 'manual', color: '#76b900' },
  amazon: { id: 'amazon', name: 'Amazon', baseUrl: 'https://amazon.science', scraperType: 'manual', color: '#ff9900' },
  walmart: { id: 'walmart', name: 'Walmart', baseUrl: 'https://unstop.com', scraperType: 'manual', color: '#0071dc' },
  openai: { id: 'openai', name: 'OpenAI', baseUrl: 'https://openai.com', scraperType: 'manual', color: '#10a37f' },
  sih: { id: 'sih', name: 'SIH', baseUrl: 'https://sih.gov.in', scraperType: 'manual', color: '#ff9933' },
  yandex: { id: 'yandex', name: 'Yandex', baseUrl: 'https://yandex.com/cup', scraperType: 'manual', color: '#fc3f1d' },
  hackjunction: { id: 'hackjunction', name: 'Hack Junction', baseUrl: 'https://hackjunction.com', scraperType: 'manual', color: '#4f46e5' },
  hackzurich: { id: 'hackzurich', name: 'HackZurich', baseUrl: 'https://hackzurich.ch', scraperType: 'manual', color: '#059669' },
  screeps: { id: 'screeps', name: 'Screeps', baseUrl: 'https://screeps.com', scraperType: 'manual', color: '#4b7bec' },
  luxai: { id: 'luxai', name: 'Lux AI', baseUrl: 'https://luxai.org', scraperType: 'manual', color: '#f59e0b' },
  battlecode: { id: 'battlecode', name: 'MIT Battlecode', baseUrl: 'https://battlecode.org', scraperType: 'manual', color: '#a31f34' },
  eyantra: { id: 'eyantra', name: 'e-Yantra', baseUrl: 'https://e-yantra.org', scraperType: 'manual', color: '#e53e3e' },
  other: { id: 'other', name: 'Other', baseUrl: '', scraperType: 'manual', color: '#6b7280' },
};

// ─── DEFAULT FILTER STATE ───
export const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  platforms: [],
  skillDomains: [],
  difficulty: null,
  effortLevel: null,
  aiPolicy: null,
  mode: null,
  competitionDensity: null,
  recurrenceCategory: null,
  careerOutcome: null,
  creditsProvided: null,
  status: 'all',
  sortBy: 'deadline',
  sortOrder: 'asc',
  advancedMode: false,
  advancedQuery: null,
};

// ─── STATUS COLORS ───
export const STATUS_COLORS: Record<string, string> = {
  open: '#00e5a0',
  upcoming: '#4d9fff',
  closed: '#6b7a99',
  archived: '#3d4655',
  unknown: '#6b7a99',
};
