"use client";

import { Languages } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_LABELS,
  LOCALE_STORAGE_KEY,
  localeDirection,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { hasTranslationSource, translateKey, translateSource, translationKeyForSource } from "@/lib/i18n/translate";

type Variables = Record<string, string | number>;
type I18nContextValue = {
  locale: Locale;
  direction: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Variables) => string;
  translateUiText: (source: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"] as const;
const CONTENT_EXCLUSIONS = "[data-book-content], [data-i18n-ignore], script, style, code, pre";

function shouldIgnore(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(CONTENT_EXCLUSIONS));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const textSources = useRef(new WeakMap<Text, string>());
  const applying = useRef(false);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try { localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale); } catch { /* Storage can be unavailable in privacy modes. */ }
  }, []);

  const t = useCallback((key: string, variables?: Variables) => translateKey(locale, key, variables), [locale]);
  const translateUiText = useCallback((source: string) => translateSource(locale, source), [locale]);

  useEffect(() => {
    const restoreLocale = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (isLocale(saved)) setLocaleState(saved);
      } catch { /* English remains the safe default. */ }
    }, 0);
    return () => window.clearTimeout(restoreLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection(locale);
    document.body.dataset.locale = locale;
  }, [locale]);

  useEffect(() => {
    const translateTextNode = (node: Text) => {
      if (shouldIgnore(node) || !node.nodeValue?.trim()) return;
      const current = node.nodeValue;
      const existingSource = textSources.current.get(node);
      const source = hasTranslationSource(current) ? current : existingSource;
      if (!source || !translationKeyForSource(source)) return;
      textSources.current.set(node, source);
      const next = translateSource(locale, source);
      if (next !== current) node.nodeValue = next;
    };

    const translateElement = (element: Element) => {
      if (shouldIgnore(element)) return;
      for (const attribute of TRANSLATABLE_ATTRIBUTES) {
        const current = element.getAttribute(attribute);
        if (!current) continue;
        const sourceAttribute = `data-i18n-source-${attribute.replace("aria-", "aria")}`;
        const stored = element.getAttribute(sourceAttribute);
        const source = hasTranslationSource(current) ? current : stored;
        if (!source || !translationKeyForSource(source)) continue;
        if (stored !== source) element.setAttribute(sourceAttribute, source);
        const translated = translateSource(locale, source);
        if (current !== translated) element.setAttribute(attribute, translated);
      }
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) translateTextNode(child as Text);
      }
    };

    const translateTree = (root: Node) => {
      applying.current = true;
      if (root.nodeType === Node.TEXT_NODE) translateTextNode(root as Text);
      if (root instanceof Element) {
        translateElement(root);
        root.querySelectorAll("*").forEach(translateElement);
      }
      applying.current = false;
    };

    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      if (applying.current) return;
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateTree(mutation.target);
        mutation.addedNodes.forEach(translateTree);
        if (mutation.type === "attributes") translateTree(mutation.target);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...TRANSLATABLE_ATTRIBUTES] });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({ locale, direction: localeDirection(locale), setLocale, t, translateUiText }), [locale, setLocale, t, translateUiText]);
  const selectorLabel = translateKey(locale, "common.selectLanguage");

  return (
    <I18nContext.Provider value={value}>
      <a className="i18n-skip-link" href="#main-content">{t("common.skipToContent")}</a>
      <div className="global-language-selector" data-i18n-ignore>
        <Languages aria-hidden="true" size={17} />
        <label htmlFor="global-language">{translateKey(locale, "common.language")}</label>
        <select id="global-language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={selectorLabel}>
          {SUPPORTED_LOCALES.map((item) => <option key={item} value={item}>{LOCALE_LABELS[item]}</option>)}
        </select>
      </div>
      <main id="main-content">{children}</main>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider.");
  return value;
}
