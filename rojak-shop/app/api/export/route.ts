import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  const { items, cartName } = await req.json()
  if (!items?.length) return NextResponse.json({ error: 'Panier vide' }, { status: 400 })

  const wb = XLSX.utils.book_new()

  // Feuille 1 — Devis complet
  const rows = [
    ['ROJAK FAMILY MARKET — Demande de devis', '', '', '', '', '', '', '', ''],
    [`Singapore spirit. Alpine soul. — Pays de Gex | ${new Date().toLocaleDateString('fr-FR')}`, '', '', '', '', '', '', '', ''],
    [`Liste : ${cartName || 'Sélection produits'}`, '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['Référence', 'Nom produit', 'Marque', 'Conditionnement', 'Catégorie', 'Sous-catégorie', 'Qté demandée', 'Notes', 'Lien catalogue'],
    ...items.map((i: any) => [
      i['Référence'], i['Nom'], i['Marque'], i['Conditionnement'],
      i['Catégorie'], i['Sous-catégorie'], i['Quantité'], i['Notes'], i['Lien'],
    ]),
    ['', '', '', '', '', `TOTAL : ${items.reduce((s: number, i: any) => s + i['Quantité'], 0)} articles`, '', '', ''],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(rows)
  ws1['!cols'] = [{ wch:12 },{ wch:45 },{ wch:18 },{ wch:18 },{ wch:20 },{ wch:25 },{ wch:12 },{ wch:25 },{ wch:50 }]
  ws1['!merges'] = [
    { s:{r:0,c:0}, e:{r:0,c:8} },
    { s:{r:1,c:0}, e:{r:1,c:8} },
    { s:{r:2,c:0}, e:{r:2,c:8} },
  ]
  XLSX.utils.book_append_sheet(wb, ws1, 'Devis')

  // Feuille 2 — Par catégorie
  const byCat: Record<string, any[]> = {}
  items.forEach((i: any) => { const k = i['Catégorie']||'Autre'; if(!byCat[k]) byCat[k]=[]; byCat[k].push(i) })
  const rows2 = [['Catégorie','Sous-catégorie','Référence','Nom','Marque','Conditionnement','Qté']]
  Object.entries(byCat).forEach(([cat, its]) =>
    its.forEach(i => rows2.push([cat, i['Sous-catégorie'], i['Référence'], i['Nom'], i['Marque'], i['Conditionnement'], i['Quantité']])))
  const ws2 = XLSX.utils.aoa_to_sheet(rows2)
  ws2['!cols'] = [{ wch:20 },{ wch:25 },{ wch:12 },{ wch:45 },{ wch:18 },{ wch:18 },{ wch:8 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Par catégorie')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `Rojak_Devis_${new Date().toISOString().slice(0,10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
