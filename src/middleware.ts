import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // First update supabase session
  const response = await updateSession(request)
  
  // Apply intl middleware on top of the original request
  // (We use request because updateSession doesn't rewrite the URL, just redirects if needed)
  if (response.headers.get('location')) {
    // If updateSession redirected, we must follow that redirect
    return response
  }

  const intlResponse = intlMiddleware(request)
  
  // Sync cookies from Supabase to IntlResponse
  response.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
