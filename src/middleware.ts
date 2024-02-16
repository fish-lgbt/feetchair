import { NextRequest, NextResponse } from 'next/server';
import { checkRatelimit } from './check-ratelimit';

export const middleware = async (request: NextRequest) => {
  // Check rate limits
  await checkRatelimit(request);

  // Run the route handler
  return NextResponse.next();
};

export const config = {
  matcher: '/api/:path*',
};
