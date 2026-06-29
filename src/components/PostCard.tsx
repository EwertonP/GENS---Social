import { useState } from "react";
import { Post } from "../types";
import { Copy, Check, FileText, Film, Layers, Sparkles, TrendingUp, AlertCircle, Diff, BarChart3 } from "lucide-react";
import ReflexaoCharts from "./ReflexaoCharts";

// Helper to compute word-by-word diff using Longest Common Subsequence (LCS)
function diffWords(v1: string, v2: string) {
  const words1 = v1.split(/(\s+)/);
  const words2 = v2.split(/(\s+)/);

  if (words1.length * words2.length > 80000) {
    return [
      { type: 'removed' as const, text: v1 },
      { type: 'added' as const, text: v2 }
    ];
  }

  const dp: number[][] = Array(words1.length + 1)
    .fill(null)
    .map(() => Array(words2.length + 1).fill(0));

  for (let i = 1; i <= words1.length; i++) {
    for (let j = 1; j <= words2.length; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = words1.length;
  let j = words2.length;
  const result: { type: 'added' | 'removed' | 'unchanged'; text: string }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      result.unshift({ type: 'unchanged' as const, text: words1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added' as const, text: words2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'removed' as const, text: words1[i - 1] });
      i--;
    }
  }
  return result;
}

function renderDiff(text1: string, text2: string) {
  if (!text1) return <span className="select-text">{text2}</span>;
  if (!text2) return <span className="select-text text-red-700 line-through">{text1}</span>;

  try {
    const diffs = diffWords(text1, text2);
    return (
      <>
        {diffs.map((part, index) => {
          if (part.type === 'removed') {
            return (
              <span
                key={index}
                className="bg-red-100 text-red-800 line-through decoration-red-500 decoration-1 px-0.5 rounded select-text"
              >
                {part.text}
              </span>
            );
          }
          if (part.type === 'added') {
            return (
              <span
                key={index}
                className="bg-emerald-100 text-emerald-800 font-bold px-0.5 rounded select-text"
              >
                {part.text}
              </span>
            );
          }
          return <span key={index} className="select-text">{part.text}</span>;
        })}
      </>
    );
  } catch (error) {
    return <span className="select-text">{text2}</span>;
  }
}

interface PostCardProps {
  key?: any;
  post: Post;
  nicheRules?: string;
}

export default function PostCard({ post, nicheRules }: PostCardProps) {
  const [activeTab, setActiveTab] = useState<"content" | "caption" | "reflection">("content");
  const [subTab, setSubTab] = useState<"diff" | "metrics">("diff");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.legenda);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const hasSlides = post.formato === "Carrossel" && post.slides && post.slides.length > 0;
  const hasReels = post.formato === "Reels" && post.roteiroReels && post.roteiroReels.cenas.length > 0;

  // Compute average score progression
  const scoreDiff = post.notasReflexao.v2.media - post.notasReflexao.v1.media;

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 hover:shadow-md transition-all duration-300 space-y-6 flex flex-col shadow-xs"
      id={`post-card-${post.id}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-[#005C66] border border-[#005C66]/15 text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full">
              Post {post.id}
            </span>
            <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
              {post.formato === "Carrossel" && <Layers size={11} />}
              {post.formato === "Reels" && <Film size={11} />}
              {post.formato === "Post Estático" && <FileText size={11} />}
              {post.formato}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-1">
            {post.titulo}
          </h3>
          <p className="text-xs text-slate-400">
            Foco de Redação: <span className="text-slate-700 font-bold">{post.framework}</span>
          </p>
        </div>

        {/* Reflexão Score Pill */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Qualidade Crítica</span>
            <span className="text-[10px] text-slate-500 font-mono">
              V1: {post.notasReflexao.v1.media.toFixed(1)} ➔ V2:{" "}
              <strong className="text-emerald-600 font-bold">{post.notasReflexao.v2.media.toFixed(1)}</strong>
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg flex flex-col items-center justify-center border border-emerald-100">
            <TrendingUp size={16} />
            <span className="text-[10px] font-mono font-bold">+{scoreDiff.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Prominent Gancho (Hook) Container */}
      <div className="bg-slate-50 border-l-4 border-[#005C66] p-4 rounded-r-xl space-y-1 shadow-3xs">
        <span className="text-[10px] text-[#005C66] font-mono font-bold uppercase tracking-wider">Gancho Inicial (Scroll Stopper)</span>
        <p className="text-sm font-semibold text-slate-800 tracking-tight">
          "{post.gancho}"
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-100" id="post-card-tabs">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "content"
              ? "border-[#005C66] text-[#005C66] font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
          id="tab-content"
        >
          Visual & Roteiro
        </button>
        <button
          onClick={() => setActiveTab("caption")}
          className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "caption"
              ? "border-[#005C66] text-[#005C66] font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
          id="tab-caption"
        >
          Legenda Copywriter
        </button>
        <button
          onClick={() => setActiveTab("reflection")}
          className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "reflection"
              ? "border-[#005C66] text-[#005C66] font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
          id="tab-reflection"
        >
          Auto-Reflexão AI (V1 vs V2)
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 min-h-[250px] flex flex-col">
        {/* TAB 1: CONTENT */}
        {activeTab === "content" && (
          <div className="space-y-4 flex-1">
            {hasSlides && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.slides?.map((slide) => (
                  <div 
                    key={slide.numero}
                    className="bg-slate-50 rounded-xl border border-slate-200/60 p-4 space-y-3 relative overflow-hidden shadow-3xs"
                  >
                    <div className="absolute top-3 right-3 text-2xl font-black text-[#005C66]/5 font-mono select-none">
                      #{slide.numero}
                    </div>
                    <div>
                      <span className="text-[9px] text-[#005C66] font-mono font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        Slide {slide.numero}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-2 pr-6">
                        {slide.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {slide.texto}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">🎨 Sugestão de Design:</span>
                      <p className="text-[10px] text-slate-600 leading-snug font-medium">
                        {slide.design}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasReels && (
              <div className="space-y-3">
                {post.roteiroReels?.cenas.map((cena, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50 rounded-xl border border-slate-200/60 p-4 flex flex-col sm:flex-row gap-4 items-start shadow-3xs"
                  >
                    <div className="bg-white border border-slate-200 text-[#005C66] text-xs font-mono font-bold px-3 py-1 rounded-full sm:w-16 text-center shrink-0">
                      {cena.tempo}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Vídeo & Movimento</span>
                        <p className="text-xs text-slate-700 font-semibold">
                          {cena.acao}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-150">
                        <span className="text-[9px] text-[#005C66] font-mono uppercase tracking-wider block mb-1 font-bold">Fala (Audio)</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          "{cena.fala}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {post.formato === "Post Estático" && (
              <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-5 space-y-4 shadow-3xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#005C66] font-mono font-bold uppercase tracking-wider">Conceito Criativo da Imagem</span>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {post.titulo}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-xs text-slate-500 font-bold block">🎨 Diretrizes do Layout Estático:</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Exibir de forma centralizada o gancho: <strong className="text-[#005C66] font-bold">"{post.gancho}"</strong>. Use fontes limpas e sóbrias que transmitam peso institucional, preferindo imagens realistas de alta qualidade ou tipografia pura em alto contraste. Evite excesso de informações para prender a atenção na imagem e forçar a leitura da legenda.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CAPTION */}
        {activeTab === "caption" && (
          <div className="space-y-4 flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Legenda Pronta para Copiar:</span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  copied 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                }`}
                id="copy-caption-btn"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-slate-500" />}
                {copied ? "Copiado!" : "Copiar Legenda"}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap h-80 overflow-y-auto flex-1 select-text shadow-inner">
              {post.legenda}
            </div>

            {nicheRules && (
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 flex gap-2 items-start text-[10px] text-amber-800">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <p>
                  <strong>Filtro Ético de Compliance Ativo:</strong> Esta cópia foi construída respeitando as restrições éticas de seu nicho e as diretrizes do CFM/OAB (sem garantia de resultados, tom educativo informativo, sem sensacionalismo comercial).
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REFLECTION */}
        {activeTab === "reflection" && (
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Sub-Tabs Selector */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg max-w-sm self-start" id="reflection-sub-tabs">
              <button
                onClick={() => setSubTab("diff")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  subTab === "diff"
                    ? "bg-white text-[#005C66] shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                id="btn-subtab-diff"
              >
                <Diff size={13} />
                Diferenças V1 ➔ V2
              </button>
              <button
                onClick={() => setSubTab("metrics")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  subTab === "metrics"
                    ? "bg-white text-[#005C66] shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                id="btn-subtab-metrics"
              >
                <BarChart3 size={13} />
                Gráfico de Critérios
              </button>
            </div>

            {subTab === "diff" ? (
              <div className="space-y-4 flex-1">
                {/* Legend */}
                <div className="flex flex-wrap gap-2.5 items-center text-[10px] bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg text-slate-500">
                  <span className="font-semibold text-slate-600">Destaques da Otimização:</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-red-100 text-red-800 line-through decoration-red-500 px-1 py-0.5 rounded font-medium">Draft Preliminar (V1)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1 py-0.5 rounded">Melhoria Crítica (V2)</span>
                  </div>
                </div>

                {/* Hook Diff */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Otimização do Gancho (Scroll Stopper)</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm leading-relaxed tracking-tight text-slate-800 shadow-3xs select-text font-medium">
                    {post.ganchoV1 ? (
                      renderDiff(post.ganchoV1, post.gancho)
                    ) : (
                      <span className="text-slate-500 italic">Diferença indisponível para este post rascunho antigo. Gancho final: "{post.gancho}"</span>
                    )}
                  </div>
                </div>

                {/* Caption Diff */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Otimização da Legenda Completa</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs leading-relaxed text-slate-700 whitespace-pre-wrap h-80 overflow-y-auto shadow-inner select-text">
                    {post.legendaV1 ? (
                      renderDiff(post.legendaV1, post.legenda)
                    ) : (
                      <span className="text-slate-500 italic">Diferença indisponível para este post rascunho antigo. Legenda final: {post.legenda}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 shadow-3xs">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#005C66]" />
                    <span className="text-xs text-slate-800 font-bold">Resumo do Ciclo de Auto-Melhoria (V1 ➔ V2):</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {post.notasReflexao.melhoriasV2}
                  </p>
                </div>

                {/* Recharts Visual Data */}
                <ReflexaoCharts 
                  v1={post.notasReflexao.v1.notas} 
                  v2={post.notasReflexao.v2.notas} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
