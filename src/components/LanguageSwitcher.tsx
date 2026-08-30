"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ne" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-bold text-brand-navy border border-slate-200 ml-4"
    >
      <span className={locale === "en" ? "text-brand-blue" : "text-slate-400"}>EN</span>
      <span className="text-slate-300">|</span>
      <span className={locale === "ne" ? "text-brand-blue" : "text-slate-400"}>NE</span>
    </button>
  );
}
