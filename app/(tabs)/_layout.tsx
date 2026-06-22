import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        // Cor quando selecionado (seu roxo)
        tabBarActiveTintColor: '#6A5AE0', 
        
        // Cor quando não selecionado (seu cinza)
        tabBarInactiveTintColor: '#8e8e93', 
        
        // Estilização extra para alinhar com o design minimalista
        tabBarStyle: {
          paddingTop: 2,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          // Ícone preenchido para o estado ativo costuma ser o padrão, 
          // mas o "home" é ideal para o Início
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          // O "notifications-outline" é o traço fino da imagem
          tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="localizacao"
        options={{
          title: 'Localização',
          // O "location-outline" é o traço fino ideal
          tabBarIcon: ({ color }) => <Ionicons name="location-outline" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          // O "trending-up" é o ícone de seta subindo da sua imagem
          tabBarIcon: ({ color }) => <Ionicons name="trending-up" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          // O "person-outline" é o traço fino do perfil
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}