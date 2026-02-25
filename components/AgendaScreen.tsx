import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';

import { AppColors, calendarTheme } from '@/constants/theme';
import { useAgendaForm } from '@/hooks/useAgendaForm';
import { ReminderItem } from '@/components/ReminderItem';
import { PriorityPicker } from '@/components/PriorityPicker';

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
  } = useAgendaForm();

  return (
    <FlatList
      className="flex-1 bg-brand-light"
      contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 160 }}
      ListHeaderComponent={
        <>
          <Text className="text-3xl font-extrabold text-brand-primary mb-6 text-center">
            Agenda de Lembretes
          </Text>

          {/* ── Nome ── */}
          <View className="mb-5">
            <Text className="text-brand-dark text-base mb-2 font-medium">Nome do lembrete</Text>
            <TextInput
              value={name}
              onChangeText={handleNameChange}
              placeholder="Ex: Reunião de projeto"
              placeholderTextColor={AppColors.muted}
              className="bg-white p-4 rounded-2xl border border-brand-border text-brand-dark"
            />
            {errors.name ? (
              <Text className="text-priority-red text-sm mt-1">{errors.name}</Text>
            ) : null}
          </View>

          {/* ── Data ── */}
          <View className="mb-5">
            <Text className="text-brand-dark text-base mb-2 font-medium">Data do lembrete</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white p-4 rounded-2xl border border-brand-border active:opacity-90"
            >
              <Text className="text-brand-dark">{date.toLocaleDateString('pt-BR')}</Text>
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
          <View className="mb-5">
            <Text className="text-brand-dark text-base mb-2 font-medium">Horário</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="bg-white p-4 rounded-2xl border border-brand-border active:opacity-90"
            >
              <Text className="text-brand-dark">
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
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
          />

          {/* ── Botão salvar ── */}
          <TouchableOpacity
            className="bg-brand-accent py-4 rounded-2xl shadow-md mb-2 active:opacity-90"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                {editingReminder ? 'Atualizar Lembrete' : 'Confirmar Lembrete'}
              </Text>
            )}
          </TouchableOpacity>

          {editingReminder && (
            <TouchableOpacity
              onPress={resetForm}
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
            <Text className="text-brand-dark text-lg font-bold mt-6 mb-3">
              Lembretes salvos
            </Text>
          )}

          {state.isLoading && (
            <ActivityIndicator size="large" color={AppColors.accent} className="mt-6" />
          )}
        </>
      }
      data={state.reminders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReminderItem
          reminder={item}
          onEdit={populateForm}
          onDelete={removeReminder}
        />
      )}
      ListEmptyComponent={
        !state.isLoading ? (
          <Text className="text-brand-muted text-center mt-4">
            Nenhum lembrete criado ainda.
          </Text>
        ) : null
      }
    />
  );
}
