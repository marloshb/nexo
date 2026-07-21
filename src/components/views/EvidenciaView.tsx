import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, type EventItem } from '@/data/mockData';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { DonutChart, TimeSeriesChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import { TrechoMap } from '@/components/shared/TrechoMap';
import {
  CUSTODY_EVENTS,
  EVIDENCE_AGENTS,
  EVIDENCE_LIVE_STEPS,
  EVIDENCE_RECORDS,
  EVIDENCE_REPORTS,
  EVIDENCE_STATUS_CHART,
  EVIDENCE_VOLUME_SERIES,
  INSPECTION_ORDERS,
  type CustodyEvent,
  type EvidenceAgentRuntime,
  type EvidenceRecord,
  type EvidenceStatus,
  type EvidenciaSection,
  type InspectionOrder,
} from '@/data/evidenciaData';
import { cls, fmtCompactBRL, type StatusKey } from '@/lib/tokens';
import type { ProductKey } from '@/data/navConfig';
import type { VistoriaStage } from '@/App';

const TYPE_ICON: Record<string, string> = {
  Foto: 'Camera',
  Vídeo: 'Video',
  Documento: 'FileText',
  Geometria: 'Route',
  'Imagem orbital': 'Images',
  Sensor: 'Activity',
  BIM: 'Building2',
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  validada: 'Validada',
  divergente: 'Divergente',
  revisao: 'Em revisão',
  pendente: 'Pendente',
  rejeitada: 'Rejeitada',
};

const STATUS_TONE: Record<EvidenceStatus, StatusKey> = {
  validada: 'normal',
  divergente: 'critico',
  revisao: 'analise',
  pendente: 'pendente',
  rejeitada: 'bloqueado',
};

const INSPECTION_STAGES: InspectionOrder['status'][] = ['agendada', 'designada', 'em_campo', 'sincronizada', 'validacao', 'concluida'];
const INSPECTION_LABEL: Record<InspectionOrder['status'], string> = {
  agendada: 'Agendada',
  designada: 'Equipe designada',
  em_campo: 'Em campo',
  sincronizada: 'Sincronizada',
  validacao: 'Em validação',
  concluida: 'Concluída',
};
const GLOBAL_STAGE_MAP: Record<VistoriaStage, InspectionOrder['status']> = {
  agendada: 'agendada', designada: 'designada', em_campo: 'em_campo', sincronizada: 'sincronizada', validacao: 'validacao', concluida: 'concluida',
};

function statusColor(status: EvidenceStatus) {
  if (status === 'validada') return '#0FA39D';
  if (status === 'divergente' || status === 'rejeitada') return '#D14A55';
  if (status === 'revisao') return '#1584D1';
  return '#E5A11A';
}

function EvidencePreview({ evidence, large = false }: { evidence: EvidenceRecord; large?: boolean }) {
  const c = statusColor(evidence.status);
  return (
    <div className={cls('rounded-xl border border-white/10 bg-gradient-to-br from-[#123353] via-[#0B2235] to-[#071521] relative overflow-hidden', large ? 'min-h-[330px]' : 'aspect-video')}>
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 16px)' }} />
      <div className="absolute inset-4 rounded-lg border border-white/8" />
      {evidence.type === 'Geometria' || evidence.type === 'Imagem orbital' ? (
        <svg viewBox="0 0 520 300" className="absolute inset-0 w-full h-full opacity-85">
          <path d="M35,230 C110,180 160,205 225,135 C286,70 345,122 482,52" fill="none" stroke="#394B59" strokeWidth="7" strokeDasharray="9 8" />
          <path d="M35,238 C102,198 170,218 240,155 C308,93 360,145 480,73" fill="none" stroke={c} strokeWidth="4" />
          {[85, 190, 310, 430].map((x, i) => <circle key={x} cx={x} cy={[210, 185, 125, 85][i]} r="7" fill={i === 2 ? '#D14A55' : '#18B7D6'} stroke="#071521" strokeWidth="2" />)}
          <text x="300" y="110" fill="#D14A55" fontSize="13" fontWeight="600">desvio 47 m</text>
        </svg>
      ) : evidence.type === 'Documento' ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[48%] h-[72%] rounded-lg border border-white/15 bg-white/[0.06] p-5">
            <div className="h-3 w-3/5 bg-white/20 rounded" /><div className="mt-5 space-y-3">{[1,2,3,4,5].map((x) => <div key={x} className="h-2 bg-white/10 rounded" style={{ width: `${92 - x * 5}%` }} />)}</div>
            <div className="mt-7 flex justify-end"><Icon name="FileCheck" size={28} className="text-[#0FA39D]" /></div>
          </div>
        </div>
      ) : evidence.type === 'Sensor' ? (
        <svg viewBox="0 0 520 300" className="absolute inset-0 w-full h-full">
          <polyline points="20,205 70,198 110,201 155,160 205,174 250,112 300,128 350,88 400,110 500,68" fill="none" stroke="#18B7D6" strokeWidth="4" />
          <line x1="20" y1="235" x2="500" y2="235" stroke="#394B59" /><line x1="20" y1="55" x2="20" y2="235" stroke="#394B59" />
        </svg>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl border border-white/12 bg-white/[0.05] flex items-center justify-center"><Icon name={TYPE_ICON[evidence.type] ?? 'FileText'} size={30} className="text-[#6FD8EC]" /></div>
          <div className="text-[12px] text-neutral-300">{evidence.locationLabel}</div>
          <div className="text-[10px] text-neutral-500">Pré-visualização sintética · objeto original preservado</div>
        </div>
      )}
      <div className="absolute left-3 top-3 flex gap-2"><Pill tone="cyan"><Icon name={TYPE_ICON[evidence.type] ?? 'FileText'} size={10} />{evidence.type}</Pill><span className="rounded-md border px-2 py-0.5 text-[10.5px]" style={{ color: c, borderColor: `${c}55`, background: `${c}18` }}>{STATUS_LABEL[evidence.status]}</span></div>
      <div className="absolute right-3 bottom-3 rounded-md bg-[#071521]/80 border border-white/10 px-2 py-1 text-[9.5px] text-neutral-400 font-mono-id">{evidence.id}</div>
    </div>
  );
}

function ValidationMetric({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const effective = inverse ? 1 - value : value;
  const tone = effective >= 0.9 ? 'teal' : effective >= 0.72 ? 'amber' : 'red';
  return <div><div className="flex justify-between mb-1 text-[10.5px]"><span className="text-neutral-500">{label}</span><span className="text-neutral-200 tnum">{Math.round(value * 100)}%</span></div><ProgressBar value={inverse ? 1 - value : value} tone={tone} height={5} /></div>;
}

function AgentRuntimeCard({ agent, onRun }: { agent: EvidenceAgentRuntime; onRun: () => void }) {
  const color = agent.status === 'running' ? '#18B7D6' : agent.status === 'waiting' ? '#7C5CBF' : agent.status === 'alert' ? '#D14A55' : agent.status === 'done' ? '#0FA39D' : '#9AACB8';
  const label = agent.status === 'running' ? 'Em execução' : agent.status === 'waiting' ? 'Aguardando humano' : agent.status === 'alert' ? 'Alerta' : agent.status === 'done' ? 'Concluído' : 'Disponível';
  return (
    <div className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-3.5">
      <div className="flex items-start justify-between gap-3"><div><div className="text-[12px] font-semibold text-neutral-100">{agent.name}</div><div className="text-[10px] text-neutral-500 mt-1 leading-snug">{agent.function}</div></div><span className="text-[9.5px] rounded-full border px-2 py-0.5 whitespace-nowrap" style={{ color, borderColor: `${color}55`, background: `${color}15` }}>{label}</span></div>
      <div className="mt-3"><div className="flex justify-between text-[10px] text-neutral-500 mb-1"><span>{agent.entity}</span><span>{agent.progress}%</span></div><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'red' : agent.status === 'done' ? 'teal' : 'cyan'} height={5} /></div>
      <div className="mt-2 text-[10.5px] text-neutral-300">{agent.stage}</div>
      <div className="mt-2 rounded-lg border border-white/8 bg-white/[0.025] p-2 text-[10px] text-neutral-400 leading-snug">{agent.recommendation}</div>
      <div className="mt-2 flex justify-between text-[9.5px] text-neutral-600"><span>{Math.round(agent.confidence * 100)}% confiança</span><span>{agent.impact}</span></div>
      <button onClick={onRun} className="mt-3 w-full rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 py-1.5 text-[10.5px] text-[#6FD8EC]"><Icon name="Play" size={10} className="inline mr-1" />Executar análise</button>
    </div>
  );
}

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(';'), ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? '').replaceAll('"', '""')}"`).join(';'))].join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function EvidenciaView({
  section,
  onSectionChange,
  onOpenAsset,
  onNavigateProduct,
  events,
  onPushEvent,
  vistoriaStage,
  demoStepIdx,
  demoRunning,
}: {
  section: EvidenciaSection;
  onSectionChange: (section: EvidenciaSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
  vistoriaStage: VistoriaStage;
  demoStepIdx: number;
  demoRunning: boolean;
}) {
  const [evidences, setEvidences] = useState(EVIDENCE_RECORDS);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('EV-08843');
  const [orders, setOrders] = useState(INSPECTION_ORDERS);
  const [selectedInspectionId, setSelectedInspectionId] = useState('OV-2026-0871');
  const [agents, setAgents] = useState(EVIDENCE_AGENTS);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | EvidenceStatus>('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [reportProgress, setReportProgress] = useState<Record<string, number>>({});
  const [custodyFilter, setCustodyFilter] = useState('EV-08843');
  const [sealed, setSealed] = useState(false);

  const selectedEvidence = evidences.find((e) => e.id === selectedEvidenceId) ?? evidences[0];
  const selectedInspection = orders.find((o) => o.id === selectedInspectionId) ?? orders[0];
  const filteredEvidence = useMemo(() => evidences.filter((e) => {
    const q = search.toLowerCase();
    return (!q || `${e.id} ${e.title} ${e.assetName} ${e.measurementId}`.toLowerCase().includes(q)) && (statusFilter === 'todos' || e.status === statusFilter) && (typeFilter === 'todos' || e.type === typeFilter) && (!selectedUF || e.uf === selectedUF);
  }), [evidences, search, statusFilter, typeFilter, selectedUF]);
  const evidenceAssets = ASSETS.filter((a) => evidences.some((e) => e.assetId === a.id));
  const exposure = evidences.filter((e) => e.status === 'divergente' || e.status === 'pendente').reduce((s, e) => s + e.relatedValue, 0);
  const validationRate = evidences.filter((e) => e.status === 'validada').length / evidences.length;
  const avgConfidence = evidences.reduce((s, e) => s + e.confidence, 0) / evidences.length;
  const custodyEvents = CUSTODY_EVENTS.filter((e) => e.evidenceId === custodyFilter);
  const effectiveInspectionStatus = selectedInspection.id === 'OV-2026-0871' && demoRunning ? GLOBAL_STAGE_MAP[vistoriaStage] : selectedInspection.status;
  const crewWaypointIndex = demoRunning ? Math.min(3, Math.floor(demoStepIdx / 3)) : Math.min(3, Math.floor(liveStep / 2.5));

  useEffect(() => {
    if (!liveRunning) return;
    if (liveStep >= EVIDENCE_LIVE_STEPS.length) {
      setLiveRunning(false);
      setAgents((prev) => prev.map((a) => a.id === 'orchestrator' ? { ...a, status: 'waiting', progress: 100, stage: 'Gate humano preparado', recommendation: 'Liberar parcialmente R$ 15,7 mi e manter R$ 2,65 mi retidos até conclusão de T-22.' } : a.id === 'custody' ? { ...a, status: 'done', progress: 100, stage: 'Versão selada' } : a));
      setOrders((prev) => prev.map((o) => o.id === 'OV-2026-0871' ? { ...o, status: 'validacao', progress: 0.86, finding: 'T-14 e T-17 confirmados; T-22 permanece em análise.' } : o));
      return;
    }
    const timer = setTimeout(() => {
      const step = EVIDENCE_LIVE_STEPS[liveStep];
      onPushEvent(step.text, liveStep === 5 ? 'success' : liveStep === 2 ? 'warning' : 'agent');
      setAgents((prev) => prev.map((a) => {
        if (a.id !== step.agentId) return a;
        const progress = Math.min(100, Math.max(a.progress, 20 + liveStep * 9));
        return { ...a, status: liveStep >= 8 && a.id === 'custody' ? 'done' : 'running', progress, stage: step.text };
      }));
      if (liveStep === 5) setEvidences((prev) => prev.map((e) => e.id === 'EV-08842' ? { ...e, confidence: 0.99, decision: 'Validada novamente em campo' } : e));
      if (liveStep === 6) setOrders((prev) => prev.map((o) => o.id === 'OV-2026-0871' ? { ...o, status: 'em_campo', progress: 0.72, finding: 'T-14 e T-17 confirmados; equipe em deslocamento ao T-22.' } : o));
      setLiveStep((s) => s + 1);
    }, 1300);
    return () => clearTimeout(timer);
  }, [liveRunning, liveStep, onPushEvent]);

  function toggleLive() {
    if (liveRunning) { setLiveRunning(false); return; }
    if (liveStep >= EVIDENCE_LIVE_STEPS.length) {
      setLiveStep(0);
      setAgents(EVIDENCE_AGENTS.map((a) => ({ ...a, status: a.id === 'orchestrator' || a.id === 'inspection' ? 'running' : a.status, progress: a.id === 'orchestrator' ? 18 : a.id === 'inspection' ? 32 : a.progress })));
    }
    setLiveRunning(true);
    onPushEvent('Nexo Evidência iniciou ciclo de validação e vistoria ao vivo.', 'agent');
  }

  function runAgent(id: string) {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'running', progress: 12, stage: 'Consultando fontes e regras autorizadas' } : a));
    onPushEvent(`${agents.find((a) => a.id === id)?.name ?? 'Agente'} iniciado sob demanda.`, 'agent');
    let p = 12;
    const interval = window.setInterval(() => {
      p += 17;
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, progress: Math.min(100, p), status: p >= 100 ? 'done' : 'running', stage: p >= 100 ? 'Análise concluída e log registrada' : `Processando etapa ${Math.ceil(p / 20)} de 5` } : a));
      if (p >= 100) { window.clearInterval(interval); onPushEvent(`${agents.find((a) => a.id === id)?.name ?? 'Agente'} concluiu a execução.`, 'success'); }
    }, 420);
  }

  function advanceInspection(id: string) {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const idx = INSPECTION_STAGES.indexOf(o.status);
      const next = INSPECTION_STAGES[Math.min(INSPECTION_STAGES.length - 1, idx + 1)];
      onPushEvent(`${o.id}: status alterado para ${INSPECTION_LABEL[next]}.`, next === 'concluida' ? 'success' : 'agent');
      return { ...o, status: next, progress: Math.min(1, o.progress + 0.18), finding: next === 'concluida' ? 'Laudo final emitido e evidências vinculadas à decisão.' : o.finding };
    }));
  }

  function updateEvidenceDecision(status: EvidenceStatus, decision: string) {
    setEvidences((prev) => prev.map((e) => e.id === selectedEvidence.id ? { ...e, status, decision, confidence: status === 'validada' ? Math.max(e.confidence, 0.94) : e.confidence } : e));
    onPushEvent(`${selectedEvidence.id}: ${decision}`, status === 'validada' ? 'success' : status === 'rejeitada' ? 'critical' : 'warning');
  }

  function generateReport(id: string) {
    setReportProgress((p) => ({ ...p, [id]: 8 }));
    let progress = 8;
    const interval = window.setInterval(() => {
      progress += 16;
      setReportProgress((p) => ({ ...p, [id]: Math.min(100, progress) }));
      if (progress >= 100) { window.clearInterval(interval); onPushEvent(`${EVIDENCE_REPORTS.find((r) => r.id === id)?.title} gerado com trilha auditável.`, 'success'); }
    }, 300);
  }

  return (
    <div className="p-5 space-y-4 max-w-[1580px] mx-auto nexo-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Evidência</h1><p className="text-[12px] text-neutral-500 mt-0.5">Fábrica corporativa de evidências, vistorias e cadeia de custódia</p></div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onNavigateProduct('entrega')} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-300"><Icon name="HardHat" size={12} className="inline mr-1" />Nexo Entrega</button>
          <button onClick={() => onOpenAsset(selectedEvidence.assetId)} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Building2" size={12} className="inline mr-1" />Ativo 360</button>
          <button onClick={toggleLive} className="rounded-lg bg-[#18B7D6] px-3 py-2 text-[11px] font-semibold text-[#071521]"><Icon name={liveRunning ? 'Pause' : 'Play'} size={12} className="inline mr-1" />{liveRunning ? 'Pausar operação' : 'Executar ciclo ao vivo'}</button>
        </div>
      </div>

      {section === 'overview' && <>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Evidências na carteira" value="18.420" delta="+1.284 no mês" icon="Images" />
          <KpiCard label="Validação automática" value={`${Math.round(validationRate * 100)}%`} delta="Com rastreabilidade" icon="ShieldCheck" />
          <KpiCard label="Confiança média" value={`${Math.round(avgConfidence * 100)}%`} delta="+3,2 p.p." icon="BadgeCheck" />
          <KpiCard label="Vistorias abertas" value={String(orders.filter((o) => o.status !== 'concluida').length)} delta="2 críticas" deltaTone="amber" icon="ClipboardCheck" />
          <KpiCard label="Valor condicionado" value={fmtCompactBRL(exposure)} delta="Protegido por evidências" deltaTone="red" icon="ShieldAlert" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <Panel title="Operação ao vivo — Medição nº 6" subtitle="Vale Verde · validação, vistoria e decisão coordenadas por agentes" actions={<button onClick={() => onSectionChange('viewer')} className="text-[10.5px] text-[#6FD8EC]">Abrir visualizador <Icon name="ArrowRight" size={11} className="inline" /></button>}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_0.85fr] gap-4"><TrechoMap crewWaypointIndex={crewWaypointIndex} active={liveRunning || demoRunning} /><div className="space-y-2.5">{EVIDENCE_LIVE_STEPS.slice(0, 6).map((s, i) => <div key={s.text} className="flex gap-2"><span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: i < liveStep ? '#0FA39D' : i === liveStep && liveRunning ? '#18B7D6' : '#394B59' }} /><div><div className={cls('text-[10.8px]', i <= liveStep ? 'text-neutral-200' : 'text-neutral-600')}>{s.text}</div><div className="text-[9px] text-neutral-600">{EVIDENCE_AGENTS.find((a) => a.id === s.agentId)?.name}</div></div></div>)}</div></div>
          </Panel>
          <Panel title="Situação das evidências" subtitle="Distribuição da carteira atual"><DonutChart data={EVIDENCE_STATUS_CHART} /></Panel>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <Panel title="Volume e validação" subtitle="Evidências recebidas versus validadas"><TimeSeriesChart data={EVIDENCE_VOLUME_SERIES} xKey="mes" aKey="recebidas" bKey="validadas" aLabel="Recebidas" bLabel="Validadas" /></Panel>
          <Panel title="Exceções prioritárias" subtitle="Itens que afetam desembolso, execução ou funcionalidade"><div className="space-y-2">{evidences.filter((e) => e.status !== 'validada').map((e) => <button key={e.id} onClick={() => { setSelectedEvidenceId(e.id); onSectionChange('viewer'); }} className="w-full rounded-lg border border-white/8 bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]"><div className="flex items-start justify-between gap-3"><div><div className="text-[11.5px] text-neutral-100">{e.title}</div><div className="text-[9.5px] text-neutral-500 mt-1">{e.assetName} · {e.locationLabel}</div></div><StatusChip status={STATUS_TONE[e.status]} size="sm" /></div><div className="mt-2 flex justify-between text-[10px] text-neutral-500"><span>{e.id} · {Math.round(e.confidence * 100)}% confiança</span><span>{fmtCompactBRL(e.relatedValue)}</span></div></button>)}</div></Panel>
        </div>
        <Panel title="Integração ponta a ponta" subtitle="A evidência retorna aos produtos responsáveis pela decisão">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">{[
            ['Nexo Entrega', 'Medição, desembolso e decisão', 'HardHat', 'entrega'], ['Nexo Contrata', 'Baseline e condições precedentes', 'ClipboardCheck', 'contrata'], ['Nexo Ativos', 'As built, operação e manutenção', 'Building2', 'ativos'], ['Nexo Impacto', 'Resultado e comprovação', 'Sprout', 'impacto'], ['Nexo Data', 'Linhagem, qualidade e integrações', 'Database', 'data'],
          ].map(([name, desc, icon, product]) => <button key={name} onClick={() => onNavigateProduct(product as ProductKey)} className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-left hover:border-[#18B7D6]/30"><Icon name={icon} size={15} className="text-[#6FD8EC]" /><div className="text-[11px] text-neutral-200 mt-2">{name}</div><div className="text-[9.5px] text-neutral-500 mt-1">{desc}</div></button>)}</div>
        </Panel>
      </>}

      {section === 'viewer' && <>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[250px]"><Icon name="Search" size={13} className="absolute left-3 top-2.5 text-neutral-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar evidência, ativo ou medição..." className="w-full rounded-lg border border-white/10 bg-[#0B2235] pl-9 pr-3 py-2 text-[11px] text-neutral-200 outline-none" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os status</option>{Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os tipos</option>{[...new Set(evidences.map((e) => e.type))].map((x) => <option key={x}>{x}</option>)}</select>
          <button onClick={() => downloadCsv('nexo-evidencias.csv', filteredEvidence.map((e) => ({ id: e.id, ativo: e.assetName, medicao: e.measurementId, tipo: e.type, status: e.status, confianca: e.confidence, valor: e.relatedValue })))} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Download" size={11} className="inline mr-1" />Exportar</button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
          <Panel title="Caixa de entrada" subtitle={`${filteredEvidence.length} evidências`} dense><div className="space-y-1.5 max-h-[690px] overflow-y-auto nexo-scroll pr-1">{filteredEvidence.map((e) => <button key={e.id} onClick={() => setSelectedEvidenceId(e.id)} className={cls('w-full text-left rounded-lg border p-2.5 transition-colors', selectedEvidence.id === e.id ? 'border-[#18B7D6]/50 bg-[#18B7D6]/8' : 'border-white/8 bg-white/[0.025] hover:bg-white/[0.05]')}><div className="flex justify-between gap-2"><div className="text-[10.8px] text-neutral-200 truncate">{e.title}</div><Icon name={TYPE_ICON[e.type] ?? 'FileText'} size={12} className="text-neutral-500 shrink-0" /></div><div className="text-[9.5px] text-neutral-600 mt-1">{e.id} · {e.measurementId}</div><div className="mt-2 flex justify-between items-center"><span className="text-[9.5px]" style={{ color: statusColor(e.status) }}>{STATUS_LABEL[e.status]}</span><span className="text-[9.5px] text-neutral-500">{Math.round(e.confidence * 100)}%</span></div></button>)}</div></Panel>
          <div className="space-y-4">
            <Panel title="Evidência original" subtitle={`${selectedEvidence.id} · ${selectedEvidence.assetName}`} actions={<button onClick={() => onOpenAsset(selectedEvidence.assetId)} className="text-[10.5px] text-[#6FD8EC]">Abrir Ativo 360</button>}><EvidencePreview evidence={selectedEvidence} large /></Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Metadados e rastreabilidade" dense><div className="space-y-2 text-[10.8px]">{[
                ['Tipo', selectedEvidence.type], ['Origem', selectedEvidence.source], ['Operador', selectedEvidence.operator], ['Capturado em', selectedEvidence.capturedAt], ['Recebido em', selectedEvidence.receivedAt], ['Local', `${selectedEvidence.locationLabel} · ${selectedEvidence.city}/${selectedEvidence.uf}`], ['Hash', selectedEvidence.hash], ['Assinatura', selectedEvidence.signature], ['Item vinculado', selectedEvidence.linkedItem],
              ].map(([l,v]) => <div key={l} className="flex justify-between gap-4"><span className="text-neutral-500">{l}</span><span className="text-neutral-200 text-right">{v}</span></div>)}</div></Panel>
              <Panel title="Validações automáticas" dense><div className="space-y-3"><ValidationMetric label="Confiança consolidada" value={selectedEvidence.confidence} /><ValidationMetric label="Aderência geoespacial" value={selectedEvidence.geoMatch} /><ValidationMetric label="Metadados e assinatura" value={selectedEvidence.metadataScore} /><ValidationMetric label="Originalidade / não duplicidade" value={selectedEvidence.duplicateScore} /><ValidationMetric label="Risco de manipulação" value={selectedEvidence.manipulationRisk} inverse /></div></Panel>
            </div>
            <Panel title="Decisão e recomendação" subtitle={`${fmtCompactBRL(selectedEvidence.relatedValue)} relacionados à evidência`}><div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start"><div><div className="rounded-lg border p-3 text-[11px] leading-relaxed" style={{ borderColor: `${statusColor(selectedEvidence.status)}45`, background: `${statusColor(selectedEvidence.status)}10`, color: '#DDE3E8' }}>{selectedEvidence.anomaly ?? selectedEvidence.decision}</div><div className="mt-2 text-[10px] text-neutral-500">Agente responsável: {selectedEvidence.status === 'divergente' ? 'Validação Geoespacial + Integridade e Fraude' : 'Ingestão e Metadados'} · Fontes e regras registradas no log.</div></div><div className="flex gap-2 flex-wrap lg:justify-end"><button onClick={() => updateEvidenceDecision('validada', 'Evidência validada por decisão humana.')} className="rounded-lg bg-[#0FA39D] px-3 py-2 text-[10.5px] font-semibold text-[#071521]">Validar</button><button onClick={() => { setSelectedInspectionId('OV-2026-0871'); onSectionChange('inspections'); }} className="rounded-lg border border-[#E5A11A]/35 bg-[#E5A11A]/8 px-3 py-2 text-[10.5px] text-[#F0B94A]">Solicitar vistoria</button><button onClick={() => updateEvidenceDecision('rejeitada', 'Evidência rejeitada e item encaminhado para diligência.')} className="rounded-lg border border-[#D14A55]/35 bg-[#D14A55]/8 px-3 py-2 text-[10.5px] text-[#E87982]">Rejeitar</button></div></div></Panel>
          </div>
        </div>
      </>}

      {section === 'inspections' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Ordens abertas" value={String(orders.filter((o) => o.status !== 'concluida').length)} delta="2 em prioridade P0/P1" deltaTone="amber" icon="ClipboardCheck" /><KpiCard label="Em campo" value={String(orders.filter((o) => o.status === 'em_campo').length)} delta="Posição live" icon="MapPin" /><KpiCard label="SLA médio" value="14h 18m" delta="-22% no trimestre" icon="Clock" /><KpiCard label="Rotas otimizadas" value="102 km" delta="38% menos deslocamento" icon="Route" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
          <Panel title="Ordens de vistoria" subtitle="Prioridade, SLA e situação" dense><div className="space-y-2">{orders.map((o) => <button key={o.id} onClick={() => setSelectedInspectionId(o.id)} className={cls('w-full rounded-lg border p-3 text-left', selectedInspection.id === o.id ? 'border-[#18B7D6]/50 bg-[#18B7D6]/8' : 'border-white/8 bg-white/[0.025]')}><div className="flex justify-between"><div className="text-[11px] text-neutral-100">{o.id}</div><span className={cls('text-[9px] rounded px-1.5 py-0.5', o.priority === 'P0' ? 'bg-[#D14A55]/15 text-[#E87982]' : o.priority === 'P1' ? 'bg-[#E5A11A]/15 text-[#F0B94A]' : 'bg-white/5 text-neutral-400')}>{o.priority}</span></div><div className="text-[10px] text-neutral-400 mt-1">{o.assetName}</div><div className="mt-2 flex justify-between text-[9.5px] text-neutral-600"><span>{INSPECTION_LABEL[o.status]}</span><span>{o.sla}</span></div><ProgressBar value={o.progress} tone={o.risk === 'critico' ? 'red' : o.risk === 'atencao' ? 'amber' : 'teal'} height={4} /></button>)}</div></Panel>
          <div className="space-y-4">
            <Panel title={`Ordem ${selectedInspection.id}`} subtitle={`${selectedInspection.assetName} · ${selectedInspection.measurementId}`} actions={<button onClick={() => advanceInspection(selectedInspection.id)} className="rounded-lg bg-[#1584D1] px-3 py-1.5 text-[10.5px] text-white">Avançar etapa</button>}>
              <div className="flex items-start overflow-x-auto pb-2 nexo-scroll">{INSPECTION_STAGES.map((stage, i) => { const idx = INSPECTION_STAGES.indexOf(effectiveInspectionStatus); return <div key={stage} className="flex items-start min-w-[120px] flex-1"><div className="flex flex-col items-center"><div className={cls('w-7 h-7 rounded-full border-2 flex items-center justify-center', i <= idx ? 'border-[#18B7D6] bg-[#18B7D6]/15' : 'border-white/15', i === idx && (liveRunning || demoRunning) && 'nexo-pulse-ring')}>{i < idx ? <Icon name="CheckCircle2" size={13} className="text-[#18B7D6]" /> : <span className={cls('w-2 h-2 rounded-full', i <= idx ? 'bg-[#18B7D6]' : 'bg-white/20')} />}</div><div className={cls('text-[9.5px] mt-1.5 text-center', i <= idx ? 'text-neutral-300' : 'text-neutral-600')}>{INSPECTION_LABEL[stage]}</div></div>{i < INSPECTION_STAGES.length - 1 && <div className={cls('h-[2px] mt-[13px] flex-1', i < idx ? 'bg-[#18B7D6]/60' : 'bg-white/10')} />}</div>; })}</div>
            </Panel>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-4"><Panel title="Mapa, rota e equipe" subtitle={`${selectedInspection.distanceKm} km · ${selectedInspection.team}`}><TrechoMap crewWaypointIndex={crewWaypointIndex} active={liveRunning || demoRunning || effectiveInspectionStatus === 'em_campo'} /></Panel><Panel title="Plano operacional" dense><div className="space-y-2 text-[10.8px]">{[['Líder', selectedInspection.lead], ['Agendamento', selectedInspection.scheduledFor], ['Objetivo', selectedInspection.objective], ['Rota', selectedInspection.route.join(' → ')], ['Evidências relacionadas', selectedInspection.evidenceIds.join(', ')], ['Achado atual', selectedInspection.finding], ['Decisão', selectedInspection.decision]].map(([l,v]) => <div key={l}><div className="text-neutral-500">{l}</div><div className="text-neutral-200 mt-0.5 leading-snug">{v}</div></div>)}</div></Panel></div>
            <Panel title="Checklist em campo" subtitle="Coleta offline, geolocalização e sincronização"><div className="grid grid-cols-1 md:grid-cols-3 gap-2">{['Confirmar identificação do trecho', 'Coletar ponto GNSS RTK', 'Fotografar marcos de referência', 'Medir extensão executada', 'Verificar conexão à rede', 'Registrar manifestação do executor'].map((x, i) => <label key={x} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5 flex items-center gap-2 text-[10.5px] text-neutral-300"><input type="checkbox" defaultChecked={i < Math.round(selectedInspection.progress * 6)} className="accent-[#18B7D6]" />{x}</label>)}</div></Panel>
          </div>
        </div>
      </>}

      {section === 'custody' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Objetos íntegros" value="99,98%" delta="Hash verificado" icon="ShieldCheck" /><KpiCard label="Assinaturas válidas" value="18.417" delta="3 pendentes" deltaTone="amber" icon="FileCheck" /><KpiCard label="Acessos auditados" value="42.806" delta="Últimos 30 dias" icon="Eye" /><KpiCard label="Pacotes selados" value="1.284" delta="Retenção corporativa" icon="Lock" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">
          <Panel title="Selecionar evidência" subtitle="Objeto e versão" dense><select value={custodyFilter} onChange={(e) => setCustodyFilter(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#071521] px-3 py-2 text-[11px] text-neutral-300">{evidences.map((e) => <option key={e.id} value={e.id}>{e.id} · {e.title}</option>)}</select><div className="mt-3"><EvidencePreview evidence={evidences.find((e) => e.id === custodyFilter) ?? selectedEvidence} /></div><div className="mt-3 rounded-lg border border-white/8 p-3 text-[10.5px] space-y-2"><div className="flex justify-between"><span className="text-neutral-500">Política de retenção</span><span className="text-neutral-200">10 anos</span></div><div className="flex justify-between"><span className="text-neutral-500">Classe de sigilo</span><span className="text-neutral-200">Uso interno restrito</span></div><div className="flex justify-between"><span className="text-neutral-500">Versão</span><span className="text-neutral-200">v1.4 imutável</span></div><div className="flex justify-between"><span className="text-neutral-500">Situação</span><span className={sealed ? 'text-[#0FA39D]' : 'text-[#E5A11A]'}>{sealed ? 'Pacote selado' : 'Aberto até laudo'}</span></div></div><button onClick={() => { setSealed(true); onPushEvent(`${custodyFilter}: pacote de evidências selado e assinado.`, 'success'); }} className="mt-3 w-full rounded-lg bg-[#0FA39D] px-3 py-2 text-[10.5px] font-semibold text-[#071521]">Selar pacote</button></Panel>
          <Panel title="Linha de custódia" subtitle="Captura, ingestão, análise, acesso, vínculo e retenção"><div className="space-y-0">{(custodyEvents.length ? custodyEvents : CUSTODY_EVENTS).map((c: CustodyEvent, i) => <div key={c.id} className="relative pl-8 pb-5 last:pb-0"><span className="absolute left-[5px] top-1 w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: c.hashState === 'íntegro' ? '#0FA39D' : '#E5A11A', background: c.hashState === 'íntegro' ? '#0FA39D18' : '#E5A11A18' }}><Icon name={c.hashState === 'íntegro' ? 'CheckCircle2' : 'AlertTriangle'} size={9} style={{ color: c.hashState === 'íntegro' ? '#0FA39D' : '#E5A11A' }} /></span>{i < (custodyEvents.length ? custodyEvents : CUSTODY_EVENTS).length - 1 && <span className="absolute left-[12px] top-5 bottom-0 w-px bg-white/10" />}<div className="flex justify-between gap-3"><div><div className="text-[11.5px] text-neutral-100">{c.event}</div><div className="text-[10px] text-neutral-500 mt-0.5">{c.actor} · {c.system}</div></div><div className="text-[10px] text-neutral-500 font-mono-id">{c.at}</div></div><div className="mt-2 rounded-lg border border-white/8 bg-white/[0.025] p-2.5 text-[10.5px] text-neutral-400">{c.detail}</div></div>)}</div></Panel>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Controles de integridade" subtitle="Políticas corporativas aplicadas"><div className="grid grid-cols-2 gap-2">{['Hash SHA-256 na ingestão e em cada versão', 'Assinatura digital e identidade do dispositivo', 'Timestamp confiável e relógio validado', 'Bloqueio de edição após vínculo à decisão', 'Criptografia em repouso e trânsito', 'Logs de acesso imutáveis', 'Retenção e descarte controlados', 'Exportação em pacote auditável'].map((x) => <div key={x} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5 flex gap-2 text-[10.5px] text-neutral-300"><Icon name="ShieldCheck" size={12} className="text-[#0FA39D] shrink-0" />{x}</div>)}</div></Panel><Panel title="Acessos recentes" subtitle="IAM, perfis e justificativas"><div className="space-y-2">{[['09:48:31', 'Marina Lopes', 'Field Maps', 'Consulta em campo'], ['09:21:05', 'Ana Beatriz Souza', 'Nexo Entrega', 'Análise da medição'], ['08:55:48', 'Agente de Custódia', 'Evidence API', 'Validação automática'], ['20:18:04', 'Auditoria Interna', 'Portal Nexo', 'Exportação do pacote']].map(([t,u,s,a]) => <div key={`${t}${u}`} className="grid grid-cols-[70px_1fr_1fr] gap-2 rounded-lg border border-white/8 bg-white/[0.025] p-2.5 text-[10px]"><span className="text-neutral-500 font-mono-id">{t}</span><span className="text-neutral-200">{u}<br/><span className="text-neutral-600">{s}</span></span><span className="text-neutral-400 text-right">{a}</span></div>)}</div></Panel></div>
      </>}

      {section === 'map' && <>
        <div className="flex gap-2 flex-wrap"><select value={selectedUF ?? ''} onChange={(e) => setSelectedUF(e.target.value || null)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="">Brasil</option>{[...new Set(evidences.map((e) => e.uf))].map((uf) => <option key={uf}>{uf}</option>)}</select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os status</option>{Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select><button className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Layers" size={11} className="inline mr-1" />Camadas</button><button className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Images" size={11} className="inline mr-1" />Living Atlas</button></div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4"><Panel title="Mapa nacional de evidências" subtitle="Ativos, ordens de vistoria, anomalias e cobertura" dense><BrazilMap assets={evidenceAssets} selectedId={selectedEvidence.assetId} onSelectAsset={(id) => { const e = evidences.find((x) => x.assetId === id); if (e) setSelectedEvidenceId(e.id); }} selectedUF={selectedUF} onSelectUF={setSelectedUF} height={540} colorBy="status" /></Panel><div className="space-y-4"><Panel title="Contexto selecionado" dense><div className="text-[12px] text-neutral-100">{selectedEvidence.assetName}</div><div className="text-[10px] text-neutral-500 mt-1">{selectedEvidence.city}/{selectedEvidence.uf} · {selectedEvidence.measurementId}</div><div className="mt-3"><EvidencePreview evidence={selectedEvidence} /></div><div className="mt-3 flex justify-between text-[10.5px]"><span className="text-neutral-500">Confiança</span><span className="text-neutral-200">{Math.round(selectedEvidence.confidence * 100)}%</span></div><ProgressBar value={selectedEvidence.confidence} tone={selectedEvidence.status === 'divergente' ? 'red' : 'teal'} height={5} /><button onClick={() => onSectionChange('viewer')} className="mt-3 w-full rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 py-2 text-[10.5px] text-[#6FD8EC]">Abrir evidência</button></Panel><Panel title="Camadas operacionais" dense><div className="space-y-2">{['Evidências e confiança', 'Ordens e equipes em campo', 'Baseline contratual', 'Geometria executada', 'Imagens orbitais', 'Riscos climáticos', 'Áreas de influência', 'Redes e dependências'].map((x, i) => <label key={x} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-[10.5px] text-neutral-300"><span>{x}</span><input type="checkbox" defaultChecked={i < 5} className="accent-[#18B7D6]" /></label>)}</div></Panel></div></div>
      </>}

      {section === 'agents' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Agentes ativos" value={String(agents.filter((a) => a.status === 'running').length)} delta="Operação live" icon="Bot" /><KpiCard label="Exceções" value={String(agents.filter((a) => a.status === 'alert').length)} delta="Gate humano" deltaTone="red" icon="AlertOctagon" /><KpiCard label="Automação" value="78%" delta="Itens de baixo risco" icon="Zap" /><KpiCard label="Confiança média" value={`${Math.round(agents.reduce((s,a) => s + a.confidence, 0) / agents.length * 100)}%`} delta="Fontes rastreáveis" icon="ShieldCheck" /></div>
        <Panel title="Cockpit de agentes" subtitle="Execução, fontes, confiança, recomendação e ação humana" actions={<button onClick={toggleLive} className="rounded-lg bg-[#18B7D6] px-3 py-1.5 text-[10.5px] font-semibold text-[#071521]"><Icon name={liveRunning ? 'Pause' : 'Play'} size={11} className="inline mr-1" />{liveRunning ? 'Pausar' : 'Executar ciclo'}</button>}><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{agents.map((a) => <AgentRuntimeCard key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel>
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4"><Panel title="Execução corrente" subtitle="Etapas visíveis, regras e resultados registrados"><div className="space-y-0">{EVIDENCE_LIVE_STEPS.map((s, i) => <div key={s.text} className="relative pl-7 pb-5 last:pb-0"><span className="absolute left-[6px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: i < liveStep ? '#0FA39D' : i === liveStep && liveRunning ? '#18B7D6' : '#394B59' }} /><span className="absolute left-[10.5px] top-4 bottom-0 w-px bg-white/10" /><div className={cls('text-[10.8px]', i <= liveStep ? 'text-neutral-200' : 'text-neutral-600')}>{s.text}</div><div className="text-[9px] text-neutral-600 mt-0.5">{agents.find((a) => a.id === s.agentId)?.name}</div></div>)}</div></Panel><Panel title="Eventos da plataforma" subtitle="Integração com os demais módulos"><EventFeed events={events.slice(-14)} /></Panel></div>
      </>}

      {section === 'reports' && <>
        <div className="flex justify-between gap-3 flex-wrap"><div><div className="text-[13px] font-semibold text-neutral-100">Biblioteca de relatórios</div><div className="text-[11px] text-neutral-500">Pacotes auditáveis, evidências, vistorias e integridade.</div></div><button onClick={() => downloadCsv('nexo-evidencia-carteira.csv', evidences.map((e) => ({ id: e.id, ativo: e.assetName, tipo: e.type, status: e.status, confianca: e.confidence, hash: e.hash, decisao: e.decision })))} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Download" size={12} className="inline mr-1" />Exportar carteira</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{EVIDENCE_REPORTS.map((r) => { const p = reportProgress[r.id] ?? 0; return <div key={r.id} className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-4"><div className="flex justify-between"><div className="w-8 h-8 rounded-lg border border-white/10 bg-[#071521]/60 flex items-center justify-center"><Icon name="FileText" size={14} className="text-[#6FD8EC]" /></div><Pill tone="neutral">{r.format}</Pill></div><div className="mt-3 text-[12.5px] font-semibold text-neutral-100">{r.title}</div><div className="text-[10.8px] text-neutral-400 mt-1 min-h-[38px]">{r.description}</div><div className="mt-3 grid grid-cols-2 gap-2 text-[9.5px] text-neutral-500"><span>{r.frequency}</span><span className="text-right">{r.audience}</span><span className="col-span-2">Último: {r.lastGenerated}</span></div>{p > 0 && p < 100 && <div className="mt-3"><ProgressBar value={p / 100} tone="cyan" height={5} /><div className="text-[9px] text-neutral-600 mt-1">Gerando {p}%</div></div>}{p === 100 && <div className="mt-3 text-[10px] text-[#0FA39D]"><Icon name="CheckCircle2" size={10} className="inline mr-1" />Pronto para revisão</div>}<button onClick={() => generateReport(r.id)} className="mt-3 w-full rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 py-2 text-[10.5px] text-[#6FD8EC]">{p === 100 ? 'Gerar nova versão' : 'Gerar relatório'}</button></div>; })}</div>
        <Panel title="Construtor de pacote auditável" subtitle="Selecione componentes e encaminhe para aprovação"><div className="grid grid-cols-2 md:grid-cols-5 gap-2">{['Evidências originais', 'Metadados', 'Validações', 'Mapa comparativo', 'Laudos', 'Cadeia de custódia', 'Logs dos agentes', 'Decisão humana', 'Documentos contratuais', 'Resumo executivo'].map((x, i) => <label key={x} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5 flex gap-2 text-[10.5px] text-neutral-300"><input type="checkbox" defaultChecked={i < 8} className="accent-[#18B7D6]" />{x}</label>)}</div><div className="mt-3 flex justify-end"><button onClick={() => onPushEvent('Pacote auditável da Medição nº 6 preparado para aprovação.', 'success')} className="rounded-lg bg-[#1584D1] px-3 py-2 text-[11px] text-white">Preparar pacote</button></div></Panel>
      </>}
    </div>
  );
}
