# Repertório Progressivo

![CI](https://github.com/tavinholoco/repertorio-progressivo/actions/workflows/test.yml/badge.svg?branch=master)
![Versão](https://img.shields.io/badge/vers%C3%A3o-2.0-6C2DC7)
![Testes](https://img.shields.io/badge/testes-144%20passing-brightgreen)

[![Download APK](https://img.shields.io/badge/Download-APK%20v2.0-6C2DC7?style=for-the-badge&logo=android&logoColor=white)](https://github.com/tavinholoco/repertorio-progressivo/releases/latest)

Aplicativo mobile para organizar e acompanhar o aprendizado progressivo — gerencie seus lembretes de estudo e registre seu aproveitamento diário, mensal e anual.

---

## Download

**[Baixar APK mais recente](https://github.com/tavinholoco/repertorio-progressivo/releases/latest)**

> Para instalar, habilite "Instalar de fontes desconhecidas" nas configurações do Android.

---

## Sobre o App

O **Repertório Progressivo** é um app Android desenvolvido com React Native e Expo. Ele foi criado para quem quer manter uma rotina de estudos organizada, oferecendo duas funcionalidades principais:

- **Agenda** — crie lembretes com data, horário, prioridade e cor personalizada; visualize no calendário e receba notificações push.
- **Aproveitamento** — registre eventos de estudo com carga horária e marque os dias em que estudou, acompanhando seu progresso mensal e anual.

---

## Screenshots

### Aba Agenda (v2)

<div align="center">

| Formulário de lembrete | Seletor de cor personalizada | Calendário e lembretes salvos |
|:---:|:---:|:---:|
| <img src="docs/screenshots/V2/Agenda-form.png" width="200" alt="Formulário de criação de lembrete"> | <img src="docs/screenshots/V2/Agenda-cor.png" width="200" alt="Seletor de cor personalizada"> | <img src="docs/screenshots/V2/Agenda-lembretes.png" width="200" alt="Calendário e lembretes salvos"> |

</div>

### Aba Aproveitamento (v2)

<div align="center">

| Formulário e dias (mensal) | Formulário e meses (anual) | Registros salvos |
|:---:|:---:|:---:|
| <img src="docs/screenshots/V2/Aproveitamento-mes.png" width="200" alt="Formulário e grid de dias do mês"> | <img src="docs/screenshots/V2/Aproveitamento-anual.png" width="200" alt="Formulário e grid de meses do ano"> | <img src="docs/screenshots/V2/Aproveitamento-registros.png" width="200" alt="Registros salvos de aproveitamento"> |

</div>

---

### Versão anterior (v1)

<details>
<summary>Ver screenshots da v1</summary>

#### Aba Agenda (v1)

<div align="center">

| Formulário de lembrete | Calendário e lembretes salvos |
|:---:|:---:|
| <img src="docs/screenshots/V1/agenda-form.png" width="220" alt="Formulário de criação de lembrete (v1)"> | <img src="docs/screenshots/V1/agenda-calendar.png" width="220" alt="Calendário e lembretes salvos (v1)"> |

</div>

#### Aba Aproveitamento (v1)

<div align="center">

| Formulário | Seletor de período e grid | Registros salvos |
|:---:|:---:|:---:|
| <img src="docs/screenshots/V1/Aproveitamento-form.png" width="180" alt="Formulário de aproveitamento (v1)"> | <img src="docs/screenshots/V1/Aproveitamento-Mensal-Anual.png" width="180" alt="Seletor mensal/anual e grid de dias (v1)"> | <img src="docs/screenshots/V1/Aproveitamento-Atualizar.png" width="180" alt="Botão de atualizar e registros salvos (v1)"> |

</div>

</details>

---

## Funcionalidades

### Agenda de Lembretes
- Criar lembretes com nome, data, horário e prioridade (baixa, média, alta ou **cor personalizada**)
- Seletor cromático para cor customizada via `reanimated-color-picker`
- Calendário visual com os dias que possuem lembretes marcados
- Notificações push agendadas via `expo-notifications`
- Editar e excluir lembretes existentes

### Aproveitamento
- Registrar eventos de estudo com carga horária total
- **Modo mensal**: grid de dias do mês para marcar quais dias você estudou
- **Modo anual**: resumo dos 12 meses com dias completados e total
- Barra de progresso animada calculada automaticamente pelos dias/meses marcados
- Navegar entre períodos anteriores e posteriores

### Interface
- Tab bar flutuante customizada com ícones SVG (sem dependência de fontes)
- Gradiente linear na aba ativa via `expo-linear-gradient`
- Tema unificado com tokens de cor e espaçamento (`AppColors`, `Layout`)

---

## Stack Tecnológica

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React Native | 0.81.5 | Framework mobile |
| Expo | SDK 54 | Plataforma de build e runtime |
| expo-router | 6.0.14 | Roteamento baseado em arquivos |
| NativeWind | 2.0.11 | Tailwind CSS para React Native |
| TypeScript | 5.9.2 | Tipagem estática (strict mode) |
| AsyncStorage | 2.2.0 | Persistência local de dados |
| expo-notifications | 0.32.16 | Notificações push |
| react-native-calendars | 1.1313.0 | Componente de calendário |
| react-native-reanimated | 4.1.1 | Animações (New Architecture) |
| react-native-svg | 15.15.3 | Ícones SVG da tab bar |
| expo-linear-gradient | — | Gradiente na tab bar ativa |
| reanimated-color-picker | — | Seletor cromático de cor personalizada |
| Jest + jest-expo | 30.2.0 / 54.0.17 | Testes automatizados (144 testes) |

> **React Compiler habilitado** (`experiments.reactCompiler: true` no `app.json`) — não adicionar `useMemo`/`useCallback` manualmente.

> **New Architecture habilitada** (`newArchEnabled: true`) — usa o renderer Fabric e o sistema de módulos nativos TurboModules.

---

## Pré-requisitos

Antes de clonar e rodar o projeto, certifique-se de ter instalado:

- **Node.js** (versão LTS recomendada) — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **Android Studio** com o Android SDK instalado — [developer.android.com/studio](https://developer.android.com/studio)
- **JDK** — o Android Studio já inclui um JDK interno (`jbr`); não é necessário instalar separadamente
- **Emulador Android** configurado no AVD Manager (Android Virtual Device)

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/tavinholoco/repertorio-progressivo.git
cd repertorio-progressivo
```

### 2. Instalar dependências

```bash
npm install
```

> Para adicionar novos pacotes no futuro, use sempre `npx expo install <pacote>` em vez de `npm install` — o Expo fixa versões validadas para o SDK 54.

---

## Configuração Manual Obrigatória

Esses arquivos **não são versionados** e precisam ser criados manualmente em cada máquina.

### `android/local.properties`

Aponta para o Android SDK instalado na sua máquina. Crie o arquivo `android/local.properties` com o conteúdo abaixo, substituindo pelo caminho real do seu SDK:

```properties
sdk.dir=C\:\\Users\\<seu-usuario>\\AppData\\Local\\Android\\Sdk
```

No Linux/macOS:
```properties
sdk.dir=/Users/<seu-usuario>/Library/Android/sdk
```

> Esse arquivo já está no `.gitignore` — não versione; cada desenvolvedor cria o seu.

### `android/gradle.properties` — caminho do JDK

O arquivo `android/gradle.properties` já está no repositório configurado com o JDK interno do Android Studio:

```properties
org.gradle.java.home=C:\\Program Files\\Android\\Android Studio\\jbr
```

Se o Android Studio estiver instalado em outro caminho na sua máquina, ajuste essa linha. Caso o `JAVA_HOME` do sistema já aponte para um JDK válido, você pode remover essa linha.

---

## Executando o App

### Modo recomendado — Build nativo (com suporte a notificações)

```bash
npm run android
```

Isso compila o APK de desenvolvimento e instala no emulador Android em execução. Necessário para testar notificações push.

### Modo rápido — Expo Go (sem notificações)

```bash
npm start
```

> **Atenção:** desde o Expo SDK 53, o `expo-notifications` **não funciona** no Expo Go. Para testar notificações, use sempre `npm run android`.

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run android` | Build nativo + executa no emulador Android |
| `npm run ios` | Build nativo + executa no simulador iOS |
| `npm start` | Inicia dev server via Expo Go (sem notificações) |
| `npm run web` | Inicia servidor web (React Native Web) |
| `npm test` | Executa os 144 testes automatizados |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | Executa ESLint |
| `npx tsc --noEmit` | Verificação de tipos sem compilar |

---

## Testes

O projeto possui **144 testes automatizados** distribuídos em **8 suites**:

| Suite | Tipo | Testes | O que cobre |
|-------|------|--------|-------------|
| `utils/validation.test.ts` | Unitário | 29 | `validateReminder`, `validateAproveitamento`, `isValidHex` — incluindo edge cases de hex e whitespace |
| `utils/dateHelpers.test.ts` | Unitário | 36 | `toDateString`, `toTimeString`, `getDaysInMonth`, `currentPeriod`, `formatPeriodLabel`, `buildAnnualMonths` |
| `services/storage.test.ts` | Unitário | 13 | Camada AsyncStorage via mocks — get, save, delete para reminders e records |
| `services/notifications.test.ts` | Unitário | 11 | `scheduleReminderNotification`, `cancelNotification` via mocks do `expo-notifications` |
| `context/remindersReducer.test.ts` | Unitário | 17 | Reducer puro: todas as actions (`LOAD_START/SUCCESS/ERROR`, `ADD`, `UPDATE`, `DELETE`) + default case |
| `context/aproveitamentoReducer.test.ts` | Unitário | 18 | Idem para o reducer de aproveitamento |
| `context/remindersContext.test.ts` | Integração | 12 | Orquestração completa de `addReminder`, `updateReminder`, `removeReminder` |
| `context/aproveitamentoContext.test.ts` | Integração | 8 | Orquestração completa de `addRecord`, `updateRecord`, `removeRecord` |

### Como executar

```bash
npm test                                              # todos os 144 testes
npm run test:watch                                    # modo watch (re-executa ao salvar)
npx jest __tests__/services/storage.test.ts           # suite específica
npx jest --testNamePattern="addReminder"              # testes por nome
```

### Padrões adotados

**Mocks antes dos imports** — native modules (AsyncStorage, expo-notifications) exigem que `jest.mock()` seja declarado antes de qualquer `import`:

```ts
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/storage');

import { reducer } from '@/context/RemindersContext';
```

**Fake timers com construtor local** — `new Date('YYYY-MM-DD')` é interpretado como UTC midnight; em fusos negativos (ex.: UTC-3) isso retorna o dia anterior. Use sempre o construtor local:

```ts
// ❌ pode falhar em UTC-3
jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));

// ✅ sempre correto
jest.useFakeTimers().setSystemTime(new Date(2025, 0, 1)); // mês 0-indexado
```

**`invocationCallOrder` para ordem de chamadas** — verifica que o storage é persistido *antes* de agendar a notificação (race condition fix):

```ts
expect(saveCallOrder).toBeLessThan(scheduleCallOrder);
```

### Testes de integração de contexto

As duas últimas suites testam a lógica de orquestração dos contextos — a parte mais crítica do app. Cada teste renderiza o Provider completo via `renderHook` e verifica o comportamento end-to-end:

```ts
const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(RemindersProvider, null, children)
);

it('salva novamente com notificationId quando schedule retorna id', async () => {
  notificationsModule.scheduleReminderNotification.mockResolvedValue('notif-123');

  const { result } = renderHook(() => useReminders(), { wrapper });
  await waitFor(() => expect(result.current.state.isLoading).toBe(false));

  await act(async () => {
    await result.current.addReminder(makeInput());
  });

  expect(storageModule.saveReminder).toHaveBeenCalledTimes(2);
  const secondCall = storageModule.saveReminder.mock.calls[1][0] as Reminder;
  expect(secondCall.notificationId).toBe('notif-123');
});
```

---

## Diagramas de Arquitetura

A pasta [`docs/architecture.md`](docs/architecture.md) contém **8 diagramas Mermaid** cobrindo toda a arquitetura do projeto:

| # | Diagrama | Tipo | Foco |
|---|----------|------|------|
| 1 | Arquitetura de Dados | `graph TD` | Fluxo AsyncStorage → storage → contexts → hooks → screens |
| 2 | Hierarquia de Componentes | `graph LR` | Árvore completa do layout raiz até componentes folha |
| 3 | Fluxo de Notificações | `sequenceDiagram` | `addReminder`, `updateReminder`, `removeReminder` com race condition fix |
| 4 | State Machine — Agenda | `stateDiagram-v2` | Estados do formulário de lembretes (Idle → Creating → Saving) |
| 5 | State Machine — Aproveitamento | `stateDiagram-v2` | Hydration automática, `skipNextHydrationRef`, navegação de período |
| 6a | RemindersContext Actions | `graph TD` | Actions do reducer, mutações de estado e side effects |
| 6b | AproveitamentoContext Actions | `graph TD` | Idem para o contexto de aproveitamento |
| 7 | ER — Tipos de Dados | `erDiagram` | `Reminder`, `AproveitamentoRecord`, `MonthRecord`, `Priority`, `PeriodType` |

> Os diagramas renderizam nativamente no GitHub e no VSCode com a extensão [`bierner.markdown-mermaid`](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid).

---

## Estrutura de Pastas

```
Repertorio_progressivo/
├── app/                         # Rotas do Expo Router (file-based routing)
│   ├── _layout.tsx              # Layout raiz: ErrorBoundary → Providers → Tabs
│   ├── index.tsx                # Aba Agenda
│   └── Aproveitamento.tsx       # Aba Aproveitamento (apenas JSX)
│
├── components/                  # Componentes de UI
│   ├── index.ts                 # Barrel export
│   ├── AgendaScreen.tsx         # Tela da agenda (apenas JSX)
│   ├── ReminderItem.tsx         # Item da lista de lembretes
│   ├── PriorityPicker.tsx       # Seletor de prioridade (baixa/média/alta/custom)
│   ├── ColorPickerModal.tsx     # Modal de seleção de cor cromática
│   ├── RecordItem.tsx           # Item da lista de registros de aproveitamento
│   ├── DayGrid.tsx              # Grid de dias do mês (modo mensal)
│   ├── MonthGrid.tsx            # Grid dos 12 meses (modo anual)
│   ├── ProgressBar.tsx          # Barra de progresso animada (reutilizável)
│   ├── Badge.tsx                # Pill de label reutilizável
│   ├── SegmentedToggle.tsx      # Toggle Mensal / Anual
│   ├── FloatingTabBar.tsx       # Tab bar flutuante customizada
│   ├── TabBarIcon.tsx           # Ícones SVG da tab bar
│   └── ErrorBoundary.tsx        # Captura erros de runtime
│
├── hooks/                       # Custom hooks (toda lógica de negócio)
│   ├── index.ts
│   ├── useAgendaForm.ts         # Lógica e estado do formulário da Agenda
│   └── useAproveitamentoForm.ts # Lógica e estado do formulário de Aproveitamento
│
├── context/                     # Estado global (useReducer)
│   ├── RemindersContext.tsx
│   └── AproveitamentoContext.tsx
│
├── services/                    # Camada de serviços
│   ├── index.ts
│   ├── storage.ts               # Único ponto de acesso ao AsyncStorage
│   └── notifications.ts         # Wrapper do expo-notifications
│
├── utils/                       # Funções puras
│   ├── index.ts
│   ├── dateHelpers.ts           # Helpers de data e período
│   ├── validation.ts            # Validação de formulários
│   └── id.ts                    # generateId(), getIsoNow()
│
├── constants/                   # Tokens de tema
│   ├── index.ts
│   └── theme.ts                 # AppColors, calendarTheme, Layout
│
├── types/                       # Interfaces TypeScript compartilhadas
│   └── index.ts                 # Reminder, AproveitamentoRecord, MonthRecord, Priority, PeriodType
│
├── docs/                        # Documentação
│   ├── architecture.md          # 8 diagramas Mermaid da arquitetura
│   └── screenshots/
│       ├── V1/                  # Capturas da versão 1.0
│       └── V2/                  # Capturas da versão 2.0 (atual)
│
└── __tests__/                   # Suites de teste Jest
    ├── utils/
    │   ├── dateHelpers.test.ts
    │   └── validation.test.ts
    ├── services/
    │   ├── storage.test.ts
    │   └── notifications.test.ts
    └── context/
        ├── remindersReducer.test.ts
        ├── aproveitamentoReducer.test.ts
        ├── remindersContext.test.ts      ← integração
        └── aproveitamentoContext.test.ts ← integração
```

---

## Arquitetura

O projeto segue o padrão de **separação de responsabilidades em camadas**:

```
AsyncStorage (disco)
      ↕
services/storage.ts              ← único ponto de acesso ao AsyncStorage
      ↕
context/ (RemindersContext,      ← estado global via useReducer
          AproveitamentoContext)
      ↕
hooks/ (useAgendaForm,           ← lógica de formulário e validação
        useAproveitamentoForm)
      ↕
components/ e app/               ← apenas JSX (sem lógica de negócio)
```

**Regra principal:** Nenhum componente acessa o `AsyncStorage` diretamente. Toda leitura e escrita passa por `services/storage.ts`. Nenhum componente usa `useContext` diretamente — sempre via hooks (`useReminders()`, `useAproveitamento()`).

**Regra de Barrel:** Cada diretório tem um `index.ts`. Código **fora** do diretório usa o barrel:
```ts
import { ReminderItem, DayGrid } from '@/components';
import { useAgendaForm } from '@/hooks';
import { AppColors, Layout } from '@/constants';
import { toDateString, validateReminder } from '@/utils';
```
Código **dentro** do mesmo diretório usa imports diretos (`./Foo`) — nunca o próprio barrel — para evitar require cycles.

**`utils/id.ts`:** Centraliza `generateId()` e `getIsoNow()`, eliminando duplicação entre `RemindersContext` e `AproveitamentoContext`.

**React Compiler:** Habilitado em `app.json` (`experiments.reactCompiler: true`). Não adicionar `useMemo` / `useCallback` manualmente — o compilador faz as memoizações necessárias.

---

## Changelog

### v2.0.0 — 2026-03-04

- **Tab bar flutuante customizada** com ícones SVG (FloatingTabBar + TabBarIcon) — elimina dependência de fontes e bugs de renderização no Fabric
- **Prioridade custom** com seletor de cor cromático (ColorPickerModal + reanimated-color-picker)
- **Novos componentes reutilizáveis:** ProgressBar (animada), Badge (pill), SegmentedToggle (mensal/anual)
- **Tokens de tema unificados:** AppColors, Layout, calendarTheme em `constants/theme.ts` — ~40 hex hardcoded substituídos
- **`utils/id.ts`:** centraliza `generateId` e `getIsoNow` (elimina duplicação entre contextos)
- **Fix de race condition** em RemindersContext: storage persistido antes de `scheduleNotification`
- **Fix de bug:** reducers retornam state intacto para actions desconhecidas (default case ausente)
- **Suite de testes expandida:** 99 → 144 testes, 6 → 8 suites (+2 suites de integração de contexto)
- **Documentação visual** com 8 diagramas Mermaid em `docs/architecture.md`
- React Compiler + New Architecture habilitados

### v1.0.0 — inicial

- Agenda de lembretes com notificações push (expo-notifications)
- Aproveitamento com modo mensal e anual
- 99 testes automatizados em 6 suites

---

## Branch Strategy

| Branch | Uso |
|--------|-----|
| `master` | Releases estáveis |
| `dev` | Desenvolvimento ativo — features e correções |

Fluxo: desenvolver em `dev` → testar → mergear para `master` quando estável.

---

## Licença

Este projeto é de uso pessoal e educacional.
