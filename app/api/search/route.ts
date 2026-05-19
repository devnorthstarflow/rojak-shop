import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types'
import fs from 'fs'
import path from 'path'

const PAGE_SIZE = 30

export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get('q')?.toLowerCase().trim() ?? ''
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], maxPage: 1, total: 0 })
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'products.json')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ products: [], maxPage: 1, total: 0, error: 'No catalogue yet' })
    }
    const all: Product[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const filtered = all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.ref && p.ref.includes(q)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
    const total   = filtered.length
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const slice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return NextResponse.json({ products: slice, maxPage, total })
  } catch (err) {
    return NextResponse.json({ error: String(err), products: [], maxPage: 1, total: 0 }, { status: 500 })
  }
}
