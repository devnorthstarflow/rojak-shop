import asyncio, json, os, re
from playwright.async_api import async_playwright

BASE = "https://www.tang-freres.fr"
OUT  = "public/products.json"

SUBCATS = [
  ("BIO","Riz BIO","/produits-asiatiques/produits-bio/riz/"),
  ("BIO","Noix de Coco","/produits-asiatiques/produits-bio/coco/"),
  ("BIO","Crackers de riz","/produits-asiatiques/produits-bio/crackers-de-riz/"),
  ("Epicerie","Riz Cereales Legumineuses","/produits-asiatiques/epicerie/riz-cereales-legumineuses/"),
  ("Epicerie","Soupes Nouilles","/produits-asiatiques/epicerie/soupes-nouilles-instantanees/"),
  ("Epicerie","Sauces","/produits-asiatiques/epicerie/sauces/"),
  ("Epicerie","Conserves","/produits-asiatiques/epicerie/conserves/"),
  ("Epicerie","Snacks Desserts","/produits-asiatiques/epicerie/snacks-desserts/"),
  ("Epicerie","Galettes Pates Vermicelles","/produits-asiatiques/epicerie/galettes-pates-vermicelles/"),
  ("Epicerie","Epices Assaisonnements","/produits-asiatiques/epicerie/epices-assaisonnements/"),
  ("Epicerie","Thes Infusions","/produits-asiatiques/epicerie/the-infusions-instantanes/"),
  ("Epicerie","Huiles Vinaigres","/produits-asiatiques/epicerie/huiles-vinaigres-alcools-culinaires/"),
  ("Epicerie","Legumes Fruits Seches","/produits-asiatiques/epicerie/legumes-fruits-plantes-seches/"),
  ("Epicerie","Farines","/produits-asiatiques/epicerie/farines-aides-culinaires/"),
  ("Surgeles","Dimsum vapeur","/produits-asiatiques/surgeles/dimsum-vapeur/"),
  ("Surgeles","Dimsum bouilli","/produits-asiatiques/surgeles/dimsum-bouilli/"),
  ("Surgeles","Poissons","/produits-asiatiques/surgeles/poissons/"),
  ("Surgeles","Crevettes Crabes","/produits-asiatiques/surgeles/crevettes-crabes/"),
  ("Surgeles","Plats prepares","/produits-asiatiques/surgeles/plats-prepares/"),
  ("Surgeles","Viandes Volailles","/produits-asiatiques/surgeles/viandes-volailles/"),
  ("Boissons","Bieres","/produits-asiatiques/boissons/bieres/"),
  ("Boissons","Jus de coco","/produits-asiatiques/boissons/jus-noix-coco/"),
  ("Boissons","Boissons au the","/produits-asiatiques/boissons/boissons-au-the/"),
  ("Boissons","Boissons gazeuses","/produits-asiatiques/boissons/boissons-gazeuses-sodas/"),
  ("Divers","Cuisson Ustensiles","/produits-asiatiques/divers/cuisson-ustensiles/"),
]

async def scrape():
    all_prods, seen = [], set()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
            locale="fr-FR"
        )
        page = await ctx.new_page()

        for cat, subcat, path in SUBCATS:
            print(f"\n📂 {cat} > {subcat}", flush=True)
            try:
                await page.goto(BASE + path, wait_until="networkidle", timeout=30000)
                # Attend que les produits soient chargés
                await page.wait_for_selector("a[href*='/produits-asiatiques/'] h2", timeout=15000)
            except:
                print("  timeout — on continue", flush=True)

            # Detecte le nb de pages
            pages_text = await page.locator("a[href*='?n=']").all_text_contents()
            page_nums = [int(x) for x in pages_text if x.strip().isdigit()]
            max_page = max(page_nums, default=1)
            print(f"  {max_page} page(s)", flush=True)

            for pg in range(1, min(max_page + 1, 51)):
                if pg > 1:
                    try:
                        await page.goto(BASE + path + f"?n={pg}", wait_until="networkidle", timeout=30000)
                        await page.wait_for_selector("a[href*='/produits-asiatiques/'] h2", timeout=10000)
                    except:
                        break

                cards = await page.locator("a[href*='/produits-asiatiques/']").all()
                count = 0
                for card in cards:
                    href = await card.get_attribute("href") or ""
                    m = re.search(r'-(\d{5,6})/?$', href)
                    if not m or href in seen: continue
                    ref = m.group(1)
                    h2 = card.locator("h2")
                    if not await h2.count(): continue
                    name = (await h2.text_content() or "").strip()
                    if not name or len(name) < 3: continue
                    img_el = card.locator("img")
                    img_src = ""
                    if await img_el.count():
                        img_src = await img_el.get_attribute("src") or ""
                        img_src = re.sub(r"-\d+x\d+(\.(jpg|png|webp))", r"\1", img_src)
                    if not img_src:
                        img_src = f"{BASE}/wp-content/uploads/produits/{ref}.jpg"
                    seen.add(href)
                    all_prods.append({"id":ref,"name":name,"ref":ref,
                                      "img":img_src,"url":BASE+href,
                                      "category":cat,"subcategory":subcat})
                    count += 1
                print(f"  p{pg} -> {count} produits | total: {len(all_prods)}", flush=True)

        await browser.close()

    os.makedirs("public", exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(all_prods, f, ensure_ascii=False, separators=(",",":"))
    print(f"\n✅ {len(all_prods)} produits -> {OUT}")

asyncio.run(scrape())
