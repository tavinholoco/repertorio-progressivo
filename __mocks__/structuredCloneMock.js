// Mock CJS para @ungap/structured-clone no ambiente Jest
// O pacote original é ESM puro (type: "module"), incompatível com Jest
function structuredClone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = structuredClone;
module.exports.default = structuredClone;
