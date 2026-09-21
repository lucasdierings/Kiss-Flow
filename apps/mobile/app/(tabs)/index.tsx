import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp, Target, TargetTemp } from '@/context/AppContext';

export default function OpportunitiesScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const { targets, mentorName, setSelectedTargetId } = useApp();
  const [selectedTemp, setSelectedTemp] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTargets = targets.filter((target) => {
    const matchesTemp = selectedTemp === 'all' || target.temp === selectedTemp;
    const matchesSearch =
      target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.archetype.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.stageLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTemp && matchesSearch;
  });

  const handleConsultMentor = (targetId: string) => {
    setSelectedTargetId(targetId);
    router.push('/(tabs)/mentor');
  };

  const getTempBadge = (temp: TargetTemp) => {
    switch (temp) {
      case 'hot':
        return { label: '🔥 Quente', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
      case 'warm':
        return { label: '⚡ Morno', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'cold':
        return { label: '❄️ Esfriando', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO & BUSCA */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Oportunidades</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {targets.length} alvos ativos no funil
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/cadastros')}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Novo Alvo</Text>
          </TouchableOpacity>
        </View>

        {/* INPUT DE BUSCA */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={16} color={theme.muted} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por nome, arquétipo ou fase..."
            placeholderTextColor={theme.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        {/* FILTROS DE TEMPERATURA */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedTemp('all')}
            style={[
              styles.filterChip,
              { borderColor: theme.border, backgroundColor: theme.surface },
              selectedTemp === 'all' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: theme.muted },
                selectedTemp === 'all' && styles.filterChipTextActive,
              ]}
            >
              Todos ({targets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTemp('hot')}
            style={[
              styles.filterChip,
              { borderColor: theme.border, backgroundColor: theme.surface },
              selectedTemp === 'hot' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: theme.muted },
                selectedTemp === 'hot' && styles.filterChipTextActive,
              ]}
            >
              🔥 Quente (1)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTemp('warm')}
            style={[
              styles.filterChip,
              { borderColor: theme.border, backgroundColor: theme.surface },
              selectedTemp === 'warm' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: theme.muted },
                selectedTemp === 'warm' && styles.filterChipTextActive,
              ]}
            >
              ⚡ Morno (1)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTemp('cold')}
            style={[
              styles.filterChip,
              { borderColor: theme.border, backgroundColor: theme.surface },
              selectedTemp === 'cold' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: theme.muted },
                selectedTemp === 'cold' && styles.filterChipTextActive,
              ]}
            >
              ❄️ Esfriando (1)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* FUNIL RESUMO DAS 5 ETAPAS */}
        <View
          style={[
            styles.funnelCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.funnelHeader}>
            <View style={styles.funnelTitleRow}>
              <FontAwesome5 name="chart-bar" size={13} color="#8b5cf6" />
              <Text style={[styles.funnelTitle, { color: theme.text }]}>
                Pipeline de Conquista
              </Text>
            </View>
            <Text style={styles.funnelStat}>
              Taxa de Rolê: <Text style={{ color: '#10b981', fontWeight: '800' }}>50%</Text>
            </Text>
          </View>

          <View style={styles.funnelStepsGrid}>
            <View style={[styles.funnelStep, { backgroundColor: theme.card }]}>
              <Text style={[styles.funnelStepLabel, { color: theme.muted }]}>De Olho</Text>
              <Text style={[styles.funnelStepValue, { color: theme.text }]}>1</Text>
            </View>
            <View style={[styles.funnelStep, styles.funnelStepHighlight]}>
              <Text style={styles.funnelStepLabelHighlight}>Papo</Text>
              <Text style={styles.funnelStepValueHighlight}>1</Text>
            </View>
            <View style={[styles.funnelStep, styles.funnelStepPurple]}>
              <Text style={styles.funnelStepLabelPurple}>Flerte</Text>
              <Text style={styles.funnelStepValuePurple}>1</Text>
            </View>
            <View style={[styles.funnelStep, styles.funnelStepAmber]}>
              <Text style={styles.funnelStepLabelAmber}>Marcar</Text>
              <Text style={styles.funnelStepValueAmber}>1</Text>
            </View>
            <View style={[styles.funnelStep, styles.funnelStepGreen]}>
              <Text style={styles.funnelStepLabelGreen}>Rolê 🎉</Text>
              <Text style={styles.funnelStepValueGreen}>0</Text>
            </View>
          </View>
        </View>

        {/* LISTA DE CARDS DE OPORTUNIDADE */}
        <View style={styles.targetsList}>
          {filteredTargets.map((target) => {
            const badge = getTempBadge(target.temp);

            return (
              <View
                key={target.id}
                style={[
                  styles.targetCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                {/* TOPO DO CARD */}
                <View style={styles.targetCardTop}>
                  <View style={styles.targetInfoRow}>
                    <View style={styles.avatarWrap}>
                      <Image source={{ uri: target.avatarUrl }} style={styles.avatarImg} />
                      <View style={[styles.tempDot, { backgroundColor: badge.color }]}>
                        <Text style={styles.tempDotIcon}>
                          {target.temp === 'hot' ? '🔥' : target.temp === 'warm' ? '⚡' : '❄️'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.targetDetails}>
                      <View style={styles.nameBadgeRow}>
                        <Text style={[styles.targetName, { color: theme.text }]}>
                          {target.name}
                        </Text>
                        <View style={styles.archetypeBadge}>
                          <Text style={styles.archetypeText}>{target.archetype}</Text>
                        </View>
                      </View>

                      <Text
                        style={[styles.lastMsgText, { color: theme.muted }]}
                        numberOfLines={1}
                      >
                        {target.lastMessage}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.hoursAgoText}>
                    {target.lastInteractionHoursAgo < 24
                      ? `Há ${target.lastInteractionHoursAgo}h`
                      : `${Math.round(target.lastInteractionHoursAgo / 24)}d atrás`}
                  </Text>
                </View>

                {/* ALERTA PROATIVO SE HOUVER */}
                {target.alert && (
                  <View style={styles.alertBox}>
                    <Ionicons name="shield-checkmark" size={14} color="#f43f5e" />
                    <Text style={styles.alertBoxText}>{target.alert}</Text>
                  </View>
                )}

                {/* MÉTRICAS PSICOLÓGICAS (MINI GAUGES) */}
                <View
                  style={[
                    styles.metricsRow,
                    { borderColor: theme.border, backgroundColor: theme.card },
                  ]}
                >
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.muted }]}>Mistério</Text>
                    <Text style={[styles.metricValue, { color: '#8b5cf6' }]}>
                      {target.mysteryScore}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.muted }]}>Tensão</Text>
                    <Text style={[styles.metricValue, { color: '#f43f5e' }]}>
                      {target.tensionScore}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.muted }]}>Interesse</Text>
                    <Text style={[styles.metricValue, { color: '#10b981' }]}>
                      {target.interestScore}%
                    </Text>
                  </View>
                </View>

                {/* BOTÃO DE AÇÃO: CONSELHO DO DON JUAN / CLEÓPATRA */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleConsultMentor(target.id)}
                >
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    Conselho do {mentorName}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  filtersScroll: {
    marginBottom: 14,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#8b5cf6',
    fontWeight: '700',
  },
  funnelCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  funnelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  funnelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  funnelTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  funnelStat: {
    fontSize: 10,
    color: '#94a3b8',
  },
  funnelStepsGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  funnelStep: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  funnelStepHighlight: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  funnelStepPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  funnelStepAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  funnelStepGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  funnelStepLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  funnelStepLabelHighlight: {
    fontSize: 9,
    fontWeight: '700',
    color: '#818cf8',
  },
  funnelStepLabelPurple: {
    fontSize: 9,
    fontWeight: '700',
    color: '#c084fc',
  },
  funnelStepLabelAmber: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fbbf24',
  },
  funnelStepLabelGreen: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
  },
  funnelStepValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  funnelStepValueHighlight: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    color: '#818cf8',
  },
  funnelStepValuePurple: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    color: '#c084fc',
  },
  funnelStepValueAmber: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    color: '#fbbf24',
  },
  funnelStepValueGreen: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    color: '#34d399',
  },
  targetsList: {
    gap: 12,
  },
  targetCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  targetCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  targetInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tempDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempDotIcon: {
    fontSize: 8,
  },
  targetDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetName: {
    fontSize: 14,
    fontWeight: '800',
  },
  archetypeBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  archetypeText: {
    color: '#8b5cf6',
    fontSize: 9,
    fontWeight: '700',
  },
  lastMsgText: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  hoursAgoText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '700',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  alertBoxText: {
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
