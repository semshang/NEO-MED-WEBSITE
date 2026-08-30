import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Shrink text slightly on small screens to fit without scrolling
text = text.replace('text-3xl lg:text-4xl', 'text-2xl lg:text-4xl')
text = text.replace('text-sm lg:text-base', 'text-xs lg:text-base')
text = text.replace('p-2.5 rounded-xl', 'p-2 lg:p-2.5 rounded-xl')
text = text.replace('text-xs lg:text-sm mt-0.5', 'text-[10px] lg:text-sm mt-0.5')
text = text.replace('p-3 lg:p-4 rounded-xl shadow-sm flex items-center space-x-3 w-full border border-slate-100', 'p-2 lg:p-4 rounded-xl shadow-sm flex items-center space-x-2 lg:space-x-3 w-full border border-slate-100 mt-auto')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
