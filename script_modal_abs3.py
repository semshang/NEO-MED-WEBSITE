import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('className="space-y-3 lg:space-y-4 mb-4 lg:mb-6 relative z-20"', 'className="space-y-2 lg:space-y-3 mb-2 relative z-20"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
