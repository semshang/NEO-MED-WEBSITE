import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_img_container = 'className="mt-auto relative w-full flex-1 flex flex-col justify-end h-[200px] lg:h-[280px] shrink-0 mt-2"'
new_img_container = 'className="mt-auto relative w-full flex flex-col justify-end h-[170px] lg:h-[240px] shrink-0 mb-4 mt-2"'
text = text.replace(old_img_container, new_img_container)

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
