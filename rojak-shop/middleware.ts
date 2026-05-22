import { NextRequest, NextResponse } from 'next/server'

function getUsers(): Record<string, string> {
  const multi = process.env.SHOP_USERS
  if (multi) {
    return Object.fromEntries(
      multi.split(',').map(pair => {
        const [l, ...rest] = pair.trim().split(':')
        return [l, rest.join(':')]
      })
    )
  }
  const login = process.env.SHOP_LOGIN ?? 'rojak'
  const password = process.env.SHOP_PASSWORD ?? 'rojak2027'
  return { [login]: password }
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api')) return NextResponse.next()
  if (req.nextUrl.pathname === '/login') return NextResponse.next()

  const cookie = req.cookies.get('rojak_auth')?.value
  if (cookie) {
    const [login, ...rest] = cookie.split(':')
    const password = rest.join(':')
    const users = getUsers()
    if (users[login] === password) return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
