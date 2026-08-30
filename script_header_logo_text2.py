import sys

with open("src/components/Header.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('text-slate-500 uppercase', 'text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green uppercase')

with open("src/components/Header.tsx", "w", encoding="utf-8") as f:
    f.write(text)
