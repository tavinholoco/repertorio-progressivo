import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAproveitamento } from '@/context/AproveitamentoContext';
import type { AproveitamentoRecord, MonthRecord, PeriodType } from '@/types';
import { validateAproveitamento } from '@/utils/validation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function getDaysInMonth(period: string): number {
  const [y, m] = period.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

function buildAnnualMonths(year: number): MonthRecord[] {
  return Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    completedDays: 0,
    totalDays: new Date(year, i + 1, 0).getDate(),
  }));
}

function currentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatPeriodLabel(period: string): string {
  const [y, m] = period.split('-');
  return `${MONTH_NAMES[Number(m) - 1]}/${y}`;
}

// ─── Componente de item da lista ──────────────────────────────────────────────

interface RecordItemProps {
  record: AproveitamentoRecord;
  onEdit: (r: AproveitamentoRecord) => void;
  onDelete: (id: string) => void;
}

function RecordItem({ record, onEdit, onDelete }: RecordItemProps) {
  const progress =
    record.totalHours > 0
      ? Math.min(record.completedHours / record.totalHours, 1)
      : 0;

  function handleDelete() {
    Alert.alert(
      'Remover registro',
      `Deseja remover "${record.eventName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onDelete(record.id),
        },
      ],
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-[#E0E0E0]">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-[#1E1E1E] font-semibold text-base" numberOfLines={1}>
            {record.eventName}
          </Text>
          <Text className="text-[#5C5C5C] text-sm">
            {formatPeriodLabel(record.referencePeriod)} · {record.periodType}
          </Text>
        </View>

        <TouchableOpacity onPress={() => onEdit(record)} className="p-2 mr-1">
          <MaterialIcons name="edit" size={22} color="#6C2DC7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="p-2">
          <MaterialIcons name="delete-outline" size={22} color="#E11D48" />
        </TouchableOpacity>
      </View>

      <View className="w-full h-3 bg-[#FFF3B0] rounded-full overflow-hidden">
        <View
          style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: '#6C2DC7' }}
        />
      </View>
      <Text className="text-sm text-[#5C5C5C] mt-1">
        {Math.round(progress * 100)}% ({record.completedHours}/{record.totalHours} h)
      </Text>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function Aproveitamento() {
  const { state, addRecord, updateRecord, removeRecord } = useAproveitamento();

  // Formulário
  const [evento, setEvento] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [horasConcluidas, setHorasConcluidas] = useState('');
  const [tempo, setTempo] = useState<PeriodType>('mensal');
  const [referencePeriod, setReferencePeriod] = useState(currentPeriod);

  // Estado de dias/meses (hidratado ao mudar período)
  const daysInMonth = useMemo(() => getDaysInMonth(referencePeriod), [referencePeriod]);
  const [dias, setDias] = useState<boolean[]>(() =>
    Array.from({ length: daysInMonth }, () => false),
  );
  const [annualMonths, setAnnualMonths] = useState<MonthRecord[]>(() =>
    buildAnnualMonths(new Date().getFullYear()),
  );

  // Edição e submissão
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Hidratar formulário ao mudar período ────────────────────────────────────
  useEffect(() => {
    const existing = state.records.find(
      (r) => r.referencePeriod === referencePeriod && r.periodType === tempo,
    );

    if (existing) {
      setEvento(existing.eventName);
      setCargaHoraria(String(existing.totalHours));
      setHorasConcluidas(String(existing.completedHours));
      setDias(existing.monthlyDays);
      setAnnualMonths(existing.annualMonths);
      setEditingId(existing.id);
    } else {
      const [y] = referencePeriod.split('-').map(Number);
      setDias(Array.from({ length: getDaysInMonth(referencePeriod) }, () => false));
      setAnnualMonths(buildAnnualMonths(y));
      setEditingId(null);
    }
  }, [referencePeriod, tempo, state.records]);

  // ─── Navegação de período ────────────────────────────────────────────────────
  function navigatePeriod(direction: 1 | -1) {
    const [y, m] = referencePeriod.split('-').map(Number);
    const next = new Date(y, m - 1 + direction, 1);
    const newY = next.getFullYear();
    const newM = String(next.getMonth() + 1).padStart(2, '0');
    setReferencePeriod(`${newY}-${newM}`);
  }

  // ─── Dias mensais ────────────────────────────────────────────────────────────
  function toggleDia(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDias((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  // ─── Meses anuais ────────────────────────────────────────────────────────────
  function adjustMonth(monthIndex: number, delta: 1 | -1) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnnualMonths((prev) =>
      prev.map((m) =>
        m.monthIndex === monthIndex
          ? {
              ...m,
              completedDays: Math.max(
                0,
                Math.min(m.totalDays, m.completedDays + delta),
              ),
            }
          : m,
      ),
    );
  }

  // ─── Computados ─────────────────────────────────────────────────────────────
  const diasMarcados = useMemo(() => dias.filter(Boolean).length, [dias]);
  const percentualDias = useMemo(
    () => (tempo === 'mensal' ? (diasMarcados / daysInMonth) * 100 : 0),
    [diasMarcados, daysInMonth, tempo],
  );
  const totalHours = Number(cargaHoraria) || 0;
  const doneHours = Number(horasConcluidas) || 0;
  const cargaProgress = totalHours > 0 ? Math.min(doneHours / totalHours, 1) : 0;

  // ─── Salvar ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    const validation = validateAproveitamento({
      eventName: evento,
      totalHours: cargaHoraria,
      completedHours: horasConcluidas,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<AproveitamentoRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        eventName: evento.trim(),
        totalHours,
        completedHours: doneHours,
        periodType: tempo,
        monthlyDays: dias,
        annualMonths,
        referencePeriod,
      };

      if (editingId) {
        const existing = state.records.find((r) => r.id === editingId);
        if (!existing) return;
        await updateRecord({ ...existing, ...payload });
      } else {
        await addRecord(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setErrors({});
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o registro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function populateFormFromRecord(record: AproveitamentoRecord) {
    setEvento(record.eventName);
    setCargaHoraria(String(record.totalHours));
    setHorasConcluidas(String(record.completedHours));
    setTempo(record.periodType);
    setReferencePeriod(record.referencePeriod);
    setDias(record.monthlyDays);
    setAnnualMonths(record.annualMonths);
    setEditingId(record.id);
    setErrors({});
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <FlatList
      className="flex-1 bg-[#F7F6FB]"
      contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 160 }}
      ListHeaderComponent={
        <>
          <Text className="text-3xl font-extrabold text-[#3A0CA3] mb-6 text-center">
            Aproveitamento
          </Text>

          {/* ── Nome do evento ── */}
          <View className="mb-4">
            <Text className="text-[#1E1E1E] mb-2 font-semibold">Nome do evento</Text>
            <TextInput
              value={evento}
              onChangeText={(v) => {
                setEvento(v);
                setErrors((p) => ({ ...p, eventName: '' }));
              }}
              placeholder="Ex: Revisão - Álgebra"
              placeholderTextColor="#5C5C5C"
              className="bg-white p-3 rounded-2xl border border-[#E0E0E0]"
            />
            {errors.eventName ? (
              <Text className="text-[#E11D48] text-sm mt-1">{errors.eventName}</Text>
            ) : null}
          </View>

          {/* ── Carga horária ── */}
          <View className="mb-4">
            <Text className="text-[#1E1E1E] mb-2 font-semibold">Carga horária (horas)</Text>
            <TextInput
              value={cargaHoraria}
              onChangeText={(v) => {
                setCargaHoraria(v);
                setErrors((p) => ({ ...p, totalHours: '' }));
              }}
              placeholder="Ex: 40"
              keyboardType="numeric"
              placeholderTextColor="#5C5C5C"
              className="bg-white p-3 rounded-2xl border border-[#E0E0E0] mb-3"
            />
            {errors.totalHours ? (
              <Text className="text-[#E11D48] text-sm -mt-2 mb-2">{errors.totalHours}</Text>
            ) : null}

            <Text className="text-[#1E1E1E] mb-2 font-semibold">Horas concluídas</Text>
            <TextInput
              value={horasConcluidas}
              onChangeText={(v) => {
                setHorasConcluidas(v);
                setErrors((p) => ({ ...p, completedHours: '' }));
              }}
              placeholder="Ex: 12"
              keyboardType="numeric"
              placeholderTextColor="#5C5C5C"
              className="bg-white p-3 rounded-2xl border border-[#E0E0E0]"
            />
            {errors.completedHours ? (
              <Text className="text-[#E11D48] text-sm mt-1">{errors.completedHours}</Text>
            ) : null}
          </View>

          {/* ── Período (mensal / anual) ── */}
          <Text className="text-[#1E1E1E] mb-2 font-semibold">Período</Text>
          <View className="flex-row mb-5">
            {(['mensal', 'anual'] as PeriodType[]).map((t, i) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTempo(t)}
                className={`flex-1 p-3 rounded-2xl ${i === 0 ? 'mr-2' : ''} ${
                  tempo === t ? 'bg-[#6C2DC7]' : 'bg-white border border-[#E0E0E0]'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    tempo === t ? 'text-white' : 'text-[#1E1E1E]'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Navegação de mês ── */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() => navigatePeriod(-1)}
              className="bg-white border border-[#E0E0E0] rounded-xl p-2"
            >
              <MaterialIcons name="chevron-left" size={24} color="#3A0CA3" />
            </TouchableOpacity>

            <Text className="text-[#3A0CA3] font-bold text-lg">
              {formatPeriodLabel(referencePeriod)}
            </Text>

            <TouchableOpacity
              onPress={() => navigatePeriod(1)}
              className="bg-white border border-[#E0E0E0] rounded-xl p-2"
            >
              <MaterialIcons name="chevron-right" size={24} color="#3A0CA3" />
            </TouchableOpacity>
          </View>

          {/* ── Indicador de progresso ── */}
          <View className="flex-row items-center justify-between mb-6">
            {/* Donut visual */}
            <View
              style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: '#FFF3B0',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#3A0CA3', fontSize: 22, fontWeight: '700' }}>
                  {Math.round(tempo === 'mensal' ? percentualDias : 0)}%
                </Text>
                <Text style={{ color: '#5C5C5C', fontSize: 12 }}>dos dias</Text>
              </View>
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-[#1E1E1E] font-semibold mb-2">Progresso da carga</Text>
              <View className="w-full h-4 bg-[#FFF3B0] rounded-full overflow-hidden mb-1">
                <View
                  style={{
                    width: `${Math.round(cargaProgress * 100)}%`,
                    height: '100%',
                    backgroundColor: '#6C2DC7',
                  }}
                />
              </View>
              <Text className="text-sm text-[#5C5C5C] mb-3">
                {Math.round(cargaProgress * 100)}% ({doneHours}/{totalHours} h)
              </Text>
              {tempo === 'mensal' && (
                <Text className="text-sm text-[#5C5C5C]">
                  Dias marcados:{' '}
                  <Text className="font-semibold text-[#3A0CA3]">{diasMarcados}</Text>
                  {' '}/ {daysInMonth}
                </Text>
              )}
            </View>
          </View>

          {/* ── Grid de dias (mensal) ── */}
          {tempo === 'mensal' && (
            <>
              <Text className="text-[#1E1E1E] mb-2 font-semibold">Dias estudados</Text>
              <View className="flex-row flex-wrap justify-between mb-4">
                {dias.map((marcado, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleDia(index)}
                    className="w-[30%] bg-white rounded-2xl p-4 m-1 border border-[#E0E0E0] flex-row items-center justify-between"
                  >
                    <Text className="text-[#1E1E1E] font-semibold">{index + 1}</Text>
                    <MaterialIcons
                      name={marcado ? 'check-box' : 'check-box-outline-blank'}
                      size={26}
                      color={marcado ? '#6C2DC7' : '#5C5C5C'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── Grid de meses (anual) ── */}
          {tempo === 'anual' && (
            <>
              <Text className="text-[#1E1E1E] mb-2 font-semibold">Meses do ano</Text>
              <View className="flex-row flex-wrap justify-between mb-4">
                {annualMonths.map((month) => {
                  const pct =
                    month.totalDays > 0
                      ? Math.round((month.completedDays / month.totalDays) * 100)
                      : 0;
                  return (
                    <View
                      key={month.monthIndex}
                      className="w-[30%] bg-white rounded-2xl p-3 m-1 border border-[#E0E0E0] items-center"
                    >
                      <Text className="text-[#1E1E1E] font-semibold text-sm">
                        {MONTH_NAMES[month.monthIndex]}
                      </Text>
                      <View className="w-full h-2 bg-[#FFF3B0] rounded-full mt-2 overflow-hidden">
                        <View
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: '#6C2DC7',
                          }}
                        />
                      </View>
                      <Text className="text-xs text-[#5C5C5C] mt-1 mb-1">
                        {month.completedDays}/{month.totalDays}d
                      </Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => adjustMonth(month.monthIndex, -1)}
                          className="bg-[#F7F6FB] rounded-lg px-2 py-1"
                        >
                          <Text className="text-[#3A0CA3] font-bold">−</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => adjustMonth(month.monthIndex, 1)}
                          className="bg-[#F7F6FB] rounded-lg px-2 py-1"
                        >
                          <Text className="text-[#3A0CA3] font-bold">+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* ── Botão salvar ── */}
          <TouchableOpacity
            className="bg-[#6C2DC7] py-4 rounded-2xl shadow-md mt-4 active:opacity-90"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                {editingId ? 'Atualizar Aproveitamento' : 'Salvar Aproveitamento'}
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Título da lista ── */}
          {state.records.length > 0 && (
            <Text className="text-[#1E1E1E] text-lg font-bold mt-8 mb-3">
              Registros salvos
            </Text>
          )}

          {state.isLoading && (
            <ActivityIndicator size="large" color="#6C2DC7" className="mt-6" />
          )}
        </>
      }
      data={state.records}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RecordItem
          record={item}
          onEdit={populateFormFromRecord}
          onDelete={removeRecord}
        />
      )}
      ListEmptyComponent={
        !state.isLoading ? (
          <Text className="text-[#5C5C5C] text-center mt-4">
            Nenhum registro salvo ainda.
          </Text>
        ) : null
      }
    />
  );
}
