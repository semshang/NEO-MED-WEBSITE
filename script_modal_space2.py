import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace mt-8 with mt-5
text = text.replace('className="mt-8 text-center"', 'className="mt-5 text-center"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
