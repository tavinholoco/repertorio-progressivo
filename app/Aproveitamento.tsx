import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppColors, FontFamily, Gradients, Layout } from '@/constants';
import { useAproveitamentoForm } from '@/hooks';
import { formatPeriodLabel } from '@/utils';
import {
  AnimatedTextInput,
  EmptyState,
  RecordItem,
  ProgressDonut,
  DayGrid,
  MonthGrid,
} from '@/components';
import type { PeriodType } from '@/types';

/* ── Animated Progress Bar ── */
function AnimatedProgressBar({ progress }: { progress: number }) {
  const pw = useSharedValue(0);

  useEffect(() => {
    pw.value = withTiming(progress, { duration: Layout.animation.progress });
  }, [progress, pw]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${pw.value * 100}%`,
    height: '100%',
    backgroundColor: AppColors.accent,
    borderRadius: 9999,
  }));

  return (
    <View className="w-full h-3 bg-brand-yellow rounded-full overflow-hidden mb-1">
      <Animated.View style={fillStyle} />
    </View>
  );
}

/* ── Segmented Toggle (mensal / anual) ── */
function SegmentedToggle({
  tempo,
  onSelect,
}: {
  tempo: PeriodType;
  onSelect: (t: PeriodType) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const halfWidth = containerWidth / 2;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (halfWidth === 0) return;
    indicatorX.value = withSpring(tempo === 'mensal' ? 0 : halfWidth, { damping: 20 });
  }, [tempo, halfWidth, indicatorX]);

  const pillStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: indicatorX.value,
    width: halfWidth,
    height: '100%',
    backgroundColor: AppColors.accent,
    borderRadius: 16,
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      style={{
        flexDirection: 'row',
        backgroundColor: AppColors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: AppColors.border,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Animated.View style={pillStyle} />
      {(['mensal', 'anual'] as PeriodType[]).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onSelect(t)}
          style={{ flex: 1, paddingVertical: 14, zIndex: 1 }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontFamily: FontFamily.semiBold,
              fontSize: 14,
              color: tempo === t ? '#fff' : AppColors.dark,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

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
      contentContainerStyle={{ padding: Layout.screenPadding, paddingTop: Layout.screenPaddingTop, paddingBottom: Layout.screenPaddingBottom }}
      ListHeaderComponent={
        <>
          {/* ── Hero Card ── */}
          <LinearGradient
            colors={Gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 20, marginBottom: 24, alignItems: 'center' }}
          >
            <Text style={{ color: AppColors.white, fontSize: 20, fontFamily: FontFamily.bold, marginBottom: 4 }}>
              Aproveitamento
            </Text>
            <Text style={{ color: AppColors.white, fontSize: 14, marginBottom: 16, opacity: 0.85, fontFamily: FontFamily.regular }}>
              {formatPeriodLabel(referencePeriod)}
            </Text>
            <ProgressDonut
              percentage={tempo === 'mensal' ? percentualDias : Math.round(cargaProgress * 100)}
            />
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
              <Text className="text-priority-red text-sm -mt-2 mb-2">{errors.totalHours}</Text>
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
            <AnimatedProgressBar progress={cargaProgress} />
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
            style={{
              borderRadius: 16,
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
              style={{ paddingVertical: 16, alignItems: 'center' }}
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
              <View style={{ width: 4, height: 20, backgroundColor: AppColors.accent, borderRadius: 2, marginRight: 10 }} />
              <Text style={{ flex: 1, fontFamily: FontFamily.bold, fontSize: 16, color: AppColors.dark }}>
                Registros salvos
              </Text>
              <View style={{ backgroundColor: AppColors.lightPurple, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 12, fontFamily: FontFamily.semiBold, color: AppColors.accent }}>
                  {state.records.length}
                </Text>
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
