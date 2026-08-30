import sys

with open("src/components/Header.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_logo_text = """            <span className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight hidden sm:block">
              Neomeditech
            </span>"""

new_logo_text = """            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green tracking-tight leading-none pb-0.5">
                Neomeditech
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5 leading-none">
                Biomedical Solutions
              </span>
            </div>"""

text = text.replace(old_logo_text, new_logo_text)

with open("src/components/Header.tsx", "w", encoding="utf-8") as f:
    f.write(text)
