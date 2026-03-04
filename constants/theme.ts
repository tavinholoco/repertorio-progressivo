/**
 * Paleta de cores do Repertório Progressivo.
 *
 * Use as classes Tailwind (`brand-*`, `priority-*`) nos componentes React Native.
 * Use `AppColors` apenas para props que não aceitam classes Tailwind
 * (ex: `theme` do react-native-calendars, `style` inline, `color` de ícones).
 */

export const AppColors = {
  /** Roxo escuro — títulos, estados ativos */
  primary: '#3A0CA3',
  /** Roxo médio — botões, elementos selecionados */
  accent: '#6C2DC7',
  /** Off-white — fundo das telas */
  background: '#F7F6FB',
  /** Amarelo claro — fundo de barras de progresso */
  yellow: '#FFF3B0',
  /** Cinza claro — bordas de cards e inputs */
  border: '#E0E0E0',
  /** Cinza médio — texto secundário, placeholders */
  muted: '#5C5C5C',
  /** Quase-preto — texto primário */
  dark: '#1E1E1E',
  white: '#FFFFFF',
  /** Roxo muito claro — destaque de hoje no calendário, pills */
  lightPurple: '#EDE9FE',
  /** Cinza de fallback para cores desconhecidas */
  fallbackGray: '#888888',
  /** Verde muito claro — fundo de itens completos */
  lightGreen: '#F0FFF4',
  /** Roxo muito claro (hover/fundo) — usados em MonthGrid */
  lightAccent: '#F5F3FF',

  priority: {
    green: '#4ADE80',
    yellow: '#F5C518',
    red: '#E11D48',
  },
} as const;

/** Família tipográfica Inter (carregada via useFonts em _layout.tsx) */
export const FontFamily = {
  regular:   'Inter-Regular',
  medium:    'Inter-Medium',
  semiBold:  'Inter-SemiBold',
  bold:      'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
} as const;

/** Arrays de gradiente prontos para uso com expo-linear-gradient */
export const Gradients = {
  /** Hero cards — diagonal roxo escuro → roxo vibrante */
  hero: ['#3A0CA3', '#7C3AED'] as const,
  /** Botão CTA primário */
  cta:  ['#6C2DC7', '#9333EA'] as const,
} as const;

/** Constantes de layout compartilhadas */
export const Layout = {
  /** Padding padrão do conteúdo das telas */
  screenPadding: 24,
  /** Padding superior das telas (safe area) */
  screenPaddingTop: 56,
  /** Padding inferior para não sobrepor a tab bar */
  screenPaddingBottom: 140,
  /** Raio de borda padrão para cards */
  cardRadius: 16,
  /** Raio de borda para hero cards */
  heroRadius: 24,
  /** Tab bar */
  tabBar: {
    offset: 24,
    height: 64,
    width: 200,
    borderRadius: 32,
    focusPaddingH: 18,
    focusPaddingV: 12,
  },
  /** Padding vertical de botões de ação (salvar, cancelar) */
  buttonPaddingV: 16,
  /** Padding horizontal de botões de ação */
  buttonPaddingH: 24,
  /** Padding interno de inputs */
  inputPadding: 16,
  /** Altura da barra de progresso */
  progressHeight: 8,
  /** Pill de badge (prioridade, tipo de período) */
  badge: { paddingH: 8, paddingV: 3, borderRadius: 12 },
  /** Duração de animações (ms) */
  animation: {
    progress: 800,
    focus: 200,
  },
} as const;

/** Tema para o componente Calendar do react-native-calendars */
export const calendarTheme = {
  backgroundColor: AppColors.background,
  calendarBackground: AppColors.white,
  textSectionTitleColor: AppColors.muted,
  selectedDayBackgroundColor: AppColors.accent,
  selectedDayTextColor: AppColors.white,
  todayTextColor: AppColors.accent,
  todayBackgroundColor: AppColors.lightPurple,
  dayTextColor: AppColors.dark,
  textDisabledColor: AppColors.border,
  dotColor: AppColors.accent,
  selectedDotColor: AppColors.white,
  arrowColor: AppColors.primary,
  monthTextColor: AppColors.primary,
  textDayFontFamily: FontFamily.medium,
  textMonthFontFamily: FontFamily.bold,
  textDayHeaderFontFamily: FontFamily.semiBold,
  textDayFontSize: 15,
  textMonthFontSize: 17,
  textDayHeaderFontSize: 12,
};
