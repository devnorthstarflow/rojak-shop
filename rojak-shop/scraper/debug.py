#!/usr/bin/env python3
"""Debug — montre ce que Tang Frères renvoie exactement"""
import requests

url = "https://www.tang-freres.fr/produits-asiatiques/produits-bio/riz/"

s = requests.Session()
s.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9",
})

r = s.get(url, timeout=15)
print(f"Status  : {r.status_code}")
print(f"Taille  : {len(r.text)} chars")
print(f"Encoding: {r.encoding}")
print(f"\n--- 500 premiers caractères ---")
print(r.text[:500])
print(f"\n--- Cherche 'produits-asiatiques' dans le HTML ---")
import re
matches = re.findall(r'/produits-asiatiques/[^\s"\'<]{10,80}', r.text)
print(f"Trouvé {len(matches)} URLs produits")
for m in matches[:10]:
    print(f"  {m}")
