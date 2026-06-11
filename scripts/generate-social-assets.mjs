import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const encodedAssetDirectory = join(rootDirectory, "scripts", "social-assets");
const publicDirectory = join(rootDirectory, "public");

const assets = {
  "clarity-loop-og.png": "5a0ed35a70f3125f105de4cd17ed954e1c85de83ed3d248a1153f452539ba2b3",
  "favicon.ico": "2496b00ef530849269e9d4d01cf8851e634dd764e5ff14f460866ea4ea16f7d4",
  "icon.png": "07322cd2fa332e72f9ad9d4f7bc61b9afc2bc43dd16dcb65c8954ace027e53c9",
  "apple-icon.png": "1192a72f60c86c8379a7fcd40e61039869231cd8df09b9fbbfc9f29d21935a2f",
};

await mkdir(publicDirectory, { recursive: true });

for (const [fileName, expectedHash] of Object.entries(assets)) {
  const encoded = await readFile(join(encodedAssetDirectory, `${fileName}.base64`), "utf8");
  const contents = Buffer.from(encoded.replaceAll(/\s/g, ""), "base64");
  const actualHash = createHash("sha256").update(contents).digest("hex");

  if (actualHash !== expectedHash) {
    throw new Error(`Refusing to write ${fileName}: encoded asset checksum mismatch.`);
  }

  await writeFile(join(publicDirectory, fileName), contents);
}

console.log(`Generated ${Object.keys(assets).length} social assets in public/.`);
