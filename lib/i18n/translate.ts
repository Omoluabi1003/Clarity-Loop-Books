import { DEFAULT_LOCALE, dictionaries, type Locale, type TranslationDictionary } from "./config";

type Primitive = string | number;
type Variables = Record<string, Primitive>;
type FlatDictionary = Record<string, string>;

const flatByLocale = new Map<Locale, FlatDictionary>();
const sourceKeyMap = new Map<string, string>();

function flatten(value: unknown, prefix = "", output: FlatDictionary = {}): FlatDictionary {
  if (typeof value === "string") {
    output[prefix] = value;
    return output;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, output);
    }
  }
  return output;
}

export function flatDictionary(locale: Locale): FlatDictionary {
  const cached = flatByLocale.get(locale);
  if (cached) return cached;
  const result = flatten(dictionaries[locale]);
  flatByLocale.set(locale, result);
  return result;
}

for (const [key, source] of Object.entries(flatDictionary(DEFAULT_LOCALE))) {
  if (!sourceKeyMap.has(source)) sourceKeyMap.set(source, key);
}

function interpolate(message: string, variables?: Variables): string {
  if (!variables) return message;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : match,
  );
}

function reportMissing(locale: Locale, key: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[i18n] Missing translation for "${key}" in locale "${locale}"; using English.`);
  }
}

export function translateKey(locale: Locale, key: string, variables?: Variables): string {
  const localized = flatDictionary(locale)[key];
  const fallback = flatDictionary(DEFAULT_LOCALE)[key];
  if (localized === undefined && locale !== DEFAULT_LOCALE) reportMissing(locale, key);
  if (localized === undefined && fallback === undefined) {
    reportMissing(locale, key);
    return key;
  }
  return interpolate(localized ?? fallback, variables);
}

export function translationKeyForSource(source: string): string | undefined {
  return sourceKeyMap.get(source.trim());
}

export function translateSource(locale: Locale, source: string): string {
  const trimmed = source.trim();
  const key = translationKeyForSource(trimmed);
  if (!key) return source;
  const translated = translateKey(locale, key);
  return source.replace(trimmed, translated);
}

export function hasTranslationSource(source: string): boolean {
  return sourceKeyMap.has(source.trim());
}

export function dictionaryForLocale(locale: Locale): TranslationDictionary {
  return dictionaries[locale];
}
