import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors, Brand } from '@/constants/theme';
import { usePushRegistration } from '@/hooks/usePushRegistration';

export default function TabLayout() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  usePushRegistration();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   C.tabIconSelected,
        tabBarInactiveTintColor: C.tabIconDefault,
        tabBarStyle: {
          backgroundColor: C.tabBar,
          borderTopColor:  C.tabBarBorder,
          paddingTop: -5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="localizacao"
        options={{
          title: 'Localização',
          tabBarIcon: ({ color }) => <Ionicons name="location-outline" color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <Ionicons name="trending-up" color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} size={23} />,
        }}
      />
    </Tabs>
  );
}