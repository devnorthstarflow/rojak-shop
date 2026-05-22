#!/usr/bin/env python3
"""
Rojak Shop — Tang Frères Catalogue Scraper
==========================================
Lance : python3 scraper/scrape.py
Génère : public/products.json
"""
import re, json, time, sys, os
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

BASE  = "https://www.tang-freres.fr"
OUT   = os.path.join(os.path.dirname(__file__), "../public/products.json")
DELAY = 1.0

SUBCATS = [
  ("BIO",       "Noix de Coco",                "/produits-asiatiques/produits-bio/coco/"),
  ("BIO",       "Pâtes de riz & Nouilles",      "/produits-asiatiques/produits-bio/pates-de-riz-nouilles-et-vermicelles/"),
  ("BIO",       "Riz BIO",                      "/produits-asiatiques/produits-bio/riz/"),
  ("BIO",       "Sauces & Curry BIO",           "/produits-asiatiques/produits-bio/sauces-produits-bio/"),
  ("BIO",       "Champignons & Baies",           "/produits-asiatiques/produits-bio/champignons-baies/"),
  ("BIO",       "Herbes BIO",                   "/produits-asiatiques/produits-bio/herbes/"),
  ("BIO",       "Graines BIO",                  "/produits-asiatiques/produits-bio/graines/"),
  ("BIO",       "Sucres BIO",                   "/produits-asiatiques/produits-bio/sucres/"),
  ("BIO",       "Thé BIO",                      "/produits-asiatiques/produits-bio/the/"),
  ("BIO",       "Crackers de riz",              "/produits-asiatiques/produits-bio/crackers-de-riz/"),
  ("Épicerie",  "Galettes, Pâtes, Vermicelles", "/produits-asiatiques/epicerie/galettes-pates-vermicelles/"),
  ("Épicerie",  "Farines & Aides culinaires",   "/produits-asiatiques/epicerie/farines-aides-culinaires/"),
  ("Épicerie",  "Riz, Céréales, Légumineuses",  "/produits-asiatiques/epicerie/riz-cereales-legumineuses/"),
  ("Épicerie",  "Soupes & Nouilles instant.",    "/produits-asiatiques/epicerie/soupes-nouilles-instantanees/"),
  ("Épicerie",  "Huiles, Vinaigres & Alcools",  "/produits-asiatiques/epicerie/huiles-vinaigres-alcools-culinaires/"),
  ("Épicerie",  "Épices & Assaisonnements",     "/produits-asiatiques/epicerie/epices-assaisonnements/"),
  ("Épicerie",  "Sauces",                       "/produits-asiatiques/epicerie/sauces/"),
  ("Épicerie",  "Conserves",                    "/produits-asiatiques/epicerie/conserves/"),
  ("Épicerie",  "Légumes & Fruits séchés",      "/produits-asiatiques/epicerie/legumes-fruits-plantes-seches/"),
  ("Épicerie",  "Snacks & Desserts",            "/produits-asiatiques/epicerie/snacks-desserts/"),
  ("Épicerie",  "Thés & Infusions",             "/produits-asiatiques/epicerie/the-infusions-instantanes/"),
  ("Surgelés",  "Dimsum vapeur",                "/produits-asiatiques/surgeles/dimsum-vapeur/"),
  ("Surgelés",  "Dimsum bouilli",               "/produits-asiatiques/surgeles/dimsum-bouilli/"),
  ("Surgelés",  "Dimsum poêlé / frit",          "/produits-asiatiques/surgeles/dimsum-poele-frit/"),
  ("Surgelés",  "Brioches & Galettes",          "/produits-asiatiques/surgeles/brioches-galettes-salees/"),
  ("Surgelés",  "Plats préparés",               "/produits-asiatiques/surgeles/plats-prepares/"),
  ("Surgelés",  "Dérivés riz, blé, soja",       "/produits-asiatiques/surgeles/derives-riz-ble-soja/"),
  ("Surgelés",  "Poissons",                     "/produits-asiatiques/surgeles/poissons/"),
  ("Surgelés",  "Crevettes & Crabes",           "/produits-asiatiques/surgeles/crevettes-crabes/"),
  ("Surgelés",  "Autres fruits de mer",         "/produits-asiatiques/surgeles/fruits-de-mer-grenouilles/"),
  ("Surgelés",  "Viandes & Volailles",          "/produits-asiatiques/surgeles/viandes-volailles/"),
  ("Surgelés",  "Snacks & Desserts surgelés",   "/produits-asiatiques/surgeles/snacks-desserts-surgeles/"),
  ("Surgelés",  "Mollusques",                   "/produits-asiatiques/surgeles/mollusques/"),
  ("Boissons",  "Jus de coco",                  "/produits-asiatiques/boissons/jus-noix-coco/"),
  ("Boissons",  "Jus de fruits",                "/produits-asiatiques/boissons/boisson-base-fruits/"),
  ("Boissons",  "Boissons au thé",              "/produits-asiatiques/boissons/boissons-au-the/"),
  ("Boissons",  "Boissons gazeuses",            "/produits-asiatiques/boissons/boissons-gazeuses-sodas/"),
  ("Boissons",  "Boissons au soja",             "/produits-asiatiques/boissons/boissons-au-soja/"),
  ("Boissons",  "Boissons aux plantes",         "/produits-asiatiques/boissons/boissons-aux-plantes/"),
  ("Boissons",  "Bières",                       "/produits-asiatiques/boissons/bieres/"),
  ("Boissons",  "Sake",                         "/produits-asiatiques/boissons/sake/"),
  ("Boissons",  "Liqueurs",                     "/produits-asiatiques/boissons/liqueurs/"),
  ("Boissons",  "Autres alcools",               "/produits-asiatiques/boissons/autres-alcools/"),
  ("Divers",    "Cuisson & Ustensiles",         "/produits-asiatiques/divers/cuisson-ustensiles/"),
  ("Divers",    "Vaisselle",                    "/produits-asiatiques/divers/vaisselle/"),
  ("Divers",    "Arts de la table",             "/produits-asiatiques/divers/arts-de-la-table/"),
  ("Divers",    "Décoration",                   "/produits-asiatiques/divers/decoration/"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "fr-FR,fr;q=0.9",
    "Referer": "https://www.tang-freres.fr/",
}

def fetch(url, retries=3):
    for i in range(retries):
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=20) as r:
                return r.read().decode("utf-8", errors="replace")
        except (HTTPError, URLError) as e:
            if i == retries - 1:
                print(f"  ✗ {e}", flush=True)
                return None
            time.sleep(2 ** i)

def parse(html, cat, subcat):
    prods, seen = [], set()
    block_re = re.compile(
        r'<a\s[^>]*href="(/produits-asiatiques/[^"]+?-(\d{5,6})\/?)"[^>]*>(.*?)</a>',
        re.DOTALL | re.IGNORECASE
    )
    img_re = re.compile(r'src="(https?://[^"]*(?:produits/|uploads/produits/)[^"]+?\.(jpg|png|webp))"', re.I)
    h2_re  = re.compile(r'<h2[^>]*>(.*?)</h2>', re.DOTALL | re.I)
    tag_re = re.compile(r'<[^>]+>')

    for m in block_re.finditer(html):
        path, ref, inner = m.group(1), m.group(2), m.group(3)
        if path in seen: continue
        h2 = h2_re.search(inner)
        if not h2: continue
        name = tag_re.sub("", h2.group(1)).replace("\n", " ").strip()
        name = re.sub(r"\s+", " ", name)
        if not name or len(name) < 3: continue
        img = img_re.search(inner)
        img_src = img.group(1) if img else f"{BASE}/wp-content/uploads/produits/{ref}.jpg"
        img_src = re.sub(r"-\d+x\d+(\.(jpg|png|webp))", r"\1", img_src)
        seen.add(path)
        prods.append({"id": ref, "name": name, "ref": ref,
                      "img": img_src, "url": BASE + path,
                      "category": cat, "subcategory": subcat})

    pages = [int(x) for x in re.findall(r'\?n=(\d+)', html)]
    return prods, max(pages, default=1)

# ── Main ──────────────────────────────────────────────────────────────────────
print("🦁 Rojak Shop — Tang Frères Scraper")
print("=" * 50)

all_products, seen_ids = [], set()

for cat, subcat, path in SUBCATS:
    print(f"\n📂 {cat} › {subcat}", flush=True)
    html = fetch(BASE + path)
    if not html:
        continue
    prods, max_page = parse(html, cat, subcat)
    print(f"  p1 → {len(prods)} produits  ({max_page} pages)", flush=True)

    for p in range(2, min(max_page + 1, 61)):
        time.sleep(DELAY)
        html = fetch(f"{BASE}{path}?n={p}")
        if not html: break
        more, _ = parse(html, cat, subcat)
        prods.extend(more)
        print(f"  p{p} → +{len(more)}", flush=True)
        time.sleep(DELAY)

    new = sum(1 for p in prods if p["id"] not in seen_ids and not seen_ids.add(p["id"]))
    all_products.extend(p for p in prods if p["id"] in seen_ids)
    print(f"  ✓ {new} nouveaux | Total: {len(all_products)}", flush=True)

# Dédoublonnage final
unique = list({p["id"]: p for p in all_products}.values())

os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(unique, f, ensure_ascii=False, separators=(",", ":"))

print(f"\n✅ {len(unique)} produits → {OUT}")
print(f"   Taille : {os.path.getsize(OUT)/1024:.0f} KB")
print(f"\n   ➜  git add public/products.json")
print(f"      git commit -m '🛒 Catalogue Tang Frères — {len(unique)} produits'")
print(f"      git push")
