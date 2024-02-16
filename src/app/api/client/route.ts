import { AccountType, fetchFromKv, putInKv } from '@/kv';
import { hashSecret } from '@/hash-secret';
import { validateClient } from '@/validate-client';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * One hour in milliseconds
 */
const ONE_HOUR = 60 * 60 * 1000;

// Lookup account data
export async function GET(request: NextRequest) {
  // Validate client
  const clientId = request.headers.get('x-client-id');
  const clientSecret = request.headers.get('x-client-secret');
  if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
  if (!clientId) return new Response('Client ID is required', { status: 400 });
  if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

  // Get client's rate limit and other data
  const clientData = await fetchFromKv(`${clientId}:client-data`, {
    rateLimit: { limit: 100, remaining: 100, reset: new Date(Date.now() + ONE_HOUR).toISOString() },
    accountType: 'free',
  });

  return new Response(JSON.stringify(clientData), {
    headers: {
      'Content-Type': 'application/json',
      'x-rate-limit-limit': clientData.rateLimit.limit.toString(),
      'x-rate-limit-remaining': clientData.rateLimit.remaining.toString(),
      'x-rate-limit-reset': clientData.rateLimit.reset,
    },
  });
}

// Register account
export async function POST(request: NextRequest) {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();

  // Save client data
  await putInKv(`${clientId}:client-data`, {
    rateLimit: { limit: 1000, remaining: 1000, reset: new Date(Date.now() + ONE_HOUR).toISOString() },
    accountType: 'free' as AccountType,
  });

  // Save hashed client secret
  await putInKv(`${clientId}:auth`, {
    hashedSecret: await hashSecret(clientSecret),
  });

  return new Response(
    JSON.stringify({
      clientId,
      clientSecret,
    }),
  );
}
