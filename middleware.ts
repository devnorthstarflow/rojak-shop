import { NextRequest, NextResponse } from 'next/server'

const LOGIN = process.env.SHOP_LOGIN ?? 'rojak'
const PASSWORD = process.env.SHOP_PASSWORD ?? 'rojak2027'
const COOKIE = 'rojak_auth'
const SECRET = `${LOGIN}:${PASSWORD}`

export function middleware(req: NextRequest) {
  // API routes — pas de protection
  if (req.nextUrl.pathname.startsWith('/api')) return NextResponse.next()
  // Page de login — pas de protection
  if (req.nextUrl.pathname === '/login') return NextResponse.next()

  // Vérifie le cookie de session
  const auth = req.cookies.get(COOKIE)?.value
  if (auth === SECRET) return NextResponse.next()

  // Redirige vers /login
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
