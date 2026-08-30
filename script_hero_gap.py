import sys

with open("src/app/[locale]/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Remove the forced minimum height that was causing the content to float in the middle
text = text.replace('className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-start overflow-hidden"', 
                    'className="relative flex items-center justify-start overflow-hidden pt-12 md:pt-16 pb-12 md:pb-16"')

# Remove the padding from the inner container so it doesn't double up, or adjust it
text = text.replace('pt-12 md:pt-16 pb-16 md:pb-24 flex flex-col', 'py-4 flex flex-col')

with open("src/app/[locale]/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)
