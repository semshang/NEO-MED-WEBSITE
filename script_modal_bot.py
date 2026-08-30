import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('className="w-full h-full object-contain object-center drop-shadow-xl"', 'className="w-full h-full object-contain object-bottom drop-shadow-xl"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
