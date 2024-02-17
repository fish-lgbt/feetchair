import { getFlags } from '@/common/get-flags';
import { Flag, putInKv } from '@/common/kv';
import { validateClient } from '@/common/validate-client';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

type Context = {
  params: {
    flag: string;
  };
};

const Body = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

export const runtime = 'edge';

export async function GET(request: NextRequest, context: Context) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Get identity
    const identity = request.headers.get('x-identity') ?? null;

    // Get flag ID
    const flagId = context.params.flag;
    if (!flagId) return new Response('Flag ID is required', { status: 400 });

    // Get a single flag
    const flags = await getFlags(clientId, identity);
    const flag = flags.find((flag) => flag.id === flagId);
    if (!flag) return new Response('Flag not found', { status: 404 });

    return new Response(JSON.stringify(flag));
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Get identity
    const identity = request.headers.get('x-identity') ?? null;

    // Get flag ID
    const flagId = context.params.flag;
    if (!flagId) return new Response('Flag ID is required', { status: 400 });

    // Remove flag
    const flags = await getFlags(clientId, identity);
    const newFlags = flags.filter((flag) => flag.id !== flagId);

    // Save flags
    if (identity) {
      await putInKv(`${clientId}:flags:${identity}`, newFlags);
    } else {
      await putInKv(`${clientId}:flags`, newFlags);
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    // Validate client
    const clientId = request.headers.get('x-client-id');
    const clientSecret = request.headers.get('x-client-secret');
    if (!clientSecret) return new Response('Client Secret is required', { status: 400 });
    if (!clientId) return new Response('Client ID is required', { status: 400 });
    if (!(await validateClient(clientId, clientSecret))) return new Response('Invalid client', { status: 401 });

    // Get identity
    const identity = request.headers.get('x-identity') ?? null;

    // Get flag ID
    const flagId = context.params.flag;
    if (!flagId) return new Response('Flag ID is required', { status: 400 });

    // Parse body
    const body = (await request.json()) as Flag;

    // Check we have a flag with that ID
    const flags = await getFlags(clientId, identity);
    const flagIndex = flags.findIndex((flag) => flag.id === flagId);
    if (flagIndex === -1) return new Response('Flag not found', { status: 404 });

    // Validate body
    const result = Body.safeParse(body);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return new Response(validationError.toString(), { status: 400 });
    }

    // Update flag
    flags[flagIndex] = {
      id: flagId,
      ...result.data,
    };

    // Save flags
    if (identity) {
      await putInKv(`${clientId}:flags:${identity}`, flags);
    } else {
      await putInKv(`${clientId}:flags`, flags);
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}

export const OPTIONS = () => new Response(null, { status: 204 });
