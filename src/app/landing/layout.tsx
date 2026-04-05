import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiss Flow | Conquiste com Estrategia e Inteligencia Artificial",
  description:
    "Kiss Flow e o app que te ajuda a conquistar com confianca. Inteligencia artificial e psicologia comportamental para saber o que dizer, quando agir e como encontrar quem voce quer. Gratis para comecar.",
  keywords: [
    "conquistar mulheres",
    "como conquistar uma mulher",
    "app de conquista",
    "dicas de sedução",
    "como conseguir namorada",
    "inteligência artificial relacionamento",
    "psicologia da sedução",
    "como flertar",
    "app para solteiros",
    "como mandar mensagem para crush",
    "dicas de paquera",
    "como ser mais confiante",
    "estratégias de conquista",
    "CRM de relacionamentos",
    "assistente de sedução IA",
  ],
  authors: [{ name: "Kiss Flow" }],
  creator: "Kiss Flow",
  publisher: "Kiss Flow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Kiss Flow",
    title: "Kiss Flow | Conquiste com Estrategia e Inteligencia Artificial",
    description:
      "O app que te ajuda a conquistar com confianca. IA + psicologia comportamental para saber o que dizer e quando agir.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kiss Flow - Conquiste com Estrategia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiss Flow | Conquiste com Estrategia e IA",
    description:
      "O app que te ajuda a conquistar com confianca. IA + psicologia comportamental para saber o que dizer e quando agir.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/landing",
    languages: {
      "pt-BR": "/landing",
    },
  },
  category: "technology",
  classification: "Relacionamentos, Desenvolvimento Pessoal, Inteligencia Artificial",
};

/* JSON-LD Structured Data for SEO + AI Discoverability */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Kiss Flow",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      description:
        "Aplicativo de conquista com inteligencia artificial e psicologia comportamental. Ajuda voce a conquistar com confianca usando taticas comprovadas, metricas psicologicas e orientacao personalizada por IA.",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BRL",
          name: "Plano Gratuito",
          description: "1 alvo, 5 analises IA/mes, 20 mensagens chat/mes",
        },
        {
          "@type": "Offer",
          price: "29.90",
          priceCurrency: "BRL",
          name: "Plano Premium",
          description: "Alvos ilimitados, 100 analises IA/mes, chat ilimitado",
        },
      ],
      featureList: [
        "Assistente de IA para conquista",
        "Analise de conversas por IA",
        "Sugestao de mensagens inteligentes",
        "Pipeline de relacionamentos em 5 fases",
        "Metricas psicologicas (misterio, tensao, encantamento)",
        "24 taticas de conquista",
        "Quiz de arquetipo de seducao",
        "Alertas proativos de friendzone",
        "Kanban visual de conquistas",
        "Analytics de performance",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "127",
        bestRating: "5",
      },
    },
    {
      "@type": "Organization",
      name: "Kiss Flow",
      description:
        "Plataforma de inteligencia artificial para relacionamentos. Ajudamos voce a conquistar com confianca.",
      foundingDate: "2026",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O Kiss Flow e gratuito?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim! O plano gratuito inclui 1 alvo ativo, 5 analises de IA por mes e 20 mensagens no chat. Voce pode usar sem cartao de credito.",
          },
        },
        {
          "@type": "Question",
          name: "Como a IA do Kiss Flow me ajuda a conquistar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A IA analisa suas conversas, sugere mensagens personalizadas, identifica o momento ideal para agir e alerta sobre riscos como friendzone. Tudo baseado em psicologia comportamental comprovada.",
          },
        },
        {
          "@type": "Question",
          name: "O Kiss Flow funciona para qualquer tipo de relacionamento?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. Voce pode usar para romance, amizade, reconquista ou atracao. A IA adapta as sugestoes ao seu objetivo especifico com cada pessoa.",
          },
        },
        {
          "@type": "Question",
          name: "Meus dados ficam seguros no Kiss Flow?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. Utilizamos criptografia, autenticacao segura e politicas de privacidade rigorosas. Seus dados sao exclusivamente seus e nunca sao compartilhados.",
          },
        },
      ],
    },
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
