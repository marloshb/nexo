import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import {
  ANALYTICS_TREND, BOTTLENECKS, COMMITTEE_MEMBERS, CONTRATA_ADMIN_RULES, CONTRATA_AGENTS,
  CONTRATA_DECISION_LABEL, CONTRATA_INTEGRATIONS, CONTRATA_REPORTS, CONTRATA_RISKS,
  CONTRATA_WORKFLOWS, QUEUE_ITEMS, WORKFLOW_COLUMNS,
  type CommitteeMember, type ContrataAgentRuntime, type ContrataDecision, type ContrataSection,
  type QueueItem, type WorkflowCard,
} from '@/data/contrataData';
import type { ProductKey } from '@/data/navConfig';
import type { EventItem } from '@/data/mockData';
import { cls, fmtCompactBRL } from '@/lib/tokens';
import { DonutChart, FunnelGeneric, RiskMatrixChart, SingleBarChart, TimeSeriesChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';

interface ContrataViewProps {
  section: ContrataSection;
  onSectionChange: (section: ContrataSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}

const SECTION_COLOR: Record<string, string> = { ok: '#0FA39D', atencao: '#E5A11A', critico: '#D14A55', pendente: '#9AACB8' };
const PRIORITY_COLOR: Record<string, string> = { P0: '#D14A55', P1: '#E5A11A', P2: '#1584D1' };
const WORKFLOW_COLOR: Record<string, string> = {
  Entrada: '#9AACB8', 'Triagem automática': '#18B7D6', 'Análise especializada': '#1584D1',
  Diligência: '#E5A11A', 'Decisão humana': '#7C5CBF', Formalização: '#0FA39D',
};

const LIVE_STEPS = [
  { agent: 'orq', text: 'Orquestrador carregou 5 operações e 61 regras aplicáveis.', type: 'agent' as const },
  { agent: 'elig', text: 'Agente de Elegibilidade reconciliou funding, programa e capacidade fiscal.', type: 'agent' as const },
  { agent: 'doc', text: 'Agente Documental identificou 3 lacunas críticas na Adutora Chapada Norte.', type: 'warning' as const },
  { agent: 'risk', text: 'Risco Integrado atualizou exposição socioambiental para R$ 340 milhões.', type: 'critical' as const },
  { agent: 'dispatch', text: 'Minuta de diligência do BRT Serra Azul preparada para revisão humana.', type: 'agent' as const },
  { agent: 'baseline', text: 'Baseline Costa Branca pré-montada; aguardando voto do Comitê.', type: 'success' as const },
];

function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const body = [headers.join(';'), ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(';'))].join('\n');
  const blob = new Blob([`\ufeff${body}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AgentRuntimeCard({ agent, onRun }: { agent: ContrataAgentRuntime; onRun: () => void }) {
  const active = agent.status === 'running';
  const statusLabel = agent.status === 'done' ? 'Concluído' : agent.status === 'alert' ? 'Alerta' : agent.status === 'waiting' ? 'Aguardando humano' : agent.status === 'running' ? 'Em execução' : 'Disponível';
  const color = agent.status === 'alert' ? '#D14A55' : agent.status === 'waiting' ? '#7C5CBF' : agent.status === 'done' ? '#0FA39D' : active ? '#18B7D6' : '#9AACB8';
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg border border-white/10 bg-[#071521]/60 flex items-center justify-center shrink-0"><Icon name={agent.icon} size={15} style={{ color }} /></div>
          <div className="min-w-0"><div className="text-[12.5px] font-semibold text-neutral-100 truncate">{agent.name}</div><div className="text-[10.5px] text-neutral-500 truncate">{agent.entity}</div></div>
        </div>
        <button onClick={onRun} className="rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-neutral-400 hover:text-white hover:border-[#18B7D6]/40"><Icon name={active ? 'Pause' : 'Play'} size={11} /></button>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1.5" style={{ color }}><span className={cls('w-2 h-2 rounded-full', active && 'nexo-pulse-dot')} style={{ background: color }} />{statusLabel}</span><span className="tnum text-neutral-500">{agent.progress}%</span></div>
      <div className="mt-1.5"><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'red' : agent.status === 'waiting' ? 'blue' : 'cyan'} height={5} /></div>
      <div className="mt-2 text-[11px] text-neutral-300 leading-snug min-h-[32px]">{agent.step}</div>
      <div className="mt-2 rounded-md border border-white/8 bg-[#071521]/45 p-2 text-[10.5px] text-neutral-400"><strong className="text-neutral-300">Recomendação:</strong> {agent.recommendation}</div>
      <div className="mt-2 flex justify-between text-[10px] text-neutral-500"><span>{agent.impact}</span><span>{agent.confidence}% confiança</span></div>
    </div>
  );
}

function CaseDetailSheet({ item, open, onClose, onOpenAsset, onNavigateProduct, onDecision, decision }: {
  item: QueueItem; open: boolean; onClose: () => void; onOpenAsset: (id: string) => void; onNavigateProduct: (p: ProductKey) => void;
  onDecision: (decision: ContrataDecision) => void; decision?: ContrataDecision;
}) {
  const [detailTab, setDetailTab] = useState<'dossie' | 'condicionantes' | 'documentos' | 'trilha'>('dossie');
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-3xl overflow-y-auto nexo-scroll">
        <SheetHeader>
          <SheetTitle className="text-neutral-50 pr-7">{item.operacao}</SheetTitle>
          <SheetDescription className="text-neutral-400">{item.id} · {item.proponente} · {item.city}/{item.uf}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[['Valor', fmtCompactBRL(item.valor)], ['Elegibilidade', `${item.elegibilidadePct}%`], ['Risco', `${item.riskScore}/100`], ['SLA', `${item.slaPct}%`]].map(([l, v]) => <div key={l} className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5"><div className="text-[10px] text-neutral-500">{l}</div><div className="text-[12px] text-neutral-100 mt-0.5">{v}</div></div>)}
        </div>
        <div className="mt-4 flex gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1 overflow-x-auto nexo-scroll">
          {(['dossie', 'condicionantes', 'documentos', 'trilha'] as const).map((tab) => <button key={tab} onClick={() => setDetailTab(tab)} className={cls('px-3 py-1.5 rounded-md text-[11px] capitalize whitespace-nowrap', detailTab === tab ? 'bg-[#E5A11A] text-[#071521] font-semibold' : 'text-neutral-400')}>{tab}</button>)}
        </div>
        {detailTab === 'dossie' && <div className="mt-4 space-y-2">{item.sections.map((s) => <div key={s.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><div className="flex items-start justify-between gap-3"><div className="flex gap-2 min-w-0"><span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: SECTION_COLOR[s.status] }} /><div><div className="text-[12px] text-neutral-100">{s.label}</div><div className="text-[11px] text-neutral-400 mt-0.5">{s.nota}</div></div></div><span className="text-[10px] text-neutral-500 shrink-0">{s.confidence}%</span></div><div className="mt-2 flex justify-between text-[10px] text-neutral-600"><span>{s.source}</span><span>{s.responsavel}</span></div></div>)}</div>}
        {detailTab === 'condicionantes' && <div className="mt-4 space-y-2">{item.condicionantes.length ? item.condicionantes.map((c, i) => <div key={c} className="rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/7 p-3 flex items-start gap-2"><Icon name="AlertTriangle" size={13} className="text-[#E5A11A] mt-0.5" /><div><div className="text-[11.5px] text-neutral-200">Condicionante {i + 1}</div><div className="text-[11px] text-neutral-400 mt-0.5">{c}</div><div className="mt-2"><Pill tone="neutral">Evidência obrigatória</Pill></div></div></div>) : <div className="rounded-lg border border-[#0FA39D]/25 bg-[#0FA39D]/8 p-3 text-[12px] text-[#7DD8D1]">Nenhuma condicionante crítica identificada.</div>}</div>}
        {detailTab === 'documentos' && <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">{['Baseline técnica do Nexo Estrutura', 'Parecer de crédito', 'Matriz de riscos', 'Análise territorial ArcGIS', 'Documentos fiscais e jurídicos', 'Plano de evidências'].map((d, i) => { const missing = i >= 4 && item.missingDocuments.length > 0; return <div key={d} className={cls('rounded-lg border p-3 flex items-start gap-2', missing ? 'border-[#D14A55]/25 bg-[#D14A55]/7' : 'border-white/10 bg-white/[0.025]')}><Icon name={missing ? 'AlertOctagon' : 'FileCheck'} size={14} className={missing ? 'text-[#D14A55]' : 'text-[#0FA39D]'} /><div><div className="text-[11.5px] text-neutral-200">{d}</div><div className="text-[10.5px] text-neutral-500">{missing ? item.missingDocuments.join(' · ') : 'Validado e versionado'}</div></div></div>; })}</div>}
        {detailTab === 'trilha' && <div className="mt-4 space-y-0">{['Baseline recebida do Nexo Estrutura', 'Funding e enquadramento validados', 'Análises especializadas distribuídas', 'Parecer consolidado pelo agente', 'Gate humano preparado'].map((x, i) => <div key={x} className="relative pl-7 pb-5 last:pb-0"><span className="absolute left-[7px] top-3 bottom-0 w-px bg-white/10 last:hidden"/><span className="absolute left-0 top-1 w-4 h-4 rounded-full border border-[#18B7D6] bg-[#18B7D6]/15 flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-[#18B7D6]" /></span><div className="text-[11.5px] text-neutral-200">{x}</div><div className="text-[10.5px] text-neutral-500">{i === 4 ? 'Aguardando responsável' : `${21 - i}/07/2026 · registro auditável`}</div></div>)}</div>}
        <div className="mt-5 rounded-xl border border-[#1584D1]/30 bg-[#1584D1]/8 p-3"><div className="text-[10.5px] uppercase tracking-wide text-[#75B9E5]">Parecer consolidado</div><p className="text-[12px] text-neutral-200 mt-1.5 leading-relaxed">{item.parecer}</p><div className="mt-2 text-[11px] text-neutral-400">Recomendação: <strong className="text-neutral-100">{CONTRATA_DECISION_LABEL[item.decisaoRecomendada]}</strong></div></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.linkedAssetId && <button onClick={() => onOpenAsset(item.linkedAssetId!)} className="rounded-lg border border-[#1584D1]/30 bg-[#1584D1]/10 px-3 py-2 text-[11.5px] text-[#75B9E5]">Abrir Ativo 360</button>}
          <button onClick={() => onNavigateProduct('estrutura')} className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] text-neutral-300">Voltar ao Nexo Estrutura</button>
          <button onClick={() => onDecision(item.decisaoRecomendada)} className="rounded-lg bg-[#E5A11A] px-3 py-2 text-[11.5px] font-semibold text-[#071521]">Registrar decisão recomendada</button>
        </div>
        {decision && <div className="mt-3 rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3 text-[11.5px] text-[#8FE4DD]">Decisão registrada: {CONTRATA_DECISION_LABEL[decision]}</div>}
      </SheetContent>
    </Sheet>
  );
}

export function ContrataView({ section, onSectionChange, onOpenAsset, onNavigateProduct, events, onPushEvent }: ContrataViewProps) {
  const [selectedId, setSelectedId] = useState(QUEUE_ITEMS[0].id);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [stageFilter, setStageFilter] = useState('Todas');
  const [decisions, setDecisions] = useState<Record<string, ContrataDecision>>({});
  const [decisionReason, setDecisionReason] = useState('');
  const [committee, setCommittee] = useState<CommitteeMember[]>(COMMITTEE_MEMBERS.map((x) => ({ ...x })));
  const [workflowCards, setWorkflowCards] = useState<WorkflowCard[]>(CONTRATA_WORKFLOWS.map((x) => ({ ...x })));
  const [agents, setAgents] = useState<ContrataAgentRuntime[]>(CONTRATA_AGENTS.map((x) => ({ ...x })));
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [reportProgress, setReportProgress] = useState<Record<string, number>>({});
  const [rules, setRules] = useState(CONTRATA_ADMIN_RULES.map((x) => ({ ...x, enabled: true })));
  const timerRef = useRef<number | null>(null);
  const reportTimers = useRef<Record<string, number>>({});

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    Object.values(reportTimers.current).forEach((id) => window.clearInterval(id));
  }, []);

  const selected = QUEUE_ITEMS.find((x) => x.id === selectedId) ?? QUEUE_ITEMS[0];
  const totalValue = QUEUE_ITEMS.reduce((s, x) => s + x.valor, 0);
  const approvedValue = Object.entries(decisions).filter(([, d]) => d === 'aprovar' || d === 'aprovar_condicionantes').reduce((s, [id]) => s + (QUEUE_ITEMS.find((x) => x.id === id)?.valor ?? 0), 0);
  const avgEligibility = Math.round(QUEUE_ITEMS.reduce((s, x) => s + x.elegibilidadePct, 0) / QUEUE_ITEMS.length);
  const criticalExposure = CONTRATA_RISKS.filter((x) => x.probability * x.impact >= 16).reduce((s, x) => s + x.exposure, 0);

  const filteredQueue = useMemo(() => QUEUE_ITEMS.filter((x) => {
    const term = search.toLowerCase();
    return (!term || `${x.operacao} ${x.proponente} ${x.programa} ${x.uf}`.toLowerCase().includes(term)) && (priorityFilter === 'Todas' || x.priority === priorityFilter) && (stageFilter === 'Todas' || x.etapa === stageFilter);
  }), [search, priorityFilter, stageFilter]);

  const riskData = CONTRATA_RISKS.map((x) => ({ name: x.operacao, probabilidade: x.probability, impacto: x.impact, categoria: x.category }));
  const funnel = [
    { name: 'Recebidas', value: 42, fill: '#394B59' }, { name: 'Triadas', value: 39, fill: '#1584D1' },
    { name: 'Parecer consolidado', value: 34, fill: '#18B7D6' }, { name: 'Comitê', value: 29, fill: '#7C5CBF' },
    { name: 'Aprovadas', value: 26, fill: '#0FA39D' },
  ];

  function recordDecision(item: QueueItem, decision: ContrataDecision) {
    setDecisions((prev) => ({ ...prev, [item.id]: decision }));
    setCommittee((prev) => prev.map((m, i) => ({ ...m, vote: i < 3 ? (decision === 'aprovar' ? 'Aprovar' : decision === 'aprovar_condicionantes' ? 'Aprovar com condicionantes' : decision === 'reprovar' ? 'Reprovar' : 'Diligenciar') : m.vote })));
    onPushEvent(`Decisão humana registrada para ${item.operacao}: ${CONTRATA_DECISION_LABEL[decision]}.`, decision === 'reprovar' ? 'critical' : decision === 'diligenciar' ? 'warning' : 'success');
    if (decision === 'aprovar' || decision === 'aprovar_condicionantes') {
      setAgents((prev) => prev.map((a) => a.id === 'baseline' ? { ...a, status: 'running', progress: 38, step: 'Gerando baseline contratual e plano de evidências' } : a));
      window.setTimeout(() => {
        setAgents((prev) => prev.map((a) => a.id === 'baseline' ? { ...a, status: 'done', progress: 100, step: 'Baseline gerada e pronta para envio ao Nexo Entrega' } : a));
        onPushEvent(`Baseline contratual de ${item.operacao} gerada e integrada ao Nexo Entrega.`, 'agent');
      }, 1700);
    }
  }

  function startLiveCycle() {
    if (liveRunning) {
      setLiveRunning(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    setLiveRunning(true);
    setLiveStep(0);
    setAgents(CONTRATA_AGENTS.map((a) => ({ ...a, status: a.id === 'orq' ? 'running' : 'idle', progress: a.id === 'orq' ? 8 : 0, step: a.id === 'orq' ? 'Carregando fila, regras e dependências' : 'Aguardando orquestrador' })));
    let index = 0;
    onPushEvent('Ciclo Nexo Contrata iniciado: agentes especializados em execução coordenada.', 'agent');
    timerRef.current = window.setInterval(() => {
      const step = LIVE_STEPS[index];
      if (!step) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setLiveRunning(false);
        setAgents((prev) => prev.map((a) => a.status === 'running' ? { ...a, status: a.id === 'dispatch' || a.id === 'baseline' ? 'waiting' : 'done', progress: 100, step: a.id === 'dispatch' ? 'Minuta pronta; aguardando revisão humana' : a.id === 'baseline' ? 'Aguardando decisão humana' : 'Execução concluída' } : a));
        onPushEvent('Ciclo concluído: 2 decisões preparadas, 1 diligência e 1 risco escalado.', 'success');
        return;
      }
      setLiveStep(index + 1);
      onPushEvent(step.text, step.type);
      setAgents((prev) => prev.map((a) => {
        if (a.id === step.agent) return { ...a, status: a.id === 'doc' ? 'alert' : a.id === 'dispatch' || a.id === 'baseline' ? 'waiting' : 'running', progress: Math.min(100, 38 + index * 12), step: step.text.replace(/^Agente [^ ]+ /, '') };
        if (a.status === 'running') return { ...a, progress: Math.min(100, a.progress + 18) };
        return a;
      }));
      index += 1;
    }, 1200);
  }

  function runAgent(id: string) {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'running', progress: 12, step: 'Execução manual iniciada; consultando fontes autorizadas' } : a));
    onPushEvent(`${agents.find((x) => x.id === id)?.name ?? 'Agente'} iniciado manualmente.`, 'agent');
    let p = 12;
    const idTimer = window.setInterval(() => {
      p += 22;
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, progress: Math.min(100, p), status: p >= 100 ? (id === 'doc' ? 'alert' : id === 'dispatch' || id === 'baseline' ? 'waiting' : 'done') : 'running', step: p >= 100 ? a.recommendation : 'Consultando dados, aplicando regras e consolidando evidências' } : a));
      if (p >= 100) { window.clearInterval(idTimer); onPushEvent(`${agents.find((x) => x.id === id)?.name ?? 'Agente'} concluiu a execução.`, id === 'doc' ? 'warning' : 'success'); }
    }, 450);
  }

  function advanceWorkflow(card: WorkflowCard) {
    const idx = WORKFLOW_COLUMNS.indexOf(card.stage as typeof WORKFLOW_COLUMNS[number]);
    const next = WORKFLOW_COLUMNS[Math.min(WORKFLOW_COLUMNS.length - 1, idx + 1)];
    setWorkflowCards((prev) => prev.map((x) => x.id === card.id ? { ...x, stage: next, waiting: next === 'Decisão humana' ? 'Gate humano' : next === 'Formalização' ? 'Assinatura e baseline' : 'Próxima etapa automática' } : x));
    onPushEvent(`Workflow ${card.id} avançou de ${card.stage} para ${next}.`, next === 'Decisão humana' ? 'warning' : 'agent');
  }

  function generateReport(id: string) {
    if (reportProgress[id] && reportProgress[id] < 100) return;
    setReportProgress((prev) => ({ ...prev, [id]: 5 }));
    let p = 5;
    reportTimers.current[id] = window.setInterval(() => {
      p += 15 + Math.round(Math.random() * 12);
      setReportProgress((prev) => ({ ...prev, [id]: Math.min(100, p) }));
      if (p >= 100) {
        window.clearInterval(reportTimers.current[id]);
        onPushEvent(`Relatório ${CONTRATA_REPORTS.find((r) => r.id === id)?.name} gerado com trilha e fontes.`, 'success');
      }
    }, 420);
  }

  const header = (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div><h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Contrata</h1><p className="text-[12px] text-neutral-500 mt-0.5">Elegibilidade, risco, aprovações, contratação e baseline auditável</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-400"><span className="text-[#18B7D6]">●</span> SIOPI, crédito, GED e ArcGIS sincronizados</div>
        <button onClick={startLiveCycle} className={cls('rounded-lg px-3 py-2 text-[11.5px] font-medium flex items-center gap-1.5', liveRunning ? 'bg-[#D14A55]/20 text-[#F08A93] border border-[#D14A55]/35' : 'bg-[#E5A11A] text-[#071521]')}><Icon name={liveRunning ? 'Pause' : 'Play'} size={13} />{liveRunning ? 'Pausar ciclo' : 'Executar ciclo ao vivo'}</button>
      </div>
    </div>
  );

  return (
    <div className="p-5 space-y-4 max-w-[1600px] mx-auto nexo-fade-in">
      {header}

      {section === 'overview' && <>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Em análise" value={String(QUEUE_ITEMS.length)} delta="+2 esta semana" icon="ListChecks" />
          <KpiCard label="Valor da fila" value={fmtCompactBRL(totalValue)} delta="5 operações" icon="DollarSign" />
          <KpiCard label="Elegibilidade média" value={`${avgEligibility}%`} delta="+6 p.p. em 90d" icon="BadgeCheck" />
          <KpiCard label="Exposição crítica" value={fmtCompactBRL(criticalExposure)} delta="1 risco P5×I5" deltaTone="red" icon="ShieldAlert" />
          <KpiCard label="Aprovado na sessão" value={fmtCompactBRL(approvedValue)} delta={`${Object.keys(decisions).length} decisões`} icon="CheckCircle2" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7"><Panel title="Esteira de contratação" subtitle="Conversão mensal da entrada à aprovação"><FunnelGeneric data={funnel} /></Panel></div>
          <div className="xl:col-span-5"><Panel title="Agenda decisória" subtitle="Operações prioritárias e SLA"><div className="space-y-2">{QUEUE_ITEMS.slice().sort((a, b) => a.prazoDias - b.prazoDias).slice(0, 4).map((q) => <button key={q.id} onClick={() => { setSelectedId(q.id); setDetailOpen(true); }} className="w-full rounded-lg border border-white/10 bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="text-[10px] font-bold" style={{ color: PRIORITY_COLOR[q.priority] }}>{q.priority}</span><span className="text-[12px] text-neutral-100">{q.operacao}</span></div><div className="mt-1 text-[10.5px] text-neutral-500">{q.etapa} · {q.alcada} · {q.committeeDate}</div></div><Pill tone={q.criticidade === 'critico' ? 'neutral' : 'blue'}>{q.elegibilidadePct}%</Pill></div><div className="mt-2"><ProgressBar value={q.slaPct / 100} tone={q.slaPct > 85 ? 'red' : q.slaPct > 65 ? 'amber' : 'teal'} height={4} /></div></button>)}</div></Panel></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Panel title="Riscos prioritários" subtitle="Exposição e mitigação"><div className="space-y-2">{CONTRATA_RISKS.slice(0, 4).map((r) => <button key={r.id} onClick={() => { setSelectedId(r.operationId); onSectionChange('risks'); }} className="w-full flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-2.5 text-left"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold" style={{ background: `${r.probability * r.impact >= 16 ? '#D14A55' : '#E5A11A'}20`, color: r.probability * r.impact >= 16 ? '#F08A93' : '#F0B94A' }}>{r.probability}×{r.impact}</div><div className="min-w-0 flex-1"><div className="text-[11.5px] text-neutral-200 truncate">{r.operacao}</div><div className="text-[10.5px] text-neutral-500 truncate">{r.category} · {r.description}</div></div><span className="text-[10.5px] text-neutral-300 tnum">{fmtCompactBRL(r.exposure)}</span></button>)}</div></Panel>
          <Panel title="Agentes críticos" subtitle={`Ciclo ${liveStep}/${LIVE_STEPS.length} · decisões com gate humano`}><div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">{agents.slice(0, 4).map((a) => <AgentRuntimeCard key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7"><Panel title="Integração do ciclo" subtitle="Objetos de entrada e saída entre produtos"><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{CONTRATA_INTEGRATIONS.map((i) => <button key={i.name} onClick={() => i.product !== 'externo' && onNavigateProduct(i.product as ProductKey)} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 text-left"><div className="flex justify-between gap-2"><span className="text-[11.5px] text-neutral-200">{i.name}</span><span className="text-[9.5px] text-[#0FA39D]">{i.status}</span></div><div className="mt-1 text-[10.5px] text-neutral-500">{i.direction} · {i.object}</div></button>)}</div></Panel></div>
          <div className="xl:col-span-5"><Panel title="Eventos ao vivo" subtitle="Logs resumidos e auditáveis"><EventFeed events={events.slice(-12)} dense maxHeight={330} /></Panel></div>
        </div>
      </>}

      {section === 'queue' && <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6 relative"><Icon name="Search" size={14} className="absolute left-3 top-2.5 text-neutral-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar operação, proponente, programa ou UF" className="w-full rounded-lg border border-white/10 bg-white/[0.035] pl-9 pr-3 py-2 text-[12px] text-neutral-100 outline-none focus:border-[#E5A11A]/50" /></div>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="lg:col-span-2 rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11.5px] text-neutral-300"><option>Todas</option><option>P0</option><option>P1</option><option>P2</option></select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="lg:col-span-3 rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11.5px] text-neutral-300"><option>Todas</option>{[...new Set(QUEUE_ITEMS.map((x) => x.etapa))].map((x) => <option key={x}>{x}</option>)}</select>
          <button onClick={() => downloadCsv('fila-nexo-contrata.csv', filteredQueue.map((q) => ({ id: q.id, operacao: q.operacao, proponente: q.proponente, valor: q.valor, elegibilidade: q.elegibilidadePct, risco: q.riskScore, etapa: q.etapa })))} className="lg:col-span-1 rounded-lg border border-white/10 px-3 py-2 text-neutral-400 hover:text-white"><Icon name="Download" size={14} /></button>
        </div>
        <Panel title="Fila de análises" subtitle={`${filteredQueue.length} operações · ${fmtCompactBRL(filteredQueue.reduce((s, x) => s + x.valor, 0))}`}>
          <div className="overflow-x-auto nexo-scroll"><table className="w-full min-w-[980px] text-left"><thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wide text-neutral-500">{['Prioridade', 'Operação', 'Etapa', 'Valor', 'Elegibilidade', 'Risco', 'SLA', 'Responsável', ''].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr></thead><tbody>{filteredQueue.map((q) => <tr key={q.id} className="border-b border-white/[0.06] hover:bg-white/[0.025]"><td className="px-2 py-3"><span className="text-[10.5px] font-bold" style={{ color: PRIORITY_COLOR[q.priority] }}>{q.priority}</span></td><td className="px-2 py-3"><button onClick={() => { setSelectedId(q.id); setDetailOpen(true); }} className="text-left"><div className="text-[11.5px] text-neutral-100">{q.operacao}</div><div className="text-[10px] text-neutral-500">{q.id} · {q.city}/{q.uf}</div></button></td><td className="px-2 py-3 text-[10.5px] text-neutral-400">{q.etapa}</td><td className="px-2 py-3 text-[10.5px] text-neutral-200 tnum">{fmtCompactBRL(q.valor)}</td><td className="px-2 py-3 w-32"><div className="flex justify-between text-[10px] text-neutral-400"><span>{q.elegibilidadePct}%</span><span>{q.documentsPct}% docs</span></div><ProgressBar value={q.elegibilidadePct / 100} tone={q.elegibilidadePct >= 85 ? 'teal' : q.elegibilidadePct >= 75 ? 'amber' : 'red'} height={4} /></td><td className="px-2 py-3"><span className="text-[10.5px]" style={{ color: q.riskScore >= 70 ? '#D14A55' : q.riskScore >= 50 ? '#E5A11A' : '#0FA39D' }}>{q.riskScore}/100</span></td><td className="px-2 py-3 w-24"><ProgressBar value={q.slaPct / 100} tone={q.slaPct >= 85 ? 'red' : q.slaPct >= 65 ? 'amber' : 'teal'} height={4} /><div className="text-[9.5px] text-neutral-500 mt-1">{q.prazoDias} dias</div></td><td className="px-2 py-3 text-[10.5px] text-neutral-400">{q.responsible}</td><td className="px-2 py-3"><button onClick={() => { setSelectedId(q.id); setDetailOpen(true); }} className="rounded-md border border-white/10 p-1.5 text-neutral-500 hover:text-white"><Icon name="Eye" size={12} /></button></td></tr>)}</tbody></table></div>
        </Panel>
      </>}

      {section === 'risks' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Riscos ativos" value={String(CONTRATA_RISKS.length)} icon="ShieldAlert" /><KpiCard label="Críticos" value={String(CONTRATA_RISKS.filter((x) => x.probability * x.impact >= 16).length)} delta={fmtCompactBRL(criticalExposure)} deltaTone="red" icon="AlertOctagon" /><KpiCard label="Mitigação em dia" value="81%" delta="+9 p.p." icon="CheckCircle2" /><KpiCard label="Risco residual médio" value="2,7" delta="−0,4 em 90d" icon="TrendingDown" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Matriz probabilidade × impacto" subtitle="Selecione um ponto para abrir a operação"><RiskMatrixChart data={riskData} onSelect={(name) => { const q = QUEUE_ITEMS.find((x) => x.operacao === name); if (q) { setSelectedId(q.id); setDetailOpen(true); } }} /></Panel></div><div className="xl:col-span-5"><Panel title="Exposição por categoria"><DonutChart data={Object.entries(CONTRATA_RISKS.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.category]: (acc[r.category] ?? 0) + r.exposure / 1e6 }), {})).map(([name, value], i) => ({ name, value: Math.round(value), fill: ['#D14A55', '#E5A11A', '#1584D1', '#7C5CBF', '#0FA39D'][i % 5] }))} /></Panel></div></div>
        <Panel title="Registro de riscos" subtitle="Mitigação, responsáveis, agentes e prazos"><div className="space-y-2">{CONTRATA_RISKS.map((r) => <div key={r.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"><div className="lg:col-span-1"><div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-[12px]" style={{ color: r.probability * r.impact >= 16 ? '#F08A93' : '#F0B94A', background: r.probability * r.impact >= 16 ? '#D14A5520' : '#E5A11A20' }}>{r.probability}×{r.impact}</div></div><div className="lg:col-span-4"><button onClick={() => { setSelectedId(r.operationId); setDetailOpen(true); }} className="text-left"><div className="text-[11.5px] text-neutral-100">{r.operacao}</div><div className="text-[10.5px] text-neutral-500">{r.category} · {r.description}</div></button></div><div className="lg:col-span-3 text-[10.5px] text-neutral-400"><strong className="text-neutral-300">Mitigação:</strong> {r.mitigation}</div><div className="lg:col-span-2 text-[10px] text-neutral-500">{r.owner}<br />{r.agent}</div><div className="lg:col-span-1 text-[10.5px] text-neutral-300 tnum">{fmtCompactBRL(r.exposure)}</div><div className="lg:col-span-1"><Pill tone={r.status === 'Escalado' ? 'neutral' : 'blue'}>{r.status}</Pill></div></div>)}</div></Panel>
      </>}

      {section === 'committee' && <>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-4 space-y-4"><Panel title="Agenda do comitê" subtitle="Operações preparadas pelos agentes"><div className="space-y-2">{QUEUE_ITEMS.filter((q) => q.alcada.includes('Comitê')).map((q) => <button key={q.id} onClick={() => setSelectedId(q.id)} className={cls('w-full rounded-lg border p-3 text-left', selectedId === q.id ? 'border-[#E5A11A]/45 bg-[#E5A11A]/8' : 'border-white/10 bg-white/[0.025]')}><div className="flex justify-between gap-2"><span className="text-[11.5px] text-neutral-100">{q.operacao}</span><span className="text-[10px] text-neutral-500">{q.committeeDate}</span></div><div className="text-[10.5px] text-neutral-500 mt-1">{fmtCompactBRL(q.valor)} · {q.alcada}</div></button>)}</div></Panel><Panel title="Quórum"><div className="flex items-center justify-between"><div><div className="text-[22px] font-semibold text-neutral-50 tnum">{committee.filter((m) => m.present).length}/{committee.length}</div><div className="text-[10.5px] text-neutral-500">membros presentes</div></div><StatusChip status={committee.filter((m) => m.present).length >= 3 ? 'normal' : 'bloqueado'} /></div></Panel></div>
          <div className="xl:col-span-8 space-y-4"><Panel title={`Deliberação — ${selected.operacao}`} subtitle={`${selected.id} · recomendação dos agentes: ${CONTRATA_DECISION_LABEL[selected.decisaoRecomendada]}`}><div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">{[['Valor', fmtCompactBRL(selected.valor)], ['Elegibilidade', `${selected.elegibilidadePct}%`], ['Risco', `${selected.riskScore}/100`], ['Prontidão', `${selected.readiness}%`], ['Condicionantes', String(selected.condicionantes.length)]].map(([l, v]) => <div key={l} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><div className="text-[9.5px] text-neutral-500">{l}</div><div className="text-[12px] text-neutral-100 mt-0.5">{v}</div></div>)}</div><p className="text-[12px] text-neutral-300 leading-relaxed">{selected.parecer}</p><textarea value={decisionReason} onChange={(e) => setDecisionReason(e.target.value)} placeholder="Fundamentação da decisão humana e eventuais ressalvas..." className="mt-4 w-full min-h-24 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-[11.5px] text-neutral-100 outline-none focus:border-[#E5A11A]/50" /><div className="mt-3 flex flex-wrap gap-2">{(['aprovar', 'aprovar_condicionantes', 'diligenciar', 'reenquadrar', 'reprovar'] as ContrataDecision[]).map((d) => <button key={d} disabled={committee.filter((m) => m.present).length < 3} onClick={() => recordDecision(selected, d)} className={cls('rounded-lg px-3 py-2 text-[11px] font-medium disabled:opacity-40', d === 'aprovar' ? 'bg-[#0FA39D] text-white' : d === 'aprovar_condicionantes' ? 'border border-[#0FA39D]/40 bg-[#0FA39D]/12 text-[#76D4CD]' : d === 'diligenciar' ? 'border border-[#1584D1]/40 bg-[#1584D1]/12 text-[#75B9E5]' : d === 'reprovar' ? 'border border-[#D14A55]/40 bg-[#D14A55]/12 text-[#F08A93]' : 'border border-[#E5A11A]/40 bg-[#E5A11A]/10 text-[#F0B94A]')}>{CONTRATA_DECISION_LABEL[d]}</button>)}</div>{decisions[selected.id] && <div className="mt-3 rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3 text-[11.5px] text-[#8FE4DD]">Ata registrada: {CONTRATA_DECISION_LABEL[decisions[selected.id]]}. {decisionReason || 'Fundamentação vinculada ao parecer consolidado.'}</div>}</Panel>
          <Panel title="Membros e votos" subtitle="Votos simulados para demonstrar a sessão"><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{committee.map((m) => <div key={m.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-center justify-between gap-3"><div><div className="text-[11.5px] text-neutral-200">{m.name}</div><div className="text-[10px] text-neutral-500">{m.role}</div></div><div className="text-right"><Pill tone={m.vote === 'Pendente' ? 'neutral' : 'cyan'}>{m.vote}</Pill><button onClick={() => setCommittee((prev) => prev.map((x) => x.id === m.id ? { ...x, present: !x.present } : x))} className="block ml-auto mt-1 text-[9.5px] text-neutral-600">{m.present ? 'presente' : 'ausente'}</button></div></div>)}</div></Panel></div>
        </div>
        {Object.entries(decisions).some(([, d]) => d === 'aprovar' || d === 'aprovar_condicionantes') && <Panel title="Baselines geradas" subtitle="Saída integrada para Nexo Entrega"><div className="space-y-2">{Object.entries(decisions).filter(([, d]) => d === 'aprovar' || d === 'aprovar_condicionantes').map(([id, d]) => { const q = QUEUE_ITEMS.find((x) => x.id === id)!; return <div key={id} className="rounded-lg border border-[#0FA39D]/20 bg-[#0FA39D]/6 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><div className="text-[11.5px] text-neutral-100">{q.operacao}</div><div className="text-[10.5px] text-neutral-500">Baseline técnica, financeira, territorial, condições precedentes e plano de evidências</div></div><div className="flex items-center gap-2"><Pill tone="cyan">{CONTRATA_DECISION_LABEL[d]}</Pill><button onClick={() => onNavigateProduct('entrega')} className="rounded-md bg-[#0FA39D] px-2.5 py-1.5 text-[10.5px] text-white">Enviar ao Nexo Entrega</button></div></div>; })}</div></Panel>}
      </>}

      {section === 'workflows' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Workflows ativos" value={String(workflowCards.length)} icon="Workflow" /><KpiCard label="Automação média" value={`${Math.round(workflowCards.reduce((s, x) => s + x.automation, 0) / workflowCards.length)}%`} icon="Bot" /><KpiCard label="Em gate humano" value={String(workflowCards.filter((x) => x.stage === 'Decisão humana').length)} icon="User" /><KpiCard label="SLA crítico" value={String(workflowCards.filter((x) => x.priority === 'P0').length)} delta="P0" deltaTone="red" icon="Clock" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-start">{WORKFLOW_COLUMNS.map((column) => <div key={column} className="rounded-xl border border-white/10 bg-[#0E2A40]/45 overflow-hidden"><div className="px-3 py-2.5 border-b border-white/8 flex items-center justify-between"><span className="text-[10.5px] font-semibold" style={{ color: WORKFLOW_COLOR[column] }}>{column}</span><span className="w-5 h-5 rounded-full bg-white/5 text-[10px] text-neutral-400 flex items-center justify-center">{workflowCards.filter((x) => x.stage === column).length}</span></div><div className="p-2 space-y-2 min-h-40">{workflowCards.filter((x) => x.stage === column).map((card) => <div key={card.id} className="rounded-lg border border-white/8 bg-[#071521]/55 p-2.5"><div className="flex justify-between gap-2"><span className="text-[9.5px] font-bold" style={{ color: PRIORITY_COLOR[card.priority] }}>{card.priority}</span><span className="text-[9px] text-neutral-600">{card.id}</span></div><div className="mt-1 text-[11px] text-neutral-200 leading-snug">{card.title}</div><div className="mt-1.5 text-[9.5px] text-neutral-500">{card.owner} · {card.due}</div><div className="mt-2"><ProgressBar value={card.automation / 100} tone="cyan" height={3} /></div><div className="mt-1 text-[9px] text-neutral-600">{card.automation}% automatizado · {card.waiting}</div>{column !== 'Formalização' && <button onClick={() => advanceWorkflow(card)} className="mt-2 w-full rounded-md border border-white/10 px-2 py-1.5 text-[9.5px] text-neutral-400 hover:text-white">Avançar workflow</button>}</div>)}</div></div>)}</div>
        <Panel title="Eventos de workflow" subtitle="Ações automáticas, diligências e gates humanos"><EventFeed events={events.slice(-16)} dense maxHeight={260} /></Panel>
      </>}

      {section === 'analytics' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Taxa de aprovação" value="80,9%" delta="+7,2 p.p." icon="CheckCircle2" /><KpiCard label="Tempo médio" value="14 dias" delta="−9 dias em 6m" icon="Clock" /><KpiCard label="Retrabalho evitado" value="R$ 8,4 mi" delta="Diligência consolidada" icon="TrendingDown" /><KpiCard label="Pareceres automatizados" value="67%" delta="gate humano mantido" icon="Bot" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Entradas e aprovações" subtitle="Evolução da esteira nos últimos seis meses"><TimeSeriesChart data={ANALYTICS_TREND} xKey="mes" aKey="entradas" bKey="aprovadas" aLabel="Entradas" bLabel="Aprovadas" /></Panel><Panel title="Tempo médio por mês" subtitle="Dias corridos até decisão"><SingleBarChart data={ANALYTICS_TREND} xKey="mes" yKey="tempo" color="#E5A11A" /></Panel></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Principais gargalos" subtitle="Tempo, volume financeiro e participação"><div className="space-y-3">{BOTTLENECKS.map((b) => <div key={b.name}><div className="flex justify-between gap-3 text-[10.5px]"><span className="text-neutral-300">{b.name}</span><span className="text-neutral-500">{b.days} dias · {fmtCompactBRL(b.volume)} · {b.share}%</span></div><div className="mt-1"><ProgressBar value={b.share / 35} tone={b.share >= 25 ? 'red' : b.share >= 15 ? 'amber' : 'blue'} height={5} /></div></div>)}</div></Panel></div><div className="xl:col-span-5"><Panel title="Insights da IA" subtitle="Explicáveis e acionáveis"><div className="space-y-2">{[
          ['Licenciamento responde por 31% do tempo pré-contratação', '92%', 'Criar fast-track para operações com licença prévia.'], ['Diligências consolidadas reduzem 4,6 dias de retrabalho', '89%', 'Tornar agrupamento padrão em toda a carteira.'], ['Operações com análise ArcGIS apresentam 28% menos surpresa territorial', '87%', 'Obrigar geometria antes da análise ambiental.'], ['Baseline automática reduz em 64% o tempo até o primeiro desembolso', '91%', 'Integrar aprovação ao Nexo Entrega.'],
        ].map(([title, conf, rec]) => <div key={title} className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="flex justify-between gap-2"><span className="text-[11.5px] text-neutral-200">{title}</span><Pill tone="cyan">{conf}</Pill></div><div className="mt-1.5 text-[10.5px] text-neutral-500">{rec}</div></div>)}</div></Panel></div></div>
      </>}

      {section === 'agents' && <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-8"><Panel title="Cockpit de agentes" subtitle="Execuções, fontes, confiança, recomendação e gate humano"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{agents.map((a) => <AgentRuntimeCard key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel></div><div className="xl:col-span-4 space-y-4"><Panel title="Eventos em tempo real" subtitle={`Ciclo ${liveStep}/${LIVE_STEPS.length}`}><EventFeed events={events.slice(-20)} dense maxHeight={580} /></Panel><Panel title="Governança dos agentes"><div className="space-y-2 text-[10.5px] text-neutral-400">{[['Automático', 'Leitura, reconciliação, checklist e cálculo'], ['Assistido', 'Parecer, diligência, agenda e baseline'], ['Humano obrigatório', 'Aprovar, reprovar, suspender e contratar']].map(([a, b]) => <div key={a} className="rounded-md border border-white/8 bg-white/[0.025] p-2.5"><div className="text-neutral-200">{a}</div><div className="mt-0.5">{b}</div></div>)}</div></Panel></div></div>}

      {section === 'reports' && <>
        <Panel title="Biblioteca de relatórios" subtitle="Geração simulada com dados, gráficos, mapas, evidências e resumo executivo"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{CONTRATA_REPORTS.map((r) => { const p = reportProgress[r.id] ?? 0; return <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] text-neutral-100">{r.name}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{r.cadence} · {r.audience}</div></div><Icon name="FileText" size={15} className="text-[#E5A11A]" /></div><div className="mt-2 text-[10px] text-neutral-600">{r.format}</div>{p > 0 && <div className="mt-3"><ProgressBar value={p / 100} tone={p >= 100 ? 'teal' : 'cyan'} height={4} /><div className="mt-1 text-[9.5px] text-neutral-500">{p >= 100 ? 'Pronto para download' : `Gerando ${p}%`}</div></div>}<div className="mt-3 flex gap-2"><button onClick={() => generateReport(r.id)} className="flex-1 rounded-md bg-[#E5A11A]/15 border border-[#E5A11A]/30 px-2 py-1.5 text-[10.5px] text-[#F0B94A]">{p >= 100 ? 'Gerar novamente' : 'Gerar'}</button>{p >= 100 && <button onClick={() => downloadCsv(`${r.id}.csv`, QUEUE_ITEMS.map((q) => ({ operacao: q.operacao, valor: q.valor, elegibilidade: q.elegibilidadePct, risco: q.riskScore, decisao: decisions[q.id] ? CONTRATA_DECISION_LABEL[decisions[q.id]] : 'Pendente' })))} className="rounded-md border border-white/10 px-2 py-1.5 text-neutral-400"><Icon name="Download" size={12} /></button>}</div></div>; })}</div></Panel>
        <Panel title="Pacote para comitê" subtitle="Composição automática do material de decisão"><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{['Resumo executivo', 'Dossiê consolidado', 'Matriz de riscos', 'Pareceres', 'Mapa territorial', 'Funding e covenants', 'Condicionantes', 'Minuta de decisão'].map((x) => <div key={x} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-center gap-2"><Icon name="FileCheck" size={13} className="text-[#0FA39D]" /><span className="text-[10.5px] text-neutral-300">{x}</span></div>)}</div></Panel>
      </>}

      {section === 'admin' && <>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Regras corporativas" subtitle="Parâmetros, guardrails e automações"><div className="space-y-2">{rules.map((r) => <div key={r.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="text-[11.5px] text-neutral-200">{r.name}</span>{r.critical && <Pill tone="neutral">crítica</Pill>}</div><div className="text-[10.5px] text-neutral-500 mt-1">{r.description}</div><div className="text-[9.5px] text-neutral-600 mt-1">{r.category}</div></div><button onClick={() => !r.critical && setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, enabled: !x.enabled } : x))} className={cls('w-10 h-5 rounded-full p-0.5 transition-colors shrink-0', r.enabled ? 'bg-[#0FA39D]' : 'bg-white/10', r.critical && 'opacity-70 cursor-not-allowed')}><span className={cls('block w-4 h-4 rounded-full bg-white transition-transform', r.enabled && 'translate-x-5')} /></button></div>)}</div></Panel></div><div className="xl:col-span-5"><Panel title="Alçadas de decisão"><div className="space-y-2">{[['Até R$ 50 mi', 'Analista sênior + gerente'], ['R$ 50–250 mi', 'Comitê Regional'], ['Acima de R$ 250 mi', 'Comitê de Crédito'], ['Risco crítico', 'Diretoria de Riscos + Jurídico'], ['Exceção de programa', 'Conselho Diretor']].map(([range, gate]) => <div key={range} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5 flex justify-between gap-3"><span className="text-[10.5px] text-neutral-300">{range}</span><span className="text-[10.5px] text-neutral-500 text-right">{gate}</span></div>)}</div></Panel><Panel title="Ambiente" className="mt-4"><div className="space-y-2 text-[10.5px]">{[['Modo', 'Demonstração com dados sintéticos'], ['Trilha', 'Imutável e versionada'], ['IA', 'Assistiva e explicável'], ['Decisão', 'Gate humano obrigatório'], ['Última política', '21/07/2026 09:30']].map(([l, v]) => <div key={l} className="flex justify-between gap-3"><span className="text-neutral-500">{l}</span><span className="text-neutral-300 text-right">{v}</span></div>)}</div></Panel></div></div>
        <Panel title="Integrações e ownership" subtitle="Sistemas de registro preservados; Nexo Contrata atua como camada de inteligência e orquestração"><div className="overflow-x-auto nexo-scroll"><table className="w-full min-w-[760px]"><thead><tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wide text-neutral-500"><th className="p-2">Origem/destino</th><th className="p-2">Objeto</th><th className="p-2">Direção</th><th className="p-2">Situação</th><th className="p-2">Ação</th></tr></thead><tbody>{CONTRATA_INTEGRATIONS.map((i) => <tr key={i.name} className="border-b border-white/[0.06]"><td className="p-2 text-[11px] text-neutral-200">{i.name}</td><td className="p-2 text-[10.5px] text-neutral-500">{i.object}</td><td className="p-2 text-[10.5px] text-neutral-400">{i.direction}</td><td className="p-2"><Pill tone="cyan">{i.status}</Pill></td><td className="p-2">{i.product !== 'externo' && <button onClick={() => onNavigateProduct(i.product as ProductKey)} className="text-[10.5px] text-[#75B9E5]">Abrir módulo</button>}</td></tr>)}</tbody></table></div></Panel>
      </>}

      <CaseDetailSheet item={selected} open={detailOpen} onClose={() => setDetailOpen(false)} onOpenAsset={onOpenAsset} onNavigateProduct={onNavigateProduct} onDecision={(d) => recordDecision(selected, d)} decision={decisions[selected.id]} />
    </div>
  );
}
