import ar from "@/locales/ar.json";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import sw from "@/locales/sw.json";
import yo from "@/locales/yo.json";
import zhCN from "@/locales/zh-CN.json";

export const SUPPORTED_LOCALES = ["en", "fr", "es", "ar", "de", "zh-CN", "yo", "sw"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TranslationDictionary = typeof en;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "clarity-loop-ui-locale";
export const RTL_LOCALES = new Set<Locale>(["ar"]);

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  ar: "العربية",
  de: "Deutsch",
  "zh-CN": "中文",
  yo: "Yorùbá",
  sw: "Swahili",
};

export const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  fr: fr as TranslationDictionary,
  es: es as TranslationDictionary,
  ar: ar as TranslationDictionary,
  de: de as TranslationDictionary,
  "zh-CN": zhCN as TranslationDictionary,
  yo: yo as TranslationDictionary,
  sw: sw as TranslationDictionary,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function localeDirection(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
