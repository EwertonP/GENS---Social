export interface Client {
  id: string;
  name: string; // Nome da Marca / Profissional
  niche: string; // Nicho (Ex: Hospital de Cardiologia, Clínica de Estética, Advogado Trabalhista)
  category: string; // Categoria de compliance (Medicina, Advocacia, etc.)
  nicheRules: string; // Special CFM, OAB rules, or general ethical guidelines
  mainProductService: string; // Produto/Serviço Principal
  brandVoice: string; // Tom de Voz
  
  // Perfil do Cliente Ideal (ICP)
  painPoints: string; // Dores Principais
  desires: string; // Desejos
  
  // Histórico de Conteúdo
  contentHistory: string; // O que já foi feito
  
  // Diretrizes de Qualidade e Critério
  preferredContentType: string; // Tipo de Conteúdo Preferido
  frequency: string; // Frequência (Ex: 1 a 2 conteúdos por semana)
  
  createdAt: string;
}

export interface Briefing {
  id: string;
  clientId: string;
  goal: 'Venda' | 'Autoridade' | 'Engajamento' | 'Educação';
  topic: string; // What the post is about
  framework: 'PAS' | 'BAB' | 'AIDA' | 'Híbrido';
  customInstructions?: string;
  model: string;
  createdAt: string;
}

export interface Slide {
  numero: number;
  titulo: string;
  texto: string;
  design: string; // Design recommendation for the visual card
}

export interface ReelsScene {
  tempo: string;
  acao: string; // Visual action or background video instruction
  fala: string; // Word-for-word spoken audio
}

export interface ReelsScript {
  cenas: ReelsScene[];
}

export interface ReflectionScores {
  conexao: number; // Emotional connection
  scrollStopper: number; // Hook strength (first 3s)
  storytelling: number; // Flow & rhythm
  posicionamento: number; // Brand alignment
  autoridade: number; // Expertise signals & proof
  zeroClique: number; // Immediate value on visual without click/expand
  etica: number; // Compliance & non-hyperbolic claims
  cta: number; // Conversion actionability
}

export interface Post {
  id: number;
  titulo: string;
  formato: 'Carrossel' | 'Reels' | 'Post Estático';
  framework: string;
  ganchoV1?: string;
  gancho: string;
  slides?: Slide[];
  roteiroReels?: ReelsScript;
  legendaV1?: string;
  legenda: string; // Detailed post caption with hashtags
  notasReflexao: {
    v1: {
      notas: ReflectionScores;
      media: number;
    };
    melhoriasV2: string; // Bullet points of what changed to improve
    v2: {
      notas: ReflectionScores;
      media: number;
    };
  };
}

export interface PlanningResult {
  cliente: string;
  posts: Post[];
  createdAt: string;
}

export interface GenerationHistory {
  id: string;
  clientId: string;
  clientName: string;
  briefing: Briefing;
  result: PlanningResult;
  createdAt: string;
}
