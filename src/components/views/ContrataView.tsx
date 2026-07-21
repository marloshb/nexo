import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { QUEUE_ITEMS, CONTRATA_DECISION_LABEL, type QueueItem, type ContrataDecision } from '@/data/contrataData';
import { fmtCompactBRL, cls } from '@/lib/tokens';
import { Panel, KpiCard, Pill, ProgressBar, EmptyHint } from '@/components/shared/Primitives';
import { RiskMatrixChart } from '@/components/shared/Charts';

const TABS = ['Fila de análises', 'Dossiê', 'Riscos', 'Comitê e decisão', 'Baseline'] as const;

const SECTION_DOT: Record<string, string> = { ok: '#0FA39D', atencao: '#E5A11A', critico: '#D14A55' };

const DECISION_BUTTONS: Array<{ key: ContrataDecision; tone: string }> = [
  { key: 'aprovar', tone: 'bg-[#0FA39D] text-white' },
  { key: 'aprovar_condicionantes', tone: 'bg-[#0FA39D]/20 text-[#0FA39D] border border-[#0FA39D]/40' },
  { key: 'diligenciar', tone: 'bg-[#1584D1]/20 text-[#5FB4E8] border border-[#1584D1]/40' },
  { key: 'reenquadrar', tone: 'bg-[#E5A11A]/20 text-[#F0B94A] border border-[#E5A11A]/40' },
  { key: 'reprovar', tone: 'bg-[#D14A55]/20 text-[#D14A55] border border-[#D14A55]/40' },
  { key: 'escalar', tone: 'bg-white/8 text-neutral-300 border border-white/15' },
  { key: 'vistoria', tone: 'bg-[#7C5CBF]/20 text-[#B79EE8] border border-[#7C5CBF]/40' },
  { key: 'nova_modelagem', tone: 'bg-white/8 text-neutral-300 border border-white/15' },
];

export function ContrataView() {
  const [tab, setTab] = useState<typeof TABS[number]>('Fila de análises');
  const [selected, setSelected] = useState<QueueItem>(QUEUE_ITEMS[0]);
  const [decisions, setDecisions] = useState<Record<string, ContrataDecision>>({});

  const riskData = QUEUE_ITEMS.map((q) => ({
    name: q.operacao, probabilidade: q.criticidade === 'critico' ? 4 : q.criticidade === 'atencao' ? 3 : 1,
    impacto: Math.min(5, Math.round(q.valor / 90_000_000) + 1), categoria: q.programa.split(' ').slice(-1)[0],
  }));

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Contrata</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Elegibilidade, risco, aprovações e contratação</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Em análise" value={String(QUEUE_ITEMS.length)} icon="ListChecks" />
        <KpiCard label="Taxa de aprovação (12m)" value="78%" icon="CheckCircle2" />
        <KpiCard label="Tempo médio por etapa" value="17 dias" icon="Clock" />
        <KpiCard label="Decisões registradas" value={String(Object.keys(decisions).length)} icon="Send" />
      </div>

      {tab === 'Fila de análises' && (
        <Panel title="Fila de análises" subtitle={`${QUEUE_ITEMS.length} operações em andamento`}>
          <div className="space-y-2">
            {QUEUE_ITEMS.map((q) => (
              <button
                key={q.id}
                onClick={() => { setSelected(q); setTab('Dossiê'); }}
                className="w-full text-left rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] text-neutral-200">{q.operacao}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{q.etapa} · {q.alcada} · {fmtCompactBRL(q.valor)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {decisions[q.id] && <Pill tone="cyan">{CONTRATA_DECISION_LABEL[decisions[q.id]]}</Pill>}
                  <span className="text-[11px] text-neutral-500 tnum">{q.prazoDias}d</span>
                  <span className={cls('text-[10.5px] font-medium', q.criticidade === 'critico' ? 'text-[#D14A55]' : q.criticidade === 'atencao' ? 'text-[#F0B94A]' : 'text-[#0FA39D]')}>{q.elegibilidadePct}% elegível</span>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {tab === 'Dossiê' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Panel title={selected.operacao} subtitle={`${selected.proponente} · ${selected.programa}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[12px] mb-3">
                <div><span className="text-neutral-500">Valor</span><div className="text-neutral-200 tnum">{fmtCompactBRL(selected.valor)}</div></div>
                <div><span className="text-neutral-500">Funding</span><div className="text-neutral-200">{selected.funding}</div></div>
                <div><span className="text-neutral-500">Etapa</span><div className="text-neutral-200">{selected.etapa}</div></div>
                <div><span className="text-neutral-500">Alçada</span><div className="text-neutral-200">{selected.alcada}</div></div>
              </div>
              <div className="mb-1 flex justify-between text-[11.5px]"><span className="text-neutral-400">Matriz de elegibilidade</span><span className="text-neutral-200 tnum">{selected.elegibilidadePct}%</span></div>
              <ProgressBar value={selected.elegibilidadePct / 100} tone={selected.elegibilidadePct > 85 ? 'teal' : selected.elegibilidadePct > 70 ? 'amber' : 'red'} />
            </Panel>

            <Panel title="Análise consolidada" subtitle="14 seções da especificação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selected.sections.map((s) => (
                  <div key={s.label} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                    <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: SECTION_DOT[s.status] }} />
                    <div className="min-w-0"><div className="text-[11.5px] text-neutral-200">{s.label}</div><div className="text-[10.5px] text-neutral-500 leading-snug">{s.nota}</div></div>
                  </div>
                ))}
              </div>
            </Panel>

            {selected.condicionantes.length > 0 && (
              <Panel title="Condicionantes">
                <div className="space-y-1.5">{selected.condicionantes.map((c) => (
                  <div key={c} className="flex items-start gap-2 text-[12px] text-neutral-300"><Icon name="AlertTriangle" size={12} className="text-[#E5A11A] mt-0.5 shrink-0" />{c}</div>
                ))}</div>
              </Panel>
            )}
          </div>
          <Panel title="Parecer consolidado">
            <p className="text-[12.5px] text-neutral-300 leading-relaxed">{selected.parecer}</p>
            <div className="mt-3 rounded-lg border border-[#1584D1]/30 bg-[#1584D1]/8 p-2.5 text-[11.5px] text-[#5FB4E8]">
              Decisão recomendada: <strong>{CONTRATA_DECISION_LABEL[selected.decisaoRecomendada]}</strong>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Riscos' && (
        <Panel title="Matriz probabilidade × impacto" subtitle="Fila de análises atual"><RiskMatrixChart data={riskData} onSelect={(name) => { const q = QUEUE_ITEMS.find((x) => x.operacao === name); if (q) { setSelected(q); setTab('Dossiê'); } }} /></Panel>
      )}

      {tab === 'Comitê e decisão' && (
        <Panel title={`Decisão — ${selected.operacao}`} subtitle="Trilha de auditoria obrigatória para qualquer decisão">
          {decisions[selected.id] ? (
            <div className="rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3.5 flex items-start gap-2.5">
              <Icon name="CheckCircle2" size={16} className="text-[#0FA39D] mt-0.5 shrink-0" />
              <div className="text-[12.5px] text-neutral-200">Decisão registrada: <strong>{CONTRATA_DECISION_LABEL[decisions[selected.id]]}</strong> — ata de decisão gerada e disponível na aba Baseline.</div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {DECISION_BUTTONS.map((d) => (
                <button key={d.key} onClick={() => setDecisions((prev) => ({ ...prev, [selected.id]: d.key }))} className={cls('rounded-lg px-3 py-2 text-[12px] font-medium', d.tone)}>
                  {CONTRATA_DECISION_LABEL[d.key]}
                </button>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === 'Baseline' && (
        <Panel title="Baseline contratual" subtitle="Gerada para operações aprovadas ou aprovadas com condicionantes">
          {Object.entries(decisions).filter(([, d]) => d === 'aprovar' || d === 'aprovar_condicionantes').length > 0 ? (
            <div className="space-y-2">
              {Object.entries(decisions).filter(([, d]) => d === 'aprovar' || d === 'aprovar_condicionantes').map(([id, d]) => {
                const q = QUEUE_ITEMS.find((x) => x.id === id)!;
                return (
                  <div key={id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between"><span className="text-[12.5px] text-neutral-200">{q.operacao}</span><Pill tone="cyan">{CONTRATA_DECISION_LABEL[d]}</Pill></div>
                    <div className="text-[11px] text-neutral-500 mt-1">Contrato base gerado · valor {fmtCompactBRL(q.valor)} · {q.condicionantes.length} condicionante(s) vinculada(s)</div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyHint icon="FileCheck">Nenhuma baseline gerada ainda — registre uma decisão de aprovação na aba Comitê e decisão.</EmptyHint>}
        </Panel>
      )}
    </div>
  );
}
