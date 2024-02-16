import { Flag, fetchFromKv, putInKv } from '@/kv';
import { validateClient } from '@/validate-client';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const runtime = 'edge';

const getFlags = async (clientId: string) => {
  return await fetchFromKv(`${clientId}:flags`, []);
};

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

export async function DELETE(request: NextRequest, body: { id: string }) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Remove flag
    const flags = await getFlags(clientId);
    const newFlags = flags.filter((flag) => flag.id !== body.id);
    await putInKv(`${clientId}:flags`, newFlags);
    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Parse body
    const { id: flagId, ...body } = (await request.json()) as Flag;

    // Check we have a flag with that ID
    const flags = await getFlags(clientId);
    const flag = flags.find((flag) => flag.id === flagId);
    if (!flag) return new Response('Flag not found', { status: 404 });

    // Validate body
    const result = Body.safeParse({
      ...body,
    });
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return new Response(validationError.toString(), { status: 400 });
    }

    // Update flag
    const flagIndex = flags.indexOf(flag);
    flags[flagIndex] = {
      id: flagId,
      ...result.data,
    };

    // Save flags
    await putInKv(`${clientId}:flags`, flags);
    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
