# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.0.0] — 2026-02-25

### Adicionado

- Arquitetura completa em camadas: `types` → `services` → `utils` → `context` → `hooks` → `components` → `app`
- 103 testes automatizados em 6 suites (validation, dateHelpers, storage, notifications, remindersReducer, aproveitamentoReducer)
- Barrel exports (`index.ts`) em todos os diretórios para imports limpos
- Componentes extraídos da tela principal: `ReminderItem`, `PriorityPicker`, `RecordItem`, `ProgressDonut`, `DayGrid`, `MonthGrid`
- Hooks customizados com toda a lógica de formulário: `useAgendaForm`, `useAproveitamentoForm`
- `ErrorBoundary` (class component) protegendo toda a árvore de componentes
- Tokens Tailwind customizados (`brand-*`, `priority-*`) substituindo cores hex hardcoded
- `RemindersContext` e `AproveitamentoContext` com `useReducer` (reducers exportados para testes)
- Camada de serviços: `services/storage.ts` (único ponto de acesso ao AsyncStorage) e `services/notifications.ts` (wrapper expo-notifications)
- `utils/validation.ts` com `validateReminder()` e `validateAproveitamento()`
- `utils/dateHelpers.ts` com funções puras de data e período
- `README.md` completo para repositório público (substituiu boilerplate do create-expo-app)
- Configuração CI via GitHub Actions (`.github/workflows/test.yml`)
- Este `CHANGELOG.md`

### Corrigido

- Notificações Android: plugin `expo-notifications` configurado no `app.json` com ícone, cor e canal
- Erros de build Android: configurações manuais para `expo-splash-screen` (AAR local) e `gradle.properties`
- Erros falsos do VS Code em `node_modules`: exclude explícito adicionado ao `tsconfig.json`
- Compatibilidade Jest + Expo SDK 54 + New Architecture: `jest.setup.after.js` substitui getters lazy do `expo/src/winter` sem acioná-los

### Removido

- 12 arquivos de template do create-expo-app não utilizados no projeto

[Unreleased]: https://github.com/tavinholoco/repertorio-progressivo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/tavinholoco/repertorio-progressivo/releases/tag/v1.0.0
