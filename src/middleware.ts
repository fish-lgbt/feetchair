import { NextRequest, NextResponse } from 'next/server';
import { checkRatelimit } from './check-ratelimit';

export const middleware = async (request: NextRequest) => {
  // Check rate limits
  if (request.nextUrl.pathname.startsWith('/api/flags')) {
    return checkRatelimit(request);
  }

  // Pass through
  return NextResponse.next();
};

export const config = {
  matcher: '/api/:path*',
};
