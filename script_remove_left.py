import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update the modal container to be smaller and auto-height
old_modal = 'className="relative w-full max-w-[850px] h-[95vh] md:h-[580px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto shrink-0"'
new_modal = 'className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[95vh] shrink-0"'
text = text.replace(old_modal, new_modal)

# 2. Extract and remove the left panel
start_str = '{/* Left Panel - Marketing */}'
end_str = '{/* Right Panel - Form */}'
start_idx = text.find(start_str)
end_idx = text.find(end_str)

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + text[end_idx:]

# 3. Update the right panel width
text = text.replace('className="w-full md:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col justify-start md:justify-center overflow-y-auto custom-scrollbar"', 
                    'className="w-full p-6 sm:p-8 flex flex-col justify-start overflow-y-auto custom-scrollbar"')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
