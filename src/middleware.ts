import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── Rate Limit Store (in-memory, válido para edge/serverless) ──
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/login':     { max: 5,  windowMs: 60_000 },  // 5 intentos / minuto
  '/ventas':    { max: 30, windowMs: 60_000 },  // 30 registros / minuto
  '/dashboard': { max: 60, windowMs: 60_000 },  // 60 peticiones / minuto
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(key: string, limit: { max: number; windowMs: number }): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs })
    return true // permitido
  }

  if (entry.count >= limit.max) return false // bloqueado

  entry.count++
  return true // permitido
}

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/ventas']
// Rutas públicas (no redirigir si ya autenticado)
const PUBLIC_ONLY_ROUTES = ['/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = getClientIp(req)

  // ── 1. Rate Limiting ─────────────────────────────────────────
  for (const [route, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      const key = `${ip}:${route}`
      if (!checkRateLimit(key, limit)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Has superado el límite de solicitudes. Intenta de nuevo en un minuto.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
              'X-RateLimit-Limit': String(limit.max),
            },
          }
        )
      }
      break
    }
  }

  // ── 2. Protección de Rutas con Supabase Auth ─────────────────
  // Supabase v2 divide el token en múltiples cookies (e.g. sb-xxx-auth-token.0, .1)
  // Por eso buscamos cualquier cookie que comience con el prefijo del proyecto.
  const SUPABASE_COOKIE_PREFIX = 'sb-sunjrcecovsmiqynwxfd-auth-token'
  const allCookies = req.cookies.getAll()
  const isAuthenticated = allCookies.some(
    (c) => c.name.startsWith(SUPABASE_COOKIE_PREFIX) && c.value
  )
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isPublicOnly  = PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r))

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublicOnly && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // ── 3. Security Headers ──────────────────────────────────────
  const res = NextResponse.next()

  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // Next.js necesita unsafe-eval en dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://lirp.cdn-website.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  )
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  return res
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas de Next internals
    '/((?!_next/static|_next/image|favicon.ico|shekina-logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
