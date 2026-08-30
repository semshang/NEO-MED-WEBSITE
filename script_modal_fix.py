import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add LanguageSwitcher import
text = text.replace('import { useTranslations } from "next-intl";', 'import { useTranslations } from "next-intl";\nimport LanguageSwitcher from "@/components/LanguageSwitcher";')

# Replace the static mock with the actual LanguageSwitcher
static_lang = """<div className="flex items-center space-x-1 text-slate-500 text-sm hover:bg-slate-50 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <Globe size={16} />
                  <span className="font-medium">English</span>
                  <ChevronDown size={14} className="ml-1" />
                </div>"""

text = text.replace(static_lang, '<LanguageSwitcher />')

# Fix image cutoff issue by giving it a better container flex and min-h-0
# The image container is currently:
old_img_container = """<div className="mt-auto relative w-full flex-1 flex flex-col justify-end">"""
new_img_container = """<div className="mt-auto relative w-full flex-1 flex flex-col justify-end min-h-[120px]">"""
text = text.replace(old_img_container, new_img_container)

old_img_class = """className="w-full max-h-[180px] lg:max-h-[240px] object-contain object-bottom relative z-10 drop-shadow-xl\""""
new_img_class = """className="w-full h-full max-h-[180px] lg:max-h-[240px] object-contain object-bottom relative z-10 drop-shadow-xl\""""
text = text.replace(old_img_class, new_img_class)

# Fix right side scrolling by reducing margins and padding to make it fit better on smaller screens
old_right_panel = """<div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col overflow-y-auto">"""
new_right_panel = """<div className="w-full md:w-1/2 p-6 sm:p-8 lg:px-12 lg:py-8 flex flex-col overflow-y-auto custom-scrollbar">"""
text = text.replace(old_right_panel, new_right_panel)

# Also let's reduce the space in the top bar to save vertical space
text = text.replace('className="flex justify-between items-center mb-6 lg:mb-10 w-full pr-10"', 'className="flex justify-end items-center mb-4 lg:mb-6 w-full pr-10"')

# The close button also overlaps if we aren't careful
text = text.replace('className="absolute top-4 right-4 z-50 w-10 h-10', 'className="absolute top-4 right-4 z-50 w-8 h-8 lg:w-10 lg:h-10')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
