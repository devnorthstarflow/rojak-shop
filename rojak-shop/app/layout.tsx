import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rojak Family Market — Épicerie Asiatique Premium',
  description: 'Le hawker center singapourien face aux Alpes. Épicerie fine asiatique, produits frais, sauces authentiques — Pays de Gex.',
  openGraph: {
    title: 'Rojak Family Market',
    description: 'Singapore spirit. Alpine soul. — Épicerie asiatique premium, Pays de Gex.',
    siteName: 'Rojak Family Market',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:wght@600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
