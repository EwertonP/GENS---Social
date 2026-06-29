import React, { useState, useEffect } from "react";
import { Client } from "../types";
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  ShieldAlert, 
  Sparkles, 
  Info, 
  Users, 
  History, 
  Award, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  FileSignature, 
  Bookmark, 
  Briefcase,
  HelpCircle
} from "lucide-react";

interface ClientFormProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const CATEGORY_PRESETS: { [key: string]: { rules: string; brandVoices: string[] } } = {
  Medicina: {
    rules: "Respeitar estritamente o CFM (Conselho Federal de Medicina). Proibido prometer curas, garantir resultados, expor fotos de antes e depois de pacientes, ou usar tom autopromocional sensacionalista. O tom deve ser estritamente informativo, educativo, preventivo e científico.",
    brandVoices: ["Autoridade Médica e Científica", "Humanizada e Empática", "Didática e Preventiva"]
  },
  Advocacia: {
    rules: "Respeitar o Código de Ética da OAB. Proibida a captação mercantilista de clientela, indução ao litígio, divulgação de preços ou promessa de ganho de causa. O foco deve ser estritamente informativo, prestando esclarecimentos sobre direitos e deveres sociais.",
    brandVoices: ["Sóbria e Institucional", "Pragmática e Protetora", "Esclarecedora e Direta"]
  },
  Tecnologia: {
    rules: "Foco em inovação, eficiência, agilidade e escalabilidade de processos. Pode utilizar terminologias do ecossistema de startups e focar em crescimento rápido (growth).",
    brandVoices: ["Disruptiva e Inovadora", "Prática e Tecnológica", "Futurista e Otimista"]
  },
  Finanças: {
    rules: "Seguir diretrizes éticas básicas da CVM (se aplicável), evitando promessas irrealistas de enriquecimento rápido, rentabilidade garantida ou jargões abusivos de 'fique rico rápido'.",
    brandVoices: ["Analítica e Segura", "Educativa e Próspera", "Pragmática e Transparente"]
  },
  Imobiliário: {
    rules: "Transmitir confiança jurídica, solidez patrimonial e apelo aspiracional de moradia de forma ética e transparente.",
    brandVoices: ["Aspiracional e Sofisticada", "Prática e Facilitadora", "Segura e Familiar"]
  },
  "Estética/Beleza": {
    rules: "Cuidar com alegações médicas de cura dermatológica se não for médico habilitado. Focar na autoestima, bem-estar, autocuidado e beleza de forma ética e segura.",
    brandVoices: ["Inspiradora e Acolhedora", "Sofisticada e Moderna", "Confiante e Vibrante"]
  },
  Outro: {
    rules: "Seguir os princípios gerais do copywriting ético: sem falsas promessas, com transparência e clareza de valor.",
    brandVoices: ["Profissional e Direta", "Amigável e Descontraída", "Didática e Inspiradora"]
  }
};

export default function ClientForm({ clients, onAddClient, onDeleteClient }: ClientFormProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // 1. Informações Básicas
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tecnologia");
  const [niche, setNiche] = useState("");
  const [mainProductService, setMainProductService] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [nicheRules, setNicheRules] = useState("");

  // 2. Perfil do Cliente Ideal (ICP)
  const [painPoints, setPainPoints] = useState("");
  const [desires, setDesires] = useState("");

  // 3. Histórico de Conteúdo
  const [contentHistory, setContentHistory] = useState("");

  // 4. Diretrizes de Qualidade e Critério
  const [preferredContentType, setPreferredContentType] = useState("");
  const [frequency, setFrequency] = useState("1 a 2 conteúdos por semana");

  // Update presets automatically when category changes
  useEffect(() => {
    const preset = CATEGORY_PRESETS[category] || CATEGORY_PRESETS["Outro"];
    setNicheRules(preset.rules);
    setBrandVoice(preset.brandVoices[0]);
  }, [category]);

  const fillExampleData = () => {
    setName("Clínica CardioVitta");
    setCategory("Medicina");
    setNiche("Hospital de Cardiologia e Arritmia");
    setMainProductService("Check-up cardiológico preventivo premium e eletrocardiogramas sob demanda.");
    setBrandVoice("Didática e Preventiva (segura, acolhedora e extremamente profissional)");
    setPainPoints("Medo de infarto silencioso na família, sedentarismo acumulado e falta de tempo para marcar consultas preventivas.");
    setDesires("Ter a segurança de que o coração está saudável, entender exames de forma simples e cultivar hábitos de longevidade.");
    setContentHistory("- Vídeo Reels sobre 'Como prevenir infartos no inverno'\n- Post estático com checklist '3 sintomas no peito que você nunca deve ignorar'\n- Carrossel explicando o que é arritmia benigna vs. maligna");
    setPreferredContentType("Conteúdo educativo técnico e informativo (Reels rápidos com dicas preventivas)");
    setFrequency("1 a 2 conteúdos por semana");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      niche: niche.trim() || `${category} Geral`,
      category,
      nicheRules: nicheRules.trim(),
      mainProductService: mainProductService.trim(),
      brandVoice: brandVoice.trim(),
      painPoints: painPoints.trim() || "Não especificado",
      desires: desires.trim() || "Não especificado",
      contentHistory: contentHistory.trim() || "Sem histórico anterior registrado",
      preferredContentType: preferredContentType.trim() || "Geral / Multi-formato",
      frequency: frequency.trim(),
      createdAt: new Date().toISOString()
    };

    onAddClient(newClient);
    
    // Reset form
    setName("");
    setNiche("");
    setMainProductService("");
    setPainPoints("");
    setDesires("");
    setContentHistory("");
    setPreferredContentType("");
    setFrequency("1 a 2 conteúdos por semana");
    setCategory("Tecnologia");
    setShowAddForm(false);
  };

  const toggleExpandClient = (id: string) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  return (
    <div className="space-y-6" id="client-form-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Carteira de Clientes</h2>
          <p className="text-xs text-slate-500">Cadastre o briefing estruturado obrigatório e analise o histórico das marcas.</p>
        </div>
        <div className="flex items-center gap-2">
          {showAddForm && (
            <button
              type="button"
              onClick={fillExampleData}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold py-2 px-3 border border-slate-200 rounded-full transition-all cursor-pointer"
              id="fill-example-btn"
            >
              <Sparkles size={12} className="text-[#005C66]" />
              Preencher Exemplo
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-full transition-all cursor-pointer ${
              showAddForm 
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" 
                : "bg-[#005C66] hover:bg-[#004D55] text-white shadow-md shadow-[#005C66]/10"
            }`}
            id="toggle-add-client-btn"
          >
            {showAddForm ? "Cancelar" : "Novo Cliente"}
            {!showAddForm && <UserPlus size={14} />}
          </button>
        </div>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-2xl border border-slate-250 p-5 sm:p-6 space-y-6 shadow-xl animate-fade-in"
          id="add-client-form"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSignature className="text-[#005C66]" size={18} />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Formulário de Briefing Obrigatório</h3>
                <p className="text-[10px] text-slate-400">Responda a todas as seções técnicas antes de finalizar o cadastro.</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#005C66]/5 text-[#005C66] font-mono font-bold px-2.5 py-1 rounded-full border border-[#005C66]/15 uppercase">
              Cadastro Ativo
            </span>
          </div>

          {/* Section 1: Informações Básicas */}
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
            <h4 className="text-xs font-bold text-[#005C66] flex items-center gap-2">
              <span className="bg-[#005C66] text-white rounded-full w-5 h-5 flex items-center justify-center font-mono text-[10px]">1</span>
              Informações Básicas
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Nome da Marca / Profissional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Clarissa Mendes, Alencar Advocacia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-3xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Categoria de Compliance</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition-all cursor-pointer shadow-3xs"
                >
                  {Object.keys(CATEGORY_PRESETS).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Nicho de Atuação Específico *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hospital de Cardiologia, Advogado Trabalhista"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-3xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Produto/Serviço Principal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta diagnóstica, Mentoria SaaS, Defesa de passivo"
                  value={mainProductService}
                  onChange={(e) => setMainProductService(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-3xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Tom de Voz *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Autoridade científica, didático, sóbrio e protetor"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-3xs"
                />
              </div>
            </div>

            {/* Ethics Rules Panel */}
            <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-200/50 space-y-1">
              <div className="flex items-center gap-1 text-amber-800">
                <ShieldAlert size={12} className="text-amber-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Diretrizes de Compliance de Nicho (Auto-Preenchido)</span>
              </div>
              <textarea
                value={nicheRules}
                onChange={(e) => setNicheRules(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-lg p-2 text-xs text-slate-700 outline-none transition-all resize-none h-16 shadow-3xs"
                placeholder="Descreva as restrições éticas de conselho de classe ou do nicho de mercado."
              />
            </div>
          </div>

          {/* Section 2: Perfil do Cliente Ideal (ICP) */}
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
            <h4 className="text-xs font-bold text-[#005C66] flex items-center gap-2">
              <span className="bg-[#005C66] text-white rounded-full w-5 h-5 flex items-center justify-center font-mono text-[10px]">2</span>
              Perfil do Cliente Ideal (ICP)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Dores Principais *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Quais os principais medos, frustrações e gargalos do público? (Ex: Medo de processo, insônia, perda de vendas)"
                  value={painPoints}
                  onChange={(e) => setPainPoints(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none shadow-3xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Desejos *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Quais os sonhos, metas e estado ideal que o público deseja atingir? (Ex: Dormir em paz, escalar vendas, blindar caixa)"
                  value={desires}
                  onChange={(e) => setDesires(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none shadow-3xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Histórico de Conteúdo */}
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
            <h4 className="text-xs font-bold text-[#005C66] flex items-center gap-2">
              <span className="bg-[#005C66] text-white rounded-full w-5 h-5 flex items-center justify-center font-mono text-[10px]">3</span>
              Histórico de Conteúdo (O que já foi feito)
            </h4>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 block">
                Insira links, temas ou ideias de posts/vídeos já produzidos para guiar o tom e evitar repetições:
              </label>
              <textarea
                rows={3}
                placeholder="Ex:&#10;- Vídeo Reels sobre 'Como prevenir infartos no inverno'&#10;- Post estático 'Direitos do trabalhador demitido'"
                value={contentHistory}
                onChange={(e) => setContentHistory(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none shadow-3xs"
              />
            </div>
          </div>

          {/* Section 4: Diretrizes de Qualidade e Critério */}
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
            <h4 className="text-xs font-bold text-[#005C66] flex items-center gap-2">
              <span className="bg-[#005C66] text-white rounded-full w-5 h-5 flex items-center justify-center font-mono text-[10px]">4</span>
              Diretrizes de Qualidade e Critério
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Tipo de Conteúdo Preferido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conteúdo educativo técnico, Reels informativo rápido, Carrosséis visuais"
                  value={preferredContentType}
                  onChange={(e) => setPreferredContentType(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-3xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Frequência Semanal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1 a 2 conteúdos por semana, Diário"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-3xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#005C66] hover:bg-[#004D55] text-white text-xs font-bold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus size={14} />
              Finalizar Cadastro e Salvar Perfil
            </button>
          </div>
        </form>
      )}

      {/* Clients Grid & List of briefings */}
      <div className="grid grid-cols-1 gap-5" id="clients-list">
        {clients.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <Bookmark className="mx-auto text-slate-300" size={32} />
            <h3 className="text-sm font-semibold text-slate-700">Nenhum cliente cadastrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Adicione marcas de forma estruturada completando o formulário obrigatório de 4 seções antes de criar pautas.
            </p>
          </div>
        ) : (
          clients.map((client) => {
            const isExpanded = expandedClientId === client.id;
            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between group shadow-xs overflow-hidden"
                id={`client-card-${client.id}`}
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#005C66]/10 text-[#005C66] border border-[#005C66]/15 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {client.category || "Marca"}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                          {client.niche}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800 tracking-tight mt-1">
                        {client.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => toggleExpandClient(client.id)}
                        className="text-slate-500 hover:text-[#005C66] p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        title={isExpanded ? "Recolher Detalhes" : "Expandir Briefing"}
                      >
                        {isExpanded ? "Ocultar Briefing" : "Ver Briefing Completo"}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                        title="Excluir Perfil de Cliente"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* High level info overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Serviço Principal</span>
                      <p className="text-slate-700 font-medium truncate">{client.mainProductService || "Não especificado"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tom de Voz</span>
                      <p className="text-slate-700 font-medium truncate">{client.brandVoice || "Não especificado"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Frequência</span>
                      <p className="text-slate-700 font-medium truncate">{client.frequency || "Não especificada"}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Briefing (Sectioned layout matching user requirements) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6 space-y-6 animate-fade-in text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs border-b border-slate-200 pb-2 mb-4">
                      <Bookmark size={14} className="text-[#005C66]" />
                      <span>Ficha de Briefing de Copywriting & Histórico</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Section 1 & 4 */}
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-3xs">
                          <h4 className="font-extrabold text-[#005C66] text-xs flex items-center gap-1.5">
                            <Briefcase size={13} />
                            1. Informações Básicas
                          </h4>
                          <ul className="space-y-2 text-slate-600 font-medium">
                            <li><strong className="text-slate-800">Nicho:</strong> {client.niche}</li>
                            <li><strong className="text-slate-800">Categoria de Compliance:</strong> {client.category}</li>
                            <li><strong className="text-slate-800">Produto Principal:</strong> {client.mainProductService}</li>
                            <li><strong className="text-slate-800">Tom de Voz:</strong> {client.brandVoice}</li>
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-3xs">
                          <h4 className="font-extrabold text-[#005C66] text-xs flex items-center gap-1.5">
                            <Calendar size={13} />
                            4. Diretrizes de Qualidade e Frequência
                          </h4>
                          <ul className="space-y-2 text-slate-600 font-medium">
                            <li><strong className="text-slate-800">Tipo de Conteúdo Preferido:</strong> {client.preferredContentType || "Geral / Informativo"}</li>
                            <li><strong className="text-slate-800">Frequência de Posts:</strong> {client.frequency}</li>
                          </ul>
                        </div>

                        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/50 space-y-1.5 text-[11px] text-slate-600">
                          <span className="font-bold text-amber-800 flex items-center gap-1">
                            <ShieldAlert size={12} className="text-amber-600" />
                            Regras Éticas Aplicadas
                          </span>
                          <p className="leading-relaxed">{client.nicheRules}</p>
                        </div>
                      </div>

                      {/* Section 2 & 3 */}
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-3xs">
                          <h4 className="font-extrabold text-[#005C66] text-xs flex items-center gap-1.5">
                            <Users size={13} />
                            2. Perfil do Cliente Ideal (ICP)
                          </h4>
                          <div className="space-y-2 text-slate-600">
                            <div>
                              <strong className="text-slate-800 block text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#005C66]">Dores Principais:</strong>
                              <p className="leading-relaxed font-medium">{client.painPoints || "Não mapeado"}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                              <strong className="text-slate-800 block text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#005C66]">Desejos:</strong>
                              <p className="leading-relaxed font-medium">{client.desires || "Não mapeado"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-3xs">
                          <h4 className="font-extrabold text-[#005C66] text-xs flex items-center gap-1.5">
                            <History size={13} />
                            3. Histórico de Conteúdo (O que já foi feito)
                          </h4>
                          <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-sans">
                            {client.contentHistory || "Sem histórico anterior registrado."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
