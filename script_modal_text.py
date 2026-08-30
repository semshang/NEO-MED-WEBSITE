import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Brutally shrink text sizes for small screens
text = text.replace('className="text-2xl lg:text-3xl font-black text-brand-navy mb-2 lg:mb-3 leading-tight"', 'className="text-xl lg:text-3xl font-black text-brand-navy mb-1 lg:mb-3 leading-tight"')
text = text.replace('className="text-slate-600 text-xs lg:text-sm mb-2 lg:mb-3 max-w-sm"', 'className="text-slate-600 text-[10px] lg:text-sm mb-2 lg:mb-3 max-w-sm leading-snug"')

# Trust Badges
text = text.replace('className="font-bold text-brand-navy text-xs lg:text-sm"', 'className="font-bold text-brand-navy text-[10px] lg:text-sm"')
text = text.replace('className="text-slate-500 text-[10px] lg:text-xs mt-0.5"', 'className="text-slate-500 text-[9px] lg:text-xs leading-tight"')
text = text.replace('className="bg-white p-1 lg:p-3 rounded-xl shadow-sm text-brand-blue shrink-0"', 'className="bg-white p-1.5 lg:p-3 rounded-xl shadow-sm text-brand-blue shrink-0"')
text = text.replace('className="bg-white p-1 lg:p-3 rounded-xl shadow-sm text-brand-green shrink-0"', 'className="bg-white p-1.5 lg:p-3 rounded-xl shadow-sm text-brand-green shrink-0"')
text = text.replace('className="bg-white p-1.5 lg:p-2 rounded-xl shadow-sm text-brand-blue shrink-0"', 'className="bg-white p-1.5 lg:p-3 rounded-xl shadow-sm text-brand-blue shrink-0"')
text = text.replace('className="bg-white p-1.5 lg:p-2 rounded-xl shadow-sm text-brand-green shrink-0"', 'className="bg-white p-1.5 lg:p-3 rounded-xl shadow-sm text-brand-green shrink-0"')


# Force image to have a fixed height in flex flow so it never gets tiny
text = text.replace('min-h-[160px] lg:min-h-0 flex-shrink-0 lg:flex-shrink', 'h-[200px] lg:h-[280px] shrink-0 mt-2')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
