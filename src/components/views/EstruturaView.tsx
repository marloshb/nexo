import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { SCENARIOS, SENSIBILIDADE, VIDA_UTIL_CURVA, PROJETO_ESTRUTURACAO } from '@/data/estruturaData';
import { fmtCompactBRL, fmtBRL, cls } from '@/lib/tokens';
import { Panel, KpiCard, Pill, EmptyHint } from '@/components/shared/Primitives';
import { RadarComparison, SingleBarChart } from '@/components/shared/Charts';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const TABS = ['Resumo', 'Alternativas', 'Modelo financeiro', 'Sensibilidade e vida útil', 'Recomendação'] as const;
const SCEN_COLOR: Record<string, string> = { 'CEN-A': '#0FA39D', 'CEN-B': '#1584D1', 'CEN-C': '#E5A11A' };
const SCEN_LETTER: Record<string, string> = { 'CEN-A': 'A', 'CEN-B': 'B', 'CEN-C': 'C' };

const TT_STYLE = { background: '#0B2235', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12, color: '#EDF1F4', padding: '8px 10px' };

export function EstruturaView() {
  const [tab, setTab] = useState<typeof TABS[number]>('Resumo');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const recommended = SCENARIOS.find((s) => s.recomendada)!;

  const radarData = [
    { dimensao: 'Custo-benefício', ...Object.fromEntries(SCENARIOS.map((s) => [SCEN_LETTER[s.id], Math.round(100 - (s.indicadores.custoPorBeneficiario - 1000) / 8)])) },
    { dimensao: 'Cobertura', ...Object.fromEntries(SCENARIOS.map((s) => [SCEN_LETTER[s.id], s.indicadores.cobertura])) },
    { dimensao: 'Resiliência', ...Object.fromEntries(SCENARIOS.map((s) => [SCEN_LETTER[s.id], s.indicadores.resiliencia])) },
    { dimensao: 'Acessibilidade', ...Object.fromEntries(SCENARIOS.map((s) => [SCEN_LETTER[s.id], s.indicadores.acessibilidade])) },
    { dimensao: 'Simplicidade', ...Object.fromEntries(SCENARIOS.map((s) => [SCEN_LETTER[s.id], 100 - s.indicadores.complexidade])) },
  ];
  const capexOpexData = SCENARIOS.map((s) => ({ nome: SCEN_LETTER[s.id], capex: Math.round(s.capex / 1_000_000), opex: Math.round(s.opexAno / 1_000_000 * 10) / 10 }));

  async function gerarResumoIA() {
    setLoadingAi(true);
    setAiSummary(null);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'Você é o Agente de Estruturação do CAIXA Nexo. Escreva em português do Brasil, em tom executivo e direto, um resumo executivo de 3 a 5 frases justificando a recomendação de uma alternativa de estruturação de projeto, com base nos dados fornecidos. Não use markdown, apenas texto corrido.',
          messages: [{
            role: 'user',
            content: `Projeto: ${PROJETO_ESTRUTURACAO}. Alternativas avaliadas: ${SCENARIOS.map((s) => `${s.nome} — Capex ${fmtCompactBRL(s.capex)}, Opex/ano ${fmtCompactBRL(s.opexAno)}, custo por beneficiário R$ ${s.indicadores.custoPorBeneficiario}, cobertura ${s.indicadores.cobertura}%, resiliência ${s.indicadores.resiliencia}%, score ${s.score}`).join(' | ')}. Alternativa recomendada: ${recommended.nome}. Gere o resumo executivo explicando por que essa alternativa foi recomendada frente às demais, mencionando riscos não totalmente equacionados.`,
          }],
        }),
      });
      const data = await response.json();
      const text = (data.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
      setAiSummary(text || 'Não foi possível gerar o resumo agora.');
    } catch {
      setAiSummary('Não foi possível conectar ao serviço de IA no momento.');
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Estrutura</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Modelagem técnica, financeira e territorial — {PROJETO_ESTRUTURACAO}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'Resumo' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Alternativas avaliadas" value={String(SCENARIOS.length)} icon="Layers" />
            <KpiCard label="Capex recomendado" value={fmtCompactBRL(recommended.capex)} icon="Calculator" />
            <KpiCard label="Custo por beneficiário" value={fmtBRL(recommended.indicadores.custoPorBeneficiario)} icon="Users" />
            <KpiCard label="Score da recomendação" value={recommended.score.toFixed(1)} icon="Target" />
          </div>
          <Panel title="Gêmeo de decisão" subtitle={`Alternativa recomendada: ${recommended.nome}`}>
            <p className="text-[12.5px] text-neutral-300 leading-relaxed">
              {recommended.localizacao} · {recommended.tecnologia}. Capacidade para {fmtCompactBRL(recommended.beneficiarios).replace('R$ ', '')} beneficiários,
              vida útil de {recommended.vidaUtilAnos} anos, prazo de implantação de {recommended.prazoMeses} meses.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recommended.premissas.map((p) => <Pill key={p}>{p}</Pill>)}
            </div>
          </Panel>
        </>
      )}

      {tab === 'Alternativas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Radar comparativo" subtitle="Quanto mais externo, melhor">
            <RadarComparison data={radarData} keys={SCENARIOS.map((s) => ({ key: SCEN_LETTER[s.id], label: s.nome.split('—')[0].trim(), color: SCEN_COLOR[s.id] }))} />
          </Panel>
          <Panel title="Cenários" subtitle="Clique para ver premissas e riscos">
            <div className="space-y-2.5">
              {SCENARIOS.map((s) => (
                <div key={s.id} className={cls('rounded-lg border p-3', s.recomendada ? 'border-[#0FA39D]/40 bg-[#0FA39D]/8' : 'border-white/10 bg-white/[0.03]')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px] font-medium text-neutral-100">{s.nome}</span>
                    {s.recomendada && <Pill tone="cyan">Recomendada</Pill>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-400 mt-1.5">
                    <span>Capex: <span className="text-neutral-200 tnum">{fmtCompactBRL(s.capex)}</span></span>
                    <span>Prazo: <span className="text-neutral-200 tnum">{s.prazoMeses}m</span></span>
                    <span>Score: <span className="text-neutral-200 tnum">{s.score}</span></span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1.5">Riscos: {s.riscos.join('; ')}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Modelo financeiro' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Capex × Opex por alternativa" subtitle="R$ milhões">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={capexOpexData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="nome" tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} />
                <YAxis tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="capex" name="Capex" fill="#005CA9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="opex" name="Opex/ano" fill="#18B7D6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Custo por beneficiário">
            <SingleBarChart data={SCENARIOS.map((s) => ({ nome: SCEN_LETTER[s.id], custo: s.indicadores.custoPorBeneficiario }))} xKey="nome" yKey="custo" color="#0FA39D" />
          </Panel>
        </div>
      )}

      {tab === 'Sensibilidade e vida útil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Tornado de variáveis" subtitle="Sensibilidade do Capex — alternativa recomendada">
            <div className="space-y-2">
              {SENSIBILIDADE.map((v) => (
                <div key={v.variavel}>
                  <div className="flex justify-between text-[11.5px] mb-1"><span className="text-neutral-400">{v.variavel}</span><span className="text-neutral-300 tnum">±{Math.round(v.impacto * 100)}%</span></div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden"><div className="h-full bg-[#E5A11A]" style={{ width: `${v.impacto * 200}%`, maxWidth: '100%' }} /></div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Curva de vida útil" subtitle="Integridade estimada do componente principal (%)">
            <SingleBarChart data={VIDA_UTIL_CURVA.map((v) => ({ ano: `Ano ${v.ano}`, valor: v.valor }))} xKey="ano" yKey="valor" color="#1584D1" />
          </Panel>
        </div>
      )}

      {tab === 'Recomendação' && (
        <Panel title="Recomendação explicável" subtitle="Gerada pelo Agente de Estruturação — chamada em tempo real à IA">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={gerarResumoIA} disabled={loadingAi} className="flex items-center gap-1.5 rounded-lg bg-[#18B7D6]/15 border border-[#18B7D6]/40 px-3 py-2 text-[12.5px] font-medium text-[#6FD8EC] hover:bg-[#18B7D6]/25 disabled:opacity-50">
              <Icon name={loadingAi ? 'Loader2' : 'Sparkles'} size={14} className={loadingAi ? 'animate-spin' : ''} />
              {loadingAi ? 'Gerando resumo executivo…' : 'Gerar resumo executivo com IA'}
            </button>
          </div>
          {aiSummary ? (
            <div className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/8 p-4 text-[13px] text-neutral-200 leading-relaxed whitespace-pre-wrap">{aiSummary}</div>
          ) : (
            <EmptyHint icon="Sparkles">Clique no botão acima para o Agente de Estruturação gerar o resumo executivo em tempo real, com base nas 3 alternativas avaliadas.</EmptyHint>
          )}
          <div className="mt-4 text-[11.5px] text-neutral-500">
            A IA também aponta premissas ausentes, compara com projetos semelhantes da carteira e sinaliza riscos não totalmente considerados — nesta versão do mockup, o principal risco residual identificado é a variação sazonal do nível do rio para a alternativa A.
          </div>
        </Panel>
      )}
    </div>
  );
}
