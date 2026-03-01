import { View } from 'react-native';
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
import { AppColors, FontFamily } from '@/constants/theme';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Layout() {
  const [fontsLoaded] = useFonts({
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
              screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarLabelStyle: { fontSize: 11, fontFamily: FontFamily.semiBold },
                tabBarActiveTintColor: AppColors.accent,
                tabBarInactiveTintColor: AppColors.muted,

                tabBarStyle: {
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  right: 20,
                  height: 80,
                  backgroundColor: AppColors.white,
                  borderRadius: 30,
                  elevation: 8,
                  shadowColor: '#000',
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  borderTopWidth: 0,
                },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Agenda',
                  tabBarIcon: ({ color, focused }) => (
                    <View
                      style={{
                        paddingHorizontal: focused ? 14 : 0,
                        paddingVertical: focused ? 5 : 0,
                        backgroundColor: focused ? '#EDE9FE' : 'transparent',
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons
                        name={focused ? 'calendar' : 'calendar-outline'}
                        color={color}
                        size={24}
                      />
                    </View>
                  ),
                }}
              />

              <Tabs.Screen
                name="Aproveitamento"
                options={{
                  title: 'Aproveitamento',
                  tabBarIcon: ({ color, focused }) => (
                    <View
                      style={{
                        paddingHorizontal: focused ? 14 : 0,
                        paddingVertical: focused ? 5 : 0,
                        backgroundColor: focused ? '#EDE9FE' : 'transparent',
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons
                        name={focused ? 'bar-chart' : 'bar-chart-outline'}
                        color={color}
                        size={24}
                      />
                    </View>
                  ),
                }}
              />
            </Tabs>
          </AproveitamentoProvider>
      </RemindersProvider>
    </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
