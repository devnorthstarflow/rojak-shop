import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { login, password } = await req.json()

  const validLogin = process.env.SHOP_LOGIN ?? 'rojak'
  const validPassword = process.env.SHOP_PASSWORD ?? 'rojak2027'

  if (login !== validLogin || password !== validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const secret = `${validLogin}:${validPassword}`
  const res = NextResponse.json({ ok: true })

  res.cookies.set('rojak_auth', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
  })

  return res
}
