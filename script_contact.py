import sys

with open("src/app/[locale]/contact/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('import { Mail, MapPin, Phone } from "lucide-react";', 'import { Mail, MapPin, Phone } from "lucide-react";\nimport { useTranslations } from "next-intl";')
text = text.replace('export default function Contact() {\n  return', 'export default function Contact() {\n  const tContact = useTranslations("contact");\n  return')

reps = {
    'Get in Touch': '{tContact("title")}',
    'We\'d love to hear from you. Please fill out the form below or use our contact information.': '{tContact("subtitle")}',
    'Full Name': '{tContact("formName")}',
    'Email Address': '{tContact("formEmail")}',
    'Phone Number': '{tContact("formPhone")}',
    'Subject': '{tContact("formSubject")}',
    'Message': '{tContact("formMessage")}',
    'Send Message': '{tContact("submit")}',
    'Our Contact Info': '{tContact("contactInfo")}',
    'Working Hours': '{tContact("workingHours")}'
}

for k, v in reps.items():
    text = text.replace(k, v)

with open("src/app/[locale]/contact/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
