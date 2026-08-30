import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make the image slightly shorter so it doesn't overlap the text on small screens, 
# but keep the absolute positioning so it doesn't squish.
text = text.replace('h-[220px] lg:h-[280px]', 'h-[160px] md:h-[180px] lg:h-[240px]')

# Make the floating badge align better
text = text.replace('bottom-6 left-6 lg:bottom-8 lg:left-8', 'bottom-4 left-6 lg:bottom-8 lg:left-8')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
