import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';
import { requestMentorAdvice } from '@/services/api';

export default function MentorScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const {
    activeMentor,
    mentorName,
    mentorIcon,
    targets,
    selectedTargetId,
    setSelectedTargetId,
    creditsBalance,
    consumeCredit,
    selectMentorManual,
  } = useApp();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'mentor'; text: string }>>([
    {
      sender: 'mentor',
      text: `Pronto para calibrar o jogo. Analisei o perfil da Gabriela Lima. Ela demonstrou abertura falando do café. Me envie um print ou digite a mensagem dela para eu formular as 3 melhores jogadas táticas.`,
    },
  ]);

  const currentTarget = targets.find((t) => t.id === selectedTargetId) || targets[0];

  const sampleOptions = [
    {
      title: 'Opção 1: Natural & Desafiadora',
      color: '#6366f1',
      text: 'Sabia que você tinha bom gosto! Mas aposto que você ainda não provou a torta de pistache de lá. Sexta agora a gente vai tirar a prova.',
    },
    {
      title: 'Opção 2: Espirituosa & Curta',
      color: '#a855f7',
      text: 'Esse café tem esse poder mesmo. E olha que você ainda não viu o meu lugar secreto pra tomar drinks.',
    },
    {
      title: 'Opção 3: Pausa & Desapego',
      color: '#64748b',
      text: 'Que bom que curtiu! Tô numa correria hoje, mais tarde te conto o que você precisa pedir da próxima vez 😉',
    },
  ];

  const [options, setOptions] = useState(sampleOptions);
  const [diagnosis, setDiagnosis] = useState(
    'A outra pessoa usou linguagem de validação e entusiasmo. A recomendação tática é não estender papo morno: formule convite progressivo.'
  );
  const [principle, setPrinciple] = useState('Fechamento Progressivo');
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async (text: string, index: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    Alert.alert('Copiado!', 'Mensagem copiada para a área de transferência. Pronto para colar no WhatsApp.');
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    if (creditsBalance <= 0) {
      Alert.alert(
        'Créditos Esgotados',
        'Seu saldo de créditos de inteligência acabou. Adquira mais créditos na aba Créditos para continuar consultando seu estrategista.'
      );
      return;
    }

    const ok = consumeCredit();
    if (!ok) return;

    const userText = inputMessage;
    setInputMessage('');

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await requestMentorAdvice({
        mentor: activeMentor,
        target: {
          name: currentTarget.name,
          archetype: currentTarget.archetype,
          stage: currentTarget.stageLabel,
          mysteryScore: currentTarget.mysteryScore,
          tensionScore: currentTarget.tensionScore,
          interestScore: currentTarget.interestScore,
        },
        userProfile: {
          name: 'Lucas',
          gender: activeMentor === 'donjuan' ? 'masculino' : 'feminino',
        },
        userMessage: userText,
      });

      if (response.diagnosis) {
        setDiagnosis(response.diagnosis);
      }

      if (response.principleApplied) {
        setPrinciple(response.principleApplied);
      }

      if (response.options && response.options.length > 0) {
        const colors = ['#6366f1', '#a855f7', '#64748b'];
        setOptions(
          response.options.map((opt, i) => ({
            title: opt.title,
            color: colors[i % colors.length],
            text: opt.text,
          }))
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'mentor',
          text: response.diagnosis,
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePrint = () => {
    setInputMessage('Print do WhatsApp: "Acho que sexta tenho aula, mas sábado estarei livre..."');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* SELETOR RÁPIDO DE ALVO & SALDO */}
      <View
        style={[
          styles.topControlBar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.targetSelector}>
          <Text style={[styles.controlLabel, { color: theme.muted }]}>Alvo:</Text>
          <Text style={[styles.targetActiveName, { color: '#8b5cf6' }]}>
            {currentTarget?.name}
          </Text>
        </View>

        <View style={styles.creditsBadge}>
          <Ionicons name="sparkles" size={11} color="#8b5cf6" />
          <Text style={styles.creditsBadgeText}>{creditsBalance} créditos</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER DO MENTOR ATIVO */}
        <View
          style={[
            styles.mentorHeaderCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.mentorInfoRow}>
            <View
              style={[
                styles.mentorAvatar,
                {
                  backgroundColor:
                    activeMentor === 'donjuan' ? '#6366f1' : '#e11d48',
                },
              ]}
            >
              <Text style={styles.mentorIconText}>{mentorIcon}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.mentorTitle, { color: theme.text }]}>
                {mentorName}
              </Text>
              <Text style={[styles.mentorRole, { color: theme.muted }]}>
                {activeMentor === 'donjuan'
                  ? 'Mentor de Conquistas & Timing'
                  : 'Mentora de Magnetismo & Poder'}
              </Text>
            </View>

            {/* Alternador manual caso queira testar */}
            <TouchableOpacity
              style={[styles.switchMentorBtn, { borderColor: theme.border }]}
              onPress={() =>
                selectMentorManual(activeMentor === 'donjuan' ? 'cleopatra' : 'donjuan')
              }
            >
              <Text style={styles.switchMentorBtnText}>
                Trocar para {activeMentor === 'donjuan' ? 'Cleópatra' : 'Don Juan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FEED DE CONVERSA */}
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.msgRow,
              msg.sender === 'user' ? styles.msgRowUser : styles.msgRowMentor,
            ]}
          >
            {msg.sender === 'mentor' && (
              <View
                style={[
                  styles.miniMentorAvatar,
                  {
                    backgroundColor:
                      activeMentor === 'donjuan' ? '#6366f1' : '#e11d48',
                  },
                ]}
              >
                <Text style={{ fontSize: 10 }}>{mentorIcon}</Text>
              </View>
            )}

            <View
              style={[
                styles.msgBubble,
                msg.sender === 'user'
                  ? styles.msgBubbleUser
                  : [
                      styles.msgBubbleMentor,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  { color: msg.sender === 'user' ? '#fff' : theme.text },
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {/* CARD COM AS 3 SUGESTÕES ESTRATÉGICAS (RAG) */}
        <View
          style={[
            styles.strategyCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.strategyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <FontAwesome5 name="brain" size={13} color="#8b5cf6" />
              <Text style={[styles.strategyTitle, { color: '#8b5cf6' }]}>
                Diagnóstico Estratégico (RAG)
              </Text>
            </View>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>Escalada</Text>
            </View>
          </View>

          <Text style={[styles.diagnosisText, { color: theme.muted }]}>
            {diagnosis}
          </Text>

          <View style={styles.optionsList}>
            {options.map((opt, i) => (
              <View
                key={i}
                style={[
                  styles.optionCard,
                  { borderColor: theme.border, backgroundColor: theme.card },
                ]}
              >
                <View style={styles.optionCardTop}>
                  <Text style={[styles.optionTitle, { color: opt.color }]}>
                    {opt.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => handleCopy(opt.text, i)}
                  >
                    <Ionicons
                      name={copiedIndex === i ? 'checkmark' : 'copy-outline'}
                      size={11}
                      color="#fff"
                    />
                    <Text style={styles.copyBtnText}>
                      {copiedIndex === i ? 'Copiado' : 'WhatsApp'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.optionBody, { color: theme.text }]}>
                  "{opt.text}"
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.principleBox}>
            <Ionicons name="bulb-outline" size={14} color="#f59e0b" />
            <Text style={styles.principleText}>
              <Text style={{ fontWeight: '700' }}>Princípio Comportamental:</Text>{' '}
              {principle}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BARRA INFERIOR DE ENTRADA / SHARE EXTENSION SIMULADA */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.attachBtn, { backgroundColor: theme.card }]}
          onPress={handleSimulatePrint}
        >
          <Ionicons name="camera-outline" size={18} color="#8b5cf6" />
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, { color: theme.text }]}
          placeholder={`Mande print ou mensagem para ${mentorName}...`}
          placeholderTextColor={theme.muted}
          value={inputMessage}
          onChangeText={setInputMessage}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="arrow-up" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  targetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  targetActiveName: {
    fontSize: 12,
    fontWeight: '800',
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditsBadgeText: {
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  mentorHeaderCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  mentorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mentorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorIconText: {
    fontSize: 18,
  },
  mentorTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  mentorRole: {
    fontSize: 10,
    marginTop: 1,
  },
  switchMentorBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  switchMentorBtnText: {
    fontSize: 9,
    color: '#8b5cf6',
    fontWeight: '700',
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowMentor: {
    justifyContent: 'flex-start',
  },
  miniMentorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },
  msgBubbleUser: {
    backgroundColor: '#8b5cf6',
    borderTopRightRadius: 4,
  },
  msgBubbleMentor: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 12,
    lineHeight: 18,
  },
  strategyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  phaseBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phaseBadgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
  diagnosisText: {
    fontSize: 11,
    lineHeight: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  optionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 10,
    fontWeight: '800',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  optionBody: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  principleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 8,
    borderRadius: 10,
  },
  principleText: {
    color: '#818cf8',
    fontSize: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
