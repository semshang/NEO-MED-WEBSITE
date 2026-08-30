import json

with open("src/messages/en.json", "r", encoding="utf-8") as f:
    en = json.load(f)

with open("src/messages/ne.json", "r", encoding="utf-8") as f:
    ne = json.load(f)

en["auth"]["better"] = "Better "
en["auth"]["outcomes"] = "Outcomes."

# In Nepali: "betterOutcomes": "?????? ????????" (Ramro Natijaharu)
ne["auth"]["better"] = "?????? "
ne["auth"]["outcomes"] = "?????????"

with open("src/messages/en.json", "w", encoding="utf-8") as f:
    json.dump(en, f, indent=4, ensure_ascii=False)

with open("src/messages/ne.json", "w", encoding="utf-8") as f:
    json.dump(ne, f, indent=4, ensure_ascii=False)

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('<span className="text-[#0d52bc]">Better </span><span className="text-[#10b981]">Outcomes.</span>', 
'<span className="text-[#0d52bc]">{tAuth("better")}</span><span className="text-[#10b981]">{tAuth("outcomes")}</span>')

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)
