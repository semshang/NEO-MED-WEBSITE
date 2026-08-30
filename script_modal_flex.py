import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Revert left panel to flex flow so it never overlaps
old_abs = """{/* Absolutely positioned image to guarantee it stays large */}
                <div className="absolute bottom-0 left-0 right-0 h-[160px] md:h-[180px] lg:h-[240px] pointer-events-none z-10">
                  <motion.img 
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    src="/login-podium-transparent.png" 
                    alt="Neomeditech Equipment" 
                    className="w-full h-full object-contain object-bottom drop-shadow-xl pl-8"
                  />
                </div>

                {/* Floating Badge - absolute relative to left panel */}
                <div className="absolute bottom-4 left-6 lg:bottom-8 lg:left-8 bg-white/95 p-2.5 lg:p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center space-x-2.5 z-30 min-w-[180px] lg:min-w-[200px] border border-slate-100">
                  <div className="bg-[#e6f8f3] p-1.5 rounded-lg text-[#10b981]">
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="text-brand-navy font-bold text-[11px] lg:text-xs leading-tight">{tTrust("certified")}</div>
                    <div className="text-slate-500 text-[9px] lg:text-[10px] mt-0.5 leading-tight">{tTrust("certifiedDesc")}</div>
                  </div>
                </div>"""

new_flex = """<div className="mt-auto relative w-full flex-1 flex flex-col justify-end min-h-0">
                  <motion.img 
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    src="/login-podium-transparent.png" 
                    alt="Neomeditech Equipment" 
                    className="w-full h-full object-contain object-bottom relative z-10 drop-shadow-xl"
                  />

                  {/* Floating Badge */}
                  <div className="absolute bottom-2 lg:bottom-4 left-0 bg-white/95 p-2 lg:p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center space-x-2 z-30 min-w-[160px] lg:min-w-[200px] border border-slate-100">
                    <div className="bg-[#e6f8f3] p-1.5 rounded-lg text-[#10b981]">
                      <Shield size={14} className="lg:w-4 lg:h-4" />
                    </div>
                    <div>
                      <div className="text-brand-navy font-bold text-[10px] lg:text-xs leading-tight">{tTrust("certified")}</div>
                      <div className="text-slate-500 text-[8px] lg:text-[10px] mt-0.5 leading-tight">{tTrust("certifiedDesc")}</div>
                    </div>
                  </div>
                </div>"""

text = text.replace(old_abs, new_flex)

# 2. Shrink text sizes and margins to make room for the image
text = text.replace('className="text-3xl font-black text-brand-navy mb-3 leading-tight"', 'className="text-2xl lg:text-3xl font-black text-brand-navy mb-2 lg:mb-3 leading-tight"')
text = text.replace('className="text-slate-600 text-sm mb-3 max-w-sm"', 'className="text-slate-600 text-xs lg:text-sm mb-2 lg:mb-3 max-w-sm"')
text = text.replace('className="space-y-2 lg:space-y-3 mb-2 relative z-20"', 'className="space-y-2 lg:space-y-3 mb-2 relative z-20"')

# Trust badges text
text = text.replace('className="bg-white p-2 rounded-xl shadow-sm text-brand-blue shrink-0"', 'className="bg-white p-1.5 lg:p-2 rounded-xl shadow-sm text-brand-blue shrink-0"')
text = text.replace('className="bg-white p-2 rounded-xl shadow-sm text-brand-green shrink-0"', 'className="bg-white p-1.5 lg:p-2 rounded-xl shadow-sm text-brand-green shrink-0"')
text = text.replace('<ShieldCheck size={20} />', '<ShieldCheck size={16} className="lg:w-5 lg:h-5" />')
text = text.replace('<Headset size={20} />', '<Headset size={16} className="lg:w-5 lg:h-5" />')
text = text.replace('<Truck size={20} />', '<Truck size={16} className="lg:w-5 lg:h-5" />')

text = text.replace('className="font-bold text-brand-navy text-sm"', 'className="font-bold text-brand-navy text-xs lg:text-sm"')
text = text.replace('className="text-slate-500 text-xs mt-0.5"', 'className="text-slate-500 text-[10px] lg:text-xs mt-0.5"')

# Logo size
text = text.replace('className="h-9 lg:h-10 w-auto object-contain -mt-1.5 lg:-mt-2"', 'className="h-7 lg:h-10 w-auto object-contain -mt-1.5 lg:-mt-2"')
text = text.replace('className="font-black tracking-widest leading-none text-lg lg:text-[22px]"', 'className="font-black tracking-widest leading-none text-base lg:text-[22px]"')
text = text.replace('className="text-slate-400 font-semibold text-[9px] lg:text-[11px] tracking-[0.2em] uppercase mt-0.5"', 'className="text-slate-400 font-semibold text-[7px] lg:text-[11px] tracking-[0.2em] uppercase mt-0.5"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
