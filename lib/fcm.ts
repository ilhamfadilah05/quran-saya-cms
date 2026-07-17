import 'server-only';
import { GoogleAuth } from 'google-auth-library';
import { getServerEnv } from './env';

// Pengiriman push via FCM HTTP v1 API.

let _auth: GoogleAuth | null = null;

function auth(): GoogleAuth {
  if (_auth) return _auth;
  const env = getServerEnv();
  _auth = new GoogleAuth({
    credentials: {
      client_email: env.fcmClientEmail,
      private_key: env.fcmPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  return _auth;
}

export type SendResult = {
  sent: number;
  failed: number;
  results: { ok: boolean; token: string; error?: string }[];
};

export type PushOptions = {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  androidChannelId?: string;
  androidSound?: string;
  iosSound?: string;
};

export async function sendPushNotification(
  opts: PushOptions
): Promise<SendResult> {
  const env = getServerEnv();
  const client = await auth().getClient();
  const url = `https://fcm.googleapis.com/v1/projects/${env.fcmProjectId}/messages:send`;

  const results: SendResult['results'] = [];
  let sent = 0;
  let failed = 0;

  for (const token of opts.tokens) {
    if (!token) {
      failed += 1;
      results.push({ ok: false, token, error: 'empty token' });
      continue;
    }
    const message: Record<string, unknown> = {
      token,
      notification: { title: opts.title, body: opts.body },
      data: opts.data ?? {},
    };
    if (opts.androidChannelId || opts.androidSound) {
      message.android = {
        notification: {
          ...(opts.androidChannelId ? { channel_id: opts.androidChannelId } : {}),
          ...(opts.androidSound ? { sound: opts.androidSound } : {}),
        },
      };
    }
    if (opts.iosSound) {
      message.apns = { payload: { aps: { sound: opts.iosSound } } };
    }

    try {
      const res = await client.request({
        url,
        method: 'POST',
        data: { message },
      });
      const ok = (res.status ?? 500) < 300;
      if (ok) sent += 1;
      else failed += 1;
      results.push({ ok, token });
    } catch (e) {
      failed += 1;
      const err = e as { message?: string };
      results.push({ ok: false, token, error: err.message ?? 'FCM error' });
    }
  }

  return { sent, failed, results };
}

/** Detail sound default untuk memisah adzan vs reminder biasa. */
export function adzanSoundDetails() {
  const env = getServerEnv();
  return {
    androidChannelId: env.adzanAndroidChannelId,
    androidSound: env.adzanAndroidSound,
    iosSound: env.adzanApnsSound,
  };
}
