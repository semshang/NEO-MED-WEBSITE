import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('mb-6 mt-4 lg:mb-8', 'mb-6 mt-2 lg:mb-8')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
