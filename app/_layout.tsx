import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { AproveitamentoProvider } from '@/context/AproveitamentoContext';
import { RemindersProvider } from '@/context/RemindersContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'Inter-Regular':   Inter_400Regular,
    'Inter-Medium':    Inter_500Medium,
    'Inter-SemiBold':  Inter_600SemiBold,
    'Inter-Bold':      Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <RemindersProvider>
          <AproveitamentoProvider>
            <Tabs
              tabBar={(props) => <FloatingTabBar {...props} />}
              screenOptions={{ headerShown: false }}
            >
              <Tabs.Screen name="index" options={{ title: 'Agenda' }} />
              <Tabs.Screen name="Aproveitamento" options={{ title: 'Aproveitamento' }} />
            </Tabs>
          </AproveitamentoProvider>
        </RemindersProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
