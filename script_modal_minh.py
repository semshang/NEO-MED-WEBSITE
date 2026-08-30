import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('min-h-[120px] lg:min-h-[160px]', 'min-h-0')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
