import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('className="w-full md:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col justify-center"', 'className="w-full md:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col justify-start md:justify-center overflow-y-auto custom-scrollbar"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
