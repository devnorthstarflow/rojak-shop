import requests, re
url = "https://www.tang-freres.fr/produits-asiatiques/produits-bio/riz/"
s = requests.Session()
s.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
s.headers["Accept-Language"] = "fr-FR,fr;q=0.9"
r = s.get(url, timeout=15)
print(f"Status: {r.status_code} - {len(r.text)} chars")
print(r.text[:800])
matches = re.findall(r'/produits-asiatiques/[^\s\"\'<]{10,80}', r.text)
print(f"\n{len(matches)} URLs trouvees:")
for m in matches[:10]: print(" ", m)
