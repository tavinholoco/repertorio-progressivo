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

  it('aceita prioridade custom com hex válido', () => {
    expect(validateReminder({ ...valid, priority: 'custom', customColor: '#A855F7' }).valid).toBe(true);
  });

  it('rejeita custom sem customColor', () => {
    const { errors } = validateReminder({ ...valid, priority: 'custom', customColor: null });
    expect(errors.priority).toBe('Selecione uma cor personalizada');
  });

  it('rejeita custom com hex malformado', () => {
    const { errors } = validateReminder({ ...valid, priority: 'custom', customColor: 'roxo' });
    expect(errors.priority).toBe('Selecione uma cor personalizada');
  });

  it('rejeita custom com hex de 3 dígitos', () => {
    const { errors } = validateReminder({ ...valid, priority: 'custom', customColor: '#A8F' });
    expect(errors.priority).toBe('Selecione uma cor personalizada');
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

  it('rejeita name com mais de 100 caracteres', () => {
    const { errors } = validateReminder({ ...valid, name: 'a'.repeat(101) });
    expect(errors.name).toBe('Nome deve ter no máximo 100 caracteres');
  });

  it('aceita name com exatamente 100 caracteres', () => {
    expect(validateReminder({ ...valid, name: 'a'.repeat(100) }).valid).toBe(true);
  });

  it('rejeita custom com hex de 5 dígitos', () => {
    expect(validateReminder({ ...valid, priority: 'custom', customColor: '#12345' }).valid).toBe(false);
  });

  it('rejeita custom com hex de 7 dígitos', () => {
    expect(validateReminder({ ...valid, priority: 'custom', customColor: '#1234567' }).valid).toBe(false);
  });

  it('rejeita custom com caracteres inválidos no hex', () => {
    expect(validateReminder({ ...valid, priority: 'custom', customColor: '#GGGGGG' }).valid).toBe(false);
  });
});

// ─── validateAproveitamento ───────────────────────────────────────────────────

describe('validateAproveitamento', () => {
  const valid = {
    eventName: 'Álgebra',
    totalHours: '40',
  };

  it('retorna valid:true para campos corretos', () => {
    expect(validateAproveitamento(valid).valid).toBe(true);
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

  it('rejeita eventName com mais de 100 caracteres', () => {
    const { errors } = validateAproveitamento({
      ...valid,
      eventName: 'a'.repeat(101),
    });
    expect(errors.eventName).toBe('Nome deve ter no máximo 100 caracteres');
  });

  it('rejeita carga horária maior que 9999', () => {
    const { errors } = validateAproveitamento({ ...valid, totalHours: '10000' });
    expect(errors.totalHours).toBe('Carga horária máxima é 9999h');
  });

  it('aceita carga horária de exatamente 9999', () => {
    expect(validateAproveitamento({ ...valid, totalHours: '9999' }).valid).toBe(true);
  });

  it('rejeita eventName composto só de espaços', () => {
    const r = validateAproveitamento({ ...valid, eventName: '   ' });
    expect(r.valid).toBe(false);
    expect(r.errors.eventName).toBeDefined();
  });
});
