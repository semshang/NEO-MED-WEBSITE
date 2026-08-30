import sys
import re

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Left panel padding (make it even smaller)
text = text.replace('p-4 lg:p-8', 'p-4 lg:p-6')

# Headline
text = text.replace('text-xl lg:text-3xl', 'text-lg lg:text-2xl')

# Paragraph
text = text.replace('text-[10px] lg:text-sm', 'text-[10px] lg:text-xs')

# Trust points text
text = text.replace('text-xs lg:text-sm', 'text-[10px] lg:text-sm')
text = text.replace('text-[9px] lg:text-xs mt-0.5', 'text-[9px] lg:text-[10px] mt-0.5')

# Certified badge
text = text.replace('text-[10px] lg:text-sm', 'text-[10px] lg:text-xs')
text = text.replace('text-[8px] lg:text-xs mt-0.5', 'text-[8px] lg:text-[9px] mt-0.5')

# Image container max-height - ensure it is fully allowed to fit
text = text.replace('max-h-[180px] lg:max-h-[260px]', 'max-h-[140px] lg:max-h-[220px]')
text = text.replace('max-h-[180px]', 'max-h-[220px]') # in case the previous one missed

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
