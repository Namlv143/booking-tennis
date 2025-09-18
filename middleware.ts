import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/utilities', '/']

// Routes that should redirect if already authenticated
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname === route)
  const isAuthRoute = authRoutes.some(route => pathname === route)

  // For protected routes, we'll let the client-side handle token validation
  // since we can't easily access server-side token storage in middleware
  // without additional API calls
  
  if (isProtectedRoute) {
    // Let the page handle token validation client-side
    return NextResponse.next()
  }

  if (isAuthRoute) {
    // Let the page handle redirect logic client-side
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
