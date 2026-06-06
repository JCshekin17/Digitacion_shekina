import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Obtenemos la respuesta base de next-intl
  const intlResponse = intlMiddleware(request)

  // 2. Integramos Supabase SSR usando la respuesta de intl para no perder opciones de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            intlResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const localePrefix = path.match(/^\/(en|es)/)?.[0] || ''
  
  // 3. Lógica de rutas protegidas
  if (
    !user &&
    (path.includes('/dashboard') || path.includes('/caja') || path.includes('/admin'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `${localePrefix}/login`
    return NextResponse.redirect(url)
  }

  // 4. Lógica de admin
  if (user && path.includes('/dashboard') && user.email !== 'shekinatoursylogistica@outlook.com') {
    const url = request.nextUrl.clone()
    url.pathname = `${localePrefix}/caja`
    return NextResponse.redirect(url)
  }

  return intlResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
