"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";
import { QUIZ_QUESTIONS, calculateArchetype, ARCHETYPE_RESULTS } from "@/lib/archetype-quiz";
import { SEDUCER_ARCHETYPES } from "@/lib/types";

type Step = "identity" | "quiz" | "communication" | "result";

const GENDER_OPTIONS = [
  { id: "male", label: "Homem" },
  { id: "female", label: "Mulher" },
  { id: "non_binary", label: "Não-binário" },
  { id: "other", label: "Outro" },
];

const ORIENTATION_OPTIONS = [
  { id: "heterosexual", label: "Heterossexual" },
  { id: "homosexual", label: "Homossexual" },
  { id: "bisexual", label: "Bissexual" },
  { id: "pansexual", label: "Pansexual" },
  { id: "other", label: "Outro" },
];

const AGE_RANGES = [
  { id: "18-24", label: "18-24" },
  { id: "25-34", label: "25-34" },
  { id: "35-44", label: "35-44" },
  { id: "45+", label: "45+" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identity");
  const [saving, setSaving] = useState(false);

  // Identity data
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [ageRange, setAgeRange] = useState("");

  // Quiz data
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Communication data
  const [commAnswers, setCommAnswers] = useState({
    difficulty: "",
    shows_interest_fast: "",
    no_response_reaction: "",
  });

  // Result
  const [archetypeResult, setArchetypeResult] = useState<ReturnType<typeof calculateArchetype> | null>(null);

  // Load user name from Supabase
  useEffect(() => {
    async function loadUser() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name);
      }
    }
    loadUser();
  }, []);

  function handleQuizAnswer(optionIndex: number) {
    const question = QUIZ_QUESTIONS[currentQuestion];
    const newAnswers = { ...quizAnswers, [question.id]: optionIndex };
    setQuizAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const result = calculateArchetype(newAnswers);
      setArchetypeResult(result);
      setStep("communication");
    }
  }

  async function handleFinish() {
    setSaving(true);
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const archetype = archetypeResult?.primary || "charmer";

    // Update user profile
    await supabase.from("user_profiles").update({
      display_name: displayName,
      gender: gender || null,
      orientation: orientation || null,
      seducer_archetype: archetype,
      onboarding_completed: true,
    }).eq("id", user.id);

    // Save onboarding answers
    const answers = [
      { user_id: user.id, question_key: "age_range", answer_value: ageRange },
      { user_id: user.id, question_key: "difficulty", answer_value: commAnswers.difficulty },
      { user_id: user.id, question_key: "shows_interest_fast", answer_value: commAnswers.shows_interest_fast },
      { user_id: user.id, question_key: "no_response_reaction", answer_value: commAnswers.no_response_reaction },
      ...Object.entries(quizAnswers).map(([key, value]) => ({
        user_id: user.id, question_key: key, answer_value: String(value),
      })),
    ].filter(a => a.answer_value);

    if (answers.length > 0) {
      await supabase.from("user_onboarding").insert(answers);
    }

    router.push("/");
    router.refresh();
  }

  const totalSteps = 4;
  const currentStepIndex = ["identity", "quiz", "communication", "result"].indexOf(step);
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-[#161616]">
        <div
          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#e11d48] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* ========== STEP 1: IDENTITY ========== */}
          {step === "identity" && (
            <div className="animate-float-up">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#e11d48] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-tighter">Quem é você?</h1>
                <p className="text-sm text-[#737373] mt-1">Precisamos conhecer você para personalizar suas estratégias</p>
              </div>

              <div className="bento-card space-y-5">
                {/* Name */}
                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-1.5">Nome</label>
                  <input
                    type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-[#e5e5e5] text-sm focus:border-[#7c3aed] focus:outline-none transition-colors"
                    placeholder="Seu nome"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-2">Gênero</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button key={g.id} onClick={() => setGender(g.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                          gender === g.id
                            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
                            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
                        }`}
                      >{g.label}</button>
                    ))}
                  </div>
                </div>

                {/* Orientation */}
                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-2">Orientação sexual</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ORIENTATION_OPTIONS.map((o) => (
                      <button key={o.id} onClick={() => setOrientation(o.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                          orientation === o.id
                            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
                            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
                        }`}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Age range */}
                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-2">Faixa etária</label>
                  <div className="grid grid-cols-4 gap-2">
                    {AGE_RANGES.map((a) => (
                      <button key={a.id} onClick={() => setAgeRange(a.id)}
                        className={`px-3 py-2.5 rounded-xl text-sm transition-all ${
                          ageRange === a.id
                            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
                            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
                        }`}
                      >{a.label}</button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep("quiz")}
                  disabled={!displayName || !gender}
                  className="w-full py-3 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ========== STEP 2: QUIZ ========== */}
          {step === "quiz" && (
            <div className="animate-float-up" key={currentQuestion}>
              <div className="text-center mb-6">
                <span className="text-[10px] text-[#737373] uppercase tracking-widest">
                  Pergunta {currentQuestion + 1} de {QUIZ_QUESTIONS.length}
                </span>
                {/* Mini progress */}
                <div className="flex gap-1 mt-3 justify-center">
                  {QUIZ_QUESTIONS.map((_, i) => (
                    <div key={i} className={`w-6 h-1 rounded-full transition-all ${
                      i < currentQuestion ? "bg-[#7c3aed]" : i === currentQuestion ? "bg-[#8b5cf6]" : "bg-[#262626]"
                    }`} />
                  ))}
                </div>
              </div>

              <div className="bento-card">
                <h2 className="text-lg font-semibold tracking-tighter mb-6 text-center leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuestion].question}
                </h2>

                <div className="space-y-3">
                  {QUIZ_QUESTIONS[currentQuestion].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full text-left p-4 rounded-xl bg-[#0D0D0D] border border-[#262626] text-sm text-[#a3a3a3] hover:border-[#7c3aed]/40 hover:text-[#e5e5e5] hover:bg-[#7c3aed]/5 transition-all"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                {currentQuestion > 0 && (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    className="mt-4 text-xs text-[#737373] hover:text-[#a3a3a3] transition-colors"
                  >
                    ← Voltar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========== STEP 3: COMMUNICATION ========== */}
          {step === "communication" && (
            <div className="animate-float-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tighter">Quase lá!</h1>
                <p className="text-sm text-[#737373] mt-1">Mais algumas perguntas para calibrar o motor de sugestões</p>
              </div>

              <div className="bento-card space-y-5">
                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-2">
                    Qual sua maior dificuldade em relacionamentos?
                  </label>
                  <div className="space-y-2">
                    {[
                      "Iniciar conversas",
                      "Manter o interesse do outro",
                      "Saber a hora certa de agir",
                      "Não demonstrar interesse demais",
                      "Lidar com rejeição",
                    ].map((opt) => (
                      <button key={opt} onClick={() => setCommAnswers({ ...commAnswers, difficulty: opt })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                          commAnswers.difficulty === opt
                            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
                            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
                        }`}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-2">
                    Você tende a demonstrar interesse rápido demais?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Sim, sempre", "Às vezes", "Não, sou cauteloso"].map((opt) => (
                      <button key={opt} onClick={() => setCommAnswers({ ...commAnswers, shows_interest_fast: opt })}
                        className={`px-3 py-2.5 rounded-xl text-sm transition-all ${
                          commAnswers.shows_interest_fast === opt
                            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
                            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
                        }`}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#737373] uppercase tracking-wider block mb-2">
                    Quando não recebe resposta, o que faz?
                  </label>
                  <div className="space-y-2">
                    {[
                      "Mando outra mensagem",
                      "Espero, mas fico ansioso",
                      "Sigo minha vida normalmente",
                      "Perco o interesse",
                    ].map((opt) => (
                      <button key={opt} onClick={() => setCommAnswers({ ...commAnswers, no_response_reaction: opt })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                          commAnswers.no_response_reaction === opt
                            ? "bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#8b5cf6]"
                            : "bg-[#0D0D0D] border border-[#262626] text-[#737373] hover:border-[#333]"
                        }`}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep("result")}
                  className="w-full py-3 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
                >
                  Ver meu perfil
                </button>
              </div>
            </div>
          )}

          {/* ========== STEP 4: RESULT ========== */}
          {step === "result" && archetypeResult && (() => {
            const archData = ARCHETYPE_RESULTS[archetypeResult.primary];
            const secondaryData = ARCHETYPE_RESULTS[archetypeResult.secondary];
            if (!archData) return null;

            return (
              <div className="animate-float-up">
                <div className="text-center mb-6">
                  <span className="text-[10px] text-[#737373] uppercase tracking-widest">Seu arquétipo sedutor</span>
                </div>

                <div className="bento-card text-center mb-4">
                  {/* Archetype icon with glow */}
                  <div className="relative mx-auto mb-6 w-24 h-24">
                    <div className="absolute inset-0 rounded-full blur-2xl scale-150" style={{ background: `${archData.color}30` }} />
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-2" style={{ borderColor: `${archData.color}60`, background: `${archData.color}10` }}>
                      <svg className="w-10 h-10" style={{ color: archData.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tighter mb-1" style={{ color: archData.color }}>
                    {archData.name}
                  </h2>
                  <p className="text-sm text-[#a3a3a3] italic mb-4">{archData.title}</p>
                  <p className="text-sm text-[#737373] leading-relaxed mb-6">{archData.description}</p>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-[#059669]/5 border border-[#059669]/10">
                      <span className="text-[10px] text-[#059669] uppercase tracking-wider block mb-2">Forças</span>
                      {archData.strengths.map((s) => (
                        <p key={s} className="text-xs text-[#a3a3a3] mb-1">+ {s}</p>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-[#e11d48]/5 border border-[#e11d48]/10">
                      <span className="text-[10px] text-[#e11d48] uppercase tracking-wider block mb-2">Pontos fracos</span>
                      {archData.weaknesses.map((w) => (
                        <p key={w} className="text-xs text-[#a3a3a3] mb-1">- {w}</p>
                      ))}
                    </div>
                  </div>

                  {/* Ideal victims */}
                  <div className="p-3 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/10 mb-4">
                    <span className="text-[10px] text-[#8b5cf6] uppercase tracking-wider block mb-2">Alvos ideais para você</span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {archData.ideal_victims.map((v) => (
                        <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-[#7c3aed]/10 text-[#8b5cf6] border border-[#7c3aed]/20">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Secondary archetype */}
                  {secondaryData && (
                    <p className="text-[11px] text-[#737373]">
                      Arquétipo secundário: <span style={{ color: secondaryData.color }}>{secondaryData.name}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#e11d48] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? "Salvando..." : "Começar a conquistar →"}
                </button>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
