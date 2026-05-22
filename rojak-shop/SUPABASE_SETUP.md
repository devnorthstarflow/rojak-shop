# Configuration Supabase — Rojak Shop

## 1. Créer un projet Supabase (gratuit)

1. Va sur **supabase.com** → "New project"
2. Nom : `rojak-shop` | Région : `West EU (Ireland)`
3. Mot de passe DB : génère-en un fort et garde-le

## 2. Créer les tables

1. Dashboard Supabase → **SQL Editor** → "New query"
2. Colle le contenu de `lib/supabase-schema.sql`
3. Clique **Run**

## 3. Récupérer les clés

Dashboard → **Settings → API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `service_role` → `SUPABASE_SERVICE_KEY` (pour l'import)

## 4. Configurer les variables

### Local (`.env.local`) :
```
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
SHOP_LOGIN=rojak
SHOP_PASSWORD=tonMotDePasse
```

### Sur Vercel :
Settings → Environment Variables → ajouter les 4 variables ci-dessus

## 5. Importer les produits

```bash
node scripts/import-to-supabase.mjs
```
→ Importe les 2275 produits depuis `public/products.json`

## 6. Télécharger les images (optionnel mais recommandé)

```bash
# Installe sharp pour la compression WebP
npm install sharp

# Télécharge et compresse toutes les images (30-45 min)
node scripts/download-images.mjs

# Met à jour les chemins dans products.json
node scripts/update-img-paths.mjs

# Push les images sur GitHub
git add public/images/ public/products.json
git commit -m "📸 Images produits optimisées WebP"
git push
```

## Résultat attendu
- Images : ~200KB → ~12KB chacune = **94% plus rapides**
- 2275 produits × 12KB = ~27MB au total dans `/public/images/`

## Workflow devis

1. Naviguer le catalogue → cliquer "Ajouter" sur les produits
2. Ouvrir le panier → donner un nom au devis
3. Ajouter des notes par article si besoin
4. Cliquer **"Exporter en Excel"**
5. Envoyer le fichier `.xlsx` au fournisseur Tang Frères
