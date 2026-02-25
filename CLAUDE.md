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

## Architecture

**Expo Router (file-based routing)** — routes are defined by files in `app/`:
- [app/_layout.tsx](app/_layout.tsx) — root layout with floating bottom tab navigator + wraps the entire tree with both Context providers
- [app/index.tsx](app/index.tsx) — Agenda tab (thin wrapper, delegates to `components/AgendaScreen`)
- [app/Aproveitamento.tsx](app/Aproveitamento.tsx) — Aproveitamento tab (self-contained)

The Agenda screen lives in `components/AgendaScreen.tsx` (not in `app/`) so it can be unit-tested independently from the router.

### Data Flow

```
AsyncStorage (disk)
      ↕
services/storage.ts        ← sole owner of AsyncStorage calls
      ↕
context/RemindersContext.tsx      ← global state (useReducer)
context/AproveitamentoContext.tsx ← global state (useReducer)
      ↕
components/AgendaScreen.tsx   ← consumes useReminders()
app/Aproveitamento.tsx        ← consumes useAproveitamento()
```

**Rule:** No component ever calls `AsyncStorage` directly. All reads/writes go through `services/storage.ts`. No component uses `useContext(RemindersContext)` directly — always use the `useReminders()` / `useAproveitamento()` hooks.

### Notifications

`services/notifications.ts` wraps `expo-notifications`. Called only from `RemindersContext` (never from components). `scheduleReminderNotification` returns `null` if permission is denied, the trigger date is in the past, the parsed date is invalid (`isNaN`), or if the OS scheduling call fails.

> **Important:** `expo-notifications` is not supported in Expo Go since SDK 53. To test notifications, always use `npm run android` (native development build), never `npm start`.

### Validation

`utils/validation.ts` exports `validateReminder()` and `validateAproveitamento()`, both returning `{ valid: boolean; errors: Record<string, string> }`. Called in the component's save handler before any async operations. `validateReminder` also validates that `priority`, when present, is one of `'green' | 'yellow' | 'red'` — any other string value produces a `'Prioridade inválida'` error.

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

## Jest Configuration Notes

The project uses `jest-expo` preset with Expo SDK 54 + New Architecture. The `expo/src/winter` runtime installs lazy getters on `global` during `setupFiles`. These getters capture the setup context's `require` and fail when triggered from within a test's module scope.

**Fix is in `jest.setup.after.js` (`setupFilesAfterEnv`):** replaces the lazy getters for `structuredClone` and `__ExpoImportMetaRegistry` using `Object.defineProperty` without triggering them. The `@ungap/structured-clone` module (ESM-only) is also mapped to a CJS mock via `moduleNameMapper` in `package.json`.

**Do not remove** `jest.setup.after.js` or the `moduleNameMapper` entry — tests will break.

## Types

All shared TypeScript interfaces are in [types/index.ts](types/index.ts):
- `Reminder` — reminder with `date: string` ("YYYY-MM-DD"), `time: string` ("HH:MM"), `priority: Priority`
- `AproveitamentoRecord` — study record with `monthlyDays: boolean[]` (real month length), `annualMonths: MonthRecord[]` (12 independent entries)
- `PeriodType` — `"mensal" | "anual"`
- `MonthRecord` — `{ monthIndex, completedDays, totalDays }` with actual days per month (28/29/30/31)
