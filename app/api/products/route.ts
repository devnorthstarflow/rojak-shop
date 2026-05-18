import { NextRequest, NextResponse } from 'next/server'
import { fetchSubcategoryPage } from '@/lib/scraper'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const url = searchParams.get('url')
  const page = parseInt(searchParams.get('page') ?? '1')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  try {
    const data = await fetchSubcategoryPage(url, page)
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fetch failed', products: [], maxPage: 1 }, { status: 500 })
  }
}
