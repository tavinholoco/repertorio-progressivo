import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppColors, FontFamily, Gradients, Layout } from '@/constants';
import { useAproveitamentoForm } from '@/hooks';
import { formatPeriodLabel } from '@/utils';
import {
  AnimatedTextInput,
  Badge,
  EmptyState,
  ProgressBar,
  RecordItem,
  SegmentedToggle,
  DayGrid,
  MonthGrid,
} from '@/components';


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
      contentContainerStyle={{ padding: Layout.screenPadding, paddingTop: Layout.screenPaddingTop, paddingBottom: Layout.screenPaddingBottom }}
      ListHeaderComponent={
        <>
          {/* ── Hero Card ── */}
          <LinearGradient
            colors={Gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: Layout.heroRadius, padding: Layout.screenPadding, marginBottom: 24, alignItems: 'center' }}
          >
            <Text style={{ color: AppColors.white, fontSize: 20, fontFamily: FontFamily.bold, marginBottom: 4 }}>
              Aproveitamento
            </Text>
            <Text style={{ color: AppColors.white, fontSize: 14, opacity: 0.85, fontFamily: FontFamily.regular }}>
              {formatPeriodLabel(referencePeriod)}
            </Text>
          </LinearGradient>

          {/* ── Nome do evento ── */}
          <View className="mb-4">
            <Text className="text-brand-dark mb-2 font-semibold">Nome do evento</Text>
            <AnimatedTextInput
              value={evento}
              onChangeText={handleEventoChange}
              placeholder="Ex: Revisão - Álgebra"
              placeholderTextColor={AppColors.muted}
            />
            {errors.eventName ? (
              <Text className="text-priority-red text-sm mt-1">{errors.eventName}</Text>
            ) : null}
          </View>

          {/* ── Carga horária ── */}
          <View className="mb-4">
            <Text className="text-brand-dark mb-2 font-semibold">Carga horária (horas)</Text>
            <AnimatedTextInput
              value={cargaHoraria}
              onChangeText={handleCargaHorariaChange}
              placeholder="Ex: 40"
              keyboardType="numeric"
              placeholderTextColor={AppColors.muted}
            />
            {errors.totalHours ? (
              <Text className="text-priority-red text-sm mt-1">{errors.totalHours}</Text>
            ) : null}
          </View>

          {/* ── Período (mensal / anual) — segmented toggle ── */}
          <Text className="text-brand-dark mb-2 font-semibold">Período</Text>
          <SegmentedToggle tempo={tempo} onSelect={setTempo} />

          {/* ── Navegação de período ── */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() => navigatePeriod(-1)}
              accessibilityLabel="Período anterior"
              accessibilityRole="button"
              className="bg-white border border-brand-border rounded-xl p-2"
            >
              <MaterialIcons name="chevron-left" size={24} color={AppColors.primary} />
            </TouchableOpacity>

            <Text className="text-brand-primary font-bold text-lg">
              {formatPeriodLabel(referencePeriod)}
            </Text>

            <TouchableOpacity
              onPress={() => navigatePeriod(1)}
              accessibilityLabel="Próximo período"
              accessibilityRole="button"
              className="bg-white border border-brand-border rounded-xl p-2"
            >
              <MaterialIcons name="chevron-right" size={24} color={AppColors.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Progresso da carga ── */}
          <View className="mb-6">
            <Text className="text-brand-dark font-semibold mb-2">Progresso da carga</Text>
            <ProgressBar progress={cargaProgress} style={{ marginBottom: 4 }} />
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
            onPress={handleSave}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={editingId ? 'Atualizar aproveitamento' : 'Salvar aproveitamento'}
            style={{
              borderRadius: Layout.cardRadius,
              overflow: 'hidden',
              marginTop: 16,
              elevation: 6,
              shadowColor: AppColors.accent,
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <LinearGradient
              colors={Gradients.cta}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: Layout.buttonPaddingV, alignItems: 'center' }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.white} />
              ) : (
                <Text style={{ color: AppColors.white, fontSize: 18, fontFamily: FontFamily.semiBold }}>
                  {editingId ? 'Atualizar Aproveitamento' : 'Salvar Aproveitamento'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Título da lista ── */}
          {state.records.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 12 }}>
              <View style={{ ...Layout.sectionBar, backgroundColor: AppColors.accent, marginRight: 10 }} />
              <Text style={{ flex: 1, fontFamily: FontFamily.bold, fontSize: 16, color: AppColors.dark }}>
                Registros salvos
              </Text>
              <View accessibilityLiveRegion="polite">
                <Badge
                  label={String(state.records.length)}
                  backgroundColor={AppColors.lightPurple}
                  textColor={AppColors.accent}
                />
              </View>
            </View>
          )}

          {state.isLoading && (
            <ActivityIndicator size="large" color={AppColors.accent} className="mt-6" />
          )}
        </>
      }
      data={state.records}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <RecordItem
          record={item}
          index={index}
          onEdit={populateFormFromRecord}
          onDelete={removeRecord}
        />
      )}
      ListEmptyComponent={
        !state.isLoading ? (
          <EmptyState
            icon="bar-chart-outline"
            title="Sem registros salvos"
            subtitle="Salve seu primeiro aproveitamento acima"
          />
        ) : null
      }
    />
  );
}
