import sys
import re

with open("src/app/[locale]/shop/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('{tShop("allProducts")}', 'tShop("allProducts")')
# Wait, if it was in JSX it would have been >{tShop("allProducts")}<
# Let's just fix the specific bad lines using regex.
text = re.sub(r'useState\(\{tShop\("allProducts"\)\}\)', 'useState(tShop("allProducts"))', text)
text = re.sub(r'activeCategory === \{tShop\("allProducts"\)\}', 'activeCategory === tShop("allProducts")', text)
text = re.sub(r'\[\{tShop\("allProducts"\)\},', '[tShop("allProducts"),', text)
text = re.sub(r'\{tShop\("category\.(.*?)"\)\}', r'tShop("category.\1")', text)

with open("src/app/[locale]/shop/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
