import sys

with open("src/app/[locale]/about/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = 'import { useTranslations } from "next-intl";\n' + text
text = text.replace('export default function About() {\n  return', 'export default function About() {\n  const tAbout = useTranslations("about");\n  return')

reps = {
    'About {SITE.shortName}': '{tAbout("title")}',
    'We are dedicated to improving healthcare in Nepal by providing top-quality medical equipment, reliable maintenance, and exceptional customer service.': '{tAbout("subtitle")}',
    'Our Mission': '{tAbout("mission")}',
    'To equip every hospital and clinic in Nepal with reliable, state-of-the-art biomedical devices that empower healthcare professionals to save lives and improve patient outcomes.': '{tAbout("missionDesc")}'
}

for k, v in reps.items():
    text = text.replace(k, v)

with open("src/app/[locale]/about/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
