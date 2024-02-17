import { AccountType, fetchFromKv, putInKv } from '@/common/kv';
import { hashSecret } from '@/common/hash-secret';
import { validateClient } from '@/common/validate-client';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// Lookup account data
export async function GET(request: NextRequest) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Get client's rate limit and other data
    const clientData = await fetchFromKv(`${clientId}:client-data`, {
      accountType: 'free',
    });

    return new Response(JSON.stringify(clientData));
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

// Register account
export async function POST(request: NextRequest) {
  try {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();

    // Save client data
    await putInKv(`${clientId}:client-data`, {
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
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}
