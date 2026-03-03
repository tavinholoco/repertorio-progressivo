import { Dimensions, View } from 'react-native';
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

import { LinearGradient } from 'expo-linear-gradient';

import { AproveitamentoProvider } from '@/context/AproveitamentoContext';
import { RemindersProvider } from '@/context/RemindersContext';
import { AppColors, Gradients, Layout as AppLayout } from '@/constants';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TabBarIcon } from '@/components/TabBarIcon';

const { width: screenWidth } = Dimensions.get('window');

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
              screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: AppColors.white,
                tabBarInactiveTintColor: AppColors.muted,

                tabBarStyle: {
                  position: 'absolute',
                  bottom: AppLayout.tabBar.offset,
                  left: Math.round((screenWidth - AppLayout.tabBar.width) / 2),
                  width: AppLayout.tabBar.width,
                  height: AppLayout.tabBar.height,
                  backgroundColor: AppColors.white,
                  borderRadius: AppLayout.tabBar.borderRadius,
                  elevation: 12,
                  shadowColor: AppColors.accent,
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  borderTopWidth: 0,
                },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Agenda',
                  tabBarIcon: ({ color, focused }) =>
                    focused ? (
                      <LinearGradient
                        colors={Gradients.hero}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          paddingHorizontal: AppLayout.tabBar.focusPaddingH,
                          paddingVertical: AppLayout.tabBar.focusPaddingV,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TabBarIcon name="calendar" color={color} size={24} />
                      </LinearGradient>
                    ) : (
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <TabBarIcon name="calendar-outline" color={color} size={24} />
                      </View>
                    ),
                }}
              />

              <Tabs.Screen
                name="Aproveitamento"
                options={{
                  title: 'Aproveitamento',
                  tabBarIcon: ({ color, focused }) =>
                    focused ? (
                      <LinearGradient
                        colors={Gradients.hero}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          paddingHorizontal: AppLayout.tabBar.focusPaddingH,
                          paddingVertical: AppLayout.tabBar.focusPaddingV,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TabBarIcon name="bar-chart" color={color} size={24} />
                      </LinearGradient>
                    ) : (
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <TabBarIcon name="bar-chart-outline" color={color} size={24} />
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
