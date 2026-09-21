import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
// import Purchases from 'react-native-purchases';

export default function PaywallScreen() {
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // TODO: Connect to RevenueCat when native builds are ready
    // try {
    //   const { customerInfo } = await Purchases.purchasePackage(packages[0]);
    //   if (typeof customerInfo.entitlements.active['Premium'] !== "undefined") {
    //     router.back();
    //   }
    // } catch (e) { ... }
    
    setTimeout(() => {
      setLoading(false);
      alert('Assinatura processada com sucesso!');
      router.back();
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Kiss Flow Premium', presentation: 'modal' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Kiss Flow Premium</Text>
        <Text style={styles.subtitle}>Desbloqueie todo o poder da inteligência comportamental.</Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>♾️</Text>
          <Text style={styles.featureText}>Alvos ilimitados no seu Kanban</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🤖</Text>
          <Text style={styles.featureText}>100 Análises de IA por mês</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📸</Text>
          <Text style={styles.featureText}>Upload ilimitado de prints</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🚨</Text>
          <Text style={styles.featureText}>Alertas proativos (Friendzone, Stagnation)</Text>
        </View>
      </View>

      <View style={styles.pricingCard}>
        <Text style={styles.pricingTitle}>Plano Anual</Text>
        <Text style={styles.pricingPrice}>R$ 29,90<Text style={styles.pricingPeriod}>/mês</Text></Text>
        <Text style={styles.pricingBilled}>Cobrado anualmente R$ 358,80</Text>
      </View>

      <Pressable 
        style={styles.subscribeButton} 
        onPress={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.subscribeButtonText}>Assinar Agora</Text>
        )}
      </Pressable>

      <View style={styles.footerLinks}>
        <Pressable onPress={() => router.push('/terms')}>
          <Text style={styles.footerLink}>Termos de Uso</Text>
        </Pressable>
        <Text style={styles.footerSeparator}>•</Text>
        <Pressable onPress={() => router.push('/privacy')}>
          <Text style={styles.footerLink}>Privacidade</Text>
        </Pressable>
        <Text style={styles.footerSeparator}>•</Text>
        <Pressable>
          <Text style={styles.footerLink}>Restaurar Compra</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8b5cf6',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    color: '#e4e4e7',
    fontSize: 16,
    flex: 1,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: '#2e1065', // Dark purple bg
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    alignItems: 'center',
    marginBottom: 24,
  },
  pricingTitle: {
    color: '#c4b5fd',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  pricingPrice: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  pricingPeriod: {
    fontSize: 18,
    color: '#c4b5fd',
    fontWeight: 'normal',
  },
  pricingBilled: {
    color: '#a78bfa',
    fontSize: 12,
    marginTop: 8,
  },
  subscribeButton: {
    backgroundColor: '#8b5cf6',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    color: '#a1a1aa',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    color: '#52525b',
    fontSize: 12,
  },
});
