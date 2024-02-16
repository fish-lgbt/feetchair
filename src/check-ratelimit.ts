import { NextRequest, NextResponse } from 'next/server';
import { fetchFromKv } from './kv';

const namespace = process.env.RLIMIT_NAMESPACE_ID;

const getTimeAtNextHour = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
};

const accountTypeToQuota = (accountType: string) => {
  switch (accountType) {
    case 'free':
      return 100;
    case 'pro':
      return 1_000;
    case 'enterprise':
      return 10_000;
    case 'unlimited':
      return 1_000_000;
    default:
      return 100;
  }
};

type Limit = {
  ok: boolean;
  status: number;
  remaining: number;
};

export const checkRatelimit = async (request: NextRequest) => {
  const clientId = request.headers.get('x-client-id');
  if (!clientId) return new Response('Client ID is required', { status: 400 });

  // Fetch the user's plan
  const clientData = await fetchFromKv(`${clientId}:client-data`);
  const quota = accountTypeToQuota(clientData.accountType);

  // Fetch the rate limit
  const response = await fetch(`https://rlimit.com/${namespace}/${quota}/1h/${clientId}`);
  const limit = (await response.json()) as Limit;
  const headers = {
    'x-ratelimit-remaining': limit.remaining.toString(),
    'x-ratelimit-reset': getTimeAtNextHour().toISOString(),
  };

  // If the rate limit is exceeded, return a 429
  if (!response.ok) {
    return new Response(null, {
      status: limit.status,
      headers,
    });
  }

  // If the rate limit is not exceeded, add the headers and pass through
  return NextResponse.next({
    headers,
  });
};
