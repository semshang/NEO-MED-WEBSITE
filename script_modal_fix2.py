import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('object-contain object-contain', 'object-contain')
text = text.replace('flex-1 flex flex-col justify-end min-h-0 flex-shrink flex-1 overflow-hidden', 'flex-1 flex flex-col justify-end min-h-[100px] overflow-hidden')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
