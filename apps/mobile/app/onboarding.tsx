import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = async () => {
    if (!agreed) {
      Alert.alert('Consentimento Necessário', 'Você precisa concordar com os Termos e Políticas para usar o aplicativo.');
      return;
    }
    
    // Save to async storage so we don't show this again
    try {
      await AsyncStorage.setItem('lgpd_consent', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to save consent', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao Kiss Flow</Text>
        <Text style={styles.subtitle}>Sua privacidade é nossa prioridade.</Text>
        
        <Text style={styles.description}>
          Para fornecer as melhores análises e estratégias comportamentais, processamos os dados que você insere sobre seus contatos.
        </Text>
        <Text style={styles.description}>
          Suas informações são criptografadas e não compartilhamos seus dados com terceiros.
        </Text>
        
        <View style={styles.linksContainer}>
          <Pressable onPress={() => router.push('/terms')}>
            <Text style={styles.linkText}>Ler Termos de Uso</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/privacy')}>
            <Text style={styles.linkText}>Ler Política de Privacidade</Text>
          </Pressable>
        </View>

        <View style={styles.consentContainer}>
          <Switch
            value={agreed}
            onValueChange={setAgreed}
            trackColor={{ false: '#3f3f46', true: '#8b5cf6' }}
            thumbColor={'#fff'}
          />
          <Text style={styles.consentText}>
            Eu li e concordo com os Termos de Uso e a Política de Privacidade (LGPD).
          </Text>
        </View>

        <Pressable 
          style={[styles.button, !agreed && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={!agreed}
        >
          <Text style={styles.buttonText}>Começar a Usar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#161616',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8b5cf6',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#a1a1aa',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  linksContainer: {
    marginTop: 8,
    marginBottom: 32,
    gap: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#60a5fa',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
    paddingHorizontal: 8,
  },
  consentText: {
    flex: 1,
    color: '#e4e4e7',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#3f3f46',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
