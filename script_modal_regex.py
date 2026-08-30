import sys
import re

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Headline
text = re.sub(r'text-lg lg:text-2xl', r'text-lg lg:text-xl', text)

# 2. Trust badges titles (they are currently text-xs lg:text-base or text-sm lg:text-base)
text = re.sub(r'text-[a-z]+ lg:text-base', r'text-[10px] lg:text-[11px]', text)
text = re.sub(r'text-xs lg:text-base', r'text-[10px] lg:text-[11px]', text)
text = re.sub(r'text-sm lg:text-base', r'text-[10px] lg:text-[11px]', text)

# 3. Margins on the left panel content (compress them heavily)
text = text.replace('mb-2 lg:mb-4', 'mb-1 lg:mb-2')
text = text.replace('mb-4 lg:mb-8', 'mb-2 lg:mb-4')
text = text.replace('space-y-2 lg:space-y-4', 'space-y-1 lg:space-y-2')

# 4. Make sure icons are smaller
text = text.replace('lg:w-5 lg:h-5', 'lg:w-4 lg:h-4')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
