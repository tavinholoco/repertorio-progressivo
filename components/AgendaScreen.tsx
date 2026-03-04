import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';

import { AppColors, calendarTheme, FontFamily, Gradients, Layout } from '@/constants';
import { useAgendaForm } from '@/hooks';
import { AnimatedTextInput } from './AnimatedTextInput';
import { ColorPickerModal } from './ColorPickerModal';
import { EmptyState } from './EmptyState';
import { ReminderItem } from './ReminderItem';
import { PriorityPicker } from './PriorityPicker';

export default function AgendaScreen() {
  const {
    state,
    removeReminder,
    name,
    handleNameChange,
    selectedColor,
    date,
    setDate,
    time,
    setTime,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    editingReminder,
    isSubmitting,
    errors,
    markedDates,
    handleSelectColor,
    populateForm,
    resetForm,
    handleSave,
    customColor,
    setCustomColor,
    showColorModal,
    setShowColorModal,
  } = useAgendaForm();

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
            style={{ borderRadius: Layout.heroRadius, padding: Layout.screenPadding, marginBottom: 24 }}
          >
            <Text style={{ color: AppColors.white, fontSize: 20, fontFamily: FontFamily.bold, textAlign: 'center' }}>
              Agenda
            </Text>
            <Text style={{ color: AppColors.white, fontSize: 14, textAlign: 'center', marginTop: 4, opacity: 0.85, fontFamily: FontFamily.regular }}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </LinearGradient>

          {/* ── Nome ── */}
          <View className="mb-5">
            <Text className="text-brand-dark text-base mb-2 font-semibold">Nome do lembrete</Text>
            <AnimatedTextInput
              value={name}
              onChangeText={handleNameChange}
              placeholder="Ex: Reunião de projeto"
              placeholderTextColor={AppColors.muted}
            />
            {errors.name ? (
              <Text className="text-priority-red text-sm mt-1">{errors.name}</Text>
            ) : null}
          </View>

          {/* ── Data ── */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: FontFamily.semiBold, fontSize: 14, color: AppColors.dark, marginBottom: 8 }}>
              Data do lembrete
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel="Selecionar data"
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: AppColors.white,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: AppColors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: AppColors.lightPurple,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
              </View>
              <Text style={{ flex: 1, fontFamily: FontFamily.medium, fontSize: 14, color: AppColors.dark }}>
                {date.toLocaleDateString('pt-BR')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={AppColors.muted} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selected) setDate(selected);
                }}
              />
            )}
          </View>

          {/* ── Horário ── */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: FontFamily.semiBold, fontSize: 14, color: AppColors.dark, marginBottom: 8 }}>
              Horário
            </Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              accessibilityLabel="Selecionar horário"
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: AppColors.white,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: AppColors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: AppColors.lightPurple,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="time-outline" size={18} color={AppColors.accent} />
              </View>
              <Text style={{ flex: 1, fontFamily: FontFamily.medium, fontSize: 14, color: AppColors.dark }}>
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={AppColors.muted} />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (selected) setTime(selected);
                }}
              />
            )}
          </View>

          {/* ── Prioridade ── */}
          <PriorityPicker
            selectedColor={selectedColor}
            onSelect={handleSelectColor}
            error={errors.priority}
            customColor={customColor}
            onOpenColorPicker={() => setShowColorModal(true)}
          />

          {/* ── Seletor de cor personalizada ── */}
          <ColorPickerModal
            visible={showColorModal}
            selectedColor={customColor}
            onSelect={(hex) => {
              setCustomColor(hex);
              handleSelectColor('custom');
              setShowColorModal(false);
            }}
            onClose={() => setShowColorModal(false)}
          />

          {/* ── Botão salvar ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={editingReminder ? 'Atualizar lembrete' : 'Confirmar lembrete'}
            style={{
              borderRadius: Layout.cardRadius,
              overflow: 'hidden',
              marginBottom: 8,
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
                  {editingReminder ? 'Atualizar Lembrete' : 'Confirmar Lembrete'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {editingReminder && (
            <TouchableOpacity
              onPress={resetForm}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edição"
              className="py-3 rounded-2xl mb-6 border border-brand-border active:opacity-90"
            >
              <Text className="text-brand-muted text-center font-medium">Cancelar edição</Text>
            </TouchableOpacity>
          )}

          {/* ── Calendário ── */}
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            markedDates={markedDates}
            theme={calendarTheme}
          />

          {/* ── Título da lista ── */}
          {state.reminders.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
              <View style={{ width: 4, height: 20, backgroundColor: AppColors.accent, borderRadius: 2, marginRight: 10 }} />
              <Text style={{ flex: 1, fontFamily: FontFamily.bold, fontSize: 16, color: AppColors.dark }}>
                Lembretes salvos
              </Text>
              <View style={{ backgroundColor: AppColors.lightPurple, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 12, fontFamily: FontFamily.semiBold, color: AppColors.accent }}>
                  {state.reminders.length}
                </Text>
              </View>
            </View>
          )}

          {state.isLoading && (
            <ActivityIndicator size="large" color={AppColors.accent} className="mt-6" />
          )}
        </>
      }
      data={state.reminders}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <ReminderItem
          reminder={item}
          index={index}
          onEdit={populateForm}
          onDelete={removeReminder}
        />
      )}
      ListEmptyComponent={
        !state.isLoading ? (
          <EmptyState
            icon="calendar-outline"
            title="Nenhum lembrete ainda"
            subtitle="Crie seu primeiro lembrete acima"
          />
        ) : null
      }
    />
  );
}
