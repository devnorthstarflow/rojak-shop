import { NextRequest, NextResponse } from 'next/server'

// Supporte plusieurs users : SHOP_USERS="login1:pass1,login2:pass2"
// Ou fallback sur SHOP_LOGIN / SHOP_PASSWORD pour un seul user
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

export async function POST(req: NextRequest) {
  const { login, password } = await req.json()
  const users = getUsers()

  if (!users[login] || users[login] !== password) {
    // Délai anti-brute force
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('rojak_auth', `${login}:${password}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
  })
  return res
}
