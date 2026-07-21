import { useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, STAGE_ORDER } from '@/data/mockData';
import {
  SENSORS, WORK_ORDERS, FAILURE_PREDICTIONS, REINVESTMENT_PLAN, CLIMATE_RISK, HEALTH_DIMENSIONS,
} from '@/data/ativosV3Data';
import { fmtCompactBRL, fmtPct, cls } from '@/lib/tokens';
import { Panel, StatusChip, ProgressBar, KpiCard, EmptyHint, Pill } from '@/components/shared/Primitives';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { Sparkline } from '@/components/shared/Sparkline';
import { WindComplexScene } from '@/components/shared/WindComplexScene';

type SortKey = 'name' | 'value' | 'physicalProgress' | 'status';
const TABS = ['Portfólio', 'Comissionamento', 'Operação', 'Manutenção', 'Resiliência', 'Reinvestimento'] as const;
const COMISSIONAMENTO_FLOW = ['Conclusão física', 'Validar as built', 'Verificar testes', 'Verificar licenças', 'Verificar operador', 'Verificar custeio', 'Verificar manutenção', 'Registrar pendências', 'Emitir prontidão operacional', 'Iniciar monitoramento'];

interface ChecklistItem { componente: string; teste: string; resultado: 'Aprovado' | 'Reprovado'; responsavel: string; data: string; pendencia?: string; aceite: boolean; }
const HORIZONTE_AZUL_CHECKLIST: ChecklistItem[] = [
  { componente: 'Rede elétrica interna', teste: 'Ensaio de isolamento', resultado: 'Aprovado', responsavel: 'Carlos Eduardo Lima', data: '2026-07-02', aceite: true },
  { componente: 'Sistema hidráulico', teste: 'Teste de pressão', resultado: 'Aprovado', responsavel: 'Carlos Eduardo Lima', data: '2026-07-03', aceite: true },
  { componente: 'Documentação as built', teste: 'Conferência documental', resultado: 'Aprovado', responsavel: 'Carlos Eduardo Lima', data: '2026-07-05', aceite: true },
  { componente: 'Licenças', teste: 'Habite-se', resultado: 'Aprovado', responsavel: 'Carlos Eduardo Lima', data: '2026-07-08', aceite: true },
  { componente: 'Acesso viário', teste: 'Vistoria de tráfego', resultado: 'Reprovado', responsavel: 'Carlos Eduardo Lima', data: '2026-07-14', pendencia: 'Pavimentação de acesso incompleta', aceite: false },
  { componente: 'Transporte público', teste: 'Verificação de linha de ônibus', resultado: 'Reprovado', responsavel: 'Carlos Eduardo Lima', data: '2026-07-15', pendencia: 'Linha municipal ainda não homologada', aceite: false },
];

const WORK_ORDER_STATUS_META = { aberta: { label: 'Aberta', color: '#E5A11A' }, em_execucao: { label: 'Em execução', color: '#1584D1' }, concluida: { label: 'Concluída', color: '#0FA39D' } };
const EXPOSICAO_META = { baixo: { label: 'Baixo', color: '#0FA39D' }, medio: { label: 'Médio', color: '#E5A11A' }, alto: { label: 'Alto', color: '#D14A55' } };

export function AtivosView({ onOpenAsset }: { onOpenAsset: (id: string) => void }) {
  const [tab, setTab] = useState<typeof TABS[number]>('Portfólio');
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('Todas');
  const [sort, setSort] = useState<SortKey>('value');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<string>('WTG-14');

  const filtered = useMemo(() => {
    let list = ASSETS.filter((a) => (selectedUF ? a.uf === selectedUF : true) && (stageFilter === 'Todas' ? true : a.stage === stageFilter));
    list = list.slice().sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'value') return b.value - a.value;
      if (sort === 'physicalProgress') return b.physicalProgress - a.physicalProgress;
      return a.status.localeCompare(b.status);
    });
    return list;
  }, [selectedUF, stageFilter, sort]);

  const operating = ASSETS.filter((a) => a.healthIndex != null);
  const avgHealth = Math.round(operating.reduce((s, a) => s + (a.healthIndex ?? 0), 0) / operating.length);
  const pendingCount = HORIZONTE_AZUL_CHECKLIST.filter((c) => !c.aceite).length;
  const flowStopIndex = 7;

  const turbinePrediction = FAILURE_PREDICTIONS.find((f) => f.componente.includes(selectedTurbine));
  const turbineSensors = SENSORS.filter((s) => s.componente.includes(selectedTurbine));

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Ativos</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Comissionamento, operação, manutenção e resiliência — portfólio nacional</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Ativos acompanhados" value={String(ASSETS.length)} icon="Building2" />
        <KpiCard label="Em operação" value={String(operating.length)} icon="Activity" />
        <KpiCard label="Índice de saúde médio" value={`${avgHealth}`} icon="HeartPulse" hint="0–100" />
        <KpiCard label="Valor total acompanhado" value={fmtCompactBRL(ASSETS.reduce((s, a) => s + a.value, 0))} icon="Landmark" />
      </div>

      {tab === 'Portfólio' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2">
            <Panel title="Portfólio no mapa" subtitle="Clique em um estado para filtrar">
              <BrazilMap assets={filtered} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={(id) => setSelected(id)} selectedId={selected} height={320} />
            </Panel>
          </div>
          <div className="xl:col-span-3">
            <Panel
              title="Tabela de ativos"
              subtitle={`${filtered.length} de ${ASSETS.length} ativos`}
              actions={
                <div className="flex items-center gap-1.5">
                  <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="bg-white/[0.05] border border-white/12 rounded-md text-[11px] text-neutral-300 px-2 py-1 outline-none">
                    <option value="Todas">Todas as etapas</option>
                    {STAGE_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-white/[0.05] border border-white/12 rounded-md text-[11px] text-neutral-300 px-2 py-1 outline-none">
                    <option value="value">Ordenar: valor</option>
                    <option value="name">Ordenar: nome</option>
                    <option value="physicalProgress">Ordenar: execução</option>
                    <option value="status">Ordenar: status</option>
                  </select>
                </div>
              }
            >
              <div className="overflow-x-auto nexo-scroll -mx-4">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-neutral-500 text-[10.5px] uppercase tracking-wide border-b border-white/8">
                      <th className="font-medium px-4 py-2">Ativo</th>
                      <th className="font-medium px-2 py-2">Etapa</th>
                      <th className="font-medium px-2 py-2">Valor</th>
                      <th className="font-medium px-2 py-2 w-28">Execução</th>
                      <th className="font-medium px-2 py-2">Status</th>
                      <th className="font-medium px-4 py-2 text-right">Saúde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} onClick={() => onOpenAsset(a.id)} className="border-b border-white/[0.05] hover:bg-white/[0.04] cursor-pointer">
                        <td className="px-4 py-2.5">
                          <div className="text-neutral-200 truncate max-w-[220px]">{a.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono-id truncate max-w-[220px]">{a.uf} · {a.sector}</div>
                        </td>
                        <td className="px-2 py-2.5 text-neutral-400 whitespace-nowrap">{a.stage}</td>
                        <td className="px-2 py-2.5 text-neutral-300 tnum whitespace-nowrap">{fmtCompactBRL(a.value)}</td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={a.physicalProgress} tone={a.status === 'critico' ? 'red' : a.status === 'atencao' ? 'amber' : 'teal'} />
                            <span className="text-[10.5px] text-neutral-500 tnum shrink-0">{fmtPct(a.physicalProgress)}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5"><StatusChip status={a.status} size="sm" /></td>
                        <td className="px-4 py-2.5 text-right tnum text-neutral-300">{a.healthIndex ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'Comissionamento' && (
        <div className="space-y-4">
          <Panel title="Fluxo de comissionamento — Residencial Horizonte Azul" subtitle="Bloqueado antes da emissão da prontidão operacional">
            <div className="flex items-center overflow-x-auto nexo-scroll pb-1">
              {COMISSIONAMENTO_FLOW.map((step, i) => (
                <div key={step} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center gap-1 w-24 text-center">
                    <div className={cls(
                      'w-6 h-6 rounded-full flex items-center justify-center border-2',
                      i < flowStopIndex ? 'border-[#0FA39D] bg-[#0FA39D]/15' : i === flowStopIndex ? 'border-[#D14A55] bg-[#D14A55]/15' : 'border-white/15'
                    )}>
                      {i < flowStopIndex ? <Icon name="CheckCircle2" size={12} className="text-[#0FA39D]" /> : i === flowStopIndex ? <Icon name="AlertOctagon" size={12} className="text-[#D14A55]" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                    </div>
                    <span className={cls('text-[9.5px] leading-tight', i <= flowStopIndex ? 'text-neutral-300' : 'text-neutral-600')}>{step}</span>
                  </div>
                  {i < COMISSIONAMENTO_FLOW.length - 1 && <div className={cls('h-px w-4 -mt-4', i < flowStopIndex ? 'bg-[#0FA39D]/50' : 'bg-white/10')} />}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/8 p-3 flex items-start gap-2.5">
              <Icon name="AlertOctagon" size={16} className="text-[#D14A55] mt-0.5 shrink-0" />
              <div className="text-[12.5px] text-neutral-200">
                Certificado de Prontidão Operacional <strong>não emitido</strong> — {pendingCount} pendência(s) bloqueiam a etapa. O Agente de Comissionamento classificou o ativo como "pronto com pendências".
              </div>
            </div>
          </Panel>

          <Panel title="Checklist de comissionamento" subtitle={`${HORIZONTE_AZUL_CHECKLIST.length} componentes verificados`}>
            <div className="overflow-x-auto nexo-scroll -mx-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-neutral-500 text-[10.5px] uppercase tracking-wide border-b border-white/8">
                    <th className="font-medium px-4 py-2">Componente</th><th className="font-medium px-2 py-2">Teste</th>
                    <th className="font-medium px-2 py-2">Resultado</th><th className="font-medium px-2 py-2">Responsável</th>
                    <th className="font-medium px-4 py-2">Pendência</th>
                  </tr>
                </thead>
                <tbody>
                  {HORIZONTE_AZUL_CHECKLIST.map((c) => (
                    <tr key={c.componente} className="border-b border-white/[0.05] last:border-0">
                      <td className="px-4 py-2.5 text-neutral-200">{c.componente}</td>
                      <td className="px-2 py-2.5 text-neutral-400">{c.teste}</td>
                      <td className="px-2 py-2.5"><span className={cls('text-[11px] font-medium', c.resultado === 'Aprovado' ? 'text-[#0FA39D]' : 'text-[#D14A55]')}>{c.resultado}</span></td>
                      <td className="px-2 py-2.5 text-neutral-400">{c.responsavel}</td>
                      <td className="px-4 py-2.5 text-neutral-400">{c.pendencia ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Operação' && (
        <div className="space-y-4">
          <Panel title="Complexo Eólico Costa Branca — cena do parque" subtitle="Clique em um aerogerador para ver os sensores associados">
            <WindComplexScene onSelectComponent={setSelectedTurbine} />
          </Panel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title={`Telemetria — ${selectedTurbine}`} subtitle="Atualização simulada a cada ~2,4s (estilo StreamLayer)">
              {turbineSensors.length > 0 ? (
                <div className="space-y-4">
                  {turbineSensors.map((s) => (
                    <div key={s.id}>
                      <div className="text-[11px] text-neutral-400 mb-1">{s.tipo} · {s.componente}</div>
                      <Sparkline sensor={s} />
                    </div>
                  ))}
                </div>
              ) : <EmptyHint icon="Radio">Sem sensores cadastrados para este componente nesta versão do mockup.</EmptyHint>}
            </Panel>
            <Panel title="Previsão de falha" subtitle={turbinePrediction ? `Janela recomendada: ${turbinePrediction.janela}` : undefined}>
              {turbinePrediction ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-[12px] mb-1"><span className="text-neutral-400">Probabilidade em 30 dias</span><span className="text-neutral-200 tnum">{Math.round(turbinePrediction.probabilidade30d * 100)}%</span></div>
                  <ProgressBar value={turbinePrediction.probabilidade30d} tone={turbinePrediction.criticidade === 'critico' ? 'red' : 'amber'} />
                  <div className="flex justify-between text-[12px] mb-1 mt-2"><span className="text-neutral-400">Probabilidade em 90 dias</span><span className="text-neutral-200 tnum">{Math.round(turbinePrediction.probabilidade90d * 100)}%</span></div>
                  <ProgressBar value={turbinePrediction.probabilidade90d} tone={turbinePrediction.criticidade === 'critico' ? 'red' : 'amber'} />
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-[12px] text-neutral-300 mt-2">{turbinePrediction.recomendacao}</div>
                </div>
              ) : <EmptyHint icon="Activity">Componente sem previsão de falha registrada — operação dentro dos parâmetros esperados.</EmptyHint>}
            </Panel>
          </div>
        </div>
      )}

      {tab === 'Manutenção' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Ordens de serviço" subtitle={`${WORK_ORDERS.length} ordens`}>
            <div className="space-y-2">
              {WORK_ORDERS.map((o) => (
                <div key={o.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-neutral-200">{o.componente}</span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: WORK_ORDER_STATUS_META[o.status].color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: WORK_ORDER_STATUS_META[o.status].color }} />{WORK_ORDER_STATUS_META[o.status].label}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-neutral-500">{o.id} · {o.tipo} · {o.ativo} · {fmtCompactBRL(o.custo)} · previsão {new Date(o.previsao).toLocaleDateString('pt-BR')}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Previsão de falha por componente">
            <div className="space-y-2">
              {FAILURE_PREDICTIONS.map((f) => (
                <div key={f.componente} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-neutral-200">{f.componente}</span>
                    {f.criticidade === 'critico' ? (
                      <span className="inline-flex items-center rounded-md border border-[#D14A55]/30 bg-[#D14A55]/15 text-[#D14A55] px-2 py-0.5 text-[11px] font-medium">{Math.round(f.probabilidade90d * 100)}% em 90d</span>
                    ) : (
                      <Pill tone="blue">{Math.round(f.probabilidade90d * 100)}% em 90d</Pill>
                    )}
                  </div>
                  <div className="text-[10.5px] text-neutral-500">{f.ativo} · {f.recomendacao}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Resiliência' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Exposição a risco climático">
            <div className="space-y-2">
              {CLIMATE_RISK.map((c) => (
                <div key={c.assetId + c.ameaca} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-neutral-200">{c.ativo}</span>
                    <span className="text-[10.5px] font-medium" style={{ color: EXPOSICAO_META[c.exposicao].color }}>Exposição {EXPOSICAO_META[c.exposicao].label}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">{c.ameaca}</div>
                  <div className="text-[10.5px] text-neutral-500 mt-1">Medida de adaptação: {c.medida}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Dimensões do índice de saúde" subtitle="Ativos em operação — 10 dimensões da especificação">
            <div className="space-y-4">
              {Object.entries(HEALTH_DIMENSIONS).map(([ativo, dims]) => (
                <div key={ativo}>
                  <div className="text-[12px] text-neutral-200 mb-1.5">{ativo}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {dims.map((d) => (
                      <div key={d.label} className="flex items-center justify-between text-[10.5px]">
                        <span className="text-neutral-500 truncate mr-2">{d.label}</span>
                        <span className={cls('tnum font-medium', d.value > 85 ? 'text-[#0FA39D]' : d.value > 60 ? 'text-neutral-300' : 'text-[#E5A11A]')}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Reinvestimento' && (
        <Panel title="Previsão de reinvestimento" subtitle="Vida útil remanescente e recomendação por ativo">
          <div className="space-y-3">
            {REINVESTMENT_PLAN.map((r) => (
              <div key={r.assetId} className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-neutral-100 font-medium">{r.ativo}</span>
                  <span className="text-[11px] text-neutral-500 tnum">Horizonte: {r.anoRecomendado}</span>
                </div>
                <div className="flex justify-between text-[11.5px] mb-1"><span className="text-neutral-400">Vida útil remanescente</span><span className="text-neutral-200 tnum">{r.vidaUtilRemanescente}%</span></div>
                <ProgressBar value={r.vidaUtilRemanescente / 100} tone={r.vidaUtilRemanescente > 85 ? 'teal' : r.vidaUtilRemanescente > 60 ? 'blue' : 'amber'} />
                <div className="text-[11.5px] text-neutral-400 mt-2">{r.recomendacao}</div>
                {r.valorEstimado > 0 && <div className="text-[10.5px] text-neutral-500 mt-1">Valor estimado: {fmtCompactBRL(r.valorEstimado)}</div>}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
