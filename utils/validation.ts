/** Resultado de uma validação de formulário. */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ─── Lembrete ─────────────────────────────────────────────────────────────────

interface ReminderFields {
  name: string;
  date: string;
  time: string;
  priority: string | null;
}

export function validateReminder(fields: ReminderFields): ValidationResult {
  const errors: Record<string, string> = {};

  if (!fields.name.trim()) {
    errors.name = 'Nome do lembrete é obrigatório';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  if (!fields.date) {
    errors.date = 'Data é obrigatória';
  }

  if (!fields.time) {
    errors.time = 'Horário é obrigatório';
  }

  if (!fields.priority) {
    errors.priority = 'Selecione uma prioridade';
  } else if (!['green', 'yellow', 'red'].includes(fields.priority)) {
    errors.priority = 'Prioridade inválida';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Aproveitamento ───────────────────────────────────────────────────────────

interface AproveitamentoFields {
  eventName: string;
  totalHours: string;
}

export function validateAproveitamento(
  fields: AproveitamentoFields,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!fields.eventName.trim()) {
    errors.eventName = 'Nome do evento é obrigatório';
  }

  const total = Number(fields.totalHours);
  if (!fields.totalHours || isNaN(total) || total <= 0) {
    errors.totalHours = 'Carga horária deve ser maior que 0';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
