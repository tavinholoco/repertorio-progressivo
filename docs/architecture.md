# Arquitetura — Repertório Progressivo

Documentação visual da arquitetura do projeto. Cada diagrama cobre uma camada ou fluxo específico.

---

## 1. Arquitetura de Dados

Fluxo vertical completo de dados: desde a persistência em disco até as telas, passando pelas camadas de serviço, contexto e hooks. As setas indicam a direção do fluxo de dados e chamadas entre módulos.

```mermaid
graph TD
    subgraph Disco["💾 Persistência"]
        AS[(AsyncStorage)]
    end

    subgraph Services["🔧 Serviços"]
        ST["services/storage.ts\ngetReminders · saveReminder · deleteReminder\ngetAproveitamentos · saveAproveitamento · deleteAproveitamento"]
        NT["services/notifications.ts\nscheduleReminderNotification · cancelNotification · requestPermissions"]
    end

    subgraph Utils["🛠️ Utilitários Puros"]
        ID["utils/id.ts\ngenerateId · getIsoNow"]
        DH["utils/dateHelpers.ts\ntoDateString · formatPeriodLabel · getDaysInMonth..."]
        VL["utils/validation.ts\nvalidateReminder · validateAproveitamento"]
    end

    subgraph Contexts["🗃️ Estado Global"]
        RC["context/RemindersContext\nuseReminders()\naddReminder · updateReminder · removeReminder"]
        AC["context/AproveitamentoContext\nuseAproveitamento()\naddRecord · updateRecord · removeRecord"]
    end

    subgraph Hooks["🪝 Lógica de Formulário"]
        UAF["hooks/useAgendaForm\nform fields · handleSave · populateForm\nresetForm · markedDates"]
        UAPF["hooks/useAproveitamentoForm\nform fields · handleSave · navigatePeriod\ntoggleDia · adjustMonth · hydration"]
    end

    subgraph Screens["📱 Telas"]
        AGS["components/AgendaScreen\n(consome useAgendaForm)"]
        APR["app/Aproveitamento.tsx\n(consome useAproveitamentoForm)"]
    end

    subgraph Router["🧭 Roteamento"]
        LAY["app/_layout.tsx\nExpo Router + Providers + FloatingTabBar"]
        IDX["app/index.tsx\n(wrapper da Agenda)"]
    end

    %% Disco ↔ Serviços
    AS <-->|"JSON serializado\n@app:reminders\n@app:aproveitamento"| ST

    %% Serviços → Contextos
    ST -->|"leitura na inicialização\nescrita em cada mutation"| RC
    ST -->|"leitura na inicialização\nescrita em cada mutation"| AC
    NT -->|"schedule / cancel\nretorna notificationId ou null"| RC

    %% Utils → Contextos e Hooks
    ID -->|"generateId · getIsoNow"| RC
    ID -->|"generateId · getIsoNow"| AC
    VL -->|"validateReminder"| UAF
    VL -->|"validateAproveitamento"| UAPF
    DH -->|"toDateString · toTimeString\nformatDisplayDate · formatDisplayTime"| UAF
    DH -->|"getDaysInMonth · buildAnnualMonths\nformatPeriodLabel · currentPeriod"| UAPF

    %% Contextos → Hooks
    RC -->|"state.reminders · isLoading\naddReminder · updateReminder · removeReminder"| UAF
    AC -->|"state.records · isLoading\naddRecord · updateRecord · removeRecord"| UAPF

    %% Hooks → Telas
    UAF -->|"todos os campos + handlers"| AGS
    UAPF -->|"todos os campos + handlers"| APR

    %% Router
    LAY --> IDX
    IDX --> AGS
    LAY --> APR
```

---

> **Regras de ouro desta arquitetura:**
> - Nenhum componente acessa `AsyncStorage` diretamente — tudo passa por `services/storage.ts`.
> - Nenhum componente usa `useContext(RemindersContext)` diretamente — sempre via `useReminders()` / `useAproveitamento()`.
> - Utilitários em `utils/` são funções puras, sem efeitos colaterais.

---

## 2. Hierarquia de Componentes

Árvore completa de componentes partindo do layout raiz. Mostra a ordem de wrapping dos providers, as duas rotas de navegação e todos os componentes folha utilizados em cada tela.

```mermaid
graph LR
    subgraph Root["🏠 Raiz"]
        GHRV["GestureHandlerRootView"]
        EB["ErrorBoundary"]
        RP["RemindersProvider"]
        AP["AproveitamentoProvider"]
        TB["Tabs\n(Expo Router)"]
    end

    subgraph TabBar["🧭 Tab Bar Customizada"]
        FTB["FloatingTabBar"]
        TBI["TabBarIcon\n(SVG: calendar / bar-chart)"]
    end

    subgraph AgendaRoute["📅 Rota: Agenda (index)"]
        IDX["app/index.tsx"]
        AGS["AgendaScreen"]

        subgraph AgendaForm["Formulário"]
            ATI1["AnimatedTextInput\n(nome do lembrete)"]
            DTF1["DateTimeField\n(data)"]
            DTF2["DateTimeField\n(horário)"]
            PP["PriorityPicker"]
            CPM["ColorPickerModal"]
        end

        subgraph AgendaList["Lista de Lembretes"]
            RI["ReminderItem"]
            BAD1["Badge\n(prioridade)"]
            CAL["Calendar\n(react-native-calendars)"]
            BADGE_COUNT1["Badge\n(contador)"]
            ES1["EmptyState"]
        end
    end

    subgraph AprovRoute["📊 Rota: Aproveitamento"]
        APR["app/Aproveitamento.tsx"]

        subgraph AprovForm["Formulário"]
            ATI2["AnimatedTextInput\n(nome do evento)"]
            ATI3["AnimatedTextInput\n(carga horária)"]
            ST["SegmentedToggle\n(mensal / anual)"]
            PB1["ProgressBar\n(progresso de dias)"]
            DG["DayGrid\n(modo mensal)"]
            MG["MonthGrid\n(modo anual)"]
        end

        subgraph AprovList["Lista de Registros"]
            RECI["RecordItem"]
            BAD2["Badge\n(período)"]
            PB2["ProgressBar\n(progresso por item)"]
            BADGE_COUNT2["Badge\n(contador)"]
            ES2["EmptyState"]
        end
    end

    %% Wrapping dos providers (ordem importa)
    GHRV --> EB --> RP --> AP --> TB

    %% Tab bar customizada
    TB -->|"prop tabBar"| FTB
    FTB --> TBI

    %% Rotas
    TB --> IDX
    TB --> APR

    %% Agenda
    IDX --> AGS
    AGS --> ATI1
    AGS --> DTF1
    AGS --> DTF2
    AGS --> PP
    AGS --> CPM
    AGS --> CAL
    AGS --> RI
    AGS --> BADGE_COUNT1
    AGS --> ES1
    RI --> BAD1

    %% Aproveitamento
    APR --> ATI2
    APR --> ATI3
    APR --> ST
    APR --> PB1
    APR --> DG
    APR --> MG
    APR --> RECI
    APR --> BADGE_COUNT2
    APR --> ES2
    RECI --> BAD2
    RECI --> PB2
```

---

> **Nota de imports dentro de `components/`:**
> Arquivos dentro da pasta `components/` usam imports diretos (`./Foo`) para outros arquivos da mesma pasta.
> O barrel `@/components` é exclusivo para código **fora** de `components/` — violações geram `WARN Require cycle` no Metro.

---

## 3. Fluxo de Notificações

Detalha as três operações que envolvem notificações: criação, atualização e remoção de um lembrete. O fix de race condition está explícito: o `saveReminder` ocorre **antes** do agendamento da notificação, garantindo que o lembrete persiste mesmo que a notificação falhe.

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
        H->>H: validateReminder() ✓
        H->>RC: addReminder(input)

        RC->>RC: gera Reminder<br/>(generateId · getIsoNow)

        Note over RC,ST: 🔒 Storage ANTES de notificação (race condition fix)
        RC->>ST: saveReminder(reminder)
        ST->>ST: readList → upsert → AsyncStorage.setItem
        ST-->>RC: ok

        RC->>NT: scheduleReminderNotification(reminder)
        NT->>NT: requestPermissions()
        NT->>NT: parse date + time → triggerDate<br/>guard: triggerDate > now && !isNaN

        alt permissão concedida e data futura
            NT->>OS: scheduleNotificationAsync(trigger: DATE)
            OS-->>NT: notificationId
            NT-->>RC: notificationId

            RC->>RC: reminder.notificationId = notificationId
            RC->>ST: saveReminder(reminder) ← atualiza com notificationId
            ST-->>RC: ok
        else permissão negada ou data passada
            NT-->>RC: null
        end

        RC->>RC: dispatch ADD
        RC-->>H: (state atualizado via contexto)
        H->>H: resetForm()
    end

    %% ─── ATUALIZAR LEMBRETE ────────────────────────────────────────
    rect rgb(255, 248, 230)
        Note over U,OS: ✏️ updateReminder — editar lembrete existente

        U->>H: handleSave() (editingReminder != null)
        H->>H: validateReminder() ✓
        H->>RC: updateReminder(reminder)

        opt reminder tem notificationId
            RC->>NT: cancelNotification(notificationId)
            NT->>OS: cancelScheduledNotificationAsync(id)
            Note over NT: try/catch interno — falha silenciosa
        end

        RC->>NT: scheduleReminderNotification(reminder)
        NT->>OS: scheduleNotificationAsync(trigger: DATE)
        OS-->>NT: newNotificationId (ou null)
        NT-->>RC: newNotificationId

        RC->>RC: updated = { ...reminder,<br/>  notificationId: newNotificationId,<br/>  updatedAt: getIsoNow() }
        RC->>ST: saveReminder(updated)
        ST-->>RC: ok

        RC->>RC: dispatch UPDATE
        RC-->>H: (state atualizado via contexto)
        H->>H: resetForm()
    end

    %% ─── REMOVER LEMBRETE ──────────────────────────────────────────
    rect rgb(255, 235, 235)
        Note over U,OS: 🗑️ removeReminder — excluir lembrete

        U->>H: onDelete(id)
        H->>RC: removeReminder(id)

        RC->>RC: busca reminder por id em state.reminders

        opt reminder tem notificationId
            RC->>NT: cancelNotification(notificationId)
            NT->>OS: cancelScheduledNotificationAsync(id)
            Note over NT: try/catch interno — falha silenciosa
        end

        RC->>ST: deleteReminder(id)
        ST->>ST: readList → filter → AsyncStorage.setItem
        ST-->>RC: ok

        RC->>RC: dispatch DELETE
    end
```

---

> **Garantias do fluxo de notificações:**
> - `scheduleReminderNotification` retorna `null` se: permissão negada, data no passado, data inválida (`isNaN`), ou falha do SO.
> - `cancelNotification` nunca lança exceção para cima — tem `try/catch` interno.
> - Em `updateReminder`, o cancelamento da notificação antiga ocorre **antes** de agendar a nova.
> - `expo-notifications` não é suportado no Expo Go (SDK 53+) — requer `npm run android`.

---

## 4. State Machine — Formulário de Agenda

Máquina de estados do hook `useAgendaForm`. Cobre o ciclo de vida completo do formulário: criação, edição, validação e salvamento. Os estados de sobreposição (pickers e modal de cor) são modelados como regiões paralelas independentes do estado principal.

```mermaid
stateDiagram-v2
    [*] --> Idle

    %% ── ESTADO PRINCIPAL ──────────────────────────────────────────
    state "Idle\n(formulário vazio, editingReminder = null)" as Idle
    state "Creating\n(editingReminder = null)" as Creating
    state "Editing\n(editingReminder = Reminder)" as Editing

    state "Saving" as Saving {
        state "isSubmitting = true" as Submitting
        [*] --> Submitting
    }

    Idle --> Creating     : usuário digita nome\nou seleciona data/hora/cor
    Idle --> Editing      : populateForm(reminder)\n→ form preenchido com dados do lembrete

    Creating --> Creating : handleNameChange\nsetDate · setTime\nhandleSelectColor

    Editing --> Editing   : handleNameChange\nsetDate · setTime\nhandleSelectColor

    Creating --> Saving   : handleSave()\n→ validateReminder() ✓\n→ addReminder()
    Editing  --> Saving   : handleSave()\n→ validateReminder() ✓\n→ updateReminder()

    Creating --> Creating : handleSave()\n→ validateReminder() ✗\n(errors preenchidos)
    Editing  --> Editing  : handleSave()\n→ validateReminder() ✗\n(errors preenchidos)

    Saving --> Idle       : sucesso\n→ dispatch ADD / UPDATE\n→ resetForm()

    Editing --> Idle      : botão "Cancelar"\n→ resetForm()

    %% ── PICKERS (paralelo ao estado principal) ────────────────────
    state "Pickers e Modal (paralelo)" as Pickers {
        state "DatePicker" as DP {
            state "fechado\n(showDatePicker=false)" as DPClosed
            state "aberto\n(showDatePicker=true)" as DPOpen
            DPClosed --> DPOpen   : onPress no campo de data
            DPOpen   --> DPClosed : onValueChange(date)\n→ setDate · setShow(iOS only)
        }

        state "TimePicker" as TP {
            state "fechado\n(showTimePicker=false)" as TPClosed
            state "aberto\n(showTimePicker=true)" as TPOpen
            TPClosed --> TPOpen   : onPress no campo de horário
            TPOpen   --> TPClosed : onValueChange(time)\n→ setTime · setShow(iOS only)
        }

        state "ColorPickerModal" as CM {
            state "fechado\n(showColorModal=false)" as CMClosed
            state "aberto\n(showColorModal=true)" as CMOpen
            CMClosed --> CMOpen   : PriorityPicker → onOpenColorPicker
            CMOpen   --> CMClosed : onSelect(hex) → handleSelectColor\nou onClose (descarta)
        }
    }

    note right of Pickers
        No Android, o DateTimePicker
        fecha sozinho ao confirmar.
        Padrão: setShow(Platform.OS === 'ios')
    end note
```

---

> **Campos do estado do formulário (`useAgendaForm`):**
> `name`, `selectedColor`, `customColor`, `date`, `time`, `showDatePicker`, `showTimePicker`, `showColorModal`, `editingReminder`, `isSubmitting`, `errors`
>
> **Derivados calculados:** `markedDates` — mapa de datas para o componente `Calendar`, recalculado a cada mudança em `state.reminders`.

---

## 5. State Machine — Formulário de Aproveitamento + Hydration

Máquina de estados do hook `useAproveitamentoForm`. O diferencial em relação ao formulário de Agenda é a **lógica de hydration automática**: o formulário não possui botão de edição explícito — ao navegar para um período que já possui registro, o form é preenchido automaticamente. O `skipNextHydrationRef` controla o caso pós-salvamento.

```mermaid
stateDiagram-v2
    [*] --> Hydrating

    %% ── HYDRATION (useEffect) ──────────────────────────────────────
    state "Hydrating\n(useEffect disparado)" as Hydrating

    note right of Hydrating
        Triggers do useEffect:
        • referencePeriod mudou (navigatePeriod)
        • tempo mudou (mensal ↔ anual)
        • state.records mudou (contexto atualizado)
    end note

    state hydrationChoice <<choice>>
    Hydrating --> hydrationChoice

    hydrationChoice --> ClearForm   : skipNextHydrationRef = true\n(pós-salvamento)
    hydrationChoice --> PopulateForm : registro existe para\nreferencePeriod + tempo
    hydrationChoice --> EmptyForm    : nenhum registro encontrado

    state "ClearForm\n→ limpa todos os campos\n→ skipNextHydrationRef = false" as ClearForm
    state "PopulateForm\n→ preenche evento, cargaHoraria,\n   dias / annualMonths do registro\n→ editingId = record.id" as PopulateForm
    state "EmptyForm\n→ dias = [] (daysInMonth booleans)\n→ annualMonths = buildAnnualMonths(year)\n→ editingId = null" as EmptyForm

    ClearForm    --> Creating
    EmptyForm    --> Creating
    PopulateForm --> Editing

    %% ── ESTADO PRINCIPAL ──────────────────────────────────────────
    state "Creating\n(editingId = null)" as Creating
    state "Editing\n(editingId = record.id)" as Editing

    state "Saving" as Saving {
        state "isSubmitting = true" as Submitting
        [*] --> Submitting
    }

    %% Interações dentro do formulário (não mudam o estado principal)
    Creating --> Creating : handleEventoChange\nhandleCargaHorariaChange\ntoggleDia(index)\nadjustMonth(monthIndex, delta)
    Editing  --> Editing  : handleEventoChange\nhandleCargaHorariaChange\ntoggleDia(index)\nadjustMonth(monthIndex, delta)

    %% Navegação de período → re-trigger de hydration
    Creating --> Hydrating : navigatePeriod(±1)\n→ referencePeriod muda
    Editing  --> Hydrating : navigatePeriod(±1)\n→ referencePeriod muda

    %% Toggle de modo → re-trigger de hydration
    Creating --> Hydrating : setTempo('mensal'|'anual')\n→ tempo muda
    Editing  --> Hydrating : setTempo('mensal'|'anual')\n→ tempo muda

    %% Salvamento
    Creating --> Saving : handleSave()\n→ validateAproveitamento() ✓\n→ addRecord()
    Editing  --> Saving : handleSave()\n→ validateAproveitamento() ✓\n→ updateRecord()

    Creating --> Creating : handleSave()\n→ validateAproveitamento() ✗\n(errors preenchidos)
    Editing  --> Editing  : handleSave()\n→ validateAproveitamento() ✗\n(errors preenchidos)

    %% Pós-salvamento: skipNextHydrationRef = true → dispatch ADD/UPDATE → Hydrating
    Saving --> Hydrating : sucesso\n→ dispatch ADD / UPDATE\n→ skipNextHydrationRef = true\n→ state.records muda → useEffect dispara
```

---

> **Por que `skipNextHydrationRef` e não estado React?**
> O ref é mutado de forma síncrona antes do dispatch, garantindo que quando o `useEffect` de hydration for re-executado (causado pelo `state.records` atualizado), o flag já está `true` — sem janela de corrida entre estado e ref.
>
> **Campos do estado (`useAproveitamentoForm`):**
> `evento`, `cargaHoraria`, `tempo`, `referencePeriod`, `dias`, `annualMonths`, `editingId`, `isSubmitting`, `errors`
>
> **Derivados calculados:** `daysInMonth`, `diasMarcados`, `totalHours`, `cargaProgress`, `progressLabel`

---

## 6. Reducers — Ações e Transições de Estado

Os dois reducers exportados para teste compartilham o mesmo conjunto de action types. A distinção está nos **efeitos colaterais** disparados pelos métodos do contexto **antes** do dispatch — o reducer em si é uma função pura. O diagrama mostra as ações, a mutação de estado resultante e os side effects associados.

```mermaid
graph TD
    subgraph RState["Estado — RemindersContext"]
        RS["{ reminders: Reminder[]\n  isLoading: boolean\n  error: string | null }"]
    end

    subgraph AState["Estado — AproveitamentoContext"]
        AS["{ records: AproveitamentoRecord[]\n  isLoading: boolean\n  error: string | null }"]
    end

    subgraph RActions["Ações — RemindersContext"]
        direction TB

        RLS["LOAD_START\n─────────────────\nisLoading = true\nerror = null"]
        RLSu["LOAD_SUCCESS\npayload: Reminder[]\n─────────────────\nreminders = payload\nisLoading = false"]
        RLE["LOAD_ERROR\npayload: string\n─────────────────\nerror = payload\nisLoading = false"]
        RADD["ADD\npayload: Reminder\n─────────────────\nreminders = [...reminders, payload]"]
        RUPD["UPDATE\npayload: Reminder\n─────────────────\nreminders.map(r =>\n  r.id === payload.id\n    ? payload : r)"]
        RDEL["DELETE\npayload: id\n─────────────────\nreminders.filter(r =>\n  r.id !== payload)"]
    end

    subgraph AActions["Ações — AproveitamentoContext"]
        direction TB

        ALS["LOAD_START\n─────────────────\nisLoading = true\nerror = null"]
        ALSu["LOAD_SUCCESS\npayload: AproveitamentoRecord[]\n─────────────────\nrecords = payload\nisLoading = false"]
        ALE["LOAD_ERROR\npayload: string\n─────────────────\nerror = payload\nisLoading = false"]
        AADD["ADD\npayload: AproveitamentoRecord\n─────────────────\nrecords = [...records, payload]"]
        AUPD["UPDATE\npayload: AproveitamentoRecord\n─────────────────\nrecords.map(r =>\n  r.id === payload.id\n    ? payload : r)"]
        ADEL["DELETE\npayload: id\n─────────────────\nrecords.filter(r =>\n  r.id !== payload)"]
    end

    subgraph RSideEffects["Side Effects — só RemindersContext"]
        direction TB

        SE1["addReminder()\n① saveReminder(reminder)\n② scheduleReminderNotification()\n③ dispatch ADD"]
        SE2["updateReminder()\n① cancelNotification(old id)\n② scheduleReminderNotification()\n③ saveReminder(updated)\n④ dispatch UPDATE"]
        SE3["removeReminder()\n① cancelNotification(id)\n② deleteReminder(id)\n③ dispatch DELETE"]
        SE4["init useEffect()\n① dispatch LOAD_START\n② getReminders()\n③ dispatch LOAD_SUCCESS / LOAD_ERROR"]
    end

    subgraph ASideEffects["Side Effects — AproveitamentoContext"]
        direction TB

        SE5["addRecord()\n① saveAproveitamento(record)\n② dispatch ADD"]
        SE6["updateRecord()\n① saveAproveitamento(updated)\n② dispatch UPDATE"]
        SE7["removeRecord()\n① deleteAproveitamento(id)\n② dispatch DELETE"]
        SE8["init useEffect()\n① dispatch LOAD_START\n② getAproveitamentos()\n③ dispatch LOAD_SUCCESS / LOAD_ERROR"]
    end

    %% Side effects disparam as ações
    SE4 -->|"dispatch"| RLS
    SE4 -->|"dispatch"| RLSu
    SE4 -->|"dispatch"| RLE
    SE1 -->|"dispatch"| RADD
    SE2 -->|"dispatch"| RUPD
    SE3 -->|"dispatch"| RDEL

    SE8 -->|"dispatch"| ALS
    SE8 -->|"dispatch"| ALSu
    SE8 -->|"dispatch"| ALE
    SE5 -->|"dispatch"| AADD
    SE6 -->|"dispatch"| AUPD
    SE7 -->|"dispatch"| ADEL

    %% Ações atualizam o estado
    RLS  -->|"atualiza"| RS
    RLSu -->|"atualiza"| RS
    RLE  -->|"atualiza"| RS
    RADD -->|"atualiza"| RS
    RUPD -->|"atualiza"| RS
    RDEL -->|"atualiza"| RS

    ALS  -->|"atualiza"| AS
    ALSu -->|"atualiza"| AS
    ALE  -->|"atualiza"| AS
    AADD -->|"atualiza"| AS
    AUPD -->|"atualiza"| AS
    ADEL -->|"atualiza"| AS
```

---

> **Reducers são funções puras** — não acessam storage nem notifications. Todo efeito colateral ocorre nos métodos do contexto (`addReminder`, `updateRecord`, etc.) antes do `dispatch`.
>
> **Ambos os reducers são exportados** para que os testes de unidade possam exercitá-los diretamente, sem precisar montar providers:
> ```ts
> import { reducer } from '@/context/RemindersContext'
> import { reducer } from '@/context/AproveitamentoContext'
> ```

---

## 7. ER — Tipos de Dados

Entidades do domínio definidas em `types/index.ts` e sua persistência no `AsyncStorage`. Atributos com `?` são opcionais. Os tipos `Priority` e `PeriodType` são union types do TypeScript, representados como entidades de lookup para explicitar os valores válidos.

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

---

> **Invariantes de dados garantidas em runtime:**
> - `Reminder.date` deve estar no formato `"YYYY-MM-DD"` — chave do `markedDates` do `react-native-calendars`.
> - `Reminder.priority === 'custom'` implica `customColor` presente e válido (`/^#[0-9A-Fa-f]{6}$/`).
> - `AproveitamentoRecord.monthlyDays.length` é sempre igual ao número de dias reais do mês de `referencePeriod`.
> - `MonthRecord.totalDays` reflete o calendário gregoriano real (28/29/30/31) — calculado por `getDaysInMonth()`.
> - `MonthRecord.completedDays` está sempre no intervalo `[0, totalDays]`.
> - Ambas as entidades usam `id` gerado por `generateId()` (`utils/id.ts`) — colisões são praticamente impossíveis.
