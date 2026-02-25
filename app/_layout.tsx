import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AproveitamentoProvider } from '@/context/AproveitamentoContext';
import { RemindersProvider } from '@/context/RemindersContext';
import { AppColors } from '@/constants/theme';

export default function Layout() {
  return (
    <RemindersProvider>
      <AproveitamentoProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,

            tabBarStyle: {
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              height: 70,
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
              tabBarIcon: ({ color }) => (
                <Ionicons name="calendar-outline" color={color} size={28} />
              ),
            }}
          />

          <Tabs.Screen
            name="Aproveitamento"
            options={{
              title: 'Aproveitamento',
              tabBarIcon: ({ color }) => (
                <Ionicons name="bar-chart-outline" color={color} size={28} />
              ),
            }}
          />
        </Tabs>
      </AproveitamentoProvider>
    </RemindersProvider>
  );
}
