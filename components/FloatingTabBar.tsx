import { View, Pressable, useWindowDimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from './TabBarIcon';
import { AppColors, Gradients, Layout } from '@/constants';

type IconName = 'calendar' | 'calendar-outline' | 'bar-chart' | 'bar-chart-outline';

const ROUTE_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index:          { active: 'calendar',  inactive: 'calendar-outline' },
  Aproveitamento: { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <View style={[styles.container, {
      left: Math.round((screenWidth - Layout.tabBar.width) / 2),
    }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const icons = ROUTE_ICONS[route.name];
        const iconName = isFocused ? icons.active : icons.inactive;
        const color = isFocused ? AppColors.white : AppColors.muted;
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const icon = <TabBarIcon name={iconName} color={color} size={30} />;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title}
          >
            {isFocused ? (
              <LinearGradient
                colors={Gradients.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activePill}
              >
                {icon}
              </LinearGradient>
            ) : (
              <View style={styles.inactiveWrap}>
                {icon}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Layout.tabBar.offset,
    width: Layout.tabBar.width,
    height: Layout.tabBar.height,
    backgroundColor: AppColors.white,
    borderRadius: Layout.tabBar.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    elevation: 12,
    shadowColor: AppColors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  activePill: {
    paddingHorizontal: Layout.tabBar.focusPaddingH,
    paddingVertical: Layout.tabBar.focusPaddingV,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
