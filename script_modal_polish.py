import sys
import re

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Sign In button color
# w-full bg-brand-blue hover:bg-brand-navy text-white font-bold
old_btn = 'className="w-full bg-brand-blue hover:bg-brand-navy text-white font-bold'
new_btn = 'className="w-full bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white font-bold'
text = text.replace(old_btn, new_btn)

# 2. Header spacing (move X into the top bar)
# Remove the absolute X button completely
abs_x_btn = """{/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>"""
text = text.replace(abs_x_btn, "")

# Update top bar to include the X button
old_top_bar = """{/* Top Bar */}
              <div className="flex justify-end items-center mb-2 lg:mb-4 w-full pr-10">
                <LanguageSwitcher />
              </div>"""
new_top_bar = """{/* Top Bar */}
              <div className="flex justify-end items-center mb-2 lg:mb-4 w-full gap-4">
                <LanguageSwitcher />
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>"""
text = text.replace(old_top_bar, new_top_bar)

# 3. Product image sizing (Scale down, fix bottom padding)
old_img_container = 'className="absolute bottom-0 left-0 right-0 h-[160px] md:h-[180px] lg:h-[240px] pointer-events-none z-10"'
new_img_container = 'className="absolute bottom-4 left-0 right-0 h-[140px] md:h-[160px] lg:h-[210px] pointer-events-none z-10"'
text = text.replace(old_img_container, new_img_container)

# 4. Divider text styling
old_divider = 'className="text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-white px-2"'
new_divider = 'className="text-[10px] lg:text-xs text-slate-500 font-bold bg-white px-2"'
text = text.replace(old_divider, new_divider)

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
