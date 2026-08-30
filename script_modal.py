import sys

with open("src/components/LoginModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Insert imports
text = text.replace('import { ShieldCheck, Headset, Truck, Shield, X, Globe, ChevronDown, Mail, Lock, Eye, ArrowRight } from "lucide-react";', 'import { ShieldCheck, Headset, Truck, Shield, X, Globe, ChevronDown, Mail, Lock, Eye, ArrowRight } from "lucide-react";\nimport { useTranslations } from "next-intl";')

# Insert hooks
text = text.replace('export function LoginModal() {\n  const searchParams = useSearchParams();', 'export function LoginModal() {\n  const tAuth = useTranslations("auth");\n  const tHero = useTranslations("hero");\n  const tTrust = useTranslations("trust");\n  const searchParams = useSearchParams();')

# Replacements
reps = {
    'Quality Equipment.<br />\n                  <span className="text-[#0d52bc]">Better </span><span className="text-[#10b981]">Outcomes.</span>': '{tAuth("qualityEquip")}<br />\n                  <span className="text-[#0d52bc]">{tAuth("betterOutcomes")}</span>',
    'Trusted by hospitals and healthcare professionals across Nepal for reliable biomedical solutions.': '{tAuth("trustedBy")}',
    '100% Genuine Equipment': '{tTrust("genuine")}',
    'All equipment is original and quality certified.': '{tTrust("genuineDesc")}',
    '24/7 Expert Support': '{tTrust("support")}',
    'Our experts are always here to help you.': '{tTrust("supportDesc")}',
    'Nationwide Delivery': '{tTrust("delivery")}',
    'Fast and safe delivery across Nepal.': '{tTrust("deliveryDesc")}',
    'Certified Biomedical Experts': '{tTrust("certified")}',
    'Backed by years of industry experience.': '{tTrust("certifiedDesc")}',
    'Welcome Back': '{tAuth("welcomeBack")}',
    'Sign in to access your account': '{tAuth("signInToAccess")}',
    'Email Address': '{tAuth("email")}',
    'Enter your email': '{tAuth("emailPlaceholder")}',
    'Password': '{tAuth("password")}',
    'Enter your password': '{tAuth("passwordPlaceholder")}',
    'Forgot Password?': '{tAuth("forgotPassword")}',
    'Remember me': '{tAuth("rememberMe")}',
    'Sign In': '{tAuth("login")}',
    'or continue with': '{tAuth("continueWith")}',
    'Continue with Google': '{tAuth("continueGoogle")}',
    "Don't have an account?": '{tAuth("noAccount")}',
    'Create Account': '{tAuth("createAccount")}',
    'Your data is secure and encrypted': '{tAuth("secureData")}'
}

for k, v in reps.items():
    text = text.replace(k, v)

with open("src/components/LoginModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("done")
