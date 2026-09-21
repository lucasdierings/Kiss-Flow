import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp, Gender, Orientation, PipelineStage } from '@/context/AppContext';

export default function CadastrosScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const { profile, updateProfile, addTarget, mentorName, mentorIcon } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'perfil' | 'alvo'>('perfil');

  // Form states perfil
  const [userName, setUserName] = useState(profile.name);
  const [userGender, setUserGender] = useState<Gender>(profile.gender);
  const [userOrientation, setUserOrientation] = useState<Orientation>(profile.orientation);

  // Form states novo alvo
  const [targetName, setTargetName] = useState('');
  const [targetArchetype, setTargetArchetype] = useState('A Sereia');
  const [targetStage, setTargetStage] = useState<PipelineStage>('papo');
  const [targetNotes, setTargetNotes] = useState('');

  const handleGenderChange = (newGender: Gender) => {
    setUserGender(newGender);
    updateProfile({ gender: newGender });
    Alert.alert(
      'Estrategista Atualizado',
      newGender === 'masculino'
        ? 'Don Juan 👑 atribuído automaticamente para homens.'
        : 'Cleópatra ✨ atribuída automaticamente para mulheres.'
    );
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: userName,
      gender: userGender,
      orientation: userOrientation,
    });
    Alert.alert('Sucesso', 'Seu perfil e características foram salvos!');
  };

  const handleCreateTarget = () => {
    if (!targetName.trim()) {
      Alert.alert('Atenção', 'Informe o nome do alvo.');
      return;
    }

    addTarget({
      name: targetName,
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      stage: targetStage,
      stageLabel:
        targetStage === 'de_olho'
          ? 'De Olho'
          : targetStage === 'papo'
          ? 'Puxando Papo'
          : targetStage === 'flerte'
          ? 'Flerte Rendendo'
          : 'Tentando Marcar',
      temp: 'warm',
      archetype: targetArchetype,
      lastMessage: targetNotes || 'Adicionado recentemente',
      lastInteractionHoursAgo: 1,
      mysteryScore: 80,
      tensionScore: 50,
      interestScore: 70,
    });

    setTargetName('');
    setTargetNotes('');
    Alert.alert('Alvo Cadastrado', `${targetName} foi adicionada ao seu CRM com sucesso!`);
    router.push('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* TOGGLE SUB-TABS: MEU PERFIL VS NOVO ALVO */}
      <View
        style={[
          styles.subTabContainer,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.subTabBtn,
            activeSubTab === 'perfil' && { backgroundColor: '#8b5cf6' },
          ]}
          onPress={() => setActiveSubTab('perfil')}
        >
          <Text
            style={[
              styles.subTabBtnText,
              { color: activeSubTab === 'perfil' ? '#fff' : theme.muted },
            ]}
          >
            Meu Perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTabBtn,
            activeSubTab === 'alvo' && { backgroundColor: '#8b5cf6' },
          ]}
          onPress={() => setActiveSubTab('alvo')}
        >
          <Text
            style={[
              styles.subTabBtnText,
              { color: activeSubTab === 'alvo' ? '#fff' : theme.muted },
            ]}
          >
            Novo Alvo
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeSubTab === 'perfil' ? (
          /* ================= MEU PERFIL ================= */
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.profileHeader}>
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: theme.text }]}>
                  {profile.name}
                </Text>
                <Text style={styles.mentorActiveBadge}>
                  Estrategista Ativo: {mentorName} {mentorIcon}
                </Text>
                <Text style={[styles.profilePlanText, { color: theme.muted }]}>
                  Plano Pro • 14 Créditos
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.muted }]}>Seu Nome</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
                value={userName}
                onChangeText={setUserName}
              />

              {/* SELETOR DE GÊNERO: ATIVAÇÃO DE DON JUAN OU CLEÓPATRA */}
              <Text style={[styles.label, { color: theme.muted }]}>
                Seu Gênero (Define seu Estrategista)
              </Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    userGender === 'masculino' && styles.choiceBtnActive,
                  ]}
                  onPress={() => handleGenderChange('masculino')}
                >
                  <Text style={styles.choiceIcon}>👑</Text>
                  <Text
                    style={[
                      styles.choiceText,
                      { color: theme.text },
                      userGender === 'masculino' && styles.choiceTextActive,
                    ]}
                  >
                    Masculino (Don Juan)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    userGender === 'feminino' && styles.choiceBtnActiveRose,
                  ]}
                  onPress={() => handleGenderChange('feminino')}
                >
                  <Text style={styles.choiceIcon}>✨</Text>
                  <Text
                    style={[
                      styles.choiceText,
                      { color: theme.text },
                      userGender === 'feminino' && styles.choiceTextActiveRose,
                    ]}
                  >
                    Feminino (Cleópatra)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.muted }]}>Interesse</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    userOrientation === 'mulheres' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setUserOrientation('mulheres')}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      { color: theme.text },
                      userOrientation === 'mulheres' && styles.choiceTextActive,
                    ]}
                  >
                    Mulheres
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    userOrientation === 'homens' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setUserOrientation('homens')}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      { color: theme.text },
                      userOrientation === 'homens' && styles.choiceTextActive,
                    ]}
                  >
                    Homens
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.muted }]}>
                Seu Arquétipo de Conquista
              </Text>
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.infoBoxText, { color: theme.text }]}>
                  {profile.archetype}
                </Text>
                <Text style={[styles.infoBoxSub, { color: theme.muted }]}>
                  Foco na escuta ativa e encantamento sem pressão.
                </Text>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Salvar Meu Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= NOVO ALVO ================= */
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Cadastrar Novo Alvo
            </Text>

            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.muted }]}>Nome ou Apelido *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Ex: Isabella, Beatriz..."
                placeholderTextColor={theme.muted}
                value={targetName}
                onChangeText={setTargetName}
              />

              <Text style={[styles.label, { color: theme.muted }]}>Fase Inicial</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    targetStage === 'de_olho' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setTargetStage('de_olho')}
                >
                  <Text style={{ fontSize: 11, color: theme.text }}>De Olho</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    targetStage === 'papo' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setTargetStage('papo')}
                >
                  <Text style={{ fontSize: 11, color: theme.text }}>Puxando Papo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    targetStage === 'flerte' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setTargetStage('flerte')}
                >
                  <Text style={{ fontSize: 11, color: theme.text }}>Flerte</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.muted }]}>Arquétipo do Alvo</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    targetArchetype === 'A Sereia' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setTargetArchetype('A Sereia')}
                >
                  <Text style={{ fontSize: 11, color: theme.text }}>A Sereia</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    targetArchetype === 'Coquete' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setTargetArchetype('Coquete')}
                >
                  <Text style={{ fontSize: 11, color: theme.text }}>Coquete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceBtn,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    targetArchetype === 'Natural' && styles.choiceBtnActive,
                  ]}
                  onPress={() => setTargetArchetype('Natural')}
                >
                  <Text style={{ fontSize: 11, color: theme.text }}>Natural</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.muted }]}>
                Interesses / Detalhes Detectados
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Ex: ama café especial, curte música ao vivo..."
                placeholderTextColor={theme.muted}
                value={targetNotes}
                onChangeText={setTargetNotes}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTarget}>
                <Text style={styles.saveBtnText}>Salvar no Pipeline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  mentorActiveBadge: {
    color: '#8b5cf6',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  profilePlanText: {
    fontSize: 10,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  formSection: {
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  choiceBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  choiceBtnActiveRose: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderColor: '#e11d48',
  },
  choiceIcon: {
    fontSize: 13,
  },
  choiceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  choiceTextActive: {
    color: '#8b5cf6',
  },
  choiceTextActiveRose: {
    color: '#e11d48',
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBoxText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoBoxSub: {
    fontSize: 10,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
