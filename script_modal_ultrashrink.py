import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Left panel padding
text = text.replace('className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-[#eff5f9] to-[#e1edf4] p-6 lg:p-10 relative overflow-hidden"', 'className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-[#eff5f9] to-[#e1edf4] p-4 lg:p-8 relative overflow-hidden"')

# Logo margin
text = text.replace('className="mb-4 lg:mb-8"', 'className="mb-2 lg:mb-6"')

# Headline
text = text.replace('text-2xl lg:text-4xl font-black text-brand-navy mb-4 leading-tight', 'text-xl lg:text-3xl font-black text-brand-navy mb-2 lg:mb-4 leading-tight')

# Paragraph
text = text.replace('text-xs lg:text-base leading-relaxed', 'text-[10px] lg:text-sm leading-snug')

# Trust points container
text = text.replace('space-y-3 lg:space-y-4 mb-4 lg:mb-8', 'space-y-2 lg:space-y-4 mb-2 lg:mb-6')

# Trust points text
text = text.replace('text-sm lg:text-base', 'text-xs lg:text-sm')
text = text.replace('text-[10px] lg:text-sm mt-0.5', 'text-[9px] lg:text-xs mt-0.5')

# Trust icons
text = text.replace('p-2 lg:p-2.5 rounded-xl shadow-sm text-brand-blue shrink-0', 'p-1.5 lg:p-2.5 rounded-xl shadow-sm text-brand-blue shrink-0')
text = text.replace('p-2 lg:p-2.5 rounded-xl shadow-sm text-brand-green shrink-0', 'p-1.5 lg:p-2.5 rounded-xl shadow-sm text-brand-green shrink-0')
text = text.replace('<ShieldCheck size={20} />', '<ShieldCheck size={16} className="lg:w-5 lg:h-5" />')
text = text.replace('<Headset size={20} />', '<Headset size={16} className="lg:w-5 lg:h-5" />')
text = text.replace('<Truck size={20} />', '<Truck size={16} className="lg:w-5 lg:h-5" />')

# Certified badge container
text = text.replace('p-2 lg:p-4 rounded-xl shadow-sm flex items-center space-x-2 lg:space-x-3 w-full border border-slate-100 mt-auto', 'p-1.5 lg:p-4 rounded-xl shadow-sm flex items-center space-x-2 lg:space-x-3 w-full border border-slate-100 mt-auto')

# Certified badge icon
text = text.replace('p-2 rounded-lg text-[#10b981] shrink-0', 'p-1.5 lg:p-2 rounded-lg text-[#10b981] shrink-0')
text = text.replace('<Shield size={20} />', '<Shield size={14} className="lg:w-5 lg:h-5" />')

# Certified badge text
text = text.replace('text-xs lg:text-sm', 'text-[10px] lg:text-sm')
text = text.replace('text-[10px] lg:text-xs mt-0.5', 'text-[8px] lg:text-xs mt-0.5')

# Make sure image container shrinks beautifully but has a bit more room
text = text.replace('min-h-[140px] max-h-[220px]', 'min-h-[120px] max-h-[180px]')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
