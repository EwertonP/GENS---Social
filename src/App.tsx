import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Layers, 
  Users, 
  Settings as SettingsIcon, 
  History as HistoryIcon, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Plus
} from "lucide-react";

import { Client, Briefing, PlanningResult, GenerationHistory } from "./types";
import ClientForm from "./components/ClientForm";
import BriefingForm from "./components/BriefingForm";
import PostCard from "./components/PostCard";
import Settings from "./components/Settings";

// Initial mock clients for a rich ready-to-test experience
const INITIAL_CLIENTS: Client[] = [
  {
    id: "med-client-1",
    name: "Dra. Clarissa Mendes (Dermatologia)",
    niche: "Dermatologia Estética Preventiva",
    category: "Medicina",
    nicheRules: "Respeitar estritamente o CFM (Conselho Federal de Medicina). Proibido prometer curas, garantir resultados, expor fotos de antes e depois de pacientes, ou usar tom autopromocional sensacionalista. O tom deve ser estritamente informativo, educativo, preventivo e científico.",
    mainProductService: "Tratamentos de rejuvenescimento facial seguro, bioestimuladores de colágeno e rotinas de skincare personalizadas.",
    brandVoice: "Autoridade Médica e Científica (didática, ética e empática)",
    painPoints: "Medo de procedimentos estéticos artificiais, frustração com cremes caros que não trazem resultados e insegurança com o envelhecimento precoce.",
    desires: "Envelhecer com naturalidade, ter uma pele saudável e radiante, e saber exatamente quais produtos usar sem desperdiçar dinheiro.",
    contentHistory: "- Post sobre 'Os perigos de misturar ácidos de skincare sem orientação médica'\n- Vídeo Reels demonstrando 'Como aplicar o protetor solar de forma correta'",
    preferredContentType: "Conteúdo educativo técnico e preventivo (Reels e Carrossel didáticos)",
    frequency: "2 a 3 conteúdos por semana",
    createdAt: new Date().toISOString()
  },
  {
    id: "law-client-1",
    name: "Alencar & Associados (Trabalhista)",
    niche: "Advocacia Trabalhista Empresarial",
    category: "Advocacia",
    nicheRules: "Respeitar o Código de Ética da OAB. Proibida a captação mercantilista de clientela, indução ao litígio, divulgação de preços ou promessa de ganho de causa. O foco deve ser estritamente informativo, prestando esclarecimentos sobre direitos e deveres sociais.",
    mainProductService: "Consultoria e assessoria preventiva trabalhista para adequação de contratos e redução de passivos jurídicos.",
    brandVoice: "Sóbria e Institucional (segura, clara, técnica e preventiva)",
    painPoints: "Medo de processos trabalhistas inesperados por falta de compliance, confusão com a legislação de terceirizados e PJ, e passivos trabalhistas altos.",
    desires: "Blindar a empresa juridicamente, ter contratos claros e seguros, e manter a paz de espírito focando no crescimento do negócio.",
    contentHistory: "- Post estático explicativo sobre 'Os 3 maiores riscos de contratar um PJ de forma incorreta'\n- Carrossel informativo sobre 'Como funciona a demissão sem justa causa e suas verbas'",
    preferredContentType: "Carrossel informativo de alto valor e posts de compliance preventivo",
    frequency: "1 a 2 conteúdos por semana",
    createdAt: new Date().toISOString()
  }
];

// Animation variants for staggered list item presentation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "history" | "settings">("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [currentResult, setCurrentResult] = useState<PlanningResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationNotice, setGenerationNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complianceStrict, setComplianceStrict] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load initial state from LocalStorage
  useEffect(() => {
    const savedClients = localStorage.getItem("copywriter_clients");
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem("copywriter_clients", JSON.stringify(INITIAL_CLIENTS));
    }

    const savedHistory = localStorage.getItem("copywriter_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Sync client list
  const handleAddClient = (newClient: Client) => {
    const updated = [newClient, ...clients];
    setClients(updated);
    localStorage.setItem("copywriter_clients", JSON.stringify(updated));
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem("copywriter_clients", JSON.stringify(updated));
  };

  // Run the copywriting generation process via the local backend
  const handleGenerateCopy = async (briefingData: Omit<Briefing, "id" | "createdAt">) => {
    setIsGenerating(true);
    setGenerationError("");
    setGenerationNotice("");
    setCurrentResult(null);

    const clientObj = clients.find(c => c.id === briefingData.clientId);
    if (!clientObj) return;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: clientObj,
          briefing: briefingData
        })
      });

      const data = await response.json();

      if (data.success && data.result) {
        setCurrentResult(data.result);
        if (data.notice) {
          setGenerationNotice(data.notice);
        }

        // Add to history
        const historyId = Math.random().toString(36).substr(2, 9);
        const historyItem: GenerationHistory = {
          id: historyId,
          clientId: clientObj.id,
          clientName: clientObj.name,
          briefing: {
            ...briefingData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
          },
          result: {
            ...data.result,
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        };

        const updatedHistory = [historyItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("copywriter_history", JSON.stringify(updatedHistory));
      } else {
        throw new Error(data.error || "Ocorreu uma falha ao processar o conteúdo.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Erro de conexão com a API do Google AI Studio.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter history items if a search query is present
  const filteredHistory = history.filter(item => 
    item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.briefing.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex font-sans antialiased selection:bg-[#005C66]/10 selection:text-[#005C66]">
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#005C66] p-1.5 rounded-lg text-white">
            <BrainCircuit size={16} />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">Sequence Copy</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg focus:outline-none"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dark overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar (Menu Lateral) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col flex-1">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
            <div className="bg-[#005C66] p-2 rounded-xl text-white">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 tracking-tight">Sequence</span>
                <span className="bg-[#10B981]/15 text-[#059669] border border-[#10B981]/25 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">B2B Copywriting Hub</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-4 space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-6 block">
                Geral
              </span>
              <div className="space-y-0.5 px-3">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-slate-100 text-[#005C66]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Painel de Pautas
                </button>
                <button
                  onClick={() => {
                    setActiveTab("clients");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "clients"
                      ? "bg-slate-100 text-[#005C66]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Users size={16} />
                  Carteira de Clientes
                </button>
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-slate-100 text-[#005C66]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <HistoryIcon size={16} />
                  Histórico de Ganchos
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-6 block">
                Configurações
              </span>
              <div className="space-y-0.5 px-3">
                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-slate-100 text-[#005C66]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <SettingsIcon size={16} />
                  Integração Gemini AI
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Area: Controls & Profile */}
        <div className="space-y-4 pt-4">
          {/* Compliance Toggle Option */}
          <div className="px-6 py-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-700">Filtro CFM/OAB</span>
                <span className="text-[9px] text-slate-400">Garante ética do nicho</span>
              </div>
              <button 
                onClick={() => setComplianceStrict(!complianceStrict)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-none ${
                  complianceStrict ? "bg-[#10B981]" : "bg-slate-200"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-xs transform transition-transform duration-200 ${
                  complianceStrict ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>
            {complianceStrict && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-1.5">
                <ShieldCheck size={11} />
                Filtro Ativo em Tempo Real
              </div>
            )}
          </div>

          {/* User profile bar */}
          <div className="mx-4 mb-4 p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#005C66] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                EP
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">Ewerton Phillipe</h4>
                <p className="text-[10px] text-slate-400 truncate font-mono leading-none mt-0.5">ewertonphillipe18@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen pt-14 lg:pt-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          
          {/* Top Search bar */}
          <div className="relative max-w-md w-full sm:block hidden">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar marcas, ganchos ou copys..."
              className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:bg-white focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="sm:hidden block">
            <span className="text-xs font-bold text-slate-800">
              {activeTab === "dashboard" && "Painel de Pautas"}
              {activeTab === "clients" && "Clientes"}
              {activeTab === "history" && "Histórico"}
              {activeTab === "settings" && "Configurações"}
            </span>
          </div>

          {/* Current Info Indicators */}
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-full">
              <Activity size={12} className="text-emerald-500" />
              Conexão Segura
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini Pro Ativo
            </span>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD (Pautas & Copys) */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex flex-col"
              >
                {/* Sequence-style Deep Teal Header Banner */}
                <div className="relative bg-gradient-to-r from-[#005C66] to-[#0A4F57] rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none">
                    <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  </div>

                  <div className="space-y-2 relative z-10">
                    <span className="text-[10px] font-bold tracking-widest text-[#10B981] uppercase font-mono bg-white/10 px-2.5 py-1 rounded-full">
                      Dashboard de Performance
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Copywriter AI Pro
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-medium leading-relaxed">
                      Crie pautas de copywriting com algoritmo de Auto-Reflexão Crítica e filtros éticos de CFM e OAB automáticos para medicina, advocacia e negócios.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 shrink-0 relative z-10">
                    <button
                      onClick={() => {
                        const target = document.getElementById("briefing-form-container");
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="bg-[#10B981] hover:bg-[#0E9F6E] text-slate-950 text-xs font-bold py-2.5 px-4 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-[#10B981]/20 cursor-pointer"
                    >
                      <Plus size={14} />
                      Nova Pauta
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-4 rounded-full transition-all border border-white/20 cursor-pointer"
                    >
                      Verificar API
                    </button>
                  </div>
                </div>

                {/* Main Content Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Side: Briefing Inputs */}
                  <div className="lg:col-span-5 space-y-6">
                    <BriefingForm 
                      clients={clients} 
                      onGenerate={handleGenerateCopy} 
                      isGenerating={isGenerating} 
                    />
                    
                    {/* Informative Side Card */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex gap-3 text-xs text-slate-500 shadow-xs">
                      <TrendingUp className="text-[#005C66] shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="font-bold text-slate-800">Como funciona a Auto-Reflexão?</h4>
                        <p className="mt-1 leading-relaxed text-slate-500">
                          Ao gerar uma pauta, a IA cria um rascunho inicial (V1) e o submete a uma sabatina ética de compliance e critérios de persuasão. O sistema recalcula as notas, reescreve as copys e apresenta a versão final otimizada (V2).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Copy & Reflection Output */}
                  <div className="lg:col-span-7 space-y-6" id="dashboard-results-section">
                    {isGenerating && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-[#005C66]/20 border-t-[#005C66] animate-spin" />
                          <BrainCircuit className="absolute inset-0 m-auto text-[#005C66]" size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-800">Refinando Copywriting de Alta Conversão...</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            O motor de Auto-Reflexão Crítica está avaliando o rascunho V1 contra os critérios regulatórios de nicho para preparar a versão final V2.
                          </p>
                        </div>
                      </div>
                    )}

                    {!isGenerating && !currentResult && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 flex flex-col items-center justify-center shadow-sm">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                          <FileText size={32} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Pronto para Gerar</h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                            Escolha uma marca à esquerda, digite o tema que deseja criar e acione o motor de geração para ver as copys otimizadas.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Generation Results Display */}
                    {currentResult && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Notices for Mock FALLBACK or live information */}
                        {generationNotice && (
                          <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-4 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="text-[#059669] shrink-0 mt-0.5" size={16} />
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider block">Nota do Motor Local</span>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {generationNotice}
                              </p>
                            </div>
                          </div>
                        )}

                        {generationError && (
                          <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-start gap-3 text-red-600">
                            <AlertCircle className="shrink-0 mt-0.5" size={16} />
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold">Erro de Processamento</h4>
                              <p className="text-[11px] leading-relaxed">
                                {generationError}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Header block with details */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-base font-bold text-slate-900">Conteúdos Otimizados Criados</h2>
                            <p className="text-[11px] text-slate-500">
                              Marca: <strong className="text-slate-800 font-bold">{currentResult.cliente}</strong>. Copys prontas para copiar.
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                            <Clock size={10} className="text-[#005C66]" />
                            Recém-gerado
                          </span>
                        </div>

                        {/* Map through posts results with stagger transition */}
                        <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="space-y-6"
                        >
                          {currentResult.posts.map((post) => {
                            const clientObj = clients.find(c => c.name === currentResult.cliente);
                            return (
                              <motion.div key={post.id} variants={itemVariants}>
                                <PostCard 
                                  post={post} 
                                  nicheRules={clientObj?.nicheRules} 
                                />
                              </motion.div>
                            );
                          })}
                        </motion.div>

                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: CLIENTS */}
            {activeTab === "clients" && (
              <motion.div
                key="clients-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ClientForm 
                  clients={clients} 
                  onAddClient={handleAddClient} 
                  onDeleteClient={handleDeleteClient} 
                />
              </motion.div>
            )}

            {/* TAB 3: HISTORY */}
            {activeTab === "history" && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Histórico de Planejamento</h2>
                  <p className="text-xs text-slate-500">Acesse posts salvos de sessões anteriores armazenados localmente.</p>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
                    <Clock className="mx-auto text-slate-400" size={32} />
                    <h3 className="text-sm font-semibold text-slate-700">Nenhum planejamento encontrado</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {searchQuery ? "Nenhum item corresponde ao termo de busca pesquisado." : "Cada vez que você gera um plano de posts de sucesso, ele é guardado para consulta rápida aqui."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8" id="history-items-list">
                    {filteredHistory.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-sm transition-all"
                        id={`history-group-${item.id}`}
                      >
                        {/* History card summary header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{item.clientName}</span>
                              <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200 font-mono">
                                {item.briefing.framework} | {item.briefing.goal}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Pauta: "{item.briefing.topic}"
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>

                        {/* Display generated posts of this history pack */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.result.posts.map((post) => (
                            <div 
                              key={post.id}
                              className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-[#005C66]/30 transition-all shadow-3xs"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-[#005C66] uppercase tracking-wider font-bold">
                                    {post.formato} | Post {post.id}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    Média: {post.notasReflexao.v2.media.toFixed(1)}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">{post.titulo}</h4>
                                <p className="text-xs text-slate-500 line-clamp-3 italic">"{post.gancho}"</p>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setCurrentResult(item.result);
                                  setActiveTab("dashboard");
                                  // Smooth scroll to results
                                  setTimeout(() => {
                                    document.getElementById("dashboard-results-section")?.scrollIntoView({ behavior: "smooth" });
                                  }, 100);
                                }}
                                className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold py-2 px-3 rounded-full border border-slate-200 transition-all text-center cursor-pointer"
                              >
                                Ver Cópia Completa e Gráficos
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: SETTINGS (Conexão AI) */}
            {activeTab === "settings" && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Settings />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* SaaS Humble Footer */}
        <footer className="border-t border-slate-200 py-6 bg-white text-center text-[10px] text-slate-400 mt-auto shrink-0">
          <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>Sequence Copy &copy; {new Date().getFullYear()} - Todos os direitos reservados.</span>
            <span className="flex items-center gap-1.5 font-mono text-slate-400">
              <span>Compliance CFM e OAB Ativo</span>
              <span>|</span>
              <span>Motor Google Gemini SDK v3.0.0</span>
            </span>
          </div>
        </footer>

      </div>

    </div>
  );
}
