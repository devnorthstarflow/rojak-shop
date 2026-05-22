import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(req: NextRequest) {
  const { items, cartName } = await req.json()

  if (!items?.length) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
  }

  const workbook = new ExcelJS.Workbook()

  // Feuille 1 — Devis complet
  const devisSheet = workbook.addWorksheet('Devis')

  devisSheet.addRow([
    'ROJAK FAMILY MARKET — Demande de devis',
    '', '', '', '', '', '', '', '',
  ])

  devisSheet.addRow([
    `Singapore spirit. Alpine soul. — Pays de Gex | ${new Date().toLocaleDateString('fr-FR')}`,
    '', '', '', '', '', '', '', '',
  ])

  devisSheet.addRow([
    `Liste : ${cartName || 'Sélection produits'}`,
    '', '', '', '', '', '', '', '',
  ])

  devisSheet.addRow([])

  devisSheet.addRow([
    'Référence',
    'Nom produit',
    'Marque',
    'Conditionnement',
    'Catégorie',
    'Sous-catégorie',
    'Qté demandée',
    'Notes',
    'Lien catalogue',
  ])

  for (const item of items) {
    devisSheet.addRow([
      item['Référence'],
      item['Nom'],
      item['Marque'],
      item['Conditionnement'],
      item['Catégorie'],
      item['Sous-catégorie'],
      item['Quantité'],
      item['Notes'],
      item['Lien'],
    ])
  }

  const totalQuantity = items.reduce(
    (sum: number, item: any) => sum + Number(item['Quantité'] || 0),
    0
  )

  devisSheet.addRow([
    '', '', '', '', '',
    `TOTAL : ${totalQuantity} articles`,
    '', '', '',
  ])

  devisSheet.columns = [
    { width: 12 },
    { width: 45 },
    { width: 18 },
    { width: 18 },
    { width: 20 },
    { width: 25 },
    { width: 12 },
    { width: 25 },
    { width: 50 },
  ]

  devisSheet.mergeCells('A1:I1')
  devisSheet.mergeCells('A2:I2')
  devisSheet.mergeCells('A3:I3')

  devisSheet.getRow(1).font = { bold: true, size: 14 }
  devisSheet.getRow(5).font = { bold: true }

  // Feuille 2 — Par catégorie
  const categorySheet = workbook.addWorksheet('Par catégorie')

  categorySheet.addRow([
    'Catégorie',
    'Sous-catégorie',
    'Référence',
    'Nom',
    'Marque',
    'Conditionnement',
    'Qté',
  ])

  const byCat: Record<string, any[]> = {}

  for (const item of items) {
    const category = item['Catégorie'] || 'Autre'

    if (!byCat[category]) {
      byCat[category] = []
    }

    byCat[category].push(item)
  }

  for (const [category, categoryItems] of Object.entries(byCat)) {
    for (const item of categoryItems) {
      categorySheet.addRow([
        category,
        item['Sous-catégorie'],
        item['Référence'],
        item['Nom'],
        item['Marque'],
        item['Conditionnement'],
        item['Quantité'],
      ])
    }
  }

  categorySheet.columns = [
    { width: 20 },
    { width: 25 },
    { width: 12 },
    { width: 45 },
    { width: 18 },
    { width: 18 },
    { width: 8 },
  ]

  categorySheet.getRow(1).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `Rojak_Devis_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}