import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Find left panel boundaries
start_str = '{/* Left Panel - Marketing */}'
end_str = '{/* Right Panel - Form */}'
start_idx = text.find(start_str)
end_idx = text.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_left_panel = """{/* Left Panel - Marketing */}
              <motion.div variants={leftPanelVariants} className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-[#eff5f9] to-[#e1edf4] p-6 lg:p-8 relative overflow-hidden">
                
                {/* Background decorative elements (faint circles) */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-[20%] left-[-10%] w-[120%] h-[120%] rounded-full border-[1px] border-white/40"></div>
                  <div className="absolute top-[30%] left-[5%] w-[90%] h-[90%] rounded-full border-[1px] border-white/20"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Logo (Top Left) */}
                  <div className="mb-4 lg:mb-6">
                    <Image 
                      src="/logo-transparent.png" 
                      alt="Neomeditech" 
                      width={140} 
                      height={70} 
                      className="h-8 lg:h-10 w-auto object-contain"
                    />
                  </div>
  
                  {/* Copy (Centered) */}
                  <div className="mb-4 lg:mb-6 text-center">
                    <h2 className="text-2xl lg:text-3xl font-black text-brand-navy mb-2 leading-tight">
                      {tAuth("qualityEquip")}<br />
                      <span className="text-brand-blue">{tAuth("better")}</span>
                      <span className="text-[#10b981]"> {tAuth("outcomes")}</span>
                    </h2>
                    <p className="text-slate-600 text-xs lg:text-sm leading-snug mx-auto max-w-sm">
                      {tAuth("trustedBy")}
                    </p>
                  </div>
  
                  {/* Trust Points (Block centered, items left-aligned) */}
                  <div className="mx-auto w-fit space-y-3 lg:space-y-4 mb-2 lg:mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm text-brand-blue shrink-0">
                        <ShieldCheck size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-[11px] lg:text-[13px] leading-none">{tTrust("genuine")}</h4>
                        <p className="text-slate-500 text-[10px] lg:text-xs mt-1 leading-none">{tTrust("genuineDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm text-brand-blue shrink-0">
                        <Headset size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-[11px] lg:text-[13px] leading-none">{tTrust("support")}</h4>
                        <p className="text-slate-500 text-[10px] lg:text-xs mt-1 leading-none">{tTrust("supportDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm text-brand-green shrink-0">
                        <Truck size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-[11px] lg:text-[13px] leading-none">{tTrust("delivery")}</h4>
                        <p className="text-slate-500 text-[10px] lg:text-xs mt-1 leading-none">{tTrust("deliveryDesc")}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image (Huge, Flex-1, pushed to edges) */}
                  <div className="w-full flex-1 flex justify-center items-end min-h-[160px] relative -mx-4 lg:-mx-8 px-4 lg:px-8">
                    <motion.img 
                      initial={{ y: 0 }}
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      src="/login-podium-transparent.png" 
                      alt="Neomeditech Equipment" 
                      className="w-full h-full object-contain object-bottom drop-shadow-2xl scale-[1.15] origin-bottom"
                    />

                    {/* Certified Badge (Absolute floating over bottom left of image) */}
                    <div className="absolute bottom-2 left-6 lg:left-8 bg-white/95 p-2 lg:p-3 rounded-xl shadow-lg flex items-center space-x-2 lg:space-x-3 border border-slate-100 z-20">
                      <div className="bg-[#e6f8f3] p-1.5 lg:p-2 rounded-lg text-[#10b981] shrink-0">
                        <Shield size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <div className="text-brand-navy font-bold text-[10px] lg:text-xs leading-none">{tTrust("certified")}</div>
                        <div className="text-slate-500 text-[9px] lg:text-[11px] mt-1 leading-none">{tTrust("certifiedDesc")}</div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
  
              """
    
    text = text[:start_idx] + new_left_panel + text[end_idx:]
    
    with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("Replaced left panel completely to match new reference.")
else:
    print("Failed to find left panel.")
