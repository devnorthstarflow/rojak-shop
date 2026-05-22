# Rojak Family Market — Boutique 🦁

> *Singapore spirit. Alpine soul.*  
> Food market asiatique premium — Pays de Gex, frontière Genève

## Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Zustand** — panier persistant (localStorage)
- **Tailwind CSS** — design system Rojak (vert #1C3928, or #C4A052)
- API route `/api/products` — scrape tang-freres.fr côté serveur avec cache 1h

## Déploiement Vercel (2 min)

### Via GitHub (recommandé)
```bash
git init && git add . && git commit -m "🦁 Rojak Family Market — boutique v1"
# Crée un repo sur github.com, puis :
git remote add origin https://github.com/TON_USER/rojak-shop.git
git push -u origin main
# → vercel.com > Add New Project > importer le repo > Deploy
```

### Via CLI
```bash
npm i -g vercel && vercel
```

## Développement local
```bash
npm install
npm run dev
# → http://localhost:3000
```

## Fonctionnalités
- 🏮 Navigation par 40+ sous-catégories (sidebar + mobile)
- 🛒 Panier persistant avec compteur animé
- 📋 "Copier ma liste" — copie les références en un clic
- 🔗 Lien direct vers chaque produit (source tang-freres.fr)
- ⚡ Cache serveur 1h — rapide et respectueux du site source
- 📱 Responsive (mobile sidebar en overlay)
- 🎨 Design fidèle au deck Rojak : vert foncé, or, typographie Syne

## À faire (post-partenariat)
- [ ] Intégrer les vrais prix (API fournisseur)
- [ ] Checkout Stripe
- [ ] Gestion des stocks en temps réel
- [ ] Compte client / historique de commandes
- [ ] Livraison / retrait en magasin
