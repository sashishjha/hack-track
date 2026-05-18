const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

function decodeJwtRole(jwt) {
  if (!jwt || typeof jwt !== 'string') return null;
  const parts = jwt.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const parsed = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'));
    return parsed.role || null;
  } catch {
    return null;
  }
}

function resolveServiceRoleKey() {
  const candidates = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SECRET_KEY',
  ];

  for (const envVar of candidates) {
    if (process.env[envVar]) {
      return { key: process.env[envVar], envVar, role: decodeJwtRole(process.env[envVar]) };
    }
  }

  if (process.env.SUPABASE_KEY && decodeJwtRole(process.env.SUPABASE_KEY) === 'service_role') {
    return {
      key: process.env.SUPABASE_KEY,
      envVar: 'SUPABASE_KEY',
      role: 'service_role',
    };
  }

  return null;
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_KEY in .env file.\n' +
    'Ask the Master Agent for setup instructions.'
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const serviceRoleConfig = resolveServiceRoleKey();

const supabaseAdmin = serviceRoleConfig
  ? createClient(process.env.SUPABASE_URL, serviceRoleConfig.key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

module.exports = {
  supabase,
  supabaseAdmin,
  serviceRoleEnvVar: serviceRoleConfig?.envVar || null,
  serviceRoleKeyRole: serviceRoleConfig?.role || null,
};
