import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Política de Privacidade', presentation: 'modal' }} />
      <View style={styles.content}>
        <Text style={styles.title}>Política de Privacidade e LGPD</Text>
        <Text style={styles.paragraph}>
          O Kiss Flow se compromete com a privacidade dos seus dados. Esta política explica como coletamos e usamos informações.
        </Text>
        <Text style={styles.subtitle}>1. Dados Coletados</Text>
        <Text style={styles.paragraph}>
          Coletamos as informações inseridas sobre os alvos, as interações registradas e os prints enviados para análise da inteligência artificial.
        </Text>
        <Text style={styles.subtitle}>2. Uso dos Dados</Text>
        <Text style={styles.paragraph}>
          Os dados são utilizados exclusivamente para gerar insights, diagnósticos comportamentais e melhorar sua performance. Não vendemos dados para terceiros.
        </Text>
        <Text style={styles.subtitle}>3. LGPD e Consentimento</Text>
        <Text style={styles.paragraph}>
          Ao utilizar o app, você consente explicitamente com o armazenamento e processamento das interações. Você pode solicitar a exclusão da sua conta e de todos os dados a qualquer momento nas configurações.
        </Text>
        <Text style={styles.subtitle}>4. Segurança</Text>
        <Text style={styles.paragraph}>
          Utilizamos banco de dados seguro (Supabase e D1) com autenticação e políticas granulares para garantir que apenas você acesse seus registros.
        </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 22,
  },
});
