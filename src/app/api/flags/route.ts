import { Flag, fetchFromKv, putInKv } from '@/kv';
import { validateClient } from '@/validate-client';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const runtime = 'edge';

const getFlags = async (clientId: string) => await fetchFromKv(`${clientId}:flags`, []);

export async function GET(request: NextRequest) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Get flags
    const flags = await getFlags(clientId);
    return new Response(JSON.stringify(flags));
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

const Body = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
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

    // Add flag
    const flags = await getFlags(clientId);
    const id = crypto.randomUUID();
    const flag = {
      id,
      ...result.data,
    };
    flags.push(flag);
    await putInKv(`${clientId}:flags`, flags);
    return new Response(JSON.stringify(flag));
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

export const OPTIONS = () => new Response(null, { status: 204 });
