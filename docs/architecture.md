# Arquitetura — Repertório Progressivo

Documentação visual da arquitetura do projeto. Cada diagrama cobre uma camada ou fluxo específico.

**Índice:**
1. [Arquitetura de Dados](#1-arquitetura-de-dados)
2. [Hierarquia de Componentes](#2-hierarquia-de-componentes)
3. [Fluxo de Notificações](#3-fluxo-de-notificações)
4. [State Machine — Agenda](#4-state-machine--formulário-de-agenda)
5. [State Machine — Aproveitamento](#5-state-machine--formulário-de-aproveitamento--hydration)
6a. [RemindersContext — Ações e Side Effects](#6a-reminderscontext--ações-reducer-e-side-effects)
6b. [AproveitamentoContext — Ações e Side Effects](#6b-aproveitamentocontext--ações-reducer-e-side-effects)
7. [ER — Tipos de Dados](#7-er--tipos-de-dados)

---

## 1. Arquitetura de Dados

**Pergunta que responde:** Como os dados fluem desde a persistência em disco até as telas?

**Público-alvo:** Devs que precisam entender quem chama quem e onde adicionar nova lógica.

**Última atualização:** 2026-03-04

```mermaid
graph TD
    %% === ESTILOS ===
    classDef storage  fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100
    classDef service  fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b
    classDef utils    fill:#f5f5f5,stroke:#9e9e9e,stroke-width:2px,color:#424242
    classDef context  fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef hooks    fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    classDef screen   fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b

    %% === PERSISTÊNCIA ===
    subgraph DISK["💾 Persistência"]
        AS[(AsyncStorage)]
    end

    %% === SERVIÇOS E UTILITÁRIOS ===
    subgraph SVC["🔧 Serviços e Utilitários"]
        ST["storage.ts"]
        NT["notifications.ts"]
        ID["utils/id.ts"]
        DH["utils/dateHelpers.ts"]
        VL["utils/validation.ts"]
    end

    %% === ESTADO GLOBAL ===
    subgraph CTX["🗃️ Estado Global"]
        RC["RemindersContext"]
        AC["AproveitamentoContext"]
    end

    %% === LÓGICA DE FORMULÁRIO ===
    subgraph HKS["🪝 Lógica de Formulário"]
        UAF["useAgendaForm"]
        UAPF["useAproveitamentoForm"]
    end

    %% === TELAS E ROTEAMENTO ===
    subgraph SCR["📱 Telas e Roteamento"]
        AGS["AgendaScreen"]
        APR["Aproveitamento.tsx"]
        LAY["_layout.tsx"]
        IDX["index.tsx"]
    end

    %% === CONEXÕES ===
    AS <-->|"JSON serializado"| ST
    ST -->|"leitura/escrita"| RC
    ST -->|"leitura/escrita"| AC
    NT -->|"schedule / cancel"| RC
    ID --> RC
    ID --> AC
    VL --> UAF
    VL --> UAPF
    DH --> UAF
    DH --> UAPF
    RC --> UAF
    AC --> UAPF
    UAF --> AGS
    UAPF --> APR
    LAY --> IDX
    IDX --> AGS
    LAY --> APR

    %% === CLASSES ===
    class AS storage
    class ST,NT service
    class ID,DH,VL utils
    class RC,AC context
    class UAF,UAPF hooks
    class AGS,APR,LAY,IDX screen
```

**Legenda:**
- 🟠 Laranja: Persistência (AsyncStorage)
- 🔵 Azul: Serviços internos e telas
- ⚫ Cinza: Utilitários puros
- 🟣 Roxo: Estado global (contextos)
- 🟢 Verde: Lógica de formulário (hooks)

**Notas:**
- `storage.ts` exporta: `getReminders`, `saveReminder`, `deleteReminder`, `getAproveitamentos`, `saveAproveitamento`, `deleteAproveitamento`
- `notifications.ts` exporta: `scheduleReminderNotification`, `cancelNotification`, `requestPermissions`
- `dateHelpers.ts` exporta: `toDateString`, `toTimeString`, `formatDisplayDate`, `formatDisplayTime`, `getDaysInMonth`, `buildAnnualMonths`, `formatPeriodLabel`, `currentPeriod`
- Chaves AsyncStorage: `@app:reminders`, `@app:aproveitamento`
- Nenhum componente acessa `AsyncStorage` diretamente — tudo passa por `storage.ts`.
- Nenhum componente usa `useContext` diretamente — sempre via `useReminders()` / `useAproveitamento()`.

---

## 2. Hierarquia de Componentes

**Pergunta que responde:** Qual é a árvore de componentes do layout raiz até as folhas?

**Público-alvo:** Devs frontend que precisam localizar onde um componente está montado ou adicionar um novo.

**Última atualização:** 2026-03-04

```mermaid
graph LR
    %% === ESTILOS ===
    classDef provider fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef navigator fill:#f5f5f5,stroke:#9e9e9e,stroke-width:2px,color:#424242
    classDef screen   fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b
    classDef shared   fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20

    %% === RAIZ ===
    subgraph ROOT["🏠 Raiz"]
        GHRV["GestureHandlerRootView"]
        EB["ErrorBoundary"]
        RP["RemindersProvider"]
        AP["AproveitamentoProvider"]
        TB["Tabs (Expo Router)"]
    end

    %% === TAB BAR ===
    subgraph TABBAR["🧭 Tab Bar"]
        FTB["FloatingTabBar"]
        TBI["TabBarIcon (SVG)"]
    end

    %% === ROTA: AGENDA ===
    subgraph AGENDA["📅 Agenda"]
        IDX["index.tsx"]
        AGS["AgendaScreen"]
        ATI1["AnimatedTextInput"]
        DTF["DateTimeField"]
        PP["PriorityPicker"]
        CPM["ColorPickerModal"]
        CAL["Calendar"]
        RI["ReminderItem"]
    end

    %% === ROTA: APROVEITAMENTO ===
    subgraph APROV["📊 Aproveitamento"]
        APR["Aproveitamento.tsx"]
        ATI2["AnimatedTextInput"]
        ST_TOG["SegmentedToggle"]
        DG["DayGrid"]
        MG["MonthGrid"]
        RECI["RecordItem"]
    end

    %% === COMPONENTES COMPARTILHADOS ===
    subgraph SHARED["♻️ Compartilhados"]
        BADGE["Badge"]
        PB["ProgressBar"]
        ES["EmptyState"]
    end

    %% === WRAPPING DOS PROVIDERS ===
    GHRV --> EB --> RP --> AP --> TB

    %% === TAB BAR ===
    TB -->|"prop tabBar"| FTB
    FTB --> TBI

    %% === ROTAS ===
    TB --> IDX
    TB --> APR

    %% === AGENDA ===
    IDX --> AGS
    AGS --> ATI1
    AGS --> DTF
    AGS --> PP
    AGS --> CPM
    AGS --> CAL
    AGS --> RI

    %% === APROVEITAMENTO ===
    APR --> ATI2
    APR --> ST_TOG
    APR --> DG
    APR --> MG
    APR --> RECI

    %% === COMPONENTES COMPARTILHADOS ===
    AGS --> BADGE
    AGS --> ES
    APR --> BADGE
    APR --> ES
    APR --> PB
    RI --> BADGE
    RECI --> BADGE
    RECI --> PB

    %% === CLASSES ===
    class RP,AP provider
    class GHRV,EB,TB,FTB,TBI,IDX navigator
    class AGS,APR screen
    class ATI1,ATI2,DTF,PP,CPM,CAL,RI,ST_TOG,DG,MG,RECI screen
    class BADGE,PB,ES shared
```

**Legenda:**
- 🟣 Roxo: Providers de estado global
- ⚫ Cinza: Navegação e wrappers
- 🔵 Azul: Telas e componentes de rota
- 🟢 Verde: Componentes compartilhados entre rotas

**Notas:**
- A ordem dos providers importa: `GestureHandlerRootView → ErrorBoundary → RemindersProvider → AproveitamentoProvider → Tabs`.
- Arquivos dentro de `components/` usam imports diretos (`./Foo`), nunca o barrel `@/components` — violações geram `WARN Require cycle`.
- `Badge` e `ProgressBar` aparecem em ambas as rotas; `EmptyState` também é compartilhado.

---

## 3. Fluxo de Notificações

**Pergunta que responde:** Em que ordem exata são executadas as operações ao criar, editar ou remover um lembrete com notificação?

**Público-alvo:** Devs que mantêm a lógica de notificações ou investigam bugs de agendamento.

**Última atualização:** 2026-03-04

```mermaid
sequenceDiagram
    actor U as Usuário
    participant H as useAgendaForm
    participant RC as RemindersContext
    participant ST as storage.ts
    participant NT as notifications.ts
    participant OS as expo-notifications

    %% ─── CRIAR LEMBRETE ───────────────────────────────────────────
    rect rgb(235, 245, 255)
        Note over U,OS: ➕ addReminder — criar novo lembrete

        U->>H: handleSave()
        activate H
        H->>H: validateReminder() ✓
        H->>RC: addReminder(input)
        activate RC

        Note over RC,ST: 🔒 Storage ANTES da notificação (race condition fix)
        RC->>ST: saveReminder(reminder)
        activate ST
        ST-->>RC: ok
        deactivate ST

        RC->>NT: scheduleReminderNotification(reminder)
        activate NT
        Note over NT: verifica permissão + valida data/hora

        alt permissão concedida e data futura
            NT->>OS: scheduleNotificationAsync(trigger: DATE)
            OS-->>NT: notificationId
            NT-->>RC: notificationId
            deactivate NT
            RC->>ST: saveReminder(reminder + notificationId)
            activate ST
            ST-->>RC: ok
            deactivate ST
        else permissão negada ou data passada
            NT-->>RC: null
            deactivate NT
        end

        RC->>RC: dispatch ADD
        deactivate RC
        H->>H: resetForm()
        deactivate H
    end

    %% ─── ATUALIZAR LEMBRETE ────────────────────────────────────────
    rect rgb(255, 248, 230)
        Note over U,OS: ✏️ updateReminder — editar lembrete existente

        U->>H: handleSave() [editingReminder != null]
        activate H
        H->>H: validateReminder() ✓
        H->>RC: updateReminder(reminder)
        activate RC

        opt reminder tem notificationId
            RC->>NT: cancelNotification(notificationId)
            NT->>OS: cancelScheduledNotificationAsync(id)
            Note over NT: try/catch interno — falha silenciosa
        end

        RC->>NT: scheduleReminderNotification(reminder)
        NT->>OS: scheduleNotificationAsync(trigger: DATE)
        OS-->>NT: newNotificationId (ou null)
        NT-->>RC: newNotificationId

        RC->>ST: saveReminder(updated + updatedAt)
        activate ST
        ST-->>RC: ok
        deactivate ST

        RC->>RC: dispatch UPDATE
        deactivate RC
        H->>H: resetForm()
        deactivate H
    end

    %% ─── REMOVER LEMBRETE ──────────────────────────────────────────
    rect rgb(255, 235, 235)
        Note over U,OS: 🗑️ removeReminder — excluir lembrete

        U->>H: onDelete(id)
        H->>RC: removeReminder(id)
        activate RC

        opt reminder tem notificationId
            RC->>NT: cancelNotification(notificationId)
            NT->>OS: cancelScheduledNotificationAsync(id)
            Note over NT: try/catch interno — falha silenciosa
        end

        RC->>ST: deleteReminder(id)
        activate ST
        ST-->>RC: ok
        deactivate ST

        RC->>RC: dispatch DELETE
        deactivate RC
    end
```

**Notas:**
- `scheduleReminderNotification` retorna `null` se: permissão negada, data no passado, data inválida (`isNaN`), ou falha do SO.
- `cancelNotification` nunca lança exceção — tem `try/catch` interno.
- Em `updateReminder`, o cancelamento da notificação antiga ocorre **antes** de agendar a nova.
- `expo-notifications` não é suportado no Expo Go (SDK 53+) — requer `npm run android`.

---

## 4. State Machine — Formulário de Agenda

**Pergunta que responde:** Quais são os estados possíveis do formulário de Agenda e o que causa cada transição?

**Público-alvo:** Devs que mantêm `useAgendaForm` ou adicionam novos campos ao formulário.

**Última atualização:** 2026-03-04

```mermaid
stateDiagram-v2
    [*] --> Idle

    %% ── ESTADO PRINCIPAL ──────────────────────────────────────────
    state "Idle" as Idle
    state "Creating" as Creating
    state "Editing" as Editing

    state "Saving" as Saving {
        [*] --> Submitting
        state "isSubmitting = true" as Submitting
    }

    Idle --> Creating : digita nome / seleciona data/hora/cor
    Idle --> Editing  : populateForm(reminder)

    Creating --> Creating : handleNameChange / setDate / setTime / handleSelectColor
    Editing  --> Editing  : handleNameChange / setDate / setTime / handleSelectColor

    Creating --> Saving  : handleSave() [válido]
    Editing  --> Saving  : handleSave() [válido]

    Creating --> Creating : handleSave() [inválido]
    Editing  --> Editing  : handleSave() [inválido]

    Saving --> Idle : dispatch ADD / UPDATE → resetForm()

    Editing --> Idle : botão "Cancelar" → resetForm()

    %% ── PICKERS (paralelo ao estado principal) ────────────────────
    state "Pickers e Modal (paralelo)" as Pickers {
        state "DatePicker" as DP {
            state "fechado" as DPClosed
            state "aberto" as DPOpen
            DPClosed --> DPOpen   : onPress no campo de data
            DPOpen   --> DPClosed : onValueChange(date)
        }

        state "TimePicker" as TP {
            state "fechado" as TPClosed
            state "aberto" as TPOpen
            TPClosed --> TPOpen   : onPress no campo de horário
            TPOpen   --> TPClosed : onValueChange(time)
        }

        state "ColorPickerModal" as CM {
            state "fechado" as CMClosed
            state "aberto" as CMOpen
            CMClosed --> CMOpen   : PriorityPicker → onOpenColorPicker
            CMOpen   --> CMClosed : onSelect(hex) / onClose
        }
    }

    note right of Pickers
        No Android, DateTimePicker fecha
        sozinho ao confirmar.
        Padrão: setShow(Platform.OS === 'ios')
    end note
```

**Notas:**
- `Idle`: `editingReminder = null`, formulário vazio.
- `Creating`: `editingReminder = null`, usuário preenchendo campos.
- `Editing`: `editingReminder = Reminder`, campos populados via `populateForm()`.
- Validação inválida mantém o estado atual com `errors` preenchidos — sem transição.
- **Campos do estado:** `name`, `selectedColor`, `customColor`, `date`, `time`, `showDatePicker`, `showTimePicker`, `showColorModal`, `editingReminder`, `isSubmitting`, `errors`
- **Derivados calculados:** `markedDates` — mapa de datas para o `Calendar`, recalculado a cada mudança em `state.reminders`.

---

## 5. State Machine — Formulário de Aproveitamento + Hydration

**Pergunta que responde:** Como o formulário de Aproveitamento carrega automaticamente dados ao navegar entre períodos?

**Público-alvo:** Devs que mantêm `useAproveitamentoForm` ou modificam a lógica de hydration/navegação de período.

**Última atualização:** 2026-03-04

```mermaid
stateDiagram-v2
    [*] --> Hydrating

    %% ── HYDRATION (useEffect) ──────────────────────────────────────
    state "Hydrating" as Hydrating

    note right of Hydrating
        Triggers do useEffect:
        • referencePeriod mudou (navigatePeriod)
        • tempo mudou (mensal ↔ anual)
        • state.records mudou (contexto atualizado)
    end note

    state hydrationChoice <<choice>>
    Hydrating --> hydrationChoice

    hydrationChoice --> ClearForm    : skipNextHydrationRef = true
    hydrationChoice --> PopulateForm : registro existe para referencePeriod + tempo
    hydrationChoice --> EmptyForm    : nenhum registro encontrado

    state "ClearForm\n(limpa campos + flag)" as ClearForm
    state "PopulateForm\n(preenche campos + editingId)" as PopulateForm
    state "EmptyForm\n(dias = [], annualMonths fresh)" as EmptyForm

    ClearForm    --> Creating
    EmptyForm    --> Creating
    PopulateForm --> Editing

    %% ── ESTADO PRINCIPAL ──────────────────────────────────────────
    state "Creating" as Creating
    state "Editing" as Editing

    state "Saving" as Saving {
        [*] --> Submitting
        state "isSubmitting = true" as Submitting
    }

    Creating --> Creating : onChange / toggleDia / adjustMonth
    Editing  --> Editing  : onChange / toggleDia / adjustMonth

    Creating --> Hydrating : navigatePeriod(±1)
    Editing  --> Hydrating : navigatePeriod(±1)

    Creating --> Hydrating : setTempo('mensal' | 'anual')
    Editing  --> Hydrating : setTempo('mensal' | 'anual')

    Creating --> Saving : handleSave() [válido] → addRecord()
    Editing  --> Saving : handleSave() [válido] → updateRecord()

    Creating --> Creating : handleSave() [inválido]
    Editing  --> Editing  : handleSave() [inválido]

    Saving --> Hydrating : dispatch ADD/UPDATE\n[skipNextHydrationRef = true]
```

**Notas:**
- **Por que `skipNextHydrationRef` e não estado React?** O ref é mutado de forma síncrona antes do dispatch, garantindo que quando o `useEffect` de hydration for re-executado (causado pelo `state.records` atualizado), o flag já está `true` — sem janela de corrida.
- **Campos do estado:** `evento`, `cargaHoraria`, `tempo`, `referencePeriod`, `dias`, `annualMonths`, `editingId`, `isSubmitting`, `errors`
- **Derivados calculados:** `daysInMonth`, `diasMarcados`, `totalHours`, `cargaProgress`, `progressLabel`

---

## 6a. RemindersContext — Ações, Reducer e Side Effects

**Pergunta que responde:** Como o RemindersContext gerencia estado: quais ações o reducer aceita e quais side effects disparam cada ação?

**Público-alvo:** Devs que adicionam novas operações ao contexto de lembretes ou escrevem testes de unidade do reducer.

**Última atualização:** 2026-03-04

```mermaid
graph TD
    %% === ESTILOS ===
    classDef state_node fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    classDef action     fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef effect     fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100

    %% === ESTADO ===
    subgraph STATE["🗄️ Estado"]
        RS["reminders: Reminder[]\nisLoading · error"]
    end

    %% === REDUCER (FUNÇÃO PURA) ===
    subgraph ACTIONS["⚙️ Reducer — função pura"]
        LOAD_START["LOAD_START\n→ isLoading = true"]
        LOAD_SUCCESS["LOAD_SUCCESS\n→ reminders = payload"]
        LOAD_ERROR["LOAD_ERROR\n→ error = payload"]
        ADD["ADD\n→ [...reminders, payload]"]
        UPDATE["UPDATE\n→ map por id"]
        DEL["DELETE\n→ filter por id"]
    end

    %% === SIDE EFFECTS (MÉTODOS DO CONTEXTO) ===
    subgraph EFFECTS["🔧 Métodos do Contexto (side effects antes do dispatch)"]
        SE_INIT["init useEffect\n→ LOAD_START → getReminders()\n→ LOAD_SUCCESS | LOAD_ERROR"]
        SE_ADD["addReminder()\n① saveReminder\n② scheduleNotification\n③ dispatch ADD"]
        SE_UPD["updateReminder()\n① cancelNotification\n② scheduleNotification\n③ saveReminder\n④ dispatch UPDATE"]
        SE_DEL["removeReminder()\n① cancelNotification\n② deleteReminder\n③ dispatch DELETE"]
    end

    %% === SIDE EFFECTS → AÇÕES ===
    SE_INIT  -->|dispatch| LOAD_START
    SE_INIT  -->|dispatch| LOAD_SUCCESS
    SE_INIT  -->|dispatch| LOAD_ERROR
    SE_ADD   -->|dispatch| ADD
    SE_UPD   -->|dispatch| UPDATE
    SE_DEL   -->|dispatch| DEL

    %% === AÇÕES → ESTADO ===
    LOAD_START   -->|atualiza| RS
    LOAD_SUCCESS -->|atualiza| RS
    LOAD_ERROR   -->|atualiza| RS
    ADD          -->|atualiza| RS
    UPDATE       -->|atualiza| RS
    DEL          -->|atualiza| RS

    %% === CLASSES ===
    class RS state_node
    class LOAD_START,LOAD_SUCCESS,LOAD_ERROR,ADD,UPDATE,DEL action
    class SE_INIT,SE_ADD,SE_UPD,SE_DEL effect
```

**Legenda:**
- 🟠 Laranja: Métodos do contexto (side effects — acessam storage e notifications)
- 🟣 Roxo: Action types do reducer (função pura)
- 🟢 Verde: Estado resultante

**Notas:**
- O reducer é exportado para testes de unidade: `import { reducer } from '@/context/RemindersContext'`
- Side effects ocorrem nos métodos do contexto **antes** do dispatch — o reducer nunca acessa storage ou notifications.
- Os action types (`LOAD_START`, `LOAD_SUCCESS`, `LOAD_ERROR`, `ADD`, `UPDATE`, `DELETE`) são idênticos ao AproveitamentoContext.

---

## 6b. AproveitamentoContext — Ações, Reducer e Side Effects

**Pergunta que responde:** Como o AproveitamentoContext gerencia estado: quais ações o reducer aceita e quais side effects disparam cada ação?

**Público-alvo:** Devs que adicionam novas operações ao contexto de aproveitamento ou escrevem testes de unidade do reducer.

**Última atualização:** 2026-03-04

```mermaid
graph TD
    %% === ESTILOS ===
    classDef state_node fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    classDef action     fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef effect     fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100

    %% === ESTADO ===
    subgraph STATE["🗄️ Estado"]
        AS["records: AproveitamentoRecord[]\nisLoading · error"]
    end

    %% === REDUCER (FUNÇÃO PURA) ===
    subgraph ACTIONS["⚙️ Reducer — função pura"]
        LOAD_START["LOAD_START\n→ isLoading = true"]
        LOAD_SUCCESS["LOAD_SUCCESS\n→ records = payload"]
        LOAD_ERROR["LOAD_ERROR\n→ error = payload"]
        ADD["ADD\n→ [...records, payload]"]
        UPDATE["UPDATE\n→ map por id"]
        DEL["DELETE\n→ filter por id"]
    end

    %% === SIDE EFFECTS (MÉTODOS DO CONTEXTO) ===
    subgraph EFFECTS["🔧 Métodos do Contexto (side effects antes do dispatch)"]
        SE_INIT["init useEffect\n→ LOAD_START → getAproveitamentos()\n→ LOAD_SUCCESS | LOAD_ERROR"]
        SE_ADD["addRecord()\n① saveAproveitamento\n② dispatch ADD"]
        SE_UPD["updateRecord()\n① saveAproveitamento\n② dispatch UPDATE"]
        SE_DEL["removeRecord()\n① deleteAproveitamento\n② dispatch DELETE"]
    end

    %% === SIDE EFFECTS → AÇÕES ===
    SE_INIT  -->|dispatch| LOAD_START
    SE_INIT  -->|dispatch| LOAD_SUCCESS
    SE_INIT  -->|dispatch| LOAD_ERROR
    SE_ADD   -->|dispatch| ADD
    SE_UPD   -->|dispatch| UPDATE
    SE_DEL   -->|dispatch| DEL

    %% === AÇÕES → ESTADO ===
    LOAD_START   -->|atualiza| AS
    LOAD_SUCCESS -->|atualiza| AS
    LOAD_ERROR   -->|atualiza| AS
    ADD          -->|atualiza| AS
    UPDATE       -->|atualiza| AS
    DEL          -->|atualiza| AS

    %% === CLASSES ===
    class AS state_node
    class LOAD_START,LOAD_SUCCESS,LOAD_ERROR,ADD,UPDATE,DEL action
    class SE_INIT,SE_ADD,SE_UPD,SE_DEL effect
```

**Legenda:**
- 🟠 Laranja: Métodos do contexto (side effects — acessam storage)
- 🟣 Roxo: Action types do reducer (função pura)
- 🟢 Verde: Estado resultante

**Notas:**
- O reducer é exportado para testes de unidade: `import { reducer } from '@/context/AproveitamentoContext'`
- AproveitamentoContext não usa notifications — os side effects de add/update/delete são mais simples (apenas storage + dispatch).
- Action types idênticos ao RemindersContext — a diferença está no shape do payload e nos side effects.

---

## 7. ER — Tipos de Dados

**Pergunta que responde:** Quais são as entidades do domínio, seus atributos e relacionamentos?

**Público-alvo:** Devs que precisam entender a estrutura de dados ou adicionar novos campos.

**Última atualização:** 2026-03-04

```mermaid
erDiagram

    %% ── ENTIDADES PRINCIPAIS ──────────────────────────────────────

    Reminder {
        string  id              PK  "timestamp36 + random"
        string  name                "2–100 caracteres"
        string  date                "YYYY-MM-DD"
        string  time                "HH:MM (24h)"
        string  priority            "FK → Priority"
        string  customColor         "opcional · #RRGGBB"
        string  notificationId      "opcional · ID do expo-notifications"
        string  createdAt           "ISO 8601"
        string  updatedAt           "opcional · ISO 8601"
    }

    AproveitamentoRecord {
        string   id             PK  "timestamp36 + random"
        string   eventName          "1–100 caracteres"
        number   totalHours         "1–9999"
        string   periodType         "FK → PeriodType"
        boolean  monthlyDays        "array · comprimento = dias reais do mês"
        string   referencePeriod    "YYYY-MM"
        string   createdAt          "ISO 8601"
        string   updatedAt          "ISO 8601"
    }

    MonthRecord {
        number  monthIndex          "0–11"
        number  completedDays       "0..totalDays"
        number  totalDays           "dias reais: 28/29/30/31"
    }

    %% ── TIPOS ESCALARES (union types) ─────────────────────────────

    Priority {
        string  green               "prioridade baixa"
        string  yellow              "prioridade média"
        string  red                 "prioridade alta"
        string  custom              "cor personalizada (#RRGGBB)"
    }

    PeriodType {
        string  mensal              "rastreia dias do mês"
        string  anual               "rastreia meses do ano"
    }

    %% ── ARMAZENAMENTO ─────────────────────────────────────────────

    AsyncStorage {
        string  key_reminders       "@app:reminders · JSON array"
        string  key_aproveitamento  "@app:aproveitamento · JSON array"
    }

    %% ── RELACIONAMENTOS ───────────────────────────────────────────

    AproveitamentoRecord ||--o{ MonthRecord : "annualMonths (12 entradas)"

    Reminder            }o--||  Priority    : "priority"
    AproveitamentoRecord}o--||  PeriodType  : "periodType"

    AsyncStorage        ||--o{ Reminder             : "serializa"
    AsyncStorage        ||--o{ AproveitamentoRecord : "serializa"
```

**Legenda:**
- Entidades principais: `Reminder`, `AproveitamentoRecord`, `MonthRecord`
- Tipos escalares (union types do TypeScript): `Priority`, `PeriodType`
- Infraestrutura de persistência: `AsyncStorage`

**Notas:**
- `Reminder.date` deve estar no formato `"YYYY-MM-DD"` — chave do `markedDates` do `react-native-calendars`.
- `Reminder.priority === 'custom'` implica `customColor` presente e válido (`/^#[0-9A-Fa-f]{6}$/`).
- `AproveitamentoRecord.monthlyDays.length` é sempre igual ao número de dias reais do mês de `referencePeriod`.
- `MonthRecord.totalDays` reflete o calendário gregoriano real (28/29/30/31) — calculado por `getDaysInMonth()`.
- `MonthRecord.completedDays` está sempre no intervalo `[0, totalDays]`.
