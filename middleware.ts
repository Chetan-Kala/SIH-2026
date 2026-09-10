import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Routes that require a specific role
const PROTECTED: Record<string, string[]> = {
  '/regional':   ['REGIONAL_HEAD', 'ADMIN'],
  '/dashboard':  ['ADMIN'],
  '/university': ['UNIVERSITY', 'ADMIN'],
  '/industry':   ['INDUSTRY', 'ADMIN'],
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Find if this path is protected
  const entry = Object.entries(PROTECTED).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (!entry) return NextResponse.next()

  const [, allowedRoles] = entry
  const token = req.cookies.get('sih_session')?.value

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const user = verifyToken(token)

  if (!user || !allowedRoles.includes(user.role)) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/regional/:path*', '/dashboard/:path*', '/university/:path*', '/industry/:path*'],
}
