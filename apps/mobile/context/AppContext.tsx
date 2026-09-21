import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Gender = 'masculino' | 'feminino';
export type Orientation = 'mulheres' | 'homens' | 'ambos';
export type MentorType = 'donjuan' | 'cleopatra';
export type TargetTemp = 'hot' | 'warm' | 'cold';
export type PipelineStage = 'de_olho' | 'papo' | 'flerte' | 'marcar' | 'role';

export interface Target {
  id: string;
  name: string;
  avatarUrl: string;
  stage: PipelineStage;
  stageLabel: string;
  temp: TargetTemp;
  archetype: string;
  lastMessage: string;
  lastInteractionHoursAgo: number;
  mysteryScore: number;
  tensionScore: number;
  interestScore: number;
  alert?: string;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  orientation: Orientation;
  archetype: string;
  loveLanguage: string;
  avatarUrl: string;
}

interface AppContextData {
  profile: UserProfile;
  activeMentor: MentorType;
  mentorName: string;
  mentorIcon: string;
  targets: Target[];
  selectedTargetId: string;
  creditsBalance: number;
  monthlyQuotaUsed: number;
  monthlyQuotaTotal: number;
  isPro: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  selectMentorManual: (mentor: MentorType) => void;
  setSelectedTargetId: (id: string) => void;
  addTarget: (target: Omit<Target, 'id'>) => void;
  consumeCredit: () => boolean;
  addCredits: (amount: number) => void;
}

const INITIAL_TARGETS: Target[] = [
  {
    id: '1',
    name: 'Gabriela Lima',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    stage: 'flerte',
    stageLabel: 'Flerte Rendendo',
    temp: 'hot',
    archetype: 'A Sereia',
    lastMessage: 'Amei o café que você indicou haha',
    lastInteractionHoursAgo: 2,
    mysteryScore: 82,
    tensionScore: 68,
    interestScore: 90,
  },
  {
    id: '2',
    name: 'Camila Rocha',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    stage: 'marcar',
    stageLabel: 'Tentando Marcar',
    temp: 'warm',
    archetype: 'Coquete',
    lastMessage: 'Sexta acho que tenho aula até tarde...',
    lastInteractionHoursAgo: 24,
    mysteryScore: 60,
    tensionScore: 45,
    interestScore: 65,
  },
  {
    id: '3',
    name: 'Juliana Mendes',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    stage: 'de_olho',
    stageLabel: 'De Olho',
    temp: 'cold',
    archetype: 'Natural',
    lastMessage: 'Visualizou e não respondeu',
    lastInteractionHoursAgo: 96,
    mysteryScore: 45,
    tensionScore: 20,
    interestScore: 35,
    alert: 'Ação recomendada: Não mande mensagem agora. Espere 48h para recuperar o mistério.',
  },
];

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Lucas',
    gender: 'masculino',
    orientation: 'mulheres',
    archetype: 'O Encantador',
    loveLanguage: 'Tempo de Qualidade',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  });

  // Atribuição da personalidade conforme a regra estrita do usuário:
  // Homem hétero -> Don Juan | Mulher hétero -> Cleópatra
  const [activeMentor, setActiveMentor] = useState<MentorType>('donjuan');
  const [targets, setTargets] = useState<Target[]>(INITIAL_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('1');
  const [creditsBalance, setCreditsBalance] = useState<number>(14);
  const [monthlyQuotaUsed, setMonthlyQuotaUsed] = useState<number>(48);
  const monthlyQuotaTotal = 100;
  const isPro = true;

  // Atualiza mentor automaticamente quando o gênero muda
  useEffect(() => {
    if (profile.gender === 'masculino') {
      setActiveMentor('donjuan');
    } else if (profile.gender === 'feminino') {
      setActiveMentor('cleopatra');
    }
  }, [profile.gender]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const selectMentorManual = (mentor: MentorType) => {
    setActiveMentor(mentor);
  };

  const addTarget = (newTargetData: Omit<Target, 'id'>) => {
    const newTarget: Target = {
      ...newTargetData,
      id: Date.now().toString(),
    };
    setTargets((prev) => [newTarget, ...prev]);
  };

  const consumeCredit = (): boolean => {
    if (creditsBalance <= 0) return false;
    setCreditsBalance((prev) => prev - 1);
    return true;
  };

  const addCredits = (amount: number) => {
    setCreditsBalance((prev) => prev + amount);
  };

  const mentorName = activeMentor === 'donjuan' ? 'Don Juan' : 'Cleópatra';
  const mentorIcon = activeMentor === 'donjuan' ? '👑' : '✨';

  return (
    <AppContext.Provider
      value={{
        profile,
        activeMentor,
        mentorName,
        mentorIcon,
        targets,
        selectedTargetId,
        creditsBalance,
        monthlyQuotaUsed,
        monthlyQuotaTotal,
        isPro,
        updateProfile,
        selectMentorManual,
        setSelectedTargetId,
        addTarget,
        consumeCredit,
        addCredits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
