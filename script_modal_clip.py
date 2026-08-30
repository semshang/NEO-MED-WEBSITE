import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Reduce image size and use flex-1 min-h-0 to mathematically prevent overflow clipping
old_img = 'className="mt-auto relative w-full flex flex-col justify-end h-[170px] lg:h-[240px] shrink-0 mb-4 mt-2"'
new_img = 'className="mt-auto relative w-full flex-1 flex flex-col justify-end min-h-0 max-h-[120px] lg:max-h-[180px] mb-6 mt-4 lg:mb-8"'
text = text.replace(old_img, new_img)

# 2. Make sure the left panel inner container isn't artificially constrained
# Sometimes `h-full` combined with `flex flex-col` inside an implicitly stretched flex child causes overflow issues.
text = text.replace('className="relative z-10 flex flex-col h-full"', 'className="relative z-10 flex flex-col h-full overflow-visible"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
