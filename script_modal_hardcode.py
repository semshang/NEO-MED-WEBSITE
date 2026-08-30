import sys
import re

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Lock modal dimensions permanently
old_modal = r'className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto max-h-\[98vh\] md:max-h-\[95vh\]"'
new_modal = 'className="relative w-full max-w-[850px] h-[95vh] md:h-[580px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto shrink-0"'
text = re.sub(old_modal, new_modal, text)

# 2. Left panel padding (remove bottom padding)
old_lp = r'className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-\[#eff5f9\] to-\[#e1edf4\] p-6 lg:p-8 relative overflow-hidden"'
new_lp = 'className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-[#eff5f9] to-[#e1edf4] pt-8 lg:pt-10 px-6 lg:px-8 pb-0 relative overflow-hidden"'
text = re.sub(old_lp, new_lp, text)

# 3. Fix the image container so it sits at the bottom and is HUGE
old_img_container = r'<div className="w-full flex-1 flex justify-center items-end min-h-\[160px\] relative -mx-4 lg:-mx-8 px-4 lg:px-8">'
new_img_container = '<div className="w-full mt-auto flex justify-center items-end h-[220px] relative -mx-4 lg:-mx-8 px-4 lg:px-8">'
text = re.sub(old_img_container, new_img_container, text)

# 4. Make the trust badges block completely match the reference (tight spacing)
text = text.replace('mx-auto w-fit space-y-3 lg:space-y-4 mb-2 lg:mb-4', 'mx-auto w-fit space-y-3 lg:space-y-4 mb-2 lg:mb-6')

# 5. Bring text sizes up to normal readable sizes since we have a fixed 580px height
text = text.replace('text-2xl lg:text-3xl', 'text-2xl lg:text-3xl') # Headline
text = text.replace('text-[11px] lg:text-[13px]', 'text-xs lg:text-sm') # Trust titles
text = text.replace('text-[10px] lg:text-xs mt-1', 'text-[10px] lg:text-xs mt-0.5') # Trust desc
text = text.replace('text-[10px] lg:text-xs leading-none', 'text-xs lg:text-sm leading-none font-bold') # Badge title

# Make the certified badge float higher so it doesn't hit the bottom edge
text = text.replace('absolute bottom-2 left-6 lg:left-8', 'absolute bottom-6 left-6 lg:left-8')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
