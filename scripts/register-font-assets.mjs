import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require.extensions[".woff"] = (module, filename) => {
  const encoded = fs.readFileSync(filename).toString("base64");
  module.exports = `data:font/woff;base64,${encoded}`;
};
