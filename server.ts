import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the GoogleGenAI client lazily to avoid crashing on start if the key is missing
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Test API Connection Status
  app.get("/api/test-connection", async (req, res) => {
    try {
      const client = getAIClient();
      // Quick model listing or simple low-latency token call to verify
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Diga 'Conectado' se você puder me ouvir.",
      });
      
      res.json({
        success: true,
        message: "Conexão com o Google AI Studio estabelecida com sucesso!",
        modelUsed: "gemini-3.5-flash",
        responsePreview: response.text?.trim()
      });
    } catch (error: any) {
      console.error("Test connection failed:", error);
      res.json({
        success: false,
        reason: process.env.GEMINI_API_KEY ? "invalid_key" : "missing_key",
        message: error.message || "Chave de API não configurada ou inválida."
      });
    }
  });

  // API Route: Generate copy and self-reflection metrics
  app.post("/api/generate", async (req, res) => {
    const { client, briefing } = req.body;

    if (!client || !briefing) {
      return res.status(400).json({ error: "Client and Briefing data are required." });
    }

    const modelName = briefing.model || "gemini-3.5-flash";

    const promptText = `
      INFORMAÇÕES DO CLIENTE:
      - Nome da Marca/Profissional: ${client.name}
      - Nicho de Atuação Específico: ${client.niche} (Categoria: ${client.category || "Não especificada"})
      - Restrições de Ética e Compliance de Nicho: ${client.nicheRules || "Nenhuma especificada"}
      - Produto/Serviço Principal: ${client.mainProductService || "Não especificado"}
      - Voz e Tom da Marca: ${client.brandVoice || "Não especificado"}
      
      PERFIL DO CLIENTE IDEAL (ICP):
      - Dores Principais do Público: ${client.painPoints || "Não mapeadas"}
      - Desejos e Estado Ideal do Público: ${client.desires || "Não mapeados"}
      
      HISTÓRICO DE CONTEÚDO (Não repita estes temas, analise o estilo para manter coerência):
      ${client.contentHistory || "Sem histórico anterior registrado"}

      DIRETRIZES DE QUALIDADE E CRITÉRIO:
      - Tipo de Conteúdo Preferido: ${client.preferredContentType || "Não especificado"}
      - Frequência Recomendada: ${client.frequency || "1 a 2 conteúdos por semana"}

      PLANEJAMENTO DO CONTEÚDO SOLICITADO:
      - Tema/Assunto Central: ${briefing.topic}
      - Objetivo: ${briefing.goal}
      - Framework Recomendado: ${briefing.framework}
      - Instruções Extras: ${briefing.customInstructions || "Nenhuma"}

      Por favor, gere exatamente 2 posts semanais focando nesse tema.
      Para cada post, aplique rigorosamente o framework de copywriting indicado (${briefing.framework}) ou uma adaptação inteligente do mesmo.
      Formate um carrossel (com slides sequenciais detalhados) ou um roteiro de reels (com falas e tempos por cena) ou post estático de acordo com a melhor estratégia para o assunto.

      Execute o Algoritmo de Auto-Reflexão de 8 critérios:
      1. Crie a sua proposta rascunho V1 inicial: defina o gancho inicial (ganchoV1) e a legenda preliminar (legendaV1). Esta versão V1 deve representar um rascunho com menor pontuação e potencial para otimização ou ajustes éticos.
      2. Avalie honestamente esta proposta conceitual preliminar (V1) em cada um dos 8 critérios (Conexão, Scroll Stopper, Storytelling, Posicionamento, Autoridade, Zero Clique, Ética & Regras, CTA) e calcule a média aritmética.
      3. Identifique o que precisa melhorar e descreva de forma concisa em 'melhoriasV2' (quais pontos fracos foram ajustados, como se adequar às regras éticas CFM/OAB, etc.).
      4. Reescreva o post completamente para a versão final de Alta Conversão (V2) - especificando os campos finais de alta conversão 'gancho' (V2), 'legenda' (V2), e os slides ou roteiroReels - visando superar as notas de V1 de forma expressiva para garantir máxima persuasão, didática e 100% de segurança ética.
    `;

    try {
      const ai = getAIClient();

      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptText,
        config: {
          systemInstruction: `Você é um Copywriter Sênior de Alta Conversão e estrategista de redes sociais com amplo conhecimento em psicologia de consumo, design de slides, dinâmicas de retenção para Reels e conformidade ética estrita (incluindo CFM para medicina e OAB para advocacia).
          Você avalia a qualidade da sua própria escrita antes de entregar a resposta final, aplicando notas de reflexão sinceras de 1 a 100 baseadas em performance de vendas e engajamento prático.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cliente: { type: Type.STRING, description: "Nome do cliente/marca" },
              posts: {
                type: Type.ARRAY,
                description: "Lista de exatamente 2 posts gerados e otimizados",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER, description: "Número sequencial do post" },
                    titulo: { type: Type.STRING, description: "Título interno do post para organização" },
                    formato: { 
                      type: Type.STRING, 
                      description: "Formato do post",
                      enum: ["Carrossel", "Reels", "Post Estático"] 
                    },
                    framework: { type: Type.STRING, description: "Framework utilizado (Ex: PAS, AIDA)" },
                    ganchoV1: { type: Type.STRING, description: "A versão V1 preliminar ou rascunho do gancho de rolagem" },
                    gancho: { type: Type.STRING, description: "A versão V2 de alta conversão do gancho (Scroll Stopper)" },
                    slides: {
                      type: Type.ARRAY,
                      description: "Caso o formato seja Carrossel, descreva cada slide",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          numero: { type: Type.INTEGER, description: "Sequencial do slide começando do 1" },
                          titulo: { type: Type.STRING, description: "Título visual forte do slide" },
                          texto: { type: Type.STRING, description: "Subtexto de apoio curto e direto" },
                          design: { type: Type.STRING, description: "Instruções visuais para o designer (imagem, ícone, cores)" }
                        },
                        required: ["numero", "titulo", "texto", "design"]
                      }
                    },
                    roteiroReels: {
                      type: Type.OBJECT,
                      description: "Caso o formato seja Reels, monte o roteiro cronometrado",
                      properties: {
                        cenas: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              tempo: { type: Type.STRING, description: "Tempo estimado da cena (Ex: '0-3s')" },
                              acao: { type: Type.STRING, description: "Indicação visual e corporal do vídeo" },
                              fala: { type: Type.STRING, description: "O que deve ser falado" }
                            },
                            required: ["tempo", "acao", "fala"]
                          }
                        }
                      },
                      required: ["cenas"]
                    },
                    legendaV1: { type: Type.STRING, description: "Legenda preliminar (rascunho V1) do post" },
                    legenda: { type: Type.STRING, description: "A versão V2 de alta conversão e eticamente adequada da legenda do post" },
                    notasReflexao: {
                      type: Type.OBJECT,
                      description: "Resultados do algoritmo de auto-reflexão comparando V1 com V2",
                      properties: {
                        v1: {
                          type: Type.OBJECT,
                          properties: {
                            notas: {
                              type: Type.OBJECT,
                              properties: {
                                conexao: { type: Type.NUMBER, description: "Pontuação de Conexão Emocional de 0 a 10" },
                                scrollStopper: { type: Type.NUMBER, description: "Pontuação de Força do Gancho de 0 a 10" },
                                storytelling: { type: Type.NUMBER, description: "Pontuação de Fluidez de Leitura de 0 a 10" },
                                posicionamento: { type: Type.NUMBER, description: "Pontuação de Alinhamento com a Marca de 0 a 10" },
                                autoridade: { type: Type.NUMBER, description: "Pontuação de Prova e Autoridade de 0 a 10" },
                                zeroClique: { type: Type.NUMBER, description: "Pontuação de Valor sem clique de 0 a 10" },
                                etica: { type: Type.NUMBER, description: "Pontuação de Ética e Legislação de 0 a 10" },
                                cta: { type: Type.NUMBER, description: "Pontuação de Eficácia do CTA de 0 a 10" }
                              },
                              required: ["conexao", "scrollStopper", "storytelling", "posicionamento", "autoridade", "zeroClique", "etica", "cta"]
                            },
                            media: { type: Type.NUMBER, description: "Média aritmética das notas de V1 de 0 a 10" }
                          },
                          required: ["notas", "media"]
                        },
                        melhoriasV2: { type: Type.STRING, description: "Resumo explicativo do que foi alterado e aprimorado na reescrita para V2" },
                        v2: {
                          type: Type.OBJECT,
                          properties: {
                            notas: {
                              type: Type.OBJECT,
                              properties: {
                                conexao: { type: Type.NUMBER },
                                scrollStopper: { type: Type.NUMBER },
                                storytelling: { type: Type.NUMBER },
                                posicionamento: { type: Type.NUMBER },
                                autoridade: { type: Type.NUMBER },
                                zeroClique: { type: Type.NUMBER },
                                etica: { type: Type.NUMBER },
                                cta: { type: Type.NUMBER }
                              },
                              required: ["conexao", "scrollStopper", "storytelling", "posicionamento", "autoridade", "zeroClique", "etica", "cta"]
                            },
                            media: { type: Type.NUMBER, description: "Média aritmética das notas de V2 de 0 a 10, que obrigatoriamente deve ser maior que a da V1" }
                          },
                          required: ["notas", "media"]
                        }
                      },
                      required: ["v1", "melhoriasV2", "v2"]
                    }
                  },
                  required: ["id", "titulo", "formato", "framework", "ganchoV1", "gancho", "legendaV1", "legenda", "notasReflexao"]
                }
              }
            },
            required: ["cliente", "posts"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("A API do Gemini retornou uma resposta vazia.");
      }

      const parsedResult = JSON.parse(responseText.trim());
      res.json({ success: true, result: parsedResult });

    } catch (error: any) {
      console.error("Gemini API error, falling back to static structured template:", error);
      
      // Fallback response - perfect for demonstration when the API Key isn't fully configured
      const clientCategory = (client.category || "").toLowerCase();
      const clientNiche = (client.niche || "").toLowerCase();
      const isMedicine = clientCategory.includes("med") || clientNiche.includes("med") || clientNiche.includes("saúde");
      const isLaw = clientCategory.includes("adv") || clientNiche.includes("adv") || clientNiche.includes("dir");

      let mockPosts = [];

      if (isMedicine) {
        mockPosts = [
          {
            id: 1,
            titulo: "Por que exames de rotina não são perda de tempo",
            formato: "Carrossel",
            framework: "PAS (Problema-Agitação-Solução)",
            ganchoV1: "Como saber se você precisa fazer um check-up médico urgentemente",
            gancho: "⚠️ O perigo silencioso de se sentir 'perfeitamente bem'",
            slides: [
              {
                numero: 1,
                titulo: "Sentir-se bem é suficiente?",
                texto: "Muitas doenças graves se desenvolvem silenciosamente por anos, sem apresentar um único sintoma na fase inicial.",
                design: "Fundo cinza-escuro com texto em destaque em ciano médico, imagem de um gráfico sutil de batimentos cardíacos."
              },
              {
                numero: 2,
                titulo: "A ilusão do bem-estar",
                texto: "Hipertensão, diabetes inicial e até tumores em estágio inicial não avisam. Esperar os sintomas aparecerem para ir ao médico é um risco evitável.",
                design: "Design limpo, ícone de alerta vermelho sutil ao lado do texto e layout de alto contraste."
              },
              {
                numero: 3,
                titulo: "O Poder da Prevenção",
                texto: "Check-ups anuais simples detectam alterações antes que elas se tornem problemas crônicos. Economize estresse e ganhe anos de vida saudável.",
                design: "Fundo com tons suaves, ilustração de escudo protetor ou médico estilizado."
              },
              {
                numero: 4,
                titulo: "Sua Saúde em Primeiro Lugar",
                texto: "Planeje seus exames hoje mesmo. Converse com seu médico de confiança e viva com segurança de verdade.",
                design: "Slide final focado em ação, fundo em azul-petróleo escuro com destaque visual para o texto principal."
              }
            ],
            legendaV1: "Você se sente saudável e não vai ao médico? Isso pode ser um erro perigoso para sua integridade. É fundamental fazer exames de rotina uma vez por ano para detectar problemas graves de forma super precoce, antes que piore. Na nossa clínica de cardiologia fazemos check-ups completos com as melhores máquinas. Agende já sua consulta pelo link da bio! #saude #checkup",
            legenda: "Você costuma deixar sua saúde para depois por 'estar se sentindo bem'?\n\nNa medicina, o maior aliado do tratamento eficaz é o diagnóstico precoce. Check-ups preventivos periódicos analisam marcadores cruciais que nos mostram exatamente o que está acontecendo por dentro antes que qualquer sintoma surja.\n\nPrevenir é um ato de responsabilidade com você e com quem você ama. Compartilhe esse post com alguém que precisa marcar a consulta anual!\n\n#medicinapreventiva #saudeemdia #checkupmedico #qualidadedevida #bemestar",
            notasReflexao: {
              v1: {
                notas: { conexao: 7.5, scrollStopper: 6.8, storytelling: 7.0, posicionamento: 7.2, autoridade: 8.0, zeroClique: 6.5, etica: 9.5, cta: 7.0 },
                media: 7.4
              },
              melhoriasV2: "Aumentei o gancho emocional no Slide 1 para reter atenção imediata, enriqueci a explicação do Slide 3 para dar mais profundidade técnica (ética e informativa, sem promessas) e refinei a chamada final tornando-a mais humanizada.",
              v2: {
                notas: { conexao: 9.0, scrollStopper: 8.8, storytelling: 8.5, posicionamento: 8.8, autoridade: 9.2, zeroClique: 8.6, etica: 10.0, cta: 8.9 },
                media: 9.0
              }
            }
          },
          {
            id: 2,
            titulo: "3 Erros Comuns na Alimentação Diária",
            formato: "Reels",
            framework: "AIDA (Atenção, Interesse, Desejo, Ação)",
            ganchoV1: "3 coisas erradas que você come todo dia sem saber na dieta",
            gancho: "Você acha que come saudável, mas comete um destes 3 erros comuns?",
            roteiroReels: {
              cenas: [
                { tempo: "0-3s", acao: "Vídeo focado no profissional preparando um prato colorido, olhando para a câmera com expressão de alerta.", fala: "Você tenta comer saudável, mas sente que seu rendimento e peso não mudam? Você pode estar cometendo um desses 3 erros comuns na rotina." },
                { tempo: "3-8s", acao: "Corta para o prato com destaque para o excesso de azeite ou molhos aparentemente leves.", fala: "Erro 1: Ignorar calorias líquidas e molhos prontos. Eles sabotam seu progresso silenciosamente." },
                { tempo: "8-13s", acao: "Profissional apontando para opções de proteínas na bancada.", fala: "Erro 2: Subestimar a ingestão diária de proteínas de qualidade, o que reduz sua saciedade e queima muscular." },
                { tempo: "13-15s", acao: "Profissional sorrindo, oferecendo um copo de água e apontando para a legenda.", fala: "Me siga para receber dicas diárias baseadas em ciência médica de forma simples e descomplicada!" }
              ]
            },
            legendaV1: "Muitas pessoas comem achando que estão saudáveis, mas cometem muitos erros alimentares graves na sua dieta diária. Por exemplo, exagerar no azeite ou não comer proteína suficiente para segurar a fome. Siga meu perfil para emagrecer rápido e garantir resultados fantásticos na sua saúde! #dieta #emagrecer",
            legenda: "Alimentar-se bem vai muito além de apenas comer salada.\n\nEntender o equilíbrio de macronutrientes e a densidade calórica é vital para que suas escolhas saudáveis de fato reflitam em mais disposição, melhora de foco e metabolismo ativo.\n\nSalve este post para consultar antes das suas refeições!\n\n#nutricao #alimentacaosaudavel #saude #qualidadedevida #medicinaesportiva",
            notasReflexao: {
              v1: {
                notas: { conexao: 7.0, scrollStopper: 7.5, storytelling: 6.5, posicionamento: 7.0, autoridade: 8.0, zeroClique: 6.0, etica: 9.5, cta: 7.0 },
                media: 7.3
              },
              melhoriasV2: "Ajustei o ritmo do roteiro de Reels para que cada erro apresentasse um corte visual dinâmico, elevando o valor de Zero Clique no roteiro técnico e garantindo conformidade educativa estrita com as regras do CFM.",
              v2: {
                notas: { conexao: 8.8, scrollStopper: 9.2, storytelling: 8.6, posicionamento: 8.5, autoridade: 9.0, zeroClique: 8.2, etica: 10.0, cta: 8.8 },
                media: 8.9
              }
            }
          }
        ];
      } else if (isLaw) {
        mockPosts = [
          {
            id: 1,
            titulo: "Demissão sem justa causa: O que você realmente recebe?",
            formato: "Carrossel",
            framework: "PAS (Problema-Agitação-Solução)",
            ganchoV1: "Saiba quanto de dinheiro você vai ganhar na sua demissão sem justa causa!",
            gancho: "Fui demitido sem justa causa. E agora, quais são os meus direitos exatos?",
            slides: [
              {
                numero: 1,
                titulo: "Fui demitido. O que recebo?",
                texto: "A saída repentina de um emprego gera ansiedade e dúvidas sobre o acerto de contas. Saber seus direitos previne abusos.",
                design: "Fundo sóbrio em azul-marinho e cinza-grafite, tipografia serifada elegante que transmite seriedade."
              },
              {
                numero: 2,
                titulo: "A lista de verbas obrigatórias",
                texto: "Você tem direito a: Saldo de salário, Aviso Prévio indenizado ou trabalhado, 13º proporcional, Férias vencidas/proporcionais + 1/3, e saque do FGTS.",
                design: "Tabela visualmente limpa e bem diagramada mostrando cada item de forma clara e legível."
              },
              {
                numero: 3,
                titulo: "A multa de 40% do FGTS",
                texto: "A empresa deve depositar o valor equivalente a 40% sobre todos os depósitos feitos ao longo do seu contrato na conta vinculada.",
                design: "Ícone de cifrão sutil in dourado com fundo sóbrio, destacando a regra da multa rescisória."
              },
              {
                numero: 4,
                titulo: "Fique atento aos prazos",
                texto: "O pagamento das verbas rescisórias deve ocorrer em até 10 dias corridos do término do contrato. Compartilhe e salve para consultar!",
                design: "Destaque visual para o prazo de 10 dias com fonte monoestilizada."
              }
            ],
            legendaV1: "Se você foi demitido, a empresa é obrigada a te pagar muito dinheiro em rescisão! Você tem direito a cobrar tudo: aviso prévio integral, férias completas, décimo terceiro e a multa do FGTS. Não deixe patrão te enganar! Entre em contato agora mesmo com a nossa equipe de advogados agressivos para processarmos a empresa e resgatar o que é seu! #rescisao #advocacia #processo",
            legenda: "A rescisão do contrato de trabalho por iniciativa do empregador e sem justa causa exige o cumprimento rigoroso de diversas obrigações legais.\n\nEstar ciente de cada verba, do prazo de pagamento de 10 dias e da entrega das guias para seguro-desemprego é essencial para garantir a transição financeira com estabilidade.\n\nFicou com alguma dúvida sobre o cálculo das verbas? Consulte sempre um profissional de advocacia trabalhista de sua confiança. Salve o post para consultar quando precisar!\n\n#direitotrabalhista #rescisao #trabalhador #clt #direitodoconsumidor #advocacia",
            notasReflexao: {
              v1: {
                notas: { conexao: 7.8, scrollStopper: 7.0, storytelling: 6.8, posicionamento: 7.5, autoridade: 8.2, zeroClique: 7.0, etica: 9.8, cta: 6.5 },
                media: 7.5
              },
              melhoriasV2: "Aprimorei a clareza da diagramação das verbas rescisórias para entregar valor prático imediato de forma educativa e estritamente informativa, respeitando o Código de Ética da OAB (sem induzir ao litígio).",
              v2: {
                notas: { conexao: 9.1, scrollStopper: 8.7, storytelling: 8.4, posicionamento: 8.9, autoridade: 9.3, zeroClique: 8.8, etica: 10.0, cta: 8.5 },
                media: 9.0
              }
            }
          },
          {
            id: 2,
            titulo: "Contrato de Prestação de Serviços: Proteja seu Negócio",
            formato: "Post Estático",
            framework: "BAB (Before-After-Bridge)",
            ganchoV1: "Faça um contrato blindado para não tomar calote de cliente folgado",
            gancho: "O erro silencioso que faz prestadores de serviço perderem milhares de reais",
            legendaV1: "Operar sem contrato é pedir para tomar prejuízo e lidar com dor de cabeça. Se você quer garantir o recebimento dos seus pagamentos sem atrasos e sem reclamação, você precisa de um contrato blindado de prestação de serviços. Elaboramos contratos personalizados extremamente econômicos. Clique no link para fazer o seu agora! #contrato #prestador",
            legenda: "Você já realizou um serviço e teve problemas para receber, ou o cliente exigiu mais do que foi combinado originalmente?\n\nAntes desse pesadelo, muitos profissionais operam apenas com base em acordos verbais pelo WhatsApp. O resultado quase sempre é desgaste, retrabalho e prejuízo.\n\nDepois de implementar um Contrato de Prestação de Serviços sob medida, você passa a ter clareza de escopo, prazos definidos, regras de cancelamento justas e segurança jurídica de pagamento.\n\nA ponte para essa tranquilidade é estabelecer um contrato robusto que proteja ambas as partes de forma preventiva. Não espere o problema acontecer para se resguardar.\n\nSalve esse post para lembrar de formalizar seus próximos negócios!\n\n#advocaciapreventiva #contratos #prestacaodeservicos #segurancajuridica #negocios",
            notasReflexao: {
              v1: {
                notas: { conexao: 7.5, scrollStopper: 7.2, storytelling: 7.0, posicionamento: 7.8, autoridade: 8.0, zeroClique: 6.0, etica: 9.8, cta: 6.8 },
                media: 7.3
              },
              melhoriasV2: "Reestruturei o contraste da dor inicial e o cenário de segurança, eliminando qualquer caráter mercantilista e focando no valor de caráter estritamente educativo conforme provimento da OAB.",
              v2: {
                notas: { conexao: 9.2, scrollStopper: 8.9, storytelling: 8.7, posicionamento: 9.0, autoridade: 9.4, zeroClique: 8.0, etica: 10.0, cta: 8.6 },
                media: 9.0
              }
            }
          }
        ];
      } else {
        mockPosts = [
          {
            id: 1,
            titulo: "Como estruturar seu SaaS para o mercado atual",
            formato: "Carrossel",
            framework: "AIDA (Atenção, Interesse, Desejo, Ação)",
            ganchoV1: "Como fazer seu software SaaS crescer muito rápido no mercado",
            gancho: "🚀 O segredo dos SaaS que crescem 3x mais rápido sem queimar caixa",
            slides: [
              {
                numero: 1,
                titulo: "Crescer sem queimar caixa?",
                texto: "O mercado mudou. Hoje, o foco absoluto está em Product-Led Growth (PLG) e eficiência operacional.",
                design: "Design com bento grid moderno, contrastes elegantes de azul escuro com acentos violetas e brancos."
              },
              {
                numero: 2,
                titulo: "Foco no Primeiro Valor",
                texto: "Reduza o 'time-to-value' (TTV) ao mínimo. O usuário precisa experimentar o poder do seu software nos primeiros 2 minutos de uso.",
                design: "Ilustração simples de uma barra de progresso acelerada com ícones limpos."
              },
              {
                numero: 3,
                titulo: "Indicação Orgânica Viral",
                texto: "Crie loops de recomendação nativos no seu fluxo. Permita que usuários convidem colegas para colaborar com apenas um clique.",
                design: "Fluxograma minimalista mostrando convites bidirecionais elegantes."
              },
              {
                numero: 4,
                titulo: "Itere Constantemente",
                texto: "Foque no feedback prático. Clique no link do nosso perfil para ler o artigo completo sobre estratégias PLG modernas!",
                design: "Layout elegante de call to action final, cores sóbrias e limpas."
              }
            ],
            legendaV1: "Quer fazer seu software decolar e ter milhares de clientes? Você precisa focar em estratégias de crescimento e otimizar seu funil de vendas. Faça seu onboarding ser simples e adicione botões de convidar amigos. Se quiser aprender a decolar sua startup, acesse nosso site agora! #saas #startups",
            legenda: "A era do crescimento a qualquer custo no mercado de tecnologia e SaaS deu lugar à eficiência operacional e retenção sólida.\n\nEstratégias de Product-Led Growth (PLG) garantem que o próprio produto seja o maior vetor de aquisição e retenção, reduzindo o custo de aquisição de clientes (CAC) de forma drástica.\n\nComo está o TTV do seu produto hoje? Comente abaixo! Salve este carrossel se foi útil para o seu time de produto.\n\n#saasgrowth #tecnologia #plg #startups #productmanagement #businessmodel",
            notasReflexao: {
              v1: {
                notas: { conexao: 7.2, scrollStopper: 7.5, storytelling: 6.8, posicionamento: 7.2, autoridade: 7.8, zeroClique: 6.5, etica: 9.0, cta: 7.0 },
                media: 7.3
              },
              melhoriasV2: "Aprimorei a profundidade técnica do Slide 2 trazendo o conceito de Time-to-Value (TTV), melhorei a fluidez dos tópicos gerando uma conexão narrativa e reforcei as métricas de conversão e valor de Zero Clique.",
              v2: {
                notas: { conexao: 9.0, scrollStopper: 9.1, storytelling: 8.8, posicionamento: 8.9, autoridade: 9.2, zeroClique: 8.5, etica: 10.0, cta: 8.8 },
                media: 9.0
              }
            }
          },
          {
            id: 2,
            titulo: "Produtividade Inteligente: O método de 3 etapas",
            formato: "Post Estático",
            framework: "PAS (Problema-Agitação-Solução)",
            ganchoV1: "Como ser mais produtivo e fazer as suas tarefas muito mais rápido",
            gancho: "Você termina o dia esgotado e com a sensação de não ter feito nada relevante?",
            legendaV1: "Se você não tem foco e vive cansado, você precisa de um método de produtividade. Escolha sua principal tarefa do dia, faça ela primeiro e organize suas tarefas da tarde em blocos de tempo no seu calendário. Isso vai dobrar sua produtividade de forma inacreditável. Siga nosso perfil para mais hacks fantásticos de foco! #produtividade #gestaodotempo",
            legenda: "Você inicia o dia com uma lista gigante de tarefas e encerra exausto, sentindo que apenas apagou incêndios?\n\nA agitação mental e o excesso de micro-notificações fragmentam sua atenção, destruindo a produtividade profunda (deep work) e gerando frustração diária constante.\n\nA solução real é o método de 3 etapas de produtividade inteligente:\n1. Defina apenas 1 Grande Alvo para o seu dia.\n2. Dedique os primeiros 90 minutos de trabalho a ele, sem distrações.\n3. Agrupe micro-tarefas em blocos de tempo específicos na tarde.\n\nExperimente essa rotina por uma semana e observe seu foco retornar.\n\nQual dessas etapas você mais precisa implementar hoje? Deixe nos comentários! Salve para estruturar seu dia amanhã!\n\n#produtividade #foco #gestaodotempo #deepwork #altaperformance #carreira",
            notasReflexao: {
              v1: {
                notas: { conexao: 7.5, scrollStopper: 7.0, storytelling: 7.2, posicionamento: 7.0, autoridade: 7.5, zeroClique: 6.5, etica: 9.5, cta: 6.8 },
                media: 7.2
              },
              melhoriasV2: "Refinei o gancho da dor na legenda com gatilhos reais de identificação, organizei as etapas de forma ultra-clara e visual com listas numeradas para aumentar o valor imediato do post.",
              v2: {
                notas: { conexao: 9.2, scrollStopper: 8.8, storytelling: 8.7, posicionamento: 8.5, autoridade: 8.9, zeroClique: 8.8, etica: 10.0, cta: 8.7 },
                media: 8.9
              }
            }
          }
        ];
      }

      res.json({
        success: true,
        result: {
          cliente: client.name,
          posts: mockPosts
        },
        notice: "Mostrando amostra estruturada de copywriting de altíssimo nível. Configure sua GEMINI_API_KEY no painel de Secrets para ativar a geração ao vivo com inteligência artificial crítica."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
