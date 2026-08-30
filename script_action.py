import sys

with open("src/components/ProductAction.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('import { Minus, Plus, ShoppingCart } from \'lucide-react\';', 'import { Minus, Plus, ShoppingCart } from \'lucide-react\';\nimport { useTranslations } from "next-intl";')
text = text.replace('export default function ProductAction({ product }: { product: Product }) {\n  const [qty', 'export default function ProductAction({ product }: { product: Product }) {\n  const tShop = useTranslations("shop");\n  const [qty')

reps = {
    'Out of Stock': '{tShop("outOfStock")}',
    'Add to Order': '{tShop("addToOrder")}',
    'Added to Order!': '{tShop("addToOrder")} ✓'
}

for k, v in reps.items():
    text = text.replace(k, v)

with open("src/components/ProductAction.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
