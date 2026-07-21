import { useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, KPI_CONTROL, AGENTS } from '@/data/mockData';
import { fmtCompactBRL, fmtPct, fmtCompactNum } from '@/lib/tokens';
import { KpiCard, Panel, StatusChip, Pill } from '@/components/shared/Primitives';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { FunnelCapitalResultado, SCurveChart, RiskMatrixChart, TreemapSource, BarProgramChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import type { EventItem } from '@/data/mockData';
import { cls } from '@/lib/tokens';

const TABS = ['Cockpit executivo', 'Sala de situação', 'Simulador'] as const;

export function ControlView({ onOpenAsset, events }: { onOpenAsset: (id: string) => void; events: EventItem[] }) {
  const [tab, setTab] = useState<typeof TABS[number]>('Cockpit executivo');
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('Todos');
  const [simAlloc, setSimAlloc] = useState(50);

  const sectors = useMemo(() => ['Todos', ...Array.from(new Set(ASSETS.map((a) => a.sector)))], []);
  const filtered = useMemo(
    () => ASSETS.filter((a) => (selectedUF ? a.uf === selectedUF : true) && (sectorFilter === 'Todos' ? true : a.sector === sectorFilter)),
    [selectedUF, sectorFilter]
  );
  const criticalAssets = ASSETS.filter((a) => a.status === 'critico');

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Control</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Centro de comando executivo e operacional</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-neutral-500 flex items-center gap-1"><Icon name="Filter" size={12} /> Filtros:</span>
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s)}
            className={cls('rounded-full px-2.5 py-1 text-[11px] border transition-colors', sectorFilter === s ? 'bg-[#1584D1]/20 border-[#1584D1]/50 text-[#5FB4E8]' : 'border-white/10 text-neutral-400 hover:text-neutral-200')}
          >
            {s}
          </button>
        ))}
        {selectedUF && (
          <button onClick={() => setSelectedUF(null)} className="rounded-full px-2.5 py-1 text-[11px] bg-[#18B7D6]/15 border border-[#18B7D6]/40 text-[#6FD8EC] flex items-center gap-1">
            Território: {selectedUF} <Icon name="X" size={11} />
          </button>
        )}
      </div>

      {tab === 'Cockpit executivo' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <KpiCard label="Capital disponível" value={fmtCompactBRL(KPI_CONTROL.capitalDisponivel)} icon="Landmark" />
            <KpiCard label="Capital alocado" value={fmtCompactBRL(KPI_CONTROL.capitalAlocado)} icon="Package" />
            <KpiCard label="Contratado" value={fmtCompactBRL(KPI_CONTROL.contratado)} icon="FileCheck" />
            <KpiCard label="Desembolsado" value={fmtCompactBRL(KPI_CONTROL.desembolsado)} icon="Banknote" delta={fmtPct(KPI_CONTROL.desembolsado / KPI_CONTROL.contratado)} deltaTone="teal" hint="do contratado" />
            <KpiCard label="Execução física média" value={fmtPct(KPI_CONTROL.execucaoFisicaMedia)} icon="Activity" />
            <KpiCard label="Ativos críticos" value={String(KPI_CONTROL.ativosCriticos)} icon="AlertOctagon" delta="+2" deltaTone="red" hint="vs. mês anterior" />
            <KpiCard label="Ativos comissionados" value={fmtCompactNum(KPI_CONTROL.ativosComissionados)} icon="PackageCheck" />
            <KpiCard label="Ativos em operação" value={fmtCompactNum(KPI_CONTROL.ativosEmOperacao)} icon="Building2" />
            <KpiCard label="Beneficiários previstos" value={fmtCompactNum(KPI_CONTROL.beneficiariosPrevistos)} icon="Users" />
            <KpiCard label="Beneficiários comprovados" value={fmtCompactNum(KPI_CONTROL.beneficiariosComprovados)} icon="BadgeCheck" delta={fmtPct(KPI_CONTROL.beneficiariosComprovados / KPI_CONTROL.beneficiariosPrevistos)} deltaTone="teal" hint="do previsto" />
            <KpiCard label="Impacto verificado" value={fmtPct(KPI_CONTROL.impactoVerificado)} icon="Target" />
            <KpiCard label="Programas ativos" value="14" icon="Layers" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-3">
              <Panel title="Mapa nacional" subtitle="Clique em um estado para filtrar a carteira" actions={<Pill tone="blue">{filtered.length} ativos filtrados</Pill>}>
                <BrazilMap assets={filtered} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={onOpenAsset} height={340} colorBy="status" />
              </Panel>
            </div>
            <div className="xl:col-span-2">
              <Panel title="Ativos em atenção" subtitle="Ordenados por criticidade">
                <div className="space-y-2 max-h-[340px] overflow-y-auto nexo-scroll pr-1">
                  {filtered.slice().sort((a, _b) => (a.status === 'critico' ? -1 : 1)).map((a) => (
                    <button key={a.id} onClick={() => onOpenAsset(a.id)} className="w-full text-left rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] text-neutral-200 truncate">{a.name}</span>
                        <StatusChip status={a.status} size="sm" />
                      </div>
                      <div className="text-[10.5px] text-neutral-500 mt-1 flex items-center gap-2">
                        <span>{a.city} · {a.uf}</span><span>·</span><span className="tnum">{fmtCompactBRL(a.value)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Funil capital → resultado" subtitle="Valores em R$ milhões"><FunnelCapitalResultado /></Panel>
            <Panel title="Planejado × realizado" subtitle="Execução física acumulada — carteira nacional"><SCurveChart /></Panel>
            <Panel title="Matriz de risco" subtitle="Probabilidade × impacto — clique para detalhes"><RiskMatrixChart /></Panel>
            <Panel title="Capital por fonte" subtitle="Treemap — R$ milhões"><TreemapSource /></Panel>
          </div>
          <Panel title="Execução por programa" subtitle="Planejado × realizado — R$ milhões"><BarProgramChart /></Panel>
        </>
      )}

      {tab === 'Sala de situação' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Panel title="Ativos críticos em tempo real" subtitle={`${criticalAssets.length} ativos requerem atenção imediata`}>
              <div className="space-y-2">
                {criticalAssets.map((a) => (
                  <button key={a.id} onClick={() => onOpenAsset(a.id)} className="w-full text-left rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/8 p-3 hover:bg-[#D14A55]/14 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-neutral-100">{a.name}</span>
                      <StatusChip status={a.status} size="sm" />
                    </div>
                    <p className="text-[11.5px] text-neutral-400 mt-1 leading-snug">{a.summary}</p>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="Agentes acionados" subtitle="Últimas execuções relevantes">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AGENTS.filter((a) => a.status === 'concluido_alerta' || a.status === 'em_execucao').map((a) => (
                  <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                    <div className="text-[12px] text-neutral-200">{a.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{a.step}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <Panel title="Central de eventos" subtitle="Barramento corporativo — ao vivo">
            <EventFeed events={events} maxHeight={480} />
          </Panel>
        </div>
      )}

      {tab === 'Simulador' && (
        <Panel title="Simulador de alocação" subtitle="Ferramenta ilustrativa — ajuste a prioridade entre risco e impacto para reequilibrar a alocação territorial">
          <div className="max-w-xl space-y-4">
            <div>
              <div className="flex justify-between text-[12px] text-neutral-400 mb-2">
                <span>Priorizar redução de risco</span><span>Priorizar impacto e cobertura</span>
              </div>
              <input type="range" min={0} max={100} value={simAlloc} onChange={(e) => setSimAlloc(Number(e.target.value))} className="w-full accent-[#1584D1]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[11px] text-neutral-500">Realocação sugerida</div>
                <div className="font-display text-[18px] font-semibold text-neutral-50 tnum mt-1">{fmtCompactBRL(180_000_000 + simAlloc * 2_400_000)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[11px] text-neutral-500">Redução de risco estimada</div>
                <div className="font-display text-[18px] font-semibold text-[#0FA39D] tnum mt-1">{Math.round((100 - simAlloc) * 0.22)}%</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[11px] text-neutral-500">Beneficiários adicionais</div>
                <div className="font-display text-[18px] font-semibold text-[#5FB4E8] tnum mt-1">+{fmtCompactNum(simAlloc * 3_400)}</div>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500">Simulação ilustrativa com dados sintéticos — em produção, o Nexo Estrutura executaria os modelos completos de custo-benefício.</p>
          </div>
        </Panel>
      )}
    </div>
  );
}
