# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server via Expo Go (does NOT support notifications since SDK 53 — use npm run android instead)
npm start

# Build and run native development APK on emulator (required for notifications)
npm run android

# Type-check without emitting
npx tsc --noEmit

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npx jest __tests__/services/storage.test.ts

# Lint
npm run lint
```

Use `npx expo install <package>` (not `npm install`) when adding new dependencies — Expo pins versions validated against SDK 54.

## Branch Strategy

- **`master`** — stable releases only. Never commit work-in-progress here.
- **`dev`** — active development. All new features and fixes go here first.

Workflow: code on `dev` → test → merge to `master` when stable.

## Architecture

**Expo Router (file-based routing)** — routes are defined by files in `app/`:
- [app/_layout.tsx](app/_layout.tsx) — root layout: `ErrorBoundary` → `RemindersProvider` → `AproveitamentoProvider` → `Tabs`
- [app/index.tsx](app/index.tsx) — Agenda tab (thin wrapper, delegates to `components/AgendaScreen`)
- [app/Aproveitamento.tsx](app/Aproveitamento.tsx) — Aproveitamento tab (presentational only, logic in `useAproveitamentoForm`)

The Agenda screen lives in `components/AgendaScreen.tsx` (not in `app/`) so it can be unit-tested independently from the router.

### Data Flow

```
AsyncStorage (disk)
      ↕
services/storage.ts           ← sole owner of AsyncStorage calls
      ↕
context/RemindersContext.tsx      ← global state (useReducer, reducer exported for testing)
context/AproveitamentoContext.tsx ← global state (useReducer, reducer exported for testing)
      ↕
hooks/useAgendaForm.ts        ← all form logic for Agenda (calls useReminders internally)
hooks/useAproveitamentoForm.ts← all form logic for Aproveitamento (calls useAproveitamento internally)
      ↕
components/AgendaScreen.tsx   ← presentational, consumes useAgendaForm()
app/Aproveitamento.tsx        ← presentational, consumes useAproveitamentoForm()
```

**Rule:** No component ever calls `AsyncStorage` directly. All reads/writes go through `services/storage.ts`. No component uses `useContext(RemindersContext)` directly — always use the `useReminders()` / `useAproveitamento()` hooks.

### Folder Structure

```
app/              ← Expo Router routes (_layout, index, Aproveitamento)
components/       ← UI components + ErrorBoundary (index.ts barrel)
  AgendaScreen.tsx, ReminderItem, PriorityPicker, ColorPickerModal
  RecordItem, DayGrid, MonthGrid, ProgressBar
  Badge, SegmentedToggle, EmptyState, AnimatedTextInput
  FloatingTabBar, TabBarIcon
  ErrorBoundary.tsx
hooks/            ← Custom hooks (index.ts barrel)
  useAgendaForm.ts, useAproveitamentoForm.ts
services/         ← Service layer (index.ts barrel)
  storage.ts, notifications.ts
utils/            ← Pure functions (index.ts barrel)
  dateHelpers.ts, validation.ts, id.ts
context/          ← Global state providers
  RemindersContext.tsx, AproveitamentoContext.tsx
constants/        ← Theme tokens (index.ts barrel)
  theme.ts
types/            ← Shared TypeScript interfaces
  index.ts
__tests__/        ← Jest test suites
  utils/dateHelpers.test.ts
  utils/validation.test.ts
  services/storage.test.ts
  services/notifications.test.ts
  context/remindersReducer.test.ts
  context/aproveitamentoReducer.test.ts
  context/remindersContext.test.ts       ← integration
  context/aproveitamentoContext.test.ts  ← integration
docs/             ← architecture.md (8 Mermaid diagrams) + screenshots/
```

### Barrel Exports

Each directory has an `index.ts` that re-exports all public symbols. Code **outside** a directory uses the barrel:
```ts
import { ReminderItem, DayGrid } from '@/components';
import { useAgendaForm } from '@/hooks';
import { AppColors, Layout } from '@/constants';
import { toDateString, validateReminder } from '@/utils';
```

Code **inside** a directory imports its siblings directly (`./ReminderItem`), never through its own
barrel — that creates a require cycle.

### Sub-components

| Component | Props | Used in |
|-----------|-------|---------|
| `ReminderItem` | `reminder, index, onEdit, onDelete` | AgendaScreen |
| `PriorityPicker` | `selectedColor, onSelect, error?, customColor?, onOpenColorPicker` | AgendaScreen |
| `ColorPickerModal` | `visible, selectedColor, onSelect, onClose` | AgendaScreen |
| `RecordItem` | `record, index, onEdit, onDelete` | Aproveitamento |
| `DayGrid` | `days: boolean[], onToggle` | Aproveitamento |
| `MonthGrid` | `months: MonthRecord[], onAdjust` | Aproveitamento |
| `ProgressBar` | `progress, style?` | RecordItem, Aproveitamento |
| `Badge` | `label, backgroundColor, textColor?` | ReminderItem, RecordItem |
| `SegmentedToggle` | `tempo: PeriodType, onSelect` | Aproveitamento |
| `EmptyState` | `icon, title, subtitle?` | AgendaScreen, Aproveitamento |
| `AnimatedTextInput` | `containerClassName?` + all `TextInputProps` | AgendaScreen, Aproveitamento |
| `FloatingTabBar` | `BottomTabBarProps` | _layout (via the `tabBar` prop of `<Tabs>`) |
| `TabBarIcon` | `name, color, size?` | FloatingTabBar |
| `ErrorBoundary` | `children` | _layout (wraps entire tree) |

`ProgressDonut` was removed in v2.0.0 — `ProgressBar` replaced it. Do not reintroduce it.

### Custom Hooks

- `useAgendaForm()` — all state and logic for the Agenda form. Exports form fields, `handleSave`, `resetForm`, `populateForm`, `markedDates`, and the `PRIORITY_COLORS`/`COLOR_TO_PRIORITY` maps.
- `useAproveitamentoForm()` — all state and logic for Aproveitamento. Exports period navigation, `toggleDia`, `adjustMonth`, `handleSave`, computed `diasMarcados`, `percentualDias`, `cargaProgress`.

### Pure Utils

- `utils/dateHelpers.ts` — `toDateString`, `toTimeString`, `formatDisplayDate`, `formatDisplayTime`, `getDaysInMonth`, `buildAnnualMonths`, `currentPeriod`, `formatPeriodLabel`, `MONTH_NAMES`
- `utils/id.ts` — `generateId()` and `getIsoNow()`, used by both contexts. Do not re-implement either inline.

### Notifications

`services/notifications.ts` wraps `expo-notifications`. Called only from `RemindersContext` (never from components). `scheduleReminderNotification` returns `null` if permission is denied, the trigger date is in the past, the parsed date is invalid (`isNaN`), or if the OS scheduling call fails.

> **Important:** `expo-notifications` is not supported in Expo Go since SDK 53. To test notifications, always use `npm run android` (native development build), never `npm start`.

### Error Boundary

`components/ErrorBoundary.tsx` is a class component (required by React) that catches runtime errors in the entire tree. Mounted at the root in `_layout.tsx`. Shows a Portuguese-language error message with a "Tentar novamente" retry button.

### Validation

`utils/validation.ts` exports `validateReminder()` and `validateAproveitamento()`, both returning `{ valid: boolean; errors: Record<string, string> }`. Called in the hook's `handleSave` before any async operations.

`validateReminder` checks that `priority`, when present, is one of `'green' | 'yellow' | 'red' | 'custom'` — any other value produces `'Prioridade inválida'`. When `priority === 'custom'`, `customColor` must additionally match `/^#[0-9A-Fa-f]{6}$/`, or the error is `'Selecione uma cor personalizada'`.

## Styling — NativeWind v2

**NativeWind v2** (not v4). The Babel plugin (`nativewind/babel` in `babel.config.js`) compiles Tailwind classes at build time. Arbitrary values like `bg-[#6C2DC7]` are supported but the preferred approach is using the custom tokens defined in `tailwind.config.js`.

Restart Metro after any change to `tailwind.config.js`.

Libraries that don't accept class strings (e.g. `react-native-calendars`'s `theme` prop) require inline style objects — import `AppColors` or `calendarTheme` from `constants/theme.ts`.

## Color Palette

Defined in `tailwind.config.js` (Tailwind tokens) and `constants/theme.ts` (for inline styles):

| Tailwind class | Hex | Usage |
|----------------|-----|-------|
| `brand-primary` | `#3A0CA3` | Headings, active states |
| `brand-accent` | `#6C2DC7` | Buttons, selected elements |
| `brand-light` | `#F7F6FB` | Screen backgrounds |
| `brand-yellow` | `#FFF3B0` | Progress bar backgrounds |
| `brand-border` | `#E0E0E0` | Card/input borders |
| `brand-muted` | `#5C5C5C` | Secondary text, placeholders |
| `brand-dark` | `#1E1E1E` | Primary text |
| `priority-green` | `#4ADE80` | Low priority |
| `priority-yellow` | `#F5C518` | Medium priority |
| `priority-red` | `#E11D48` | High priority |

## Key Constraints

- **`react-native-calendars`**: `markedDates` keys must be `"YYYY-MM-DD"` strings. The `Reminder.date` field is stored in this format.
- **`@react-native-community/datetimepicker`**: On Android, the picker dismisses itself — `setShow(Platform.OS === "ios")` is the correct pattern.
- **`react-native-reanimated` v4** is installed (breaking API vs v3). Use v4 API only.
- **React Compiler is enabled** (`"reactCompiler": true` in `app.json`). Do not add manual `useMemo` / `useCallback`.
- **New Architecture is enabled** (`"newArchEnabled": true`).
- **`GestureHandlerRootView` inside a Modal is mandatory on Android** — a modal is a separate native window and does not inherit the root one.
- **`metro.config.js` sets `drop_console: true`** in the minifier config, so `console.*` is stripped from production bundles. Do not rely on logging for production behavior.
- **`FlatList` tuning is intentional** on both list screens (`initialNumToRender={8}`, `maxToRenderPerBatch={5}`, `windowSize={7}`, `removeClippedSubviews` on Android only). Keep these when editing the lists.
- **Do not introduce** FlashList, FastImage, or `React.lazy` — evaluated and rejected; the current list sizes do not justify them.

## Android Build — Manual Configurations

These are NOT handled automatically by Expo autolinking or prebuild. Do not remove them.

### `android/local.properties` (not committed — create per machine)
This file is in `.gitignore`. Must be created manually on each machine:
```
sdk.dir=C\:\\Users\\<your-user>\\AppData\\Local\\Android\\Sdk
```

### `android/gradle.properties` — Android Studio JDK
If the system `JAVA_HOME` does not point to a JDK (e.g. only a JRE is installed), add:
```
org.gradle.java.home=C:\\Program Files\\Android\\Android Studio\\jbr
```
Already configured in this repository. Adjust the path if Android Studio is installed elsewhere.

### `android/gradle.properties` — R8 Minification + Resource Shrinking
Added manually for release build optimization:
```
android.enableMinifyInReleaseBuilds=true
android.enableShrinkResourcesInReleaseBuilds=true
```

### `android/app/build.gradle` — AAB Bundle Splits
Added manually inside the `android { }` block (after `androidResources`):
```groovy
bundle {
    language { enableSplit = true }
    density { enableSplit = true }
    abi { enableSplit = true }
}
```

### `android/app/proguard-rules.pro` — Keep Rules
Added manually (in addition to the existing Reanimated keep rules):
```proguard
# expo-splash-screen (manual AAR, not autolinked)
-keep class expo.modules.splashscreen.** { *; }
```

### `expo-splash-screen` — Not autolinked (manual AAR)
`expo-splash-screen ~31.0.10` has no `android/` folder, so Expo autolinking ignores it entirely. The following were added **manually** and must not be removed:

- **`android/build.gradle`** (`allprojects.repositories`):
  ```groovy
  maven { url "$rootDir/../node_modules/expo-splash-screen/local-maven-repo" }
  ```
- **`android/app/build.gradle`** (`dependencies`):
  ```groovy
  implementation("androidx.core:core-splashscreen:1.0.1")
  implementation("host.exp.exponent:expo.modules.splashscreen:31.0.10")
  ```

## TypeScript / VS Code Notes

- **`tsconfig.json`** has an explicit `"exclude": ["node_modules"]`. This is intentional: `expo/tsconfig.base` excludes node_modules using `${configDir}/node_modules` (a TypeScript 5.5+ interpolation), but VS Code's internal TS server may not resolve `${configDir}` correctly, causing red errors to appear in the `node_modules` folder. The explicit exclude using the simple form fixes it without affecting `tsc` or Jest.
- **`app.json`** shows a yellow warning on `"reactCompiler": true` inside `"experiments"`. This is a VS Code JSON schema false positive — the Expo SchemaStore entry hasn't been updated to include that key yet. The config is valid and the React Compiler is active.

## Jest Configuration Notes

The project uses `jest-expo` preset with Expo SDK 54 + New Architecture. The `expo/src/winter` runtime installs lazy getters on `global` during `setupFiles`. These getters capture the setup context's `require` and fail when triggered from within a test's module scope.

**Fix is in `jest.setup.after.js` (`setupFilesAfterEnv`):** replaces the lazy getters for `structuredClone` and `__ExpoImportMetaRegistry` using `Object.defineProperty` without triggering them. The `@ungap/structured-clone` module (ESM-only) is also mapped to a CJS mock via `moduleNameMapper` in `package.json`.

**Do not remove** `jest.setup.after.js` or the `moduleNameMapper` entry — tests will break.

### Test Coverage (144 tests across 8 suites)

| Suite | Tests | Notes |
|-------|-------|-------|
| `utils/validation.test.ts` | 29 | Pure function, no mocks needed |
| `utils/dateHelpers.test.ts` | 36 | Pure function, no mocks needed |
| `services/storage.test.ts` | 13 | Uses AsyncStorage jest mock |
| `services/notifications.test.ts` | 11 | Mocks `expo-notifications`; `Platform.OS` set via direct assignment (not `spyOn` — it's a plain property in RN Jest env) |
| `context/remindersReducer.test.ts` | 17 | Must mock `@react-native-async-storage/async-storage` and `@/services/storage` to avoid native module error when importing the context |
| `context/aproveitamentoReducer.test.ts` | 18 | Same pattern as remindersReducer |
| `context/remindersContext.test.ts` | 12 | Integration: mounts `RemindersProvider` with `renderHook`, asserts `addReminder` / `updateReminder` / `removeReminder` orchestration end to end |
| `context/aproveitamentoContext.test.ts` | 8 | Integration: same pattern for `addRecord` / `updateRecord` / `removeRecord` |

Update these numbers whenever a suite changes — they are quoted in `README.md` and `README.pt-BR.md` too.

**Pattern for reducer tests** (mocks must be declared before imports):
```ts
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/storage', () => ({ getReminders: jest.fn(), ... }));

import { reducer } from '@/context/RemindersContext';
```

**Pattern for `Platform.OS` mock** (spyOn with `'get'` fails in RN Jest env):
```ts
const originalOS = Platform.OS;
beforeEach(() => { (Platform as unknown as { OS: string }).OS = 'android'; });
afterAll(() => { (Platform as unknown as { OS: string }).OS = originalOS; });
```

**Pattern for fake timers** — `new Date('YYYY-MM-DD')` parses as UTC midnight, which resolves to the
previous day in negative offsets such as UTC-3. Always use the local constructor:
```ts
jest.useFakeTimers().setSystemTime(new Date(2025, 0, 1)); // month is 0-indexed
```

**Pattern for call ordering** — `RemindersContext` must persist to storage *before* scheduling the
notification. `invocationCallOrder` guards that race condition fix:
```ts
expect(saveCallOrder).toBeLessThan(scheduleCallOrder);
```

## Types

All shared TypeScript interfaces are in [types/index.ts](types/index.ts):
- `Priority` — `'green' | 'yellow' | 'red' | 'custom'`
- `Reminder` — reminder with `date: string` ("YYYY-MM-DD"), `time: string` ("HH:MM"), `priority: Priority`, plus the optionals `customColor?` (hex `#RRGGBB`, only when `priority === 'custom'`), `notificationId?` (undefined when permission was denied) and `updatedAt?` (undefined on records created before v2.0.0)
- `AproveitamentoRecord` — study record with `monthlyDays: boolean[]` (real month length), `annualMonths: MonthRecord[]` (12 independent entries), `referencePeriod: string` ("YYYY-MM")
- `PeriodType` — `"mensal" | "anual"`
- `MonthRecord` — `{ monthIndex, completedDays, totalDays }` with actual days per month (28/29/30/31)

## Documentation Files

Keep these in sync when behavior changes — they contradict each other quickly otherwise:

| File | Holds |
|------|-------|
| `README.md` / `README.pt-BR.md` | Public-facing docs, mirrored section by section. Both quote the test count and dependency versions. |
| `CHANGELOG.md` | Keep a Changelog format. New work goes under `[Unreleased]` until a version is tagged. |
| `docs/architecture.md` | 8 Mermaid diagrams: data flow, component tree, notification sequence, both form state machines, reducer actions per context, ER of the shared types. |
| `Boas_praticas/` | Reference notes on Mermaid and React Native performance. Not part of the app. |
