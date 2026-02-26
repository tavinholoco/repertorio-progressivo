# Repertório Progressivo

![CI](https://github.com/tavinholoco/repertorio-progressivo/actions/workflows/test.yml/badge.svg?branch=dev)

Aplicativo mobile para organizar e acompanhar o aprendizado progressivo — gerencie seus lembretes de estudo e registre seu aproveitamento diário, mensal e anual.

---

## Sobre o App

O **Repertório Progressivo** é um app Android desenvolvido com React Native e Expo. Ele foi criado para quem quer manter uma rotina de estudos organizada, oferecendo duas funcionalidades principais:

- **Agenda** — crie lembretes com data, horário e prioridade, visualize no calendário e receba notificações push.
- **Aproveitamento** — registre eventos de estudo com carga horária e marque os dias em que estudou, acompanhando seu progresso mensal e anual.

---

## Screenshots

### Aba Agenda

<div align="center">

| Formulário de lembrete | Calendário e lembretes salvos |
|:---:|:---:|
| <img src="docs/screenshots/agenda-form.png" width="220" alt="Formulário de criação de lembrete"> | <img src="docs/screenshots/agenda-calendar.png" width="220" alt="Calendário e lembretes salvos"> |

</div>

### Aba Aproveitamento

<div align="center">

| Formulário | Seletor de período e grid | Registros salvos |
|:---:|:---:|:---:|
| <img src="docs/screenshots/Aproveitamento-form.png" width="180" alt="Formulário de aproveitamento"> | <img src="docs/screenshots/Aproveitamento-Mensal-Anual.png" width="180" alt="Seletor mensal/anual e grid de dias"> | <img src="docs/screenshots/Aproveitamento-Atualizar.png" width="180" alt="Botão de atualizar e registros salvos"> |

</div>

---

## Funcionalidades

### Agenda de Lembretes
- Criar lembretes com nome, data, horário e prioridade (baixa, média, alta)
- Calendário visual com os dias que possuem lembretes marcados
- Notificações push agendadas via `expo-notifications`
- Editar e excluir lembretes existentes

### Aproveitamento
- Registrar eventos de estudo com carga horária total
- **Modo mensal**: grid de dias do mês para marcar quais dias você estudou
- **Modo anual**: resumo dos 12 meses com dias completados e total
- Gráfico em donut com percentual de aproveitamento
- Barra de progresso calculada automaticamente pelos dias/meses marcados
- Navegar entre períodos anteriores e posteriores

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
| Jest + jest-expo | 30.2.0 / 54.0.17 | Testes automatizados (99 testes) |

> React Compiler habilitado (`experiments.reactCompiler: true` no `app.json`) — não adicionar `useMemo`/`useCallback` manualmente.

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
| `npm test` | Executa os 99 testes automatizados |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | Executa ESLint |
| `npx tsc --noEmit` | Verificação de tipos sem compilar |

---

## Testes

O projeto possui 99 testes automatizados distribuídos em 6 suites:

| Suite | Testes | Descrição |
|-------|--------|-----------|
| `utils/validation.test.ts` | 16 | Validação de lembretes e aproveitamento |
| `utils/dateHelpers.test.ts` | 27 | Funções puras de data e período |
| `services/storage.test.ts` | 13 | Camada AsyncStorage com mocks |
| `services/notifications.test.ts` | 11 | expo-notifications com mocks |
| `context/remindersReducer.test.ts` | 15 | Reducer de lembretes |
| `context/aproveitamentoReducer.test.ts` | 17 | Reducer de aproveitamento |

Para executar:

```bash
npm test               # todos os testes
npm run test:watch     # modo watch (re-executa ao salvar)
npx jest __tests__/services/storage.test.ts  # arquivo específico
```

---

## Estrutura de Pastas

```
Repertorio_progressivo/
├── app/                    # Rotas do Expo Router (file-based routing)
│   ├── _layout.tsx         # Layout raiz: ErrorBoundary → Providers → Tabs
│   ├── index.tsx           # Aba Agenda
│   └── Aproveitamento.tsx  # Aba Aproveitamento (apenas JSX)
│
├── components/             # Componentes de UI
│   ├── index.ts            # Barrel export
│   ├── AgendaScreen.tsx    # Tela da agenda (apenas JSX)
│   ├── ReminderItem.tsx    # Item da lista de lembretes
│   ├── PriorityPicker.tsx  # Seletor de prioridade (3 cores)
│   ├── RecordItem.tsx      # Item da lista de registros
│   ├── ProgressDonut.tsx   # Gráfico em donut de progresso
│   ├── DayGrid.tsx         # Grid de dias do mês
│   ├── MonthGrid.tsx       # Grid dos 12 meses do ano
│   └── ErrorBoundary.tsx   # Captura erros de runtime
│
├── hooks/                  # Custom hooks (toda lógica de negócio)
│   ├── index.ts
│   ├── useAgendaForm.ts    # Lógica e estado do formulário da Agenda
│   └── useAproveitamentoForm.ts  # Lógica e estado do formulário de Aproveitamento
│
├── context/                # Estado global (useReducer)
│   ├── RemindersContext.tsx
│   └── AproveitamentoContext.tsx
│
├── services/               # Camada de serviços
│   ├── index.ts
│   ├── storage.ts          # Único ponto de acesso ao AsyncStorage
│   └── notifications.ts    # Wrapper do expo-notifications
│
├── utils/                  # Funções puras
│   ├── index.ts
│   ├── dateHelpers.ts      # Helpers de data e período
│   └── validation.ts       # Validação de formulários
│
├── constants/              # Tokens de tema
│   ├── index.ts
│   └── theme.ts            # AppColors, calendarTheme
│
├── types/                  # Interfaces TypeScript compartilhadas
│   └── index.ts
│
└── __tests__/              # Suites de teste Jest
    ├── utils/
    ├── services/
    └── context/
```

---

## Arquitetura

O projeto segue o padrão de **separação de responsabilidades em camadas**:

```
AsyncStorage (disco)
      ↕
services/storage.ts          ← único ponto de acesso ao AsyncStorage
      ↕
context/ (RemindersContext, AproveitamentoContext)  ← estado global via useReducer
      ↕
hooks/ (useAgendaForm, useAproveitamentoForm)       ← lógica de formulário
      ↕
components/ e app/           ← apenas JSX (sem lógica de negócio)
```

**Regra principal:** Nenhum componente acessa o `AsyncStorage` diretamente. Toda leitura e escrita passa por `services/storage.ts`.

**Barrel exports:** Cada diretório tem um `index.ts`. Prefira imports via barrel:

```ts
import { ReminderItem, DayGrid } from '@/components';
import { useAgendaForm } from '@/hooks';
import { AppColors } from '@/constants';
import { toDateString } from '@/utils';
```

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
