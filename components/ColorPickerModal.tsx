import { useEffect, useRef } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';

import { AppColors, FontFamily, Layout } from '@/constants/theme';

interface ColorPickerModalProps {
  visible: boolean;
  selectedColor: string | null;
  onSelect: (hex: string) => void;
  onClose: () => void;
}

export function ColorPickerModal({
  visible,
  selectedColor,
  onSelect,
  onClose,
}: ColorPickerModalProps) {
  const pickedColor = useRef(selectedColor ?? AppColors.accent);

  useEffect(() => {
    pickedColor.current = selectedColor ?? AppColors.accent;
  }, [selectedColor]);

  const backdropContent = (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
    >
      <View
        style={{ backgroundColor: AppColors.white, borderRadius: Layout.heroRadius, padding: Layout.screenPadding, width: '100%', elevation: 8 }}
      >
        <Text
          style={{ fontFamily: FontFamily.bold, color: AppColors.dark, fontSize: 18, textAlign: 'center', marginBottom: 20 }}
        >
          Escolha uma cor
        </Text>

        <ColorPicker
          value={selectedColor ?? AppColors.accent}
          onCompleteJS={({ hex }) => { pickedColor.current = hex; }}
        >
          <Panel1 style={{ borderRadius: 12, marginBottom: 16 }} />
          <HueSlider style={{ borderRadius: 8 }} />
        </ColorPicker>

        <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancelar seleção de cor"
            style={{
              flex: 1,
              paddingVertical: Layout.buttonPaddingV,
              borderRadius: Layout.cardRadius,
              borderWidth: 1,
              borderColor: AppColors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: FontFamily.semiBold, color: AppColors.muted }}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSelect(pickedColor.current)}
            accessibilityRole="button"
            accessibilityLabel="Confirmar cor selecionada"
            style={{
              flex: 1,
              paddingVertical: Layout.buttonPaddingV,
              borderRadius: Layout.cardRadius,
              backgroundColor: AppColors.accent,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: FontFamily.semiBold, color: AppColors.white }}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
            {backdropContent}
          </BlurView>
        ) : (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            {backdropContent}
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
