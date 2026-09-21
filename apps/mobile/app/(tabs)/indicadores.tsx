import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';

export default function IndicadoresScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { targets } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Painel de Indicadores
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Métricas comportamentais dos seus relacionamentos
          </Text>
        </View>

        {/* INDICADOR 1: TERMÔMETRO DE TENSÃO */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="thermometer-outline" size={16} color="#f43f5e" />
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Termômetro de Tensão Média
              </Text>
            </View>
            <Text style={{ color: '#f43f5e', fontWeight: '800', fontSize: 12 }}>
              68° / 100° (Ideal)
            </Text>
          </View>

          <View style={[styles.gaugeTrack, { backgroundColor: theme.card }]}>
            <View style={[styles.gaugeFill, { width: '68%' }]} />
          </View>

          <Text style={[styles.cardNote, { color: theme.muted }]}>
            Zona de conforto evitada. Suas mensagens mantêm o interesse vivo sem cair na
            friendzone.
          </Text>
        </View>

        {/* GRID DE 2 GAUGES: MISTÉRIO E ESCASSEZ */}
        <View style={styles.gridRow}>
          {/* Mistério */}
          <View
            style={[
              styles.gaugeCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.gaugeLabel, { color: theme.muted }]}>
              Índice de Mistério
            </Text>
            <View style={styles.circlePlaceholder}>
              <Text style={[styles.circleValue, { color: '#8b5cf6' }]}>78%</Text>
            </View>
            <Text style={styles.circleTagSuccess}>Alta atratividade</Text>
          </View>

          {/* Escassez */}
          <View
            style={[
              styles.gaugeCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.gaugeLabel, { color: theme.muted }]}>
              Índice de Escassez
            </Text>
            <View style={styles.circlePlaceholder}>
              <Text style={[styles.circleValue, { color: '#f43f5e' }]}>62%</Text>
            </View>
            <Text style={styles.circleTagWarning}>Disponibilidade ok</Text>
          </View>
        </View>

        {/* VELOCIDADE NO PIPELINE */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="speedometer" size={16} color="#8b5cf6" />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Velocidade no Pipeline
            </Text>
          </View>

          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.muted }]}>
                Tempo médio até o 1º date:
              </Text>
              <Text style={[styles.statValue, { color: '#10b981' }]}>8.5 dias</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.muted }]}>
                Alvos convertidos em 30 dias:
              </Text>
              <Text style={[styles.statValue, { color: '#8b5cf6' }]}>
                3 dates marcados
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.muted }]}>
                Taxa de resposta aos convites:
              </Text>
              <Text style={[styles.statValue, { color: '#6366f1' }]}>75%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  gaugeTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#8b5cf6',
  },
  cardNote: {
    fontSize: 10,
    lineHeight: 14,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gaugeCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  circlePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  circleValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  circleTagSuccess: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10b981',
  },
  circleTagWarning: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f59e0b',
  },
  statsList: {
    gap: 8,
    paddingTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
  },
});
