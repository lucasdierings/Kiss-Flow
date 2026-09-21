import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Termos de Uso', presentation: 'modal' }} />
      <View style={styles.content}>
        <Text style={styles.title}>Termos de Uso</Text>
        <Text style={styles.paragraph}>
          Bem-vindo ao Kiss Flow. Ao acessar e utilizar este aplicativo, você concorda com os Termos de Uso descritos abaixo.
        </Text>
        <Text style={styles.subtitle}>1. Aceitação</Text>
        <Text style={styles.paragraph}>
          Estes termos constituem um contrato vinculativo. Caso não concorde com alguma condição, por favor, não utilize o aplicativo.
        </Text>
        <Text style={styles.subtitle}>2. Uso do Aplicativo</Text>
        <Text style={styles.paragraph}>
          O Kiss Flow foi desenvolvido para fornecer insights e gestão de relacionamentos. O usuário é o único responsável pelas ações tomadas com base nas sugestões da IA.
        </Text>
        <Text style={styles.subtitle}>3. Assinatura e Pagamentos</Text>
        <Text style={styles.paragraph}>
          Planos Premium são cobrados via lojas de aplicativos (Apple e Google). Cancelamentos devem ser feitos diretamente na respectiva loja.
        </Text>
        <Text style={styles.subtitle}>4. Responsabilidade</Text>
        <Text style={styles.paragraph}>
          Não garantimos resultados específicos nos relacionamentos geridos pelo aplicativo. O uso é de sua total responsabilidade.
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
