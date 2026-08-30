import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  const isSupportedLocale = (value: string): value is (typeof routing.locales)[number] => routing.locales.includes(value as (typeof routing.locales)[number]);
  
  // Ensure that a valid locale is used
  if (!locale || !isSupportedLocale(locale)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
