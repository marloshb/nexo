import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { OPPORTUNITIES, type Opportunity, type OpportunityStage } from '@/data/carteiraData';
import { fmtCompactBRL, fmtCompactNum, cls } from '@/lib/tokens';
import { Panel, KpiCard, Pill, EmptyHint } from '@/components/shared/Primitives';
import { GeoDotMap } from '@/components/shared/BrazilMap';
import { FunnelGeneric, SingleBarChart, RiskMatrixChart } from '@/components/shared/Charts';

const TABS = ['Radar territorial', 'Oportunidades', 'Priorização', 'Funil', 'Comparador'] as const;
const STAGES: OpportunityStage[] = ['Triagem', 'Georreferenciada', 'Enriquecida', 'Verificada', 'Estruturação', 'Arquivada'];
const STAGE_COLOR: Record<OpportunityStage, string> = {
  Triagem: '#9AACB8', Georreferenciada: '#1584D1', Enriquecida: '#18B7D6', Verificada: '#0FA39D', Estruturação: '#E5A11A', Arquivada: '#394B59',
};

export function CarteiraView({ onOpenProduct }: { onOpenProduct?: (p: 'estrutura') => void }) {
  const [tab, setTab] = useState<typeof TABS[number]>('Radar territorial');
  const [selected, setSelected] = useState<Opportunity | null>(OPPORTUNITIES[0]);
  const [compareIds, setCompareIds] = useState<[string, string]>([OPPORTUNITIES[0].id, OPPORTUNITIES[4].id]);

  const active = OPPORTUNITIES.filter((o) => o.estagio !== 'Arquivada');
  const totalDemanda = OPPORTUNITIES.reduce((s, o) => s + o.valorEstimado, 0);

  const funnelData = STAGES.filter((s) => s !== 'Arquivada').map((s) => ({
    name: s, value: OPPORTUNITIES.filter((o) => o.estagio === s).length, fill: STAGE_COLOR[s],
  }));
  const byStageBar = STAGES.map((s) => ({ estagio: s, qtd: OPPORTUNITIES.filter((o) => o.estagio === s).length }));
  const impactoProntidao = OPPORTUNITIES.map((o) => ({ name: o.titulo, probabilidade: Math.round(o.score / 2), impacto: Math.min(5, Math.round(o.populacaoBeneficiada / 60000) + 1), categoria: o.setor }));

  const points = OPPORTUNITIES.map((o) => ({ id: o.id, name: o.titulo, lat: o.lat, lon: o.lon, color: STAGE_COLOR[o.estagio], sublabel: `${o.city} · ${o.uf}` }));

  const compareA = OPPORTUNITIES.find((o) => o.id === compareIds[0])!;
  const compareB = OPPORTUNITIES.find((o) => o.id === compareIds[1])!;

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Carteira</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Originação, projetos e priorização</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Oportunidades em radar" value={String(active.length)} icon="Radar" />
        <KpiCard label="Em estruturação" value={String(OPPORTUNITIES.filter((o) => o.estagio === 'Estruturação').length)} icon="Layers" />
        <KpiCard label="Score médio" value={(OPPORTUNITIES.reduce((s, o) => s + o.score, 0) / OPPORTUNITIES.length).toFixed(1)} icon="Target" />
        <KpiCard label="Demanda mapeada" value={fmtCompactBRL(totalDemanda)} icon="TrendingUp" />
      </div>

      {tab === 'Radar territorial' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            <Panel title="Radar territorial" subtitle="Oportunidades por estágio — clique em um ponto">
              <GeoDotMap points={points} onSelectPoint={(id) => setSelected(OPPORTUNITIES.find((o) => o.id === id) ?? null)} selectedId={selected?.id} height={340} />
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10.5px] text-neutral-500">
                {STAGES.map((s) => <span key={s} className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLOR[s] }} />{s}</span>)}
              </div>
            </Panel>
          </div>
          <div className="xl:col-span-2">
            {selected ? (
              <Panel title={selected.titulo} subtitle={`${selected.id} · Score ${selected.score}`} actions={onOpenProduct && (
                <button onClick={() => onOpenProduct('estrutura')} className="text-[11px] text-[#5FB4E8] hover:underline flex items-center gap-1">Estruturar <Icon name="ArrowRight" size={11} /></button>
              )}>
                <p className="text-[12.5px] text-neutral-300 leading-relaxed mb-3">{selected.problema}</p>
                <div className="grid grid-cols-2 gap-2.5 text-[12px] mb-3">
                  <div><span className="text-neutral-500">Proponente</span><div className="text-neutral-200">{selected.proponente}</div></div>
                  <div><span className="text-neutral-500">Território</span><div className="text-neutral-200">{selected.city}, {selected.uf}</div></div>
                  <div><span className="text-neutral-500">Valor estimado</span><div className="text-neutral-200 tnum">{fmtCompactBRL(selected.valorEstimado)}</div></div>
                  <div><span className="text-neutral-500">Beneficiários</span><div className="text-neutral-200 tnum">{fmtCompactNum(selected.populacaoBeneficiada)}</div></div>
                  <div><span className="text-neutral-500">Fonte desejada</span><div className="text-neutral-200">{selected.fonteDesejada}</div></div>
                  <div><span className="text-neutral-500">Ativo previsto</span><div className="text-neutral-200">{selected.ativoPrevisto}</div></div>
                </div>
                {selected.duplicidadeDetectada && (
                  <div className="rounded-lg border border-[#E5A11A]/30 bg-[#E5A11A]/10 p-2.5 text-[11.5px] text-[#F0B94A] flex items-start gap-1.5">
                    <Icon name="AlertTriangle" size={13} className="mt-0.5 shrink-0" /> Possível duplicidade detectada com proposta anterior — recomenda-se verificação manual.
                  </div>
                )}
                {selected.restricoesConhecidas.length > 0 && (
                  <div className="mt-2 text-[11.5px] text-neutral-400"><span className="text-neutral-500">Restrições: </span>{selected.restricoesConhecidas.join('; ')}</div>
                )}
              </Panel>
            ) : <EmptyHint>Selecione um ponto no mapa para ver a ficha da oportunidade.</EmptyHint>}
          </div>
        </div>
      )}

      {tab === 'Oportunidades' && (
        <Panel title="Todas as oportunidades" subtitle={`${OPPORTUNITIES.length} registros`}>
          <div className="overflow-x-auto nexo-scroll -mx-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-neutral-500 text-[10.5px] uppercase tracking-wide border-b border-white/8">
                  <th className="font-medium px-4 py-2">Oportunidade</th><th className="font-medium px-2 py-2">Setor</th>
                  <th className="font-medium px-2 py-2">Território</th><th className="font-medium px-2 py-2">Score</th>
                  <th className="font-medium px-4 py-2">Estágio</th>
                </tr>
              </thead>
              <tbody>
                {OPPORTUNITIES.map((o) => (
                  <tr key={o.id} onClick={() => { setSelected(o); setTab('Radar territorial'); }} className="border-b border-white/[0.05] hover:bg-white/[0.04] cursor-pointer">
                    <td className="px-4 py-2.5 text-neutral-200">{o.titulo}</td>
                    <td className="px-2 py-2.5 text-neutral-400">{o.setor}</td>
                    <td className="px-2 py-2.5 text-neutral-400">{o.uf}</td>
                    <td className="px-2 py-2.5 text-neutral-300 tnum">{o.score.toFixed(1)}</td>
                    <td className="px-4 py-2.5"><Pill>{o.estagio}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'Priorização' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Ranking multicritério" subtitle="Ordenado por score preliminar">
            <div className="space-y-1.5">
              {OPPORTUNITIES.slice().sort((a, b) => b.score - a.score).map((o, i) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="font-display text-[13px] font-semibold text-neutral-500 w-5 tnum">{i + 1}</span>
                  <div className="flex-1 min-w-0"><div className="text-[12px] text-neutral-200 truncate">{o.titulo}</div><div className="text-[10.5px] text-neutral-500">{o.setor} · {o.uf}</div></div>
                  <span className="font-display text-[14px] font-semibold text-[#5FB4E8] tnum">{o.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Matriz impacto × prontidão"><RiskMatrixChart data={impactoProntidao} xLabel="Prontidão" yLabel="Impacto" /></Panel>
        </div>
      )}

      {tab === 'Funil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Funil de originação" subtitle="Quantidade de oportunidades por estágio"><FunnelGeneric data={funnelData} /></Panel>
          <Panel title="Oportunidades por estágio"><SingleBarChart data={byStageBar} xKey="estagio" yKey="qtd" color="#18B7D6" /></Panel>
        </div>
      )}

      {tab === 'Comparador' && (
        <Panel title="Comparador de oportunidades">
          <div className="flex gap-2 mb-4">
            {([0, 1] as const).map((idx) => (
              <select
                key={idx}
                value={compareIds[idx]}
                onChange={(e) => setCompareIds(idx === 0 ? [e.target.value, compareIds[1]] : [compareIds[0], e.target.value])}
                className="bg-white/[0.05] border border-white/12 rounded-md text-[11px] text-neutral-300 px-2 py-1.5 outline-none"
              >
                {OPPORTUNITIES.map((o) => <option key={o.id} value={o.id}>{o.titulo}</option>)}
              </select>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[compareA, compareB].map((o) => (
              <div key={o.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
                <div className="font-display text-[13.5px] font-semibold text-neutral-100 mb-2">{o.titulo}</div>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-neutral-500">Setor</span><span className="text-neutral-200">{o.setor}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Score</span><span className="text-neutral-200 tnum">{o.score.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Valor estimado</span><span className="text-neutral-200 tnum">{fmtCompactBRL(o.valorEstimado)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Beneficiários</span><span className="text-neutral-200 tnum">{fmtCompactNum(o.populacaoBeneficiada)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Estágio</span><span className="text-neutral-200">{o.estagio}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Documentos</span><span className="text-neutral-200 tnum">{o.documentosDisponiveis}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
