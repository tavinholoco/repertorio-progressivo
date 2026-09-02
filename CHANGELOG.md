# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Adicionado

- `LICENSE` com a Licença MIT — o projeto não tinha arquivo de licença
- `README.pt-BR.md`: versão em português, espelhando seção a seção o README em inglês
- Seletor de idioma no topo dos dois READMEs

### Modificado

- `README.md` reescrito em inglês e padronizado: badges no padrão shields.io, índice, seção
  About focada no problema que o app resolve, stack em tabela por camada com versões reais do
  lockfile, diagrama Mermaid de arquitetura e seção Deploy documentando EAS Build e CI
- `README.md` atualizado com o que estava faltando: componentes `AnimatedTextInput` e
  `EmptyState`, otimizações de performance da v2.0.2 e versões de `expo-linear-gradient`
  e `reanimated-color-picker`
- `CLAUDE.md` sincronizado com o código: remove o `ProgressDonut` (componente que não existe
  mais), corrige a contagem de testes de 103/6 suites para 144/8 suites, adiciona os
  componentes introduzidos na v2.0.0 e v2.0.2, atualiza os tipos `Priority` e `Reminder`
- `CHANGELOG.md`: adicionadas as entradas das versões 2.0.0, 2.0.1 e 2.0.2, que estavam
  documentadas apenas nas GitHub Releases

### Corrigido

- Links quebrados no rodapé do `CHANGELOG.md`: apontavam para uma tag `v1.0.0` que nunca
  foi criada no repositório

---

## [2.0.2] — 2026-03-08

### Adicionado

- Ícone monocromático para os Themed Icons do Android 13 ou superior
- Splits do AAB por idioma, densidade e ABI, para distribuição otimizada via Play Store
- `gradleCommand` explícito no perfil `preview-apk` do EAS, garantindo builds de release consistentes

### Modificado

- Ícone do app redesenhado: coruja roxa sobre fundo `#F7F6FB`
- R8 e resource shrinking habilitados nos builds de release
- `metro.config.js`: remoção automática de `console.*` no bundle de produção via `drop_console`
- Listas de Agenda e Aproveitamento com props de tuning de `FlatList`
  (`initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`)
- Assets comprimidos: `icon.png` de 786 KB para 177 KB, `android-icon-foreground.png` de 356 KB para 64 KB

### Corrigido

- Adaptive Icon do Android: o foreground passou a conter apenas a coruja com fundo transparente,
  corrigindo o recorte em launchers como Samsung One UI, Pixel e MIUI

---

## [2.0.1] — 2026-03-04

### Modificado

- Display name do app de `Repertorio_progressivo` para `Repertorio Progressivo`
- Ícone personalizado substituindo o placeholder padrão do Expo, aplicado como ícone principal
  e como camada foreground do Adaptive Icon

### Corrigido

- Removida configuração redundante de `backgroundImage` no Adaptive Icon
- Versão do `package.json` sincronizada com a do `app.json`

---

## [2.0.0] — 2026-03-04

### Adicionado

- Tab bar flutuante customizada com ícones SVG (`FloatingTabBar` e `TabBarIcon`), eliminando
  a dependência de fontes de ícone e os bugs de renderização no Fabric
- Prioridade personalizada com seletor cromático (`ColorPickerModal` e `reanimated-color-picker`)
- Componentes reutilizáveis: `ProgressBar` animada, `Badge` e `SegmentedToggle`
- Tokens de tema unificados em `constants/theme.ts` (`AppColors`, `Layout`, `calendarTheme`),
  substituindo cerca de 40 valores hex hardcoded
- `utils/id.ts` centralizando `generateId()` e `getIsoNow()`, eliminando a duplicação entre contextos
- Duas suites de teste de integração de contexto, levando a suite de 6 para 8 suites e 144 testes
- `docs/architecture.md` com 8 diagramas Mermaid da arquitetura
- React Compiler e New Architecture habilitados

### Corrigido

- Race condition no `RemindersContext`: o registro passa a ser persistido antes de a notificação
  ser agendada, e salvo novamente com o `notificationId` retornado
- Reducers passam a retornar o estado intacto em actions desconhecidas — faltava o `default case`

---

## 1.0.0 — 2026-02-25

Primeira versão. Não recebeu tag nem GitHub Release.

### Adicionado

- Arquitetura completa em camadas: `types` para `services` para `utils` para `context` para
  `hooks` para `components` para `app`
- Testes automatizados em 6 suites (validation, dateHelpers, storage, notifications,
  remindersReducer, aproveitamentoReducer)
- Barrel exports (`index.ts`) em todos os diretórios
- Componentes extraídos da tela principal: `ReminderItem`, `PriorityPicker`, `RecordItem`,
  `ProgressDonut`, `DayGrid`, `MonthGrid`
- Hooks customizados com toda a lógica de formulário: `useAgendaForm`, `useAproveitamentoForm`
- `ErrorBoundary` protegendo toda a árvore de componentes
- Tokens Tailwind customizados (`brand-*`, `priority-*`)
- `RemindersContext` e `AproveitamentoContext` com `useReducer`, reducers exportados para teste
- Camada de serviços: `services/storage.ts` e `services/notifications.ts`
- `utils/validation.ts` e `utils/dateHelpers.ts`
- `README.md` completo, substituindo o boilerplate do create-expo-app
- CI via GitHub Actions em `.github/workflows/test.yml`
- Este `CHANGELOG.md`

### Corrigido

- Notificações no Android: plugin `expo-notifications` configurado no `app.json` com ícone,
  cor e canal
- Erros de build Android: configurações manuais para `expo-splash-screen` (AAR local) e `gradle.properties`
- Erros falsos do VS Code em `node_modules`: exclude explícito no `tsconfig.json`
- Compatibilidade Jest com Expo SDK 54 e New Architecture: `jest.setup.after.js` substitui os
  getters lazy do `expo/src/winter` sem acioná-los

### Removido

- 12 arquivos de template do create-expo-app não utilizados

[Unreleased]: https://github.com/tavinholoco/repertorio-progressivo/compare/v2.0.2...HEAD
[2.0.2]: https://github.com/tavinholoco/repertorio-progressivo/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/tavinholoco/repertorio-progressivo/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/tavinholoco/repertorio-progressivo/releases/tag/v2.0.0
