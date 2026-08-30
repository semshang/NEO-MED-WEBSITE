import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Brutally tighten text on small screens so flex flow leaves a massive gap for the image
text = text.replace('mb-3', 'mb-1 lg:mb-3')
text = text.replace('mb-2 lg:mb-3', 'mb-1 lg:mb-4')
text = text.replace('space-y-2 lg:space-y-3 mb-2', 'space-y-1 lg:space-y-4 mb-1 lg:mb-4')
text = text.replace('p-1.5 lg:p-2', 'p-1 lg:p-3')

# Remove any min-h constraints on the image container so it can grow
text = text.replace('min-h-0', 'min-h-[160px] lg:min-h-0 flex-shrink-0 lg:flex-shrink')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
