import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace mt-4 lg:mt-auto with solid margin mt-8
text = text.replace('className="mt-4 lg:mt-auto text-center"', 'className="mt-8 text-center"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
