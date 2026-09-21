import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { mentorName, activeMentor } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 17,
        },
      }}
    >
      {/* Tab 1: CRM / Oportunidades */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alvos',
          headerTitle: 'Kiss Flow • Oportunidades',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users" size={18} color={color} />
          ),
        }}
      />

      {/* Tab 2: Mentor Estratégico (Don Juan ou Cleópatra) */}
      <Tabs.Screen
        name="mentor"
        options={{
          title: mentorName, // 'Don Juan' ou 'Cleópatra'
          headerTitle: `${mentorName} • Estrategista`,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={styles.mentorIcon}>
                {activeMentor === 'donjuan' ? '👑' : '✨'}
              </Text>
              <View style={styles.activeDot} />
            </View>
          ),
        }}
      />

      {/* Tab 3: Cadastros (Meu Perfil & Novo Alvo) */}
      <Tabs.Screen
        name="cadastros"
        options={{
          title: 'Cadastros',
          headerTitle: 'Cadastros & Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="id-card-outline" size={20} color={color} />
          ),
        }}
      />

      {/* Tab 4: Indicadores & Métricas */}
      <Tabs.Screen
        name="indicadores"
        options={{
          title: 'Métricas',
          headerTitle: 'Painel de Indicadores',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-pie" size={22} color={color} />
          ),
        }}
      />

      {/* Tab 5: Assinatura & Créditos */}
      <Tabs.Screen
        name="carteira"
        options={{
          title: 'Créditos',
          headerTitle: 'Assinatura & Créditos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="diamond-outline" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorIcon: {
    fontSize: 18,
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f43f5e',
  },
});
