export type Locale = "en" | "fil";

export const LOCALES: Locale[] = ["en", "fil"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fil: "Filipino",
};

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "exitplan_locale";
