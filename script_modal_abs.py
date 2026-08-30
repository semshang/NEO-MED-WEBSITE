import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make "Outcomes." green
text = text.replace('<span className="text-[#0d52bc]">{tAuth("betterOutcomes")}</span>', 
'<span className="text-[#0d52bc]">Better </span><span className="text-[#10b981]">Outcomes.</span>')

# Re-structure the left panel for absolute image
old_left_panel = """<div className="mt-auto relative w-full flex-1 flex flex-col justify-end min-h-0">
                  <motion.img 
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    src="/login-podium-transparent.png" 
                    alt="Neomeditech Equipment" 
                    className="w-full h-full object-contain object-bottom relative z-10 drop-shadow-xl"
                  />

                  {/* Floating Badge */}
                  <div className="absolute bottom-2 lg:bottom-4 left-0 bg-white/95 p-2.5 lg:p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center space-x-2.5 z-30 min-w-[180px] lg:min-w-[200px] border border-slate-100">
                    <div className="bg-[#e6f8f3] p-1.5 rounded-lg text-[#10b981]">
                      <Shield size={16} />
                    </div>
                    <div>
                      <div className="text-brand-navy font-bold text-[11px] lg:text-xs leading-tight">{tTrust("certified")}</div>
                      <div className="text-slate-500 text-[9px] lg:text-[10px] mt-0.5 leading-tight">{tTrust("certifiedDesc")}</div>
                    </div>
                  </div>
                </div>"""

new_left_panel = """{/* Absolutely positioned image to guarantee it stays large */}
                <div className="absolute bottom-0 left-0 right-0 h-[220px] lg:h-[280px] pointer-events-none z-10">
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
                <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 bg-white/95 p-2.5 lg:p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center space-x-2.5 z-30 min-w-[180px] lg:min-w-[200px] border border-slate-100">
                  <div className="bg-[#e6f8f3] p-1.5 rounded-lg text-[#10b981]">
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="text-brand-navy font-bold text-[11px] lg:text-xs leading-tight">{tTrust("certified")}</div>
                    <div className="text-slate-500 text-[9px] lg:text-[10px] mt-0.5 leading-tight">{tTrust("certifiedDesc")}</div>
                  </div>
                </div>"""

text = text.replace(old_left_panel, new_left_panel)

# Also ensure the trust badges and text are positioned above the image in z-index, so if they overlap, text is readable
# Actually, the trust badges should have relative z-20
text = text.replace('<div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">', '<div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6 relative z-20">')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
