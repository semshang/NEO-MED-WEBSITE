import sys

with open("src/app/[locale]/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace image
text = text.replace('/hero-monitor.png', '/login-podium-transparent.png')

# Replace floating animation
text = text.replace('animate={{ y: [0, -20, 0] }}', 'animate={{ x: [0, 30, 0] }}')

# Increase the animation duration slightly so it's a smooth slide
text = text.replace('transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}', 'transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}')

# Also update the entrance animation to slide in from left to right if they meant that, but let's just stick to updating the continuous one which matches "slide right slide". Let's actually do both.
# The entrance animation is: initial={{ opacity: 0, x: 50, scale: 0.9 }}
text = text.replace('initial={{ opacity: 0, x: 50, scale: 0.9 }}', 'initial={{ opacity: 0, x: -100, scale: 0.9 }}')

with open("src/app/[locale]/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)
