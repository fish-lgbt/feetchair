import { NextRequest } from 'next/server';
import { fetchFromKv, putInKv } from './kv';

const ONE_HOUR = 60 * 60 * 1000;

export const checkRatelimit = async (request: NextRequest) => {
  const clientId = request.headers.get('x-client-id');
  if (!clientId) return new Response('Client ID is required', { status: 400 });

  // Get client's rate limit
  const clientData = await fetchFromKv(`${clientId}:client-data`, {
    rateLimit: { limit: 100, remaining: 100, reset: new Date(Date.now() + ONE_HOUR).toISOString() },
    accountType: 'free',
  });

  // If it's been more than the reset time, reset the rate limit
  if (new Date(clientData.rateLimit.reset) < new Date()) {
    clientData.rateLimit.remaining = clientData.rateLimit.limit;
    clientData.rateLimit.reset = new Date(Date.now() + ONE_HOUR).toISOString();
  }

  // If the rate limit is exceeded, return a 429
  if (clientData.rateLimit.remaining <= 0) return new Response('Rate limit exceeded', { status: 429 });

  // Decrement the rate limit
  clientData.rateLimit.remaining--;

  // Save the updated rate limit
  await putInKv(`${clientId}:client-data`, clientData);
};
