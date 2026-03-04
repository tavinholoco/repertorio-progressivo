import {
  toDateString,
  toTimeString,
  formatDisplayDate,
  formatDisplayTime,
  getDaysInMonth,
  buildAnnualMonths,
  formatPeriodLabel,
  MONTH_NAMES,
} from '@/utils/dateHelpers';

// ─── Agenda helpers ───────────────────────────────────────────────────────────

describe('toDateString', () => {
  it('formata data como YYYY-MM-DD', () => {
    expect(toDateString(new Date(2025, 2, 10))).toBe('2025-03-10');
  });

  it('padeia mês e dia com zero à esquerda', () => {
    expect(toDateString(new Date(2025, 0, 5))).toBe('2025-01-05');
  });

  it('funciona para datas de dezembro', () => {
    expect(toDateString(new Date(2025, 11, 31))).toBe('2025-12-31');
  });
});

describe('toTimeString', () => {
  it('formata hora como HH:MM', () => {
    const d = new Date(0, 0, 0, 9, 5);
    expect(toTimeString(d)).toBe('09:05');
  });

  it('formata meia-noite', () => {
    expect(toTimeString(new Date(0, 0, 0, 0, 0))).toBe('00:00');
  });

  it('formata horário sem zero à esquerda necessário', () => {
    expect(toTimeString(new Date(0, 0, 0, 14, 30))).toBe('14:30');
  });
});

describe('formatDisplayDate', () => {
  it('converte YYYY-MM-DD para DD/MM/YYYY', () => {
    expect(formatDisplayDate('2025-03-10')).toBe('10/03/2025');
  });

  it('preserva zeros à esquerda', () => {
    expect(formatDisplayDate('2025-01-05')).toBe('05/01/2025');
  });
});

describe('formatDisplayTime', () => {
  it('retorna o horário sem modificação', () => {
    expect(formatDisplayTime('09:30')).toBe('09:30');
    expect(formatDisplayTime('00:00')).toBe('00:00');
    expect(formatDisplayTime('23:59')).toBe('23:59');
  });
});

// ─── Aproveitamento helpers ───────────────────────────────────────────────────

describe('getDaysInMonth', () => {
  it('retorna 31 para março (2025-03)', () => {
    expect(getDaysInMonth('2025-03')).toBe(31);
  });

  it('retorna 28 para fevereiro em ano não-bissexto (2025-02)', () => {
    expect(getDaysInMonth('2025-02')).toBe(28);
  });

  it('retorna 29 para fevereiro em ano bissexto (2024-02)', () => {
    expect(getDaysInMonth('2024-02')).toBe(29);
  });

  it('retorna 30 para abril (2025-04)', () => {
    expect(getDaysInMonth('2025-04')).toBe(30);
  });

  it('retorna 31 para janeiro (2025-01)', () => {
    expect(getDaysInMonth('2025-01')).toBe(31);
  });

  it('retorna 31 para dezembro (2025-12)', () => {
    expect(getDaysInMonth('2025-12')).toBe(31);
  });
});

describe('buildAnnualMonths', () => {
  it('retorna exatamente 12 meses', () => {
    expect(buildAnnualMonths(2025)).toHaveLength(12);
  });

  it('o monthIndex de cada entrada corresponde à posição', () => {
    const months = buildAnnualMonths(2025);
    months.forEach((m, i) => {
      expect(m.monthIndex).toBe(i);
    });
  });

  it('todos os completedDays começam em 0', () => {
    const months = buildAnnualMonths(2025);
    months.forEach((m) => expect(m.completedDays).toBe(0));
  });

  it('totalDays de fevereiro 2025 é 28', () => {
    const months = buildAnnualMonths(2025);
    expect(months[1].totalDays).toBe(28); // índice 1 = fevereiro
  });

  it('totalDays de fevereiro 2024 é 29 (ano bissexto)', () => {
    const months = buildAnnualMonths(2024);
    expect(months[1].totalDays).toBe(29);
  });

  it('totalDays de janeiro é 31', () => {
    const months = buildAnnualMonths(2025);
    expect(months[0].totalDays).toBe(31);
  });

  it('totalDays de abril é 30', () => {
    const months = buildAnnualMonths(2025);
    expect(months[3].totalDays).toBe(30);
  });
});

describe('formatPeriodLabel', () => {
  it('formata "2025-03" como "Mar/2025"', () => {
    expect(formatPeriodLabel('2025-03')).toBe('Mar/2025');
  });

  it('formata "2025-01" como "Jan/2025"', () => {
    expect(formatPeriodLabel('2025-01')).toBe('Jan/2025');
  });

  it('formata "2025-12" como "Dez/2025"', () => {
    expect(formatPeriodLabel('2025-12')).toBe('Dez/2025');
  });

  it('retorna fallback para mês fora do range (13)', () => {
    const result = formatPeriodLabel('2025-13');
    expect(result).not.toContain('undefined');
  });

  it('retorna fallback para mês fora do range (0)', () => {
    const result = formatPeriodLabel('2025-00');
    expect(result).not.toContain('undefined');
  });
});

describe('getDaysInMonth', () => {
  it('retorna 31 para janeiro (2025-01)', () => {
    expect(getDaysInMonth('2025-01')).toBe(31);
  });

  it('retorna 28 para fevereiro 2025 (não bissexto)', () => {
    expect(getDaysInMonth('2025-02')).toBe(28);
  });

  it('retorna 29 para fevereiro 2024 (bissexto)', () => {
    expect(getDaysInMonth('2024-02')).toBe(29);
  });

  it('retorna 30 como fallback para string inválida', () => {
    expect(getDaysInMonth('invalid')).toBe(30);
  });

  it('retorna 30 como fallback para string vazia', () => {
    expect(getDaysInMonth('')).toBe(30);
  });
});

describe('MONTH_NAMES', () => {
  it('contém exatamente 12 nomes', () => {
    expect(MONTH_NAMES).toHaveLength(12);
  });

  it('o primeiro é Jan e o último é Dez', () => {
    expect(MONTH_NAMES[0]).toBe('Jan');
    expect(MONTH_NAMES[11]).toBe('Dez');
  });
});
