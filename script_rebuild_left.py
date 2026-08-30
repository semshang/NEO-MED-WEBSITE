import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Left panel old string
# First, let's just find the start of the left panel and end of it.
start_str = '{/* Left Panel - Marketing */}'
end_str = '{/* Right Panel - Form */}'

start_idx = text.find(start_str)
end_idx = text.find(end_str)

if start_idx != -1 and end_idx != -1:
    left_panel = text[start_idx:end_idx]
    
    # We will build a completely clean left panel
    new_left_panel = """{/* Left Panel - Marketing */}
              <motion.div variants={leftPanelVariants} className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-[#eff5f9] to-[#e1edf4] p-8 lg:p-12 relative overflow-y-auto custom-scrollbar">
                <div className="relative z-10 flex flex-col h-full min-h-max">
                  {/* Logo */}
                  <div className="mb-6 lg:mb-8">
                    <Image 
                      src="/logo.png" 
                      alt="Neomeditech" 
                      width={160} 
                      height={80} 
                      className="h-10 lg:h-12 w-auto object-contain"
                    />
                  </div>
  
                  {/* Copy */}
                  <div className="mb-6 lg:mb-8">
                    <h2 className="text-3xl lg:text-4xl font-black text-brand-navy mb-4 leading-tight">
                      {tAuth("qualityEquip")}<br />
                      <span className="text-brand-blue">{tAuth("better")}</span>
                      <span className="text-[#10b981]">{tAuth("outcomes")}</span>
                    </h2>
                    <p className="text-slate-600 text-sm lg:text-base leading-relaxed">
                      {tAuth("trustedBy")}
                    </p>
                  </div>
  
                  {/* Trust Points */}
                  <div className="space-y-4 lg:space-y-5 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm text-brand-blue shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-sm lg:text-base">{tTrust("genuine")}</h4>
                        <p className="text-slate-500 text-xs lg:text-sm mt-0.5">{tTrust("genuineDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm text-brand-blue shrink-0">
                        <Headset size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-sm lg:text-base">{tTrust("support")}</h4>
                        <p className="text-slate-500 text-xs lg:text-sm mt-0.5">{tTrust("supportDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm text-brand-green shrink-0">
                        <Truck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-sm lg:text-base">{tTrust("delivery")}</h4>
                        <p className="text-slate-500 text-xs lg:text-sm mt-0.5">{tTrust("deliveryDesc")}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image (Normal Flow) */}
                  <div className="w-full flex justify-center items-center h-[200px] lg:h-[260px] shrink-0 mb-6">
                    <motion.img 
                      initial={{ y: 0 }}
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      src="/login-podium-transparent.png" 
                      alt="Neomeditech Equipment" 
                      className="w-full h-full object-contain object-center drop-shadow-xl"
                    />
                  </div>

                  {/* Certified Badge (Normal Flow below image) */}
                  <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm flex items-center space-x-3 w-full border border-slate-100">
                    <div className="bg-[#e6f8f3] p-2 rounded-lg text-[#10b981] shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="text-brand-navy font-bold text-xs lg:text-sm">{tTrust("certified")}</div>
                      <div className="text-slate-500 text-[10px] lg:text-xs mt-0.5">{tTrust("certifiedDesc")}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
  
              """
    
    text = text[:start_idx] + new_left_panel + text[end_idx:]
    
    with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("Replaced left panel successfully.")
else:
    print("Failed to find left panel.")
