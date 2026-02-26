import { useEffect, useRef } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';

import { AppColors } from '@/constants/theme';

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
  const pickedColor = useRef(selectedColor ?? '#6C2DC7');

  useEffect(() => {
    pickedColor.current = selectedColor ?? '#6C2DC7';
  }, [selectedColor]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <View
          style={{ backgroundColor: AppColors.white, borderRadius: 24, padding: 24, width: '100%', elevation: 8 }}
        >
          <Text
            style={{ color: AppColors.dark, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}
          >
            Escolha uma cor
          </Text>

          <ColorPicker
            value={selectedColor ?? '#6C2DC7'}
            onCompleteJS={({ hex }) => { pickedColor.current = hex; }}
          >
            <Panel1 style={{ borderRadius: 12, marginBottom: 16 }} />
            <HueSlider style={{ borderRadius: 8 }} />
          </ColorPicker>

          <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: AppColors.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: AppColors.muted, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelect(pickedColor.current)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: AppColors.accent,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: AppColors.white, fontWeight: '600' }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
