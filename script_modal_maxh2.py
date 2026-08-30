import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make the modal a bit taller on small screens so the left panel doesn't get squished
text = text.replace('max-h-[95vh] md:max-h-[85vh]', 'max-h-[98vh] md:max-h-[95vh]')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
