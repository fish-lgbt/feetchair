import { fetchFromKv } from '@/kv';
import { validateClient } from '@/validate-client';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const runtime = 'edge';

const getFlags = async (clientId: string) => {
  return await fetchFromKv(`${clientId}:flags`, []);
};

export async function GET(request: NextRequest) {
  // Validate client
  const clientId = request.headers.get('x-client-id');
  const clientSecret = request.headers.get('x-client-secret');
  if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
  if (!clientId) return new Response('Client ID is required', { status: 400 });
  if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

  // Get client's rate limit
  const clientData = await fetchFromKv(`${clientId}:client-data`);

  // Get flags
  const flags = await getFlags(clientId);
  return new Response(JSON.stringify(flags), {
    headers: {
      'Content-Type': 'application/json',
      'x-rate-limit-limit': clientData.rateLimit.limit.toString(),
      'x-rate-limit-remaining': clientData.rateLimit.remaining.toString(),
      'x-rate-limit-reset': clientData.rateLimit.reset,
    },
  });
}

const Body = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

export async function POST(request: NextRequest) {
  // Validate client
  const clientId = request.headers.get('x-client-id');
  const clientSecret = request.headers.get('x-client-secret');
  if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
  if (!clientId) return new Response('Client ID is required', { status: 400 });
  if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

  // Validate body
  const result = Body.safeParse(await request.json());
  if (!result.success) {
    const validationError = fromZodError(result.error);
    return new Response(validationError.toString(), { status: 400 });
  }

  // Get client's rate limit
  const clientData = await fetchFromKv(`${clientId}:client-data`);

  // Add flag
  const flags = await getFlags(clientId);
  const id = crypto.randomUUID();
  flags.push({
    id,
    ...result.data,
  });
  await process.env.feetchair.put(`${clientId}:flags`, JSON.stringify(flags));
  return new Response(
    JSON.stringify({
      id,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'x-rate-limit-limit': clientData.rateLimit.limit.toString(),
        'x-rate-limit-remaining': clientData.rateLimit.remaining.toString(),
        'x-rate-limit-reset': clientData.rateLimit.reset,
      },
    },
  );
}

export async function DELETE(request: NextRequest, body: { id: string }) {
  // Validate client
  const clientId = request.headers.get('x-client-id');
  const clientSecret = request.headers.get('x-client-secret');
  if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
  if (!clientId) return new Response('Client ID is required', { status: 400 });
  if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

  // Get client's rate limit
  const clientData = await fetchFromKv(`${clientId}:client-data`);

  // Remove flag
  const flags = await getFlags(clientId);
  const newFlags = flags.filter((flag) => flag.id !== body.id);
  await process.env.feetchair.put(`${clientId}:flags`, JSON.stringify(newFlags));
  return new Response(null, {
    status: 204,
    headers: {
      'Content-Type': 'application/json',
      'x-rate-limit-limit': clientData.rateLimit.limit.toString(),
      'x-rate-limit-remaining': clientData.rateLimit.remaining.toString(),
      'x-rate-limit-reset': clientData.rateLimit.reset,
    },
  });
}

export async function PUT(request: NextRequest, body: { id: string; name: string; description: string; enabled: boolean }) {
  // Validate client
  const clientId = request.headers.get('x-client-id');
  const clientSecret = request.headers.get('x-client-secret');
  if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
  if (!clientId) return new Response('Client ID is required', { status: 400 });
  if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

  // Get client's rate limit
  const clientData = await fetchFromKv(`${clientId}:client-data`);

  // Update flag
  const flags = await getFlags(clientId);
  const newFlags = flags.map((flag) => (flag.id === body.id ? body : flag));
  await process.env.feetchair.put(`${clientId}:flags`, JSON.stringify(newFlags));
  return new Response(null, {
    status: 204,
    headers: {
      'Content-Type': 'application/json',
      'x-rate-limit-limit': clientData.rateLimit.limit.toString(),
      'x-rate-limit-remaining': clientData.rateLimit.remaining.toString(),
      'x-rate-limit-reset': clientData.rateLimit.reset,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
