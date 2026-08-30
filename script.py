import sys
import re

with open("src/app/[locale]/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Insert imports
text = text.replace('import { SITE } from "@/config/site";', 'import { SITE } from "@/config/site";\nimport { useTranslations } from "next-intl";')

# Insert hooks
text = text.replace('export default function Home() {\n  const { products }', 'export default function Home() {\n  const tHero = useTranslations("hero");\n  const tTrust = useTranslations("trust");\n  const tShop = useTranslations("shop");\n  const { products }')

# Replacements
reps = {
    'Trusted by 500+ hospitals across Nepal': '{tHero("trustedByBadge")}',
    'Premium Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">Equipment</span> You Can Trust': '{tHero("title1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">{tHero("titleHighlight")}</span> {tHero("title2")}',
    'Equipping healthcare professionals with state-of-the-art biomedical devices. Reliable service, certified products, and trusted expertise.': '{tHero("subtitle")}',
    '>Explore Products<': '>{tHero("explore")}<',
    '>Contact Us<': '>{tHero("contactUs")}<',
    '100% Genuine Equipment': '{tTrust("genuine")}',
    'All equipment is original and quality certified.': '{tTrust("genuineDesc")}',
    '24/7 Expert Support': '{tTrust("support")}',
    'Our experts are always here to help you.': '{tTrust("supportDesc")}',
    'Nationwide Delivery': '{tTrust("delivery")}',
    'Fast and safe delivery across Nepal.': '{tTrust("deliveryDesc")}',
    'Need Medical Equipment for Your Clinic?': '{tHero("ctaTitle")}',
    'Get in touch with our experts today for customized solutions, bulk orders, and specialized biomedical equipment.': '{tHero("ctaSubtitle")}',
    'Get a Free Quote': '{tHero("getQuote")}'
}

for k, v in reps.items():
    text = text.replace(k, v)

with open("src/app/[locale]/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
