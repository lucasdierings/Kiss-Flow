import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // TODO: Chamar API do Better Auth (fetch /api/auth/sign-in/email)
    // Se sucesso, salvar token e ir para as tabs
    try {
      await AsyncStorage.setItem('user_session', 'mock_token');
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível fazer o login.');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // TODO: Implementar expo-auth-session ou redirect para a API do Better Auth
    Alert.alert('Integração', `Login com ${provider} está pronto para ser configurado com os Client IDs.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kiss Flow</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OU</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={() => handleSocialLogin('apple')}>
        <Text style={styles.socialButtonText}>Continuar com Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => handleSocialLogin('google')}>
        <Text style={[styles.socialButtonText, { color: '#000' }]}>Continuar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/signup')}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    marginBottom: 16,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#262626',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  appleButton: {
    backgroundColor: '#fff',
  },
  googleButton: {
    backgroundColor: '#f1f5f9',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
});
