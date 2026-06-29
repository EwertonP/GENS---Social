import React, { useState } from "react";
import { Client, Briefing } from "../types";
import { BrainCircuit, Target, MessageSquare, Settings, Sparkles, Activity } from "lucide-react";

interface BriefingFormProps {
  clients: Client[];
  onGenerate: (briefing: Omit<Briefing, "id" | "createdAt">) => void;
  isGenerating: boolean;
}

const CONVERSION_GOALS = [
  { id: "Autoridade", title: "Construir Autoridade", desc: "Foco técnico, esclarecimento de dúvidas comuns e posicionamento como referência do nicho." },
  { id: "Conexão", title: "Conexão / Engajamento", desc: "Histórias pessoais, bastidores, identificação de dores e fomento de interações nos comentários." },
  { id: "Vendas", title: "Venda Direta / CTA", desc: "Apresentação clara de soluções, quebra de objeções frequentes e chamada clara para ação." },
  { id: "Educativo", title: "Educativo / Valor", desc: "Passo a passo, guias práticos de rotina e ensinamentos que o público pode aplicar no dia." }
];

const COPY_FRAMEWORKS = [
  { id: "AIDA", name: "AIDA (Atenção, Interesse, Desejo, Ação)", desc: "A clássica estrutura publicitária ideal para reels rápidos e posts focados em conversão." },
  { id: "PAS", name: "PAS (Problema, Agitação, Solução)", desc: "Muito poderosa para nichos regulados. Agita uma dor ética e apresenta a saída institucional." },
  { id: "Questão-Solução", name: "Questão ➔ Solução Direta", desc: "Ideal para carrosséis informativos. Coloca uma dúvida técnica comum e resolve em slides." },
  { id: "Storytelling", name: "Storytelling Humanizado", desc: "Foco em reter através de uma narrativa curta, gerando forte identificação com a marca." }
];

export default function BriefingForm({ clients, onGenerate, isGenerating }: BriefingFormProps) {
  const [clientId, setClientId] = useState("");
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("Autoridade");
  const [framework, setFramework] = useState("AIDA");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [customInstructions, setCustomInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !topic.trim() || isGenerating) return;

    onGenerate({
      clientId,
      topic: topic.trim(),
      goal,
      framework,
      model,
      customInstructions: customInstructions.trim()
    });
  };

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm rounded-2xl" id="briefing-form-container">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
        <BrainCircuit className="text-[#005C66]" size={18} />
        <div>
          <h3 className="text-sm font-bold text-slate-800">Criar Nova Pauta Copywriting</h3>
          <p className="text-[11px] text-slate-500">Preencha o briefing técnico para ativar o algoritmo de redação e reflexão.</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 leading-relaxed">
          Você precisa adicionar ao menos um <strong>Cliente</strong> antes de gerar pautas.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Client select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Selecione o Cliente / Marca</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none transition-all cursor-pointer"
            >
              <option value="" disabled className="text-slate-400">Escolha um cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-800 bg-white">{c.name} ({c.niche})</option>
              ))}
            </select>
          </div>

          {/* Prompt / Topic input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Tema Central / Assunto do Post</label>
            <textarea
              required
              rows={2}
              placeholder="Ex: Como blindar sua empresa de riscos trabalhistas na contratação de PJ; Os perigos da automedicação de pele..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none shadow-3xs"
            />
          </div>

          {/* Conversion Goal Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Target size={12} className="text-[#005C66]" />
              Objetivo de Conversão
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONVERSION_GOALS.map((g) => {
                const active = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-slate-50 border-[#005C66] text-slate-900 shadow-3xs"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <h4 className={`text-xs font-bold ${active ? "text-[#005C66]" : "text-slate-800"}`}>{g.title}</h4>
                    <p className={`text-[10px] mt-1 leading-relaxed ${active ? "text-slate-700 font-medium" : "text-slate-500"}`}>{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copywriting Framework Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MessageSquare size={12} className="text-[#005C66]" />
              Framework Estrutural
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COPY_FRAMEWORKS.map((f) => {
                const active = framework === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFramework(f.id)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-slate-50 border-[#005C66] text-slate-900 shadow-3xs"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <h4 className={`text-xs font-bold ${active ? "text-[#005C66]" : "text-slate-800"}`}>{f.name}</h4>
                    <p className={`text-[10px] mt-1 leading-relaxed ${active ? "text-slate-700 font-medium" : "text-slate-500"}`}>{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model toggle & Custom Instructions expander */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Settings size={12} className="text-[#005C66]" />
                Modelo Gemini AI
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none transition-all cursor-pointer"
              >
                <option value="gemini-3.5-flash" className="bg-white text-slate-800">Gemini 3.5 Flash (Velocidade)</option>
                <option value="gemini-3.1-pro-preview" className="bg-white text-slate-800">Gemini 3.1 Pro (Vendas Profundo)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Instruções Customizadas (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Usar metáfora esportiva; Evitar a palavra 'imperdível'."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#005C66] focus:ring-1 focus:ring-[#005C66]/20 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Selected Client Overview Info */}
          {selectedClient && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[10px] text-slate-500 flex items-center justify-between shadow-3xs">
              <div className="truncate pr-4">
                <span>Ativo: <strong className="text-slate-800 font-bold">{selectedClient.name}</strong> ({selectedClient.niche})</span>
                <span className="mx-2 text-slate-300">|</span>
                <span>Tom: {selectedClient.brandVoice}</span>
              </div>
              <span className="text-[#005C66] font-semibold flex items-center gap-1 shrink-0">
                <Activity size={10} />
                Compliance Ativo
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || !clientId || !topic.trim()}
              className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-full transition-all shadow-xs ${
                isGenerating 
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                  : "bg-[#005C66] hover:bg-[#004D55] text-white cursor-pointer shadow-md shadow-[#005C66]/10"
              }`}
            >
              <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Otimizando com Auto-Reflexão..." : "Gerar Copys com Auto-Reflexão V2"}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
