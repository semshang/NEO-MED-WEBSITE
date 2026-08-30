import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Fix logo path
text = text.replace('src="/logo.png"', 'src="/logo-transparent.png"')

# Remove overflow-y-auto from left panel
text = text.replace('p-8 lg:p-12 relative overflow-y-auto custom-scrollbar', 'p-6 lg:p-10 relative overflow-hidden')

# Remove min-h-max from inner container to allow it to shrink
text = text.replace('relative z-10 flex flex-col h-full min-h-max', 'relative z-10 flex flex-col h-full')

# Reduce paddings and margins slightly to prevent scrolling
text = text.replace('mb-6 lg:mb-8', 'mb-4 lg:mb-8')
text = text.replace('mb-8', 'mb-4 lg:mb-8')
text = text.replace('space-y-4 lg:space-y-5', 'space-y-3 lg:space-y-4')

# Allow image to shrink so it doesn't force a scrollbar, but keep it in flex flow
text = text.replace('w-full flex justify-center items-center h-[200px] lg:h-[260px] shrink-0 mb-6', 'w-full flex-1 flex justify-center items-end min-h-[140px] max-h-[220px] lg:max-h-[260px] mb-4 lg:mb-6')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
