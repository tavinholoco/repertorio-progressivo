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

/** Tema para o componente Calendar do react-native-calendars */
export const calendarTheme = {
  backgroundColor: AppColors.background,
  calendarBackground: AppColors.white,
  textSectionTitleColor: AppColors.muted,
  selectedDayBackgroundColor: AppColors.accent,
  selectedDayTextColor: AppColors.white,
  todayTextColor: AppColors.accent,
  todayBackgroundColor: '#EDE9FE',
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
