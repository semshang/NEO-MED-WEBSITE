import sys

with open("src/app/[locale]/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('pt-24 pb-24 flex flex-col', 'pt-12 md:pt-16 pb-16 md:pb-24 flex flex-col')

with open("src/app/[locale]/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)
