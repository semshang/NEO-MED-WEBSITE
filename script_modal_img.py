import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Increase image minimum height
text = text.replace('min-h-[100px] overflow-hidden', 'min-h-[160px] lg:min-h-[200px]')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
