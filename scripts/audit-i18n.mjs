import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const locales = ["en", "fr", "es", "ar", "de", "zh-CN", "yo", "sw"];
const flatten = (value, prefix = "", result = {}) => {
  if (typeof value === "string") result[prefix] = value;
  else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, result);
  return result;
};

const english = flatten(JSON.parse(readFileSync(path.join(root, "locales/en.json"), "utf8")));
const englishKeys = Object.keys(english).sort();
if (englishKeys.length < 1_000) throw new Error(`Expected site-wide coverage; found only ${englishKeys.length} English keys.`);

for (const locale of locales) {
  const filename = path.join(root, `locales/${locale}.json`);
  if (!existsSync(filename)) throw new Error(`Missing locale dictionary: ${locale}`);
  const dictionary = flatten(JSON.parse(readFileSync(filename, "utf8")));
  const keys = Object.keys(dictionary).sort();
  if (JSON.stringify(keys) !== JSON.stringify(englishKeys)) throw new Error(`${locale} keys do not match English.`);
  const blank = keys.find((key) => !dictionary[key].trim());
  if (blank) throw new Error(`${locale}:${blank} is blank.`);
}

const config = readFileSync(path.join(root, "lib/i18n/config.ts"), "utf8");
if (!config.includes('"zh-CN"')) throw new Error("zh-CN must be used consistently in locale configuration.");

console.log(`i18n audit passed: ${locales.length} locales × ${englishKeys.length} complete keys.`);
