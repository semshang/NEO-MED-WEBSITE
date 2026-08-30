import sys

with open("src/components/Header.tsx", "r", encoding="utf-8") as f:
    text = f.read()

start_str = '{/* Top Bar */}'
end_str = '{/* Main Navigation */}'
start_idx = text.find(start_str)
end_idx = text.find(end_str)

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + text[end_idx:]

with open("src/components/Header.tsx", "w", encoding="utf-8") as f:
    f.write(text)
