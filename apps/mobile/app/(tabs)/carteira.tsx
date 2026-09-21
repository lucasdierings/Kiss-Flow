import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';
import { restorePurchases } from '@/services/purchases';

export default function CarteiraScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const {
    creditsBalance,
    monthlyQuotaUsed,
    monthlyQuotaTotal,
    addCredits,
  } = useApp();

  const handleBuy = (amount: number, priceStr: string) => {
    addCredits(amount);
    Alert.alert(
      'Compra Realizada com Sucesso',
      `Foram adicionados +${amount} créditos à sua carteira via In-App Purchase (${priceStr}).`
    );
  };

  const handleRestore = async () => {
    const res = await restorePurchases();
    Alert.alert('Restauração de Compras', res.message);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Assinatura & Créditos
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Gerencie seu plano Pro e saldo de inteligência
          </Text>
        </View>

        {/* CARD DO PLANO PRO ATIVO */}
        <View style={styles.proCard}>
          <View style={styles.proCardTop}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>PLANO PRO ATIVO</Text>
            </View>
            <Text style={styles.renewText}>Renova em 14 dias</Text>
          </View>

          <Text style={styles.planName}>Seduction Master</Text>
          <Text style={styles.planDesc}>
            Acesso irrestrito ao CRM, pipeline de alvos e mentor estratégico pessoal.
          </Text>

          {/* BARRA DE CONSUMO DA FRANQUIA MENSAL */}
          <View style={styles.quotaSection}>
            <View style={styles.quotaRow}>
              <Text style={styles.quotaLabel}>Franquia Mensal de Consultas</Text>
              <Text style={styles.quotaValue}>
                {monthlyQuotaUsed} / {monthlyQuotaTotal} usadas
              </Text>
            </View>

            <View style={styles.quotaTrack}>
              <View
                style={[
                  styles.quotaFill,
                  { width: `${(monthlyQuotaUsed / monthlyQuotaTotal) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* CARTEIRA DE CRÉDITOS DE IA ADICIONAIS */}
        <View
          style={[
            styles.walletCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.walletTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.coinIconWrap}>
                <FontAwesome5 name="coins" size={16} color="#8b5cf6" />
              </View>
              <View>
                <Text style={[styles.walletTitle, { color: theme.text }]}>
                  Créditos Adicionais
                </Text>
                <Text style={[styles.walletSubtitle, { color: theme.muted }]}>
                  Usados quando a franquia esgotar
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.creditBalanceValue}>{creditsBalance}</Text>
              <Text style={[styles.creditBalanceLabel, { color: theme.muted }]}>
                créditos
              </Text>
            </View>
          </View>

          {/* PACOTES DE CRÉDITOS PARA RECARGA */}
          <View style={[styles.storeSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.storeTitle, { color: theme.muted }]}>
              RECARREGAR CRÉDITOS RÁPIDOS:
            </Text>

            <View style={styles.packagesRow}>
              {/* Pacote 1 */}
              <TouchableOpacity
                style={[
                  styles.packageCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => handleBuy(25, 'R$ 19,90')}
              >
                <Text style={styles.packageCredits}>+25</Text>
                <Text style={[styles.packagePrice, { color: theme.text }]}>
                  R$ 19,90
                </Text>
                <Text style={[styles.packageBadge, { color: theme.muted }]}>SOS</Text>
              </TouchableOpacity>

              {/* Pacote 2 (Destaque) */}
              <TouchableOpacity
                style={[styles.packageCard, styles.packageCardPopular]}
                onPress={() => handleBuy(80, 'R$ 49,90')}
              >
                <View style={styles.popularTag}>
                  <Text style={styles.popularTagText}>POPULAR</Text>
                </View>
                <Text style={styles.packageCredits}>+80</Text>
                <Text style={[styles.packagePrice, { color: theme.text }]}>
                  R$ 49,90
                </Text>
                <Text style={[styles.packageBadge, { color: '#8b5cf6' }]}>
                  Mais Vendido
                </Text>
              </TouchableOpacity>

              {/* Pacote 3 */}
              <TouchableOpacity
                style={[
                  styles.packageCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => handleBuy(200, 'R$ 99,90')}
              >
                <Text style={styles.packageCredits}>+200</Text>
                <Text style={[styles.packagePrice, { color: theme.text }]}>
                  R$ 99,90
                </Text>
                <Text style={[styles.packageBadge, { color: theme.muted }]}>
                  Pro Master
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.storeFooter}>
              <Ionicons name="logo-apple" size={14} color={theme.muted} />
              <Text style={[styles.storeFooterText, { color: theme.muted }]}>
                Apple In-App Purchase e Google Play Billing integrados
              </Text>
            </View>

            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={handleRestore}
            >
              <Text style={[styles.restoreBtnText, { color: theme.muted }]}>
                Restaurar Compras Anteriores
              </Text>
            </TouchableOpacity>
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
  proCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: 22,
    padding: 18,
    gap: 10,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  proCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  renewText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  planName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  planDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 16,
  },
  quotaSection: {
    paddingTop: 6,
    gap: 6,
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quotaLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  quotaValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  quotaTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  walletCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  walletSubtitle: {
    fontSize: 10,
  },
  creditBalanceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#8b5cf6',
  },
  creditBalanceLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  storeSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  storeTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  packagesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  packageCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  packageCardPopular: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
    position: 'relative',
  },
  popularTag: {
    position: 'absolute',
    top: -9,
    backgroundColor: '#f43f5e',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  popularTagText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '900',
  },
  packageCredits: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '900',
  },
  packagePrice: {
    fontSize: 11,
    fontWeight: '800',
  },
  packageBadge: {
    fontSize: 9,
    fontWeight: '700',
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  storeFooterText: {
    fontSize: 10,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreBtnText: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
