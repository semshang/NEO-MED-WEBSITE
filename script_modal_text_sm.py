import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Headline
text = text.replace('text-2xl lg:text-3xl font-black text-brand-navy', 'text-xl lg:text-2xl font-black text-brand-navy')

# Paragraph
text = text.replace('text-slate-600 text-xs lg:text-sm leading-snug mx-auto max-w-sm', 'text-slate-600 text-[10px] lg:text-xs leading-snug mx-auto max-w-sm')

# Trust points titles
text = text.replace('font-bold text-brand-navy text-xs lg:text-sm leading-none', 'font-bold text-brand-navy text-[11px] lg:text-xs leading-none')

# Trust points descriptions
text = text.replace('text-slate-500 text-[10px] lg:text-xs mt-0.5 leading-none', 'text-slate-500 text-[9px] lg:text-[10px] mt-1 leading-none')

# Certified badge title
text = text.replace('text-brand-navy font-bold text-xs lg:text-sm leading-none font-bold', 'text-brand-navy font-bold text-[11px] lg:text-xs leading-none')

# Certified badge description
text = text.replace('text-slate-500 text-[9px] lg:text-[11px] mt-1 leading-none', 'text-slate-500 text-[9px] lg:text-[10px] mt-1 leading-none')

# Certified icon size
text = text.replace('<Shield size={16} className="lg:w-5 lg:h-5" />', '<Shield size={14} className="lg:w-4 lg:h-4" />')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
