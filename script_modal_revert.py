import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Revert modal container height
text = text.replace('min-h-[600px]', 'max-h-[95vh] md:max-h-[85vh]')

# Adjust image container to be flexible but prefer a good height
text = text.replace('min-h-[180px] lg:min-h-[240px]', 'min-h-[120px] lg:min-h-[160px]')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
