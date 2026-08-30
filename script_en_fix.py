import json

with open("src/messages/en.json", "r", encoding="utf-8") as f:
    en = json.load(f)

en["auth"]["continueWith"] = "Or continue with"

with open("src/messages/en.json", "w", encoding="utf-8") as f:
    json.dump(en, f, indent=4, ensure_ascii=False)
