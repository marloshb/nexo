import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { INDICATORS, RESULT_CHAIN, IMPACT_TIME_SERIES, type Indicator } from '@/data/impactoData';
import { ASSETS } from '@/data/mockData';
import { fmtCompactNum, fmtPct, cls } from '@/lib/tokens';
import { Panel, KpiCard, Pill, ProgressBar } from '@/components/shared/Primitives';
import { TimeSeriesChart, SingleBarChart } from '@/components/shared/Charts';
import { BrazilMap } from '@/components/shared/BrazilMap';

const TABS = ['Visão de impacto', 'Indicadores', 'Linha de resultados', 'Beneficiários', 'Mapa de impacto', 'Prestação de contas'] as const;
const STATUS_DOT: Record<Indicator['status'], string> = { validado: '#0FA39D', divergente: '#D14A55', pendente: '#9AACB8' };
const STATUS_LABEL: Record<Indicator['status'], string> = { validado: 'Validado', divergente: 'Divergente', pendente: 'Pendente' };

export function ImpactoView() {
  const [tab, setTab] = useState<typeof TABS[number]>('Visão de impacto');
  const [selectedChecklist, setSelectedChecklist] = useState<string[]>(INDICATORS.slice(0, 3).map((i) => i.id));
  const [reportGenerated, setReportGenerated] = useState(false);

  const validados = INDICATORS.filter((i) => i.status === 'validado').length;
  const beneficiariosComprovados = ASSETS.reduce((s, a) => s + a.beneficiariesVerified, 0);
  const beneficiariosPrevistos = ASSETS.reduce((s, a) => s + a.beneficiaries, 0);

  function toggleChecklist(id: string) {
    setSelectedChecklist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Impacto</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Indicadores, MRV, resultados e prestação de contas</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Beneficiários comprovados" value={fmtCompactNum(beneficiariosComprovados)} icon="BadgeCheck" delta={fmtPct(beneficiariosComprovados / beneficiariosPrevistos)} deltaTone="teal" hint="do previsto" />
        <KpiCard label="Indicadores validados" value={`${validados} de ${INDICATORS.length}`} icon="Target" />
        <KpiCard label="Impacto por real investido" value="0,78" icon="TrendingUp" hint="benef./R$ mil" />
        <KpiCard label="Relatórios emitidos (12m)" value="48" icon="FileText" />
      </div>

      {tab === 'Visão de impacto' && (
        <>
          <Panel title="Beneficiários previstos × comprovados" subtitle="Evolução acumulada da carteira">
            <TimeSeriesChart data={IMPACT_TIME_SERIES} xKey="ano" aKey="previsto" bKey="comprovado" aLabel="Previsto" bLabel="Comprovado" />
          </Panel>
          <Panel title="Meta × realizado por indicador">
            <div className="space-y-2.5">
              {INDICATORS.map((i) => (
                <div key={i.id}>
                  <div className="flex justify-between text-[11.5px] mb-1">
                    <span className="text-neutral-300">{i.nome}</span>
                    <span className="text-neutral-500 tnum">{fmtCompactNum(i.realizado)} / {fmtCompactNum(i.meta)} {i.unidade}</span>
                  </div>
                  <ProgressBar value={i.meta ? Math.min(1, i.realizado / i.meta) : 0} tone={i.status === 'divergente' ? 'amber' : i.status === 'pendente' ? 'blue' : 'teal'} />
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {tab === 'Indicadores' && (
        <Panel title="Frameworks e indicadores" subtitle={`${INDICATORS.length} indicadores cadastrados`}>
          <div className="overflow-x-auto nexo-scroll -mx-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-neutral-500 text-[10.5px] uppercase tracking-wide border-b border-white/8">
                  <th className="font-medium px-4 py-2">Indicador</th><th className="font-medium px-2 py-2">Nível</th>
                  <th className="font-medium px-2 py-2">Baseline → Meta</th><th className="font-medium px-2 py-2">Realizado</th>
                  <th className="font-medium px-2 py-2">Fonte</th><th className="font-medium px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {INDICATORS.map((i) => (
                  <tr key={i.id} className="border-b border-white/[0.05]">
                    <td className="px-4 py-2.5"><div className="text-neutral-200">{i.nome}</div><div className="text-[10px] text-neutral-500">{i.ativo}</div></td>
                    <td className="px-2 py-2.5"><Pill>{i.nivelCadeia}</Pill></td>
                    <td className="px-2 py-2.5 text-neutral-400 tnum whitespace-nowrap">{fmtCompactNum(i.baseline)} → {fmtCompactNum(i.meta)}</td>
                    <td className="px-2 py-2.5 text-neutral-300 tnum">{fmtCompactNum(i.realizado)}</td>
                    <td className="px-2 py-2.5 text-neutral-500 text-[11px] max-w-[160px] truncate">{i.fonte}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: STATUS_DOT[i.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[i.status] }} />{STATUS_LABEL[i.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'Linha de resultados' && (
        <Panel title="Cadeia de resultados" subtitle="Insumo → Atividade → Produto → Serviço → Resultado → Impacto">
          <div className="flex items-stretch overflow-x-auto nexo-scroll pb-2">
            {RESULT_CHAIN.map((stage, i) => {
              const inds = INDICATORS.filter((ind) => ind.nivelCadeia === stage);
              return (
                <div key={stage} className="flex items-stretch shrink-0">
                  <div className="w-48 rounded-lg border border-white/10 bg-white/[0.03] p-3 mr-2">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-2">{stage}</div>
                    {inds.length > 0 ? (
                      <div className="space-y-1.5">
                        {inds.map((ind) => <div key={ind.id} className="text-[11px] text-neutral-300 leading-snug">{ind.nome}</div>)}
                      </div>
                    ) : <div className="text-[10.5px] text-neutral-600">Sem indicador cadastrado neste nível</div>}
                  </div>
                  {i < RESULT_CHAIN.length - 1 && <div className="flex items-center mr-2"><Icon name="ArrowRight" size={16} className="text-neutral-600" /></div>}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {tab === 'Beneficiários' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Previstos × comprovados por ativo">
            <SingleBarChart data={ASSETS.map((a) => ({ nome: a.name.split(' ').slice(-1)[0], previsto: a.beneficiaries }))} xKey="nome" yKey="previsto" color="#394B59" />
          </Panel>
          <Panel title="Detalhamento">
            <div className="space-y-1.5">
              {ASSETS.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-[12px] border-b border-white/[0.05] py-1.5 last:border-0">
                  <span className="text-neutral-300 truncate max-w-[220px]">{a.name}</span>
                  <span className="text-neutral-500 tnum">{fmtCompactNum(a.beneficiariesVerified)} / {fmtCompactNum(a.beneficiaries)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Mapa de impacto' && (
        <Panel title="Mapa de impacto" subtitle="Cor por proporção de beneficiários comprovados">
          <BrazilMap assets={ASSETS} height={340} colorBy="status" />
        </Panel>
      )}

      {tab === 'Prestação de contas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Relatórios emitidos">
            <div className="space-y-1.5">
              {['Demonstração de Valor — Adutora Sertão Vivo', 'Relatório de impacto — Complexo Eólico Costa Branca', 'Prestação de contas semestral — BID', 'Painel público — Programa de Saneamento'].map((r) => (
                <div key={r} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="text-[12px] text-neutral-300">{r}</span>
                  <Icon name="Download" size={13} className="text-neutral-500" />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Report builder" subtitle="Selecione os indicadores a incluir">
            <div className="space-y-1.5 mb-3">
              {INDICATORS.map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-[12px] text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={selectedChecklist.includes(i.id)} onChange={() => toggleChecklist(i.id)} className="accent-[#1584D1]" />
                  {i.nome}
                </label>
              ))}
            </div>
            <button onClick={() => setReportGenerated(true)} className="flex items-center gap-1.5 rounded-lg bg-[#1584D1] px-3.5 py-2 text-[12.5px] font-medium text-white">
              <Icon name="FileText" size={14} /> Gerar prestação de contas ({selectedChecklist.length} indicadores)
            </button>
            {reportGenerated && (
              <div className="mt-3 rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3 text-[12px] text-neutral-200">
                Relatório gerado com {selectedChecklist.length} indicador(es) — pronto para exportação em PDF, XLSX ou link compartilhável.
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
