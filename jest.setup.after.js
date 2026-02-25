/**
 * setupFilesAfterEnv: roda no escopo do módulo de cada arquivo de teste,
 * APÓS o framework Jest estar instalado.
 *
 * O expo/src/winter instala getters lazy no global durante setupFiles.
 * Esses getters tentam usar o `require` do contexto de setup (já fechado)
 * quando acionados no contexto do teste, causando:
 *   "You are trying to import a file outside of the scope of the test code"
 *
 * Solução: substituir os getters por valores diretos usando Object.defineProperty
 * SEM acionar os getters (que falhariam) — apenas substituindo o descriptor.
 */

// structuredClone — getter aponta para @ungap/structured-clone (ESM puro)
Object.defineProperty(global, 'structuredClone', {
  value: (obj) => JSON.parse(JSON.stringify(obj)),
  writable: true,
  configurable: true,
  enumerable: false,
});

// __ExpoImportMetaRegistry — getter aponta para expo/src/winter/ImportMetaRegistry
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  value: new Map(),
  writable: true,
  configurable: true,
  enumerable: false,
});
