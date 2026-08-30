import sys
import re

with open("src/components/Header.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace the specific span with the new div block
old_pattern = r'<span className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight hidden sm:block">\s*Neomeditech\s*</span>'
new_block = """<div className="hidden sm:flex flex-col justify-center">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green tracking-tight leading-none pb-0.5">
              Neomeditech
            </span>
            <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green uppercase tracking-[0.2em] mt-0.5 leading-none">
              Biomedical Solutions
            </span>
          </div>"""

text = re.sub(old_pattern, new_block, text)

with open("src/components/Header.tsx", "w", encoding="utf-8") as f:
    f.write(text)
