module.exports = function loadWoffAsDataUrl(content) {
  const encoded = content.toString("base64");
  return `export default ${JSON.stringify(`data:font/woff;base64,${encoded}`)};`;
};

module.exports.raw = true;
