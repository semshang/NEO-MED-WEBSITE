import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Remove max-h-full to allow the modal to grow to fit its content naturally
text = text.replace('className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto max-h-full"', 'className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto min-h-[600px]"')

# Make the image container take a good amount of space
text = text.replace('min-h-[160px] lg:min-h-[200px]', 'min-h-[180px] lg:min-h-[240px]')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
