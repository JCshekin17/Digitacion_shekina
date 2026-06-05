'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: 'en' | 'es') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => handleLanguageChange('es')}
        className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
          locale === 'es' ? 'bg-[#ffb020] text-[#110E3C]' : 'bg-transparent text-[#110E3C] hover:bg-slate-100'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
          locale === 'en' ? 'bg-[#ffb020] text-[#110E3C]' : 'bg-transparent text-[#110E3C] hover:bg-slate-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}
