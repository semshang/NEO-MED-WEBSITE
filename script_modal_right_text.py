import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Right panel text reduction
text = text.replace('text-sm font-bold text-brand-navy', 'text-xs lg:text-sm font-bold text-brand-navy')
text = text.replace('text-slate-500 text-sm mb-6 lg:mb-8', 'text-slate-500 text-xs lg:text-sm mb-6 lg:mb-8')

# Input text sizes
text = text.replace('className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all bg-slate-50/50 focus:bg-white text-sm"', 
                    'className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all bg-slate-50/50 focus:bg-white text-xs lg:text-sm"')

text = text.replace('className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all bg-slate-50/50 focus:bg-white text-sm"', 
                    'className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all bg-slate-50/50 focus:bg-white text-xs lg:text-sm"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
