import assert from "node:assert/strict";
import test from "node:test";
import { createLocalAccount, normalizeEmail, parseAccounts, parseSession, serializeSession, verifyLocalPassword } from "../lib/auth";

test("account emails are normalized and malformed account storage is ignored", () => {
  assert.equal(normalizeEmail("  Author@Example.COM "), "author@example.com");
  assert.deepEqual(parseAccounts("not-json"), []);
  assert.deepEqual(parseAccounts(JSON.stringify([{ id: "incomplete" }])), []);
});

test("local beta accounts hash passwords and restore valid sessions", async () => {
  const account = await createLocalAccount("Ada Author", " ADA@example.com ", "correct horse");
  assert.equal(account.email, "ada@example.com");
  assert.notEqual(account.passwordHash, "correct horse");
  assert.equal(await verifyLocalPassword(account, "correct horse"), true);
  assert.equal(await verifyLocalPassword(account, "wrong password"), false);

  const accounts = parseAccounts(JSON.stringify([account]));
  assert.deepEqual(parseSession(serializeSession(account), accounts), { id: account.id, name: "Ada Author", email: "ada@example.com" });
  assert.equal(parseSession(JSON.stringify({ userId: "missing" }), accounts), null);
});
