import sys
import re

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make the right side NOT scrollable and reduce padding
text = text.replace('w-full md:w-1/2 p-6 sm:p-8 lg:px-12 lg:py-8 flex flex-col overflow-y-auto custom-scrollbar', 'w-full md:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col justify-center')

# Reduce top bar margin
text = text.replace('flex justify-end items-center mb-4 lg:mb-6 w-full pr-10', 'flex justify-end items-center mb-2 lg:mb-4 w-full pr-10')

# Left panel padding and gaps
text = text.replace('p-8 lg:p-10', 'p-6 lg:p-8')
text = text.replace('mb-6', 'mb-4')
text = text.replace('mb-8 max-w-sm', 'mb-4 max-w-sm')
text = text.replace('mb-8 lg:mb-12', 'mb-4 lg:mb-6')
text = text.replace('space-y-5 lg:space-y-6', 'space-y-3')
text = text.replace('space-y-4 lg:space-y-5', 'space-y-3')
text = text.replace('mb-8', 'mb-4')
text = text.replace('my-6 lg:my-8', 'my-4')
text = text.replace('mt-8 lg:mt-auto', 'mt-4 lg:mt-auto')
text = text.replace('mt-6', 'mt-4')

# Inputs and buttons height
text = text.replace('py-3 text-sm', 'py-2.5 text-sm')
text = text.replace('py-3.5', 'py-2.5')

# Image fix: give it a better flex box container and max height
text = text.replace('min-h-[120px]', 'min-h-0 flex-shrink flex-1 overflow-hidden')
text = text.replace('w-full h-full max-h-[180px] lg:max-h-[240px]', 'w-full h-full object-contain')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
print("done")
