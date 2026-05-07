import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Middleware simplificado — solo Security Headers
//
// La protección de rutas (/dashboard, /ventas) se maneja directamente en cada
// page.tsx mediante supabase.auth.getUser(), lo cual es más confiable que
// detectar cookies manualmente en el middleware sin @supabase/ssr.
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ── Security Headers ────────────────────────────────────────────────────────
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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
    // Excluir archivos estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|shekina-logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
