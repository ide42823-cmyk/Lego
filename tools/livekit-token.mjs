#!/usr/bin/env node
/**
 * Dev-only helper: mint a LiveKit access token (JWT, HS256) with no dependencies.
 *
 * This exists so a local `livekit-server --dev` can be used for on-device RTC
 * testing without a LiveKit Cloud account. It is NOT shipped in the app bundle
 * and must never be used with production keys.
 *
 * Usage:
 *   node tools/livekit-token.mjs --room spike --identity user-a --name "User A"
 *
 * Environment:
 *   LIVEKIT_API_KEY     (default: devkey)
 *   LIVEKIT_API_SECRET  (default: secret)
 */

import { createHmac } from 'node:crypto';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const apiKey = process.env.LIVEKIT_API_KEY ?? 'devkey';
const apiSecret = process.env.LIVEKIT_API_SECRET ?? 'secret';
const room = arg('room', 'spike');
const identity = arg('identity', `user-${Math.random().toString(36).slice(2, 8)}`);
const name = arg('name', identity);
const ttlSeconds = Number(arg('ttl', '21600'));

const now = Math.floor(Date.now() / 1000);

const payload = {
  iss: apiKey,
  sub: identity,
  name,
  nbf: now - 10,
  exp: now + ttlSeconds,
  jti: identity,
  video: {
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  },
};

const b64url = (input) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const body = b64url(JSON.stringify(payload));
const signature = b64url(createHmac('sha256', apiSecret).update(`${header}.${body}`).digest());

process.stdout.write(`${header}.${body}.${signature}\n`);
