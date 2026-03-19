"use client";

import { useLanguage } from "./context";
import en, { type TranslationKeys } from "./translations/en";
import fil from "./translations/fil";
import type { Locale } from "./types";

const translations: Record<Locale, TranslationKeys> = { en, fil };

/**
 * Access translated strings for the current locale.
 *
 * @example
 * const { t } = useTranslation();
 * <h1>{t.nav.home}</h1>
 * <p>{t.landing.hero.headline}</p>
 */
export function useTranslation() {
  const { locale } = useLanguage();
  return { t: translations[locale], locale };
}
