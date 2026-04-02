import { NextRequest, NextResponse } from "next/server";

/**
 * Inject X-API-Key header into proxied /api/* requests.
 * The backend requires this header when BACKEND_API_KEY is set.
 * The key is server-side only (never exposed to the browser).
 */
export function middleware(request: NextRequest) {
  const apiKey = process.env.BACKEND_API_KEY;
  
  if (apiKey && request.nextUrl.pathname.startsWith("/api/")) {
    // Clone the request headers and add the API key
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-API-Key", apiKey);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
