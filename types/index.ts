// Tipos compartilhados por toda a aplicação

export type Priority = 'green' | 'yellow' | 'red';

export interface Reminder {
  id: string;
  name: string;
  /** Formato "YYYY-MM-DD" — chave direta do markedDates do react-native-calendars */
  date: string;
  /** Formato "HH:MM" 24h */
  time: string;
  priority: Priority;
  /** ID retornado pelo expo-notifications ao agendar; undefined se permissão negada */
  notificationId?: string;
  createdAt: string;
}

export type PeriodType = 'mensal' | 'anual';

export interface MonthRecord {
  /** 0–11 */
  monthIndex: number;
  completedDays: number;
  /** Dias reais do mês (28 / 29 / 30 / 31) */
  totalDays: number;
}

export interface AproveitamentoRecord {
  id: string;
  eventName: string;
  totalHours: number;
  completedHours: number;
  periodType: PeriodType;
  /** Array de booleanos com tamanho igual aos dias reais do mês */
  monthlyDays: boolean[];
  /** 12 entradas independentes para o modo anual */
  annualMonths: MonthRecord[];
  /** "YYYY-MM" — período de referência do registro */
  referencePeriod: string;
  createdAt: string;
  updatedAt: string;
}
