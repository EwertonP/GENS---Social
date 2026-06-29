import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ReflectionScores } from "../types";

interface ReflexaoChartsProps {
  v1: ReflectionScores;
  v2: ReflectionScores;
}

export default function ReflexaoCharts({ v1, v2 }: ReflexaoChartsProps) {
  // Map internal technical keys to professional Portuguese labels
  const translationMap: { [key: string]: string } = {
    conexao: "Conexão",
    scrollStopper: "Scroll Stopper",
    storytelling: "Storytelling",
    posicionamento: "Posicionamento",
    autoridade: "Autoridade",
    zeroClique: "Zero Clique",
    etica: "Ética e Regras",
    cta: "Chamada (CTA)",
  };

  const keys = Object.keys(translationMap);

  const data = keys.map((key) => ({
    name: translationMap[key],
    V1: Number(v1[key as keyof ReflectionScores] || 0),
    V2: Number(v2[key as keyof ReflectionScores] || 0),
  }));

  // Simple grid list for robust presentation in all viewports
  return (
    <div className="space-y-6" id="reflexao-charts-wrapper">
      <div className="h-64 sm:h-72 w-full bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={10} 
              domain={[0, 10]} 
              tickLine={false}
              axisLine={false}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#E2E8F0",
                borderRadius: "12px",
                color: "#1E293B",
                fontSize: "11px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
              verticalAlign="bottom"
              height={36}
            />
            <Bar dataKey="V1" fill="#94A3B8" name="Versão 1 (Rascunho)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="V2" fill="#005C66" name="Versão 2 (Refinada)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid of details for mobile-first or quick viewing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((item) => {
          const delta = item.V2 - item.V1;
          return (
            <div 
              key={item.name} 
              className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col justify-between shadow-2xs hover:border-[#005C66]/30 transition-all duration-200"
              id={`metric-card-${item.name.toLowerCase().replace(/ /g, "-")}`}
            >
              <div className="text-[11px] text-slate-500 font-bold truncate mb-1">{item.name}</div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">v1:</span>
                  <span className="text-xs text-slate-500 font-mono font-bold">{item.V1.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#005C66]/70 font-mono">v2:</span>
                  <span className="text-sm text-[#005C66] font-mono font-extrabold">{item.V2.toFixed(1)}</span>
                </div>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Melhoria:</span>
                <span className={`font-extrabold font-mono ${delta > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                  {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
