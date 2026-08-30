import sys

def prepend_import(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    if 'import { useTranslations } from "next-intl";' not in text:
        text = text.replace('"use client";', '"use client";\nimport { useTranslations } from "next-intl";')
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text)

prepend_import("src/app/[locale]/contact/page.tsx")
prepend_import("src/app/[locale]/shop/page.tsx")

print("done")
