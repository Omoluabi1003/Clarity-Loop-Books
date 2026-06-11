export const AUTH_ACCOUNTS_KEY = "clarity-loop-accounts-v1";
export const AUTH_SESSION_KEY = "clarity-loop-session-v1";

const PASSWORD_ITERATIONS = 120_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type StoredAccount = AuthUser & {
  salt: string;
  passwordHash: string;
  createdAt: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseAccounts(raw: string | null): StoredAccount[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((account): account is StoredAccount => {
      if (!account || typeof account !== "object") return false;
      const item = account as Partial<StoredAccount>;
      return [item.id, item.name, item.email, item.salt, item.passwordHash, item.createdAt].every((field) => typeof field === "string" && field.length > 0);
    });
  } catch {
    return [];
  }
}

export function parseSession(raw: string | null, accounts: StoredAccount[]): AuthUser | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || typeof (value as { userId?: unknown }).userId !== "string") return null;
    const account = accounts.find((candidate) => candidate.id === (value as { userId: string }).userId);
    return account ? toAuthUser(account) : null;
  } catch {
    return null;
  }
}

export function serializeSession(user: AuthUser) {
  return JSON.stringify({ userId: user.id });
}

export function toAuthUser(account: StoredAccount): AuthUser {
  return { id: account.id, name: account.name, email: account.email };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derivePasswordHash(password: string, salt: Uint8Array) {
  const saltBytes = new Uint8Array(salt.byteLength);
  saltBytes.set(salt);
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: PASSWORD_ITERATIONS }, keyMaterial, HASH_BYTES * 8);
  return bytesToBase64(new Uint8Array(bits));
}

export async function createLocalAccount(name: string, email: string, password: string): Promise<StoredAccount> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizeEmail(email),
    salt: bytesToBase64(salt),
    passwordHash: await derivePasswordHash(password, salt),
    createdAt: new Date().toISOString(),
  };
}

export async function verifyLocalPassword(account: StoredAccount, password: string) {
  const candidate = await derivePasswordHash(password, base64ToBytes(account.salt));
  if (candidate.length !== account.passwordHash.length) return false;
  let difference = 0;
  for (let index = 0; index < candidate.length; index += 1) difference |= candidate.charCodeAt(index) ^ account.passwordHash.charCodeAt(index);
  return difference === 0;
}
