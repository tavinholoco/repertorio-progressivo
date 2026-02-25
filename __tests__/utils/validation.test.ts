import {
  validateAproveitamento,
  validateReminder,
} from '@/utils/validation';

// ─── validateReminder ─────────────────────────────────────────────────────────

describe('validateReminder', () => {
  const valid = {
    name: 'Reunião',
    date: '2025-03-10',
    time: '09:00',
    priority: 'green' as const,
  };

  it('retorna valid:true para campos corretos', () => {
    expect(validateReminder(valid).valid).toBe(true);
  });

  it('exige nome', () => {
    const { errors } = validateReminder({ ...valid, name: '' });
    expect(errors.name).toBe('Nome do lembrete é obrigatório');
  });

  it('rejeita nome composto só de espaços', () => {
    const { errors } = validateReminder({ ...valid, name: '   ' });
    expect(errors.name).toBe('Nome do lembrete é obrigatório');
  });

  it('exige nome com pelo menos 2 caracteres', () => {
    const { errors } = validateReminder({ ...valid, name: 'A' });
    expect(errors.name).toBe('Nome deve ter pelo menos 2 caracteres');
  });

  it('aceita nome com exatamente 2 caracteres', () => {
    const result = validateReminder({ ...valid, name: 'AB' });
    expect(result.valid).toBe(true);
  });

  it('exige data', () => {
    const { errors } = validateReminder({ ...valid, date: '' });
    expect(errors.date).toBe('Data é obrigatória');
  });

  it('exige horário', () => {
    const { errors } = validateReminder({ ...valid, time: '' });
    expect(errors.time).toBe('Horário é obrigatório');
  });

  it('exige prioridade', () => {
    const { errors } = validateReminder({ ...valid, priority: null });
    expect(errors.priority).toBe('Selecione uma prioridade');
  });

  it('rejeita prioridade fora do enum', () => {
    const { errors } = validateReminder({ ...valid, priority: 'gold' });
    expect(errors.priority).toBe('Prioridade inválida');
  });

  it('aceita todas as prioridades válidas', () => {
    expect(validateReminder({ ...valid, priority: 'green' }).valid).toBe(true);
    expect(validateReminder({ ...valid, priority: 'yellow' }).valid).toBe(true);
    expect(validateReminder({ ...valid, priority: 'red' }).valid).toBe(true);
  });

  it('retorna múltiplos erros ao mesmo tempo', () => {
    const { valid: isValid, errors } = validateReminder({
      name: '',
      date: '',
      time: '',
      priority: null,
    });
    expect(isValid).toBe(false);
    expect(Object.keys(errors).length).toBeGreaterThan(1);
  });
});

// ─── validateAproveitamento ───────────────────────────────────────────────────

describe('validateAproveitamento', () => {
  const valid = {
    eventName: 'Álgebra',
    totalHours: '40',
    completedHours: '10',
  };

  it('retorna valid:true para campos corretos', () => {
    expect(validateAproveitamento(valid).valid).toBe(true);
  });

  it('aceita horas concluídas vazio (campo opcional)', () => {
    const result = validateAproveitamento({ ...valid, completedHours: '' });
    expect(result.valid).toBe(true);
  });

  it('exige nome do evento', () => {
    const { errors } = validateAproveitamento({ ...valid, eventName: '' });
    expect(errors.eventName).toBe('Nome do evento é obrigatório');
  });

  it('exige carga horária maior que 0', () => {
    const { errors } = validateAproveitamento({ ...valid, totalHours: '0' });
    expect(errors.totalHours).toBe('Carga horária deve ser maior que 0');
  });

  it('rejeita carga horária negativa', () => {
    const { errors } = validateAproveitamento({ ...valid, totalHours: '-5' });
    expect(errors.totalHours).toBe('Carga horária deve ser maior que 0');
  });

  it('rejeita carga horária não numérica', () => {
    const { errors } = validateAproveitamento({ ...valid, totalHours: 'abc' });
    expect(errors.totalHours).toBe('Carga horária deve ser maior que 0');
  });

  it('rejeita horas concluídas maiores que a carga total', () => {
    const { errors } = validateAproveitamento({
      ...valid,
      totalHours: '10',
      completedHours: '15',
    });
    expect(errors.completedHours).toBe('Horas concluídas não podem exceder a carga total');
  });

  it('rejeita horas concluídas negativas', () => {
    const { errors } = validateAproveitamento({ ...valid, completedHours: '-1' });
    expect(errors.completedHours).toBe('Horas concluídas inválidas');
  });

  it('aceita horas concluídas igual à carga total', () => {
    const result = validateAproveitamento({
      ...valid,
      totalHours: '10',
      completedHours: '10',
    });
    expect(result.valid).toBe(true);
  });
});
