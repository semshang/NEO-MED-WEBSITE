import sys

with open("src/app/[locale]/shop/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('import { Search, Filter, ShoppingCart, Info, Activity, Wind, Zap } from "lucide-react";', 'import { Search, Filter, ShoppingCart, Info, Activity, Wind, Zap } from "lucide-react";\nimport { useTranslations } from "next-intl";')
text = text.replace('export default function Shop() {\n  const { products }', 'export default function Shop() {\n  const tShop = useTranslations("shop");\n  const tNav = useTranslations("nav");\n  const { products }')

reps = {
    'Search products...': '{tShop("search")}',
    'Categories': '{tShop("categories")}',
    'All Products': '{tShop("allProducts")}',
    'Patient Monitors': '{tShop("category.patient-monitor")}',
    'Ventilators': '{tShop("category.ventilator")}',
    'Defibrillators': '{tShop("category.defibrillator")}',
    'Infusion Pumps': '{tShop("category.infusion-pump")}',
    'ECG Machines': '{tShop("category.ecg")}',
    'No products found matching your search.': '{tShop("noProducts")}'
}

for k, v in reps.items():
    text = text.replace(k, v)

with open("src/app/[locale]/shop/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
