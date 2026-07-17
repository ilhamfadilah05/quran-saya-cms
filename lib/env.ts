// Akses & validasi environment variables (server-only).

function req(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Env ${name} belum diisi`);
  return v.trim();
}

export function getServerEnv() {
  return {
    supabaseUrl: req('SUPABASE_URL'),
    supabaseServiceRoleKey: req('SUPABASE_SERVICE_ROLE_KEY'),
    fcmProjectId: req('FCM_PROJECT_ID'),
    fcmClientEmail: req('FCM_CLIENT_EMAIL'),
    fcmPrivateKey: req('FCM_PRIVATE_KEY').replace(/\\n/g, '\n'),
    adminSessionSecret: req('ADMIN_SESSION_SECRET'),
    cronSecret: req('CRON_SECRET'),
    appTimezone: process.env.APP_TIMEZONE?.trim() || 'Asia/Jakarta',
    winbackTime: process.env.WINBACK_TIME?.trim() || '19:00',
    adzanAndroidChannelId:
      process.env.ADZAN_ANDROID_CHANNEL_ID?.trim() || 'adzan_channel',
    adzanAndroidSound: process.env.ADZAN_ANDROID_SOUND?.trim() || 'adzan',
    adzanApnsSound: process.env.ADZAN_APNS_SOUND?.trim() || 'adzan.caf',
  };
}

export function validateSupabaseEnv() {
  req('SUPABASE_URL');
  req('SUPABASE_SERVICE_ROLE_KEY');
}

export function validateFcmEnv() {
  req('FCM_PROJECT_ID');
  req('FCM_CLIENT_EMAIL');
  req('FCM_PRIVATE_KEY');
}
