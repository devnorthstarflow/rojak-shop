#!/usr/bin/env python3
"""
Rojak Shop — Tang Frères Catalogue Scraper
Lance : py scraper/scrape.py
Génère : public/products.json
"""
import re, json, time, sys, os

# On utilise requests si disponible, sinon urllib
try:
    import requests
    USE_REQUESTS = True
except ImportError:
    from urllib.request import urlopen, Request
    from urllib.error import HTTPError, URLError
    USE_REQUESTS = False

BASE  = "https://www.tang-freres.fr"
OUT   = os.path.join(os.path.dirname(__file__), "..", "public", "products.json")
DELAY = 1.5

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

# Headers qui imitent un vrai navigateur Chrome
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    "Referer": "https://www.tang-freres.fr/",
}

SESSION = None

def get_session():
    global SESSION
    if USE_REQUESTS and SESSION is None:
        SESSION = requests.Session()
        SESSION.headers.update(HEADERS)
        # Visite la home d'abord pour obtenir les cookies
        try:
            SESSION.get(BASE, timeout=15)
            time.sleep(1)
        except:
            pass
    return SESSION

def fetch(url, retries=3):
    for i in range(retries):
        try:
            if USE_REQUESTS:
                s = get_session()
                r = s.get(url, timeout=20, allow_redirects=True)
                if r.status_code == 200:
                    return r.text
                print(f"  HTTP {r.status_code}", flush=True)
            else:
                from urllib.request import urlopen, Request
                req = Request(url, headers=HEADERS)
                with urlopen(req, timeout=20) as r:
                    raw = r.read()
                    # Décompresse si gzip
                    if r.info().get('Content-Encoding') == 'gzip':
                        import gzip
                        raw = gzip.decompress(raw)
                    return raw.decode("utf-8", errors="replace")
        except Exception as e:
            if i == retries - 1:
                print(f"  ✗ {e}", flush=True)
                return None
            time.sleep(2 ** i)
    return None

def parse(html, cat, subcat):
    """
    Deux patterns détectés sur tang-freres.fr :

    Pattern A (avec img dans le lien) :
      <a href="/produits-asiatiques/.../NOM-REF/"><img src="...REF-WxH.ext"><h2>NOM</h2></a>

    Pattern B (markdown-style extrait du HTML rendu) :
      [produits - REF.png NOM](URL)
    """
    prods, seen = [], set()

    # ── Pattern A : blocs <a href> contenant <img> et <h2> ──────────────────
    block_re = re.compile(
        r'<a\s[^>]*href="(/produits-asiatiques/[^"]+?-(\d{5,6})\/?)"[^>]*>(.*?)</a>',
        re.DOTALL | re.IGNORECASE
    )
    img_re = re.compile(
        r'src="(https?://[^"]*(?:wp-content/uploads/produits/)[^"]+?\.(jpg|png|webp))"',
        re.I
    )
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

    # ── Pattern B : liens produits sans <h2> (fallback) ─────────────────────
    # Cherche href produit + alt ou texte adjacent
    if not prods:
        # Cherche toutes les URLs produits dans le HTML
        url_re = re.compile(
            r'href="(/produits-asiatiques/[^"]+?-(\d{5,6})/?)"'
        )
        alt_re = re.compile(r'alt="([^"]{5,})"')
        img2_re = re.compile(
            r'(/wp-content/uploads/produits/(\d{5,6})[^"]*?\.(jpg|png|webp))'
        )
        for m in url_re.finditer(html):
            path, ref = m.group(1), m.group(2)
            if path in seen: continue
            # Cherche une image avec ce ref
            img_match = re.search(
                rf'/wp-content/uploads/produits/{ref}[^"]*?\.(jpg|png|webp)',
                html
            )
            img_src = (f"{BASE}{img_match.group(0)}" if img_match
                       else f"{BASE}/wp-content/uploads/produits/{ref}.jpg")
            img_src = re.sub(r"-\d+x\d+(\.(jpg|png|webp))", r"\1", img_src)
            # Cherche le nom dans le contexte autour du lien (200 chars)
            ctx_start = max(0, m.start() - 50)
            ctx_end   = min(len(html), m.end() + 300)
            ctx = html[ctx_start:ctx_end]
            h2 = h2_re.search(ctx)
            if h2:
                name = tag_re.sub("", h2.group(1)).strip()
                name = re.sub(r"\s+", " ", name)
            else:
                # Construit un nom depuis le slug URL
                slug = path.rstrip("/").split("/")[-1]
                slug = re.sub(rf"-{ref}$", "", slug)
                name = slug.replace("-", " ").title()
            if len(name) < 3: continue
            seen.add(path)
            prods.append({"id": ref, "name": name, "ref": ref,
                          "img": img_src, "url": BASE + path,
                          "category": cat, "subcategory": subcat})

    pages = [int(x) for x in re.findall(r'\?n=(\d+)', html)]
    return prods, max(pages, default=1)


def debug_html(html, url):
    """Affiche des infos de debug si 0 produits trouvés"""
    print(f"  ⚠ HTML reçu : {len(html)} chars", flush=True)
    # Cherche des indices
    if "tang-freres" in html.lower():
        print(f"  ✓ Domaine reconnu", flush=True)
    if "produits-asiatiques" in html:
        print(f"  ✓ URLs produits présentes dans le HTML", flush=True)
        # Montre un exemple
        m = re.search(r'/produits-asiatiques/[^\s"]{20,60}', html)
        if m:
            print(f"  ex: {m.group(0)}", flush=True)
    if "wp-content/uploads/produits" in html:
        print(f"  ✓ Images produits présentes", flush=True)
    if "<h2" in html.lower():
        print(f"  ✓ Balises h2 présentes", flush=True)
    # Montre les 300 premiers chars utiles
    body_start = html.find("<body")
    if body_start > 0:
        print(f"  body[0:200]: {html[body_start:body_start+200]!r}", flush=True)


# ── Main ──────────────────────────────────────────────────────────────────────
print("🦁 Rojak Shop — Tang Frères Scraper")
print(f"   Mode : {'requests' if USE_REQUESTS else 'urllib'}")
print("=" * 50)

# Installe requests si absent
if not USE_REQUESTS:
    print("\n💡 Pour de meilleurs résultats, installe requests :")
    print("   py -m pip install requests")
    print("   Puis relance le scraper.\n")

all_products, seen_ids = [], set()
debug_done = False

for cat, subcat, path in SUBCATS:
    print(f"\n📂 {cat} › {subcat}", flush=True)
    html = fetch(BASE + path)
    if not html:
        continue

    prods, max_page = parse(html, cat, subcat)

    # Debug sur le premier échec
    if not prods and not debug_done:
        debug_html(html, BASE + path)
        debug_done = True

    print(f"  p1 → {len(prods)} produits  ({max_page} pages)", flush=True)

    for p in range(2, min(max_page + 1, 61)):
        time.sleep(DELAY)
        html = fetch(f"{BASE}{path}?n={p}")
        if not html: break
        more, _ = parse(html, cat, subcat)
        prods.extend(more)
        print(f"  p{p} → +{len(more)}", flush=True)
        time.sleep(DELAY)

    new = 0
    for prod in prods:
        if prod["id"] not in seen_ids:
            seen_ids.add(prod["id"])
            all_products.append(prod)
            new += 1
    print(f"  ✓ {new} nouveaux | Total: {len(all_products)}", flush=True)

# ── Écriture ──────────────────────────────────────────────────────────────────
unique = list({p["id"]: p for p in all_products}.values())
out_path = os.path.abspath(OUT)
os.makedirs(os.path.dirname(out_path), exist_ok=True)

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(unique, f, ensure_ascii=False, separators=(",", ":"))

print(f"\n{'='*50}")
print(f"✅ {len(unique)} produits → {out_path}")
print(f"   Taille : {os.path.getsize(out_path)/1024:.0f} KB")
if len(unique) == 0:
    print("\n⚠️  0 produits récupérés.")
    print("   → Lance d'abord : py -m pip install requests")
    print("   → Puis relance  : py scraper/scrape.py")
else:
    print(f"\n   ➜  git add public/products.json")
    print(f"      git commit -m '🛒 Catalogue {len(unique)} produits'")
    print(f"      git push")
