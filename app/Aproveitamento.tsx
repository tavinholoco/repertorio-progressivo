import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';
import { useAproveitamentoForm } from '@/hooks/useAproveitamentoForm';
import { formatPeriodLabel } from '@/utils/dateHelpers';
import { RecordItem } from '@/components/RecordItem';
import { ProgressDonut } from '@/components/ProgressDonut';
import { DayGrid } from '@/components/DayGrid';
import { MonthGrid } from '@/components/MonthGrid';
import type { PeriodType } from '@/types';

export default function Aproveitamento() {
  const {
    state,
    removeRecord,
    evento,
    handleEventoChange,
    cargaHoraria,
    handleCargaHorariaChange,
    tempo,
    setTempo,
    referencePeriod,
    dias,
    annualMonths,
    editingId,
    isSubmitting,
    errors,
    daysInMonth,
    diasMarcados,
    percentualDias,
    cargaProgress,
    progressLabel,
    navigatePeriod,
    toggleDia,
    adjustMonth,
    handleSave,
    populateFormFromRecord,
  } = useAproveitamentoForm();

  return (
    <FlatList
      className="flex-1 bg-brand-light"
      contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 160 }}
      ListHeaderComponent={
        <>
          {/* ── Hero Card ── */}
          <View className="bg-brand-accent rounded-3xl p-5 mb-6 items-center">
            <Text className="text-white text-xl font-bold mb-1">Aproveitamento</Text>
            <Text className="text-white text-sm mb-4" style={{ opacity: 0.8 }}>
              {formatPeriodLabel(referencePeriod)}
            </Text>
            <ProgressDonut
              percentage={tempo === 'mensal' ? percentualDias : Math.round(cargaProgress * 100)}
            />
          </View>

          {/* ── Nome do evento ── */}
          <View className="mb-4">
            <Text className="text-brand-dark mb-2 font-semibold">Nome do evento</Text>
            <TextInput
              value={evento}
              onChangeText={handleEventoChange}
              placeholder="Ex: Revisão - Álgebra"
              placeholderTextColor={AppColors.muted}
              className="bg-white p-4 rounded-2xl border border-brand-border"
            />
            {errors.eventName ? (
              <Text className="text-priority-red text-sm mt-1">{errors.eventName}</Text>
            ) : null}
          </View>

          {/* ── Carga horária ── */}
          <View className="mb-4">
            <Text className="text-brand-dark mb-2 font-semibold">Carga horária (horas)</Text>
            <TextInput
              value={cargaHoraria}
              onChangeText={handleCargaHorariaChange}
              placeholder="Ex: 40"
              keyboardType="numeric"
              placeholderTextColor={AppColors.muted}
              className="bg-white p-4 rounded-2xl border border-brand-border mb-3"
            />
            {errors.totalHours ? (
              <Text className="text-priority-red text-sm -mt-2 mb-2">{errors.totalHours}</Text>
            ) : null}
          </View>

          {/* ── Período (mensal / anual) ── */}
          <Text className="text-brand-dark mb-2 font-semibold">Período</Text>
          <View className="flex-row mb-5">
            {(['mensal', 'anual'] as PeriodType[]).map((t, i) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTempo(t)}
                className={`flex-1 p-4 rounded-2xl ${i === 0 ? 'mr-2' : ''} ${
                  tempo === t ? 'bg-brand-accent' : 'bg-white border border-brand-border'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    tempo === t ? 'text-white' : 'text-brand-dark'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Navegação de período ── */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() => navigatePeriod(-1)}
              className="bg-white border border-brand-border rounded-xl p-2"
            >
              <MaterialIcons name="chevron-left" size={24} color={AppColors.primary} />
            </TouchableOpacity>

            <Text className="text-brand-primary font-bold text-lg">
              {formatPeriodLabel(referencePeriod)}
            </Text>

            <TouchableOpacity
              onPress={() => navigatePeriod(1)}
              className="bg-white border border-brand-border rounded-xl p-2"
            >
              <MaterialIcons name="chevron-right" size={24} color={AppColors.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Progresso da carga ── */}
          <View className="mb-6">
            <Text className="text-brand-dark font-semibold mb-2">Progresso da carga</Text>
            <View className="w-full h-3 bg-brand-yellow rounded-full overflow-hidden mb-1">
              <View
                style={{
                  width: `${Math.round(cargaProgress * 100)}%`,
                  height: '100%',
                  backgroundColor: AppColors.accent,
                }}
              />
            </View>
            <Text className="text-sm text-brand-muted mb-3">
              {Math.round(cargaProgress * 100)}% ({progressLabel})
            </Text>
            {tempo === 'mensal' && (
              <Text className="text-sm text-brand-muted">
                Dias marcados:{' '}
                <Text className="font-semibold text-brand-primary">{diasMarcados}</Text>
                {' '}/ {daysInMonth}
              </Text>
            )}
          </View>

          {/* ── Grid de dias (mensal) ── */}
          {tempo === 'mensal' && <DayGrid days={dias} onToggle={toggleDia} />}

          {/* ── Grid de meses (anual) ── */}
          {tempo === 'anual' && <MonthGrid months={annualMonths} onAdjust={adjustMonth} />}

          {/* ── Botão salvar ── */}
          <TouchableOpacity
            className="bg-brand-accent py-4 rounded-2xl shadow-md mt-4 active:opacity-90"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                {editingId ? 'Atualizar Aproveitamento' : 'Salvar Aproveitamento'}
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Título da lista ── */}
          {state.records.length > 0 && (
            <Text className="text-brand-dark text-lg font-bold mt-8 mb-3">
              Registros salvos
            </Text>
          )}

          {state.isLoading && (
            <ActivityIndicator size="large" color={AppColors.accent} className="mt-6" />
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
          <Text className="text-brand-muted text-center mt-4">
            Nenhum registro salvo ainda.
          </Text>
        ) : null
      }
    />
  );
}
