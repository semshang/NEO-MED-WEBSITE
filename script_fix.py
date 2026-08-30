import sys
import re

with open("src/app/[locale]/shop/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('"{tShop(\"search\")}"', '{tShop("search")}')
text = text.replace('"{tShop(\"categories\")}"', '{tShop("categories")}')
text = text.replace('"{tShop(\"allProducts\")}"', '{tShop("allProducts")}')

with open("src/app/[locale]/shop/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('"{tAuth(\"emailPlaceholder\")}"', '{tAuth("emailPlaceholder")}')
text = text.replace('"{tAuth(\"passwordPlaceholder\")}"', '{tAuth("passwordPlaceholder")}')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
