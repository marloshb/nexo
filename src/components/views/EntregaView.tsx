import React, { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import {
  DELIVERY_AGENTS, DELIVERY_ANALYTICS_TREND, DELIVERY_BOTTLENECKS, DELIVERY_INTEGRATIONS,
  DELIVERY_LIVE_STEPS, DELIVERY_MEASUREMENTS, DELIVERY_PORTFOLIO, DELIVERY_REPORTS,
  DELIVERY_WORKFLOWS, DISBURSEMENTS, PHYSICAL_FINANCIAL_GAP, SCHEDULE_MILESTONES, WORKFLOW_STAGES,
  type DeliveryAgentRuntime, type DeliveryIntegration,
  type EntregaSection, type MeasurementRecord,
} from '@/data/entregaData';
import { ASSETS, HERO_ASSET_ID, MEDICAO_ITENS, type EventItem } from '@/data/mockData';
import type { ProductKey } from '@/data/navConfig';
import { cls, fmtBRL, fmtCompactBRL } from '@/lib/tokens';
import { BarProgramChart, DonutChart, SCurveChart, SingleBarChart, TimeSeriesChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { TrechoMap } from '@/components/shared/TrechoMap';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import type { VistoriaStage } from '@/App';

interface EntregaViewProps {
  section: EntregaSection;
  onSectionChange: (section: EntregaSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
  vistoriaStage: VistoriaStage;
  onDecision: (action: 'parcial' | 'diligenciar' | 'suspender') => void;
  decision: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  validada: 'Validada', em_analise: 'Em análise', divergente: 'Divergente', aguardando_vistoria: 'Aguardando vistoria', paga: 'Paga',
  pronto: 'Pronto para decisão', decisao: 'Decisão humana', retido: 'Retido', processando: 'Processando', pago: 'Pago',
};
const STATUS_COLOR: Record<string, string> = {
  validada: '#0FA39D', em_analise: '#1584D1', divergente: '#D14A55', aguardando_vistoria: '#E5A11A', paga: '#0FA39D',
  pronto: '#0FA39D', decisao: '#7C5CBF', retido: '#D14A55', processando: '#1584D1', pago: '#0FA39D',
};
const PRIORITY_COLOR: Record<string, string> = { P0: '#D14A55', P1: '#E5A11A', P2: '#1584D1' };
const WORKFLOW_COLOR: Record<string, string> = {
  Recebido: '#9AACB8', 'Validação automática': '#18B7D6', 'Análise técnica': '#1584D1', Vistoria: '#E5A11A', 'Decisão humana': '#7C5CBF', Concluído: '#0FA39D',
};

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

function Header({ onSectionChange, onRunLive, running, onNavigateProduct }: {
  onSectionChange: (s: EntregaSection) => void; onRunLive: () => void; running: boolean; onNavigateProduct: (p: ProductKey) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-[#18B7D6]/14 border border-[#18B7D6]/25 flex items-center justify-center"><Icon name="HardHat" size={14} className="text-[#6FD8EC]" /></span><h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Entrega</h1></div>
        <p className="text-[12px] text-neutral-500 mt-1">Execução, medição, desembolso e destravamento · ciclo físico-financeiro verificável</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => onNavigateProduct('contrata')} className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] text-neutral-400 hover:text-white">Baseline contratual</button>
        <button onClick={() => onNavigateProduct('evidencia')} className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] text-neutral-400 hover:text-white">Abrir Evidência</button>
        <button onClick={() => onSectionChange('measurements')} className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/10 px-3 py-2 text-[11.5px] text-[#6FD8EC] hover:bg-[#18B7D6]/15"><Icon name="Ruler" size={12} className="inline mr-1.5" />Nova medição</button>
        <button onClick={onRunLive} className={cls('rounded-lg px-3 py-2 text-[11.5px] font-semibold flex items-center gap-1.5', running ? 'bg-[#D14A55] text-white' : 'bg-[#18B7D6] text-[#071521]')}><Icon name={running ? 'Pause' : 'Play'} size={12} />{running ? 'Pausar ciclo' : 'Executar ciclo ao vivo'}</button>
      </div>
    </div>
  );
}

function AgentRuntimeCard({ agent, onRun }: { agent: DeliveryAgentRuntime; onRun: () => void }) {
  const active = agent.status === 'running';
  const color = agent.status === 'alert' ? '#D14A55' : agent.status === 'waiting' ? '#7C5CBF' : agent.status === 'done' ? '#0FA39D' : active ? '#18B7D6' : '#9AACB8';
  const label = agent.status === 'alert' ? 'Alerta' : agent.status === 'waiting' ? 'Aguardando humano' : agent.status === 'done' ? 'Concluído' : active ? 'Em execução' : 'Disponível';
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0"><div className="w-8 h-8 rounded-lg border border-white/10 bg-[#071521]/60 flex items-center justify-center shrink-0"><Icon name={agent.icon} size={15} style={{ color }} /></div><div className="min-w-0"><div className="text-[12.5px] font-semibold text-neutral-100 truncate">{agent.name}</div><div className="text-[10.5px] text-neutral-500 truncate">{agent.entity}</div></div></div>
        <button onClick={onRun} className="rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-neutral-400 hover:text-white"><Icon name={active ? 'Pause' : 'Play'} size={11} /></button>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10.5px]"><span className="flex items-center gap-1.5" style={{ color }}><span className={cls('w-2 h-2 rounded-full', active && 'nexo-pulse-dot')} style={{ background: color }} />{label}</span><span className="tnum text-neutral-500">{agent.progress}%</span></div>
      <div className="mt-1.5"><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'red' : agent.status === 'waiting' ? 'blue' : 'cyan'} height={5} /></div>
      <div className="mt-2 text-[11px] text-neutral-300 leading-snug min-h-[32px]">{agent.step}</div>
      <div className="mt-2 rounded-md border border-white/8 bg-[#071521]/45 p-2 text-[10.5px] text-neutral-400"><strong className="text-neutral-300">Recomendação:</strong> {agent.recommendation}</div>
      <div className="mt-2 flex justify-between gap-3 text-[10px] text-neutral-500"><span className="truncate">{agent.impact}</span><span className="shrink-0">{agent.confidence}% confiança</span></div>
    </div>
  );
}

function MeasurementSheet({ item, open, onClose, onOpenAsset, vistoriaStage, decision, onDecision, onNavigateProduct }: {
  item: MeasurementRecord | null; open: boolean; onClose: () => void; onOpenAsset: (id: string) => void; vistoriaStage: VistoriaStage; decision: string | null;
  onDecision: (a: 'parcial' | 'diligenciar' | 'suspender') => void; onNavigateProduct: (p: ProductKey) => void;
}) {
  const [tab, setTab] = useState<'resumo' | 'itens' | 'evidencias' | 'decisao'>('resumo');
  if (!item) return null;
  const asset = ASSETS.find((a) => a.id === item.assetId);
  const isVale = item.id === 'MED-VALE-006';
  const laudoPronto = vistoriaStage === 'validacao' || vistoriaStage === 'concluida';
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-3xl overflow-y-auto nexo-scroll">
        <SheetHeader><SheetTitle className="text-neutral-50 pr-7">Medição nº {item.number} — {asset?.name}</SheetTitle><SheetDescription className="text-neutral-400">{item.contract} · {item.period} · recebida em {item.submittedAt}</SheetDescription></SheetHeader>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[['Solicitado', fmtCompactBRL(item.requested)], ['Validado', fmtCompactBRL(item.validated)], ['Retido', fmtCompactBRL(item.retained)], ['Confiança', `${Math.round(item.confidence * 100)}%`]].map(([l, v]) => <div key={l} className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5"><div className="text-[10px] text-neutral-500">{l}</div><div className="text-[12px] text-neutral-100 mt-0.5">{v}</div></div>)}
        </div>
        <div className="mt-4 flex gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1 overflow-x-auto nexo-scroll">
          {(['resumo', 'itens', 'evidencias', 'decisao'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[11px] capitalize', tab === t ? 'bg-[#18B7D6] text-[#071521] font-semibold' : 'text-neutral-400')}>{t}</button>)}
        </div>
        {tab === 'resumo' && <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><div className="flex items-center justify-between"><span className="text-[12px] text-neutral-200">Avanço informado × verificado</span><StatusChip status={item.risk} size="sm" /></div><div className="mt-3 grid grid-cols-2 gap-3"><div><div className="text-[10.5px] text-neutral-500">Informado</div><div className="text-[20px] font-semibold text-neutral-50 tnum">{Math.round(item.physicalClaimed * 100)}%</div></div><div><div className="text-[10.5px] text-neutral-500">Verificado</div><div className="text-[20px] font-semibold text-[#6FD8EC] tnum">{Math.round(item.physicalVerified * 100)}%</div></div></div></div>
          {item.issue && <div className="rounded-lg border border-[#D14A55]/25 bg-[#D14A55]/7 p-3 flex gap-2"><Icon name="AlertOctagon" size={14} className="text-[#D14A55] mt-0.5" /><div><div className="text-[11.5px] text-neutral-200">Inconsistência principal</div><div className="text-[11px] text-neutral-400 mt-0.5">{item.issue}</div></div></div>}
          <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><div className="text-[11.5px] text-neutral-200">Parecer do agente</div><div className="text-[11px] text-neutral-400 mt-1">O {item.agent} reconciliou baseline, quantidades, evidências, saldo do funding e condicionantes. {item.retained > 0 ? `Recomendação: liberar ${fmtCompactBRL(item.validated)} e manter ${fmtCompactBRL(item.retained)} sob retenção.` : 'Recomendação: liberar integralmente.'}</div></div>
          <div className="flex gap-2 flex-wrap"><button onClick={() => onOpenAsset(item.assetId)} className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] text-neutral-300">Abrir Ativo 360</button><button onClick={() => onNavigateProduct('evidencia')} className="rounded-lg border border-[#0FA39D]/25 bg-[#0FA39D]/8 px-3 py-2 text-[11.5px] text-[#7DD8D1]">Abrir evidências</button></div>
        </div>}
        {tab === 'itens' && <div className="mt-4 overflow-x-auto nexo-scroll"><table className="w-full text-[11.5px]"><thead><tr className="text-left text-neutral-500 border-b border-white/8"><th className="py-2">Item</th><th>Quantidade</th><th>Valor</th><th>Status</th></tr></thead><tbody>{(isVale ? MEDICAO_ITENS : [
          { item: 'Serviços executados no período', qtd: Math.round(item.requested / 125000), unidade: 'un.', valorUnit: 125000, status: item.retained ? 'analise' : 'ok' },
          { item: 'Mobilização e equipamentos', qtd: 1, unidade: 'lote', valorUnit: item.requested * 0.18, status: item.issue ? 'divergente' : 'ok' },
          { item: 'Administração local', qtd: 1, unidade: 'mês', valorUnit: item.requested * 0.08, status: 'ok' },
        ]).map((it) => <tr key={it.item} className="border-b border-white/[0.05]"><td className="py-2.5 text-neutral-200">{it.item}</td><td className="text-neutral-400">{it.qtd.toLocaleString('pt-BR')} {it.unidade}</td><td className="text-neutral-300">{fmtBRL(it.qtd * it.valorUnit)}</td><td><span className="text-[10.5px]" style={{ color: it.status === 'ok' ? '#0FA39D' : it.status === 'divergente' ? '#D14A55' : '#E5A11A' }}>{it.status === 'ok' ? 'Validado' : it.status === 'divergente' ? 'Divergente' : 'Em análise'}</span></td></tr>)}</tbody></table></div>}
        {tab === 'evidencias' && <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">{[
          ['Fotos georreferenciadas', `${item.evidenceCount} arquivos`, 'Camera'], ['Geometria executada', 'Feature layer versionada', 'Map'], ['Boletim assinado', `Medição nº ${item.number}`, 'FileCheck'], ['Diário de obra', 'Sincronizado', 'FileText'], ['Notas e contratos', 'Validação documental', 'FileSearch'], ['Trilha de custódia', 'Hash e metadados preservados', 'Link2'],
        ].map(([n, d, icon]) => <div key={n} className="rounded-lg border border-white/10 bg-white/[0.025] p-3 flex gap-2"><Icon name={icon} size={14} className="text-[#18B7D6]" /><div><div className="text-[11.5px] text-neutral-200">{n}</div><div className="text-[10.5px] text-neutral-500">{d}</div></div></div>)}</div>}
        {tab === 'decisao' && <div className="mt-4 space-y-3">
          {isVale && decision ? <div className="rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3"><div className="text-[12px] text-[#7DD8D1]">Decisão registrada</div><div className="text-[11px] text-neutral-400 mt-1">{decision}</div></div> : isVale && !laudoPronto ? <div className="rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/7 p-3"><div className="text-[12px] text-[#F0B94A]">Gate bloqueado</div><div className="text-[11px] text-neutral-400 mt-1">Aguardando laudo da vistoria OV-2026-0871. Execute o ciclo ao vivo ou acompanhe no Nexo Evidência.</div></div> : <>
            <div className="rounded-lg border border-[#7C5CBF]/25 bg-[#7C5CBF]/8 p-3"><div className="text-[12px] text-neutral-200">Decisão humana obrigatória</div><div className="text-[11px] text-neutral-400 mt-1">A IA prepara o parecer, mas aprovação, retenção ou suspensão permanecem sob alçada humana.</div></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => onDecision('parcial')} className="rounded-lg bg-[#0FA39D] px-3 py-2 text-[11.5px] font-semibold text-white">Aprovar {fmtCompactBRL(item.validated)}</button><button onClick={() => onDecision('diligenciar')} className="rounded-lg border border-[#1584D1]/30 bg-[#1584D1]/10 px-3 py-2 text-[11.5px] text-[#5FB4E8]">Diligenciar</button><button onClick={() => onDecision('suspender')} className="rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/10 px-3 py-2 text-[11.5px] text-[#D14A55]">Suspender item</button></div>
          </>}
        </div>}
      </SheetContent>
    </Sheet>
  );
}

export function EntregaView({
  section, onSectionChange, onOpenAsset, onNavigateProduct, events, onPushEvent,
  vistoriaStage, onDecision, decision,
}: EntregaViewProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(HERO_ASSET_ID);
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementRecord | null>(null);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [showNewMeasurement, setShowNewMeasurement] = useState(false);
  const [measurementSearch, setMeasurementSearch] = useState('');
  const [measurementStatus, setMeasurementStatus] = useState('todos');
  const [workflowCards, setWorkflowCards] = useState(DELIVERY_WORKFLOWS);
  const [agents, setAgents] = useState(DELIVERY_AGENTS);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [mapLayers, setMapLayers] = useState({ obras: true, evidencias: true, riscos: true, imagery: false });
  const [reportProgress, setReportProgress] = useState<Record<string, number>>({});
  const [syncing, setSyncing] = useState<string | null>(null);
  const [integrationStates, setIntegrationStates] = useState(DELIVERY_INTEGRATIONS);
  const [scheduleFilter, setScheduleFilter] = useState('todos');
  const [draftMeasurement, setDraftMeasurement] = useState({ contract: 'CT-2025-SAN-0142', period: '01/07 a 31/07/2026', requested: '12400000', evidenceCount: '18', note: '' });
  const liveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPortfolio = DELIVERY_PORTFOLIO.find((p) => p.assetId === selectedAssetId) ?? DELIVERY_PORTFOLIO[0];
  const deliveryAssets = ASSETS.filter((a) => DELIVERY_PORTFOLIO.some((p) => p.assetId === a.id));
  const selectedAsset = ASSETS.find((a) => a.id === selectedAssetId) ?? deliveryAssets[0];

  useEffect(() => {
    if (!liveRunning) return;
    if (liveStep >= DELIVERY_LIVE_STEPS.length) {
      setLiveRunning(false);
      return;
    }
    liveTimer.current = setTimeout(() => {
      const step = DELIVERY_LIVE_STEPS[liveStep];
      onPushEvent(step.text, step.type);
      setAgents((prev) => prev.map((a) => a.id === step.agent ? {
        ...a, status: liveStep === DELIVERY_LIVE_STEPS.length - 1 ? 'waiting' : 'running', progress: Math.min(100, Math.max(a.progress, 20 + liveStep * 13)), step: step.text,
      } : a));
      if (step.agent === 'inspection') setWorkflowCards((prev) => prev.map((w) => w.id === 'WF-0781' ? { ...w, progress: Math.min(95, w.progress + 9) } : w));
      setLiveStep((v) => v + 1);
    }, 1500);
    return () => { if (liveTimer.current) clearTimeout(liveTimer.current); };
  }, [liveRunning, liveStep, onPushEvent]);

  function toggleLive() {
    if (!liveRunning && liveStep >= DELIVERY_LIVE_STEPS.length) {
      setLiveStep(0);
      setAgents(DELIVERY_AGENTS.map((a) => a.id === 'orq' ? { ...a, status: 'running', progress: 8, step: 'Recebendo eventos da carteira...' } : a));
    }
    setLiveRunning((v) => !v);
  }

  function runAgent(id: string) {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: a.status === 'running' ? 'idle' : 'running', progress: a.status === 'running' ? 0 : Math.max(12, a.progress), step: a.status === 'running' ? 'Pausado pelo operador.' : 'Consultando fontes e aplicando regras...' } : a));
    onPushEvent(`${agents.find((a) => a.id === id)?.name ?? 'Agente'} ${agents.find((a) => a.id === id)?.status === 'running' ? 'pausado' : 'acionado manualmente'}.`, 'agent');
  }

  function openMeasurement(m: MeasurementRecord) {
    setSelectedMeasurement(m);
    setMeasurementOpen(true);
  }

  function advanceWorkflow(id: string) {
    setWorkflowCards((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      const idx = WORKFLOW_STAGES.indexOf(w.stage);
      const next = WORKFLOW_STAGES[Math.min(WORKFLOW_STAGES.length - 1, idx + 1)];
      onPushEvent(`Workflow ${w.id} avançou para ${next}.`, next === 'Concluído' ? 'success' : 'info');
      return { ...w, stage: next, progress: Math.min(100, w.progress + 18) };
    }));
  }

  function submitMeasurement() {
    setShowNewMeasurement(false);
    onPushEvent(`Nova medição recebida para ${draftMeasurement.contract}: ${fmtCompactBRL(Number(draftMeasurement.requested))}, ${draftMeasurement.evidenceCount} evidências.`, 'info');
    setAgents((prev) => prev.map((a) => a.id === 'orq' || a.id === 'measure' ? { ...a, status: 'running', progress: 14, step: 'Validando nova medição e metadados...' } : a));
  }

  function generateReport(id: string) {
    setReportProgress((p) => ({ ...p, [id]: 8 }));
    const timer = setInterval(() => setReportProgress((p) => {
      const next = Math.min(100, (p[id] ?? 0) + 17);
      if (next >= 100) clearInterval(timer);
      return { ...p, [id]: next };
    }), 280);
  }

  function syncIntegration(integration: DeliveryIntegration) {
    setSyncing(integration.id);
    onPushEvent(`Sincronização iniciada: ${integration.name}.`, 'info');
    setTimeout(() => {
      setIntegrationStates((prev) => prev.map((i) => i.id === integration.id ? { ...i, status: 'online', lastSync: 'Agora', latency: i.latency === '—' ? '2,1 s' : i.latency } : i));
      setSyncing(null);
      onPushEvent(`${integration.name} sincronizada com sucesso.`, 'success');
    }, 1400);
  }

  const filteredMeasurements = DELIVERY_MEASUREMENTS.filter((m) => {
    const asset = ASSETS.find((a) => a.id === m.assetId);
    const text = `${m.id} ${m.contract} ${asset?.name ?? ''}`.toLowerCase();
    return text.includes(measurementSearch.toLowerCase()) && (measurementStatus === 'todos' || m.status === measurementStatus);
  });
  const filteredMilestones = SCHEDULE_MILESTONES.filter((m) => m.assetId === selectedAssetId && (scheduleFilter === 'todos' || m.category === scheduleFilter));
  const totalValue = DELIVERY_PORTFOLIO.reduce((s, p) => s + p.value, 0);
  const totalValidated = DELIVERY_MEASUREMENTS.reduce((s, m) => s + m.validated, 0);
  const totalRetained = DELIVERY_MEASUREMENTS.reduce((s, m) => s + m.retained, 0);
  const weightedPhysical = DELIVERY_PORTFOLIO.reduce((s, p) => s + p.physical * p.value, 0) / totalValue;
  const weightedFinancial = DELIVERY_PORTFOLIO.reduce((s, p) => s + p.financial * p.value, 0) / totalValue;
  const pendingDecision = DISBURSEMENTS.filter((d) => d.status === 'decisao' || d.status === 'retido').reduce((s, d) => s + d.recommended, 0);

  const sharedHeader = <Header onSectionChange={onSectionChange} onRunLive={toggleLive} running={liveRunning} onNavigateProduct={onNavigateProduct} />;

  return (
    <div className="p-5 space-y-4 max-w-[1600px] mx-auto nexo-fade-in">
      {sharedHeader}

      {section === 'overview' && <>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Carteira em execução" value={fmtCompactBRL(totalValue)} delta="5 ativos prioritários" icon="HardHat" />
          <KpiCard label="Execução física" value={`${Math.round(weightedPhysical * 100)}%`} delta={`${Math.round((weightedPhysical - weightedFinancial) * 100)} p.p. acima do financeiro`} icon="Activity" />
          <KpiCard label="Validado em medições" value={fmtCompactBRL(totalValidated)} delta={`${DELIVERY_MEASUREMENTS.length} medições`} icon="Ruler" />
          <KpiCard label="Valor em decisão" value={fmtCompactBRL(pendingDecision)} delta="2 gates críticos" deltaTone="amber" icon="Banknote" />
          <KpiCard label="Retenção ativa" value={fmtCompactBRL(totalRetained)} delta="Risco e evidências" deltaTone="red" icon="Lock" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-4">
          <Panel title="Curva consolidada de execução" subtitle="Avanço físico planejado × realizado · carteira prioritária" actions={<button onClick={() => onSectionChange('schedule')} className="text-[11px] text-[#6FD8EC]">Abrir cronograma</button>}><SCurveChart /></Panel>
          <Panel title="Decisões e exceções críticas" subtitle="Ordenadas por exposição e prazo">
            <div className="space-y-2.5">{DELIVERY_PORTFOLIO.filter((p) => p.status === 'critico' || p.status === 'atencao').map((p) => <button key={p.assetId} onClick={() => { setSelectedAssetId(p.assetId); onSectionChange('workflows'); }} className="w-full text-left rounded-lg border border-white/10 bg-white/[0.025] p-3 hover:border-[#18B7D6]/30"><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] text-neutral-100">{p.shortName} · {p.nextMilestone}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{p.owner} · {p.openIssues} ocorrências abertas</div></div><StatusChip status={p.status} size="sm" /></div><div className="mt-2 flex items-center justify-between text-[10.5px]"><span className="text-neutral-400">Execução {Math.round(p.physical * 100)}%</span><span className="text-neutral-500">{fmtCompactBRL(p.value)}</span></div></button>)}</div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-4">
          <Panel title="Mapa da execução" subtitle="Ativos, criticidade e avanço territorial" actions={<button onClick={() => onSectionChange('map')} className="text-[11px] text-[#6FD8EC]">Explorar mapa</button>}><BrazilMap assets={deliveryAssets} selectedId={selectedAssetId} onSelectAsset={setSelectedAssetId} height={340} colorBy="status" /></Panel>
          <Panel title="Ativo selecionado" subtitle={`${selectedAsset.city} · ${selectedAsset.uf}`}>
            <div className="flex items-start justify-between gap-3"><div><div className="text-[14px] font-semibold text-neutral-100">{selectedAsset.name}</div><div className="text-[11px] text-neutral-500 mt-1">{selectedPortfolio.contract} · {selectedAsset.fundingSource}</div></div><StatusChip status={selectedAsset.status} size="sm" /></div>
            <div className="mt-4 grid grid-cols-2 gap-2">{[['Valor', fmtCompactBRL(selectedAsset.value)], ['Físico', `${Math.round(selectedAsset.physicalProgress * 100)}%`], ['Financeiro', `${Math.round(selectedAsset.disbursed * 100)}%`], ['Conclusão', selectedPortfolio.forecast]].map(([l, v]) => <div key={l} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><div className="text-[10px] text-neutral-500">{l}</div><div className="text-[12px] text-neutral-100 mt-0.5">{v}</div></div>)}</div>
            <div className="mt-3 rounded-lg border border-[#E5A11A]/20 bg-[#E5A11A]/6 p-3"><div className="text-[11.5px] text-neutral-200">Próximo marco</div><div className="text-[11px] text-neutral-400 mt-0.5">{selectedPortfolio.nextMilestone} · responsável {selectedPortfolio.owner}</div></div>
            <div className="mt-3 flex gap-2"><button onClick={() => onOpenAsset(selectedAsset.id)} className="rounded-lg bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Ativo 360</button><button onClick={() => onSectionChange('measurements')} className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] text-neutral-300">Medições</button></div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
          <Panel title="Agentes na operação" subtitle="Automação com gates humanos e rastreabilidade" actions={<button onClick={() => onSectionChange('agents')} className="text-[11px] text-[#6FD8EC]">Central de agentes</button>}><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{agents.slice(0, 4).map((a) => <AgentRuntimeCard key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel>
          <Panel title="Eventos ao vivo" subtitle="Barramento operacional do Nexo Entrega"><EventFeed events={events.slice(-8)} /></Panel>
        </div>

        <Panel title="Fluxo integrado da entrega" subtitle="Do contrato ao ativo pronto para comissionamento">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">{[
            ['Contrata', 'Baseline e condições', 'contrata'], ['Entrega', 'Cronograma e obra', 'entrega'], ['Evidência', 'Comprovação e vistoria', 'evidencia'], ['Capital', 'Saldo e funding', 'capital'], ['Ativos', 'Comissionamento', 'ativos'], ['Impacto', 'Resultados', 'impacto'],
          ].map(([name, sub, p], i) => <React.Fragment key={name}><button onClick={() => onNavigateProduct(p as ProductKey)} className="rounded-lg border border-white/10 bg-white/[0.025] p-3 text-left hover:border-[#18B7D6]/30"><div className="text-[11.5px] text-neutral-100">Nexo {name}</div><div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div></button>{i < 5 && <div className="hidden md:flex items-center justify-center -mx-4 pointer-events-none"><Icon name="ArrowRight" size={13} className="text-neutral-700" /></div>}</React.Fragment>)}</div>
        </Panel>
      </>}

      {section === 'schedule' && <>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="rounded-lg border border-white/10 bg-[#0E2A40] px-3 py-2 text-[11.5px] text-neutral-200 outline-none">{DELIVERY_PORTFOLIO.map((p) => <option key={p.assetId} value={p.assetId}>{p.shortName} · {p.contract}</option>)}</select>
          <select value={scheduleFilter} onChange={(e) => setScheduleFilter(e.target.value)} className="rounded-lg border border-white/10 bg-[#0E2A40] px-3 py-2 text-[11.5px] text-neutral-200 outline-none"><option value="todos">Todas as categorias</option>{['Engenharia', 'Obra', 'Licença', 'Desembolso', 'Comissionamento'].map((x) => <option key={x}>{x}</option>)}</select>
          <Pill tone="cyan">Caminho crítico recalculado há 2 min</Pill>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Avanço físico" value={`${Math.round(selectedPortfolio.physical * 100)}%`} delta={`${selectedPortfolio.delayWeeks} semanas de desvio`} deltaTone={selectedPortfolio.delayWeeks > 5 ? 'red' : 'amber'} icon="Activity" /><KpiCard label="Previsão de conclusão" value={selectedPortfolio.forecast} delta="Modelo probabilístico P50" icon="CalendarClock" /><KpiCard label="Contingência usada" value={`${Math.round(selectedPortfolio.contingencyUsed * 100)}%`} delta={fmtCompactBRL(selectedPortfolio.value * selectedPortfolio.contingencyUsed * 0.08)} deltaTone="amber" icon="Gauge" /><KpiCard label="Marcos críticos" value={String(filteredMilestones.filter((m) => m.critical && m.status !== 'normal').length)} delta="Ações de recuperação" deltaTone="red" icon="AlertTriangle" /></div>
        <Panel title={`Cronograma mestre — ${selectedAsset.name}`} subtitle="Baseline, avanço, dependências e caminho crítico">
          <div className="overflow-x-auto nexo-scroll"><div className="min-w-[980px]">
            <div className="grid grid-cols-[260px_100px_100px_100px_1fr] gap-2 text-[10px] uppercase tracking-wide text-neutral-500 border-b border-white/8 pb-2"><span>Marco</span><span>Início</span><span>Fim</span><span>Avanço</span><span>Linha do tempo</span></div>
            {filteredMilestones.map((m, i) => <div key={m.id} className="grid grid-cols-[260px_100px_100px_100px_1fr] gap-2 items-center py-3 border-b border-white/[0.05]"><div className="min-w-0"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: m.critical ? '#D14A55' : '#1584D1' }} /><span className="text-[11.5px] text-neutral-200 truncate">{m.name}</span></div><div className="text-[9.5px] text-neutral-600 mt-0.5">{m.category} · {m.owner}{m.dependency ? ` · depende de ${m.dependency}` : ''}</div></div><span className="text-[10.5px] text-neutral-400">{m.plannedStart.slice(8, 10)}/{m.plannedStart.slice(5, 7)}/{m.plannedStart.slice(2, 4)}</span><span className="text-[10.5px] text-neutral-400">{m.plannedEnd.slice(8, 10)}/{m.plannedEnd.slice(5, 7)}/{m.plannedEnd.slice(2, 4)}</span><div><span className="text-[10.5px] text-neutral-300">{Math.round(m.progress * 100)}%</span><ProgressBar value={m.progress} tone={m.status === 'critico' ? 'red' : m.status === 'atencao' ? 'amber' : 'cyan'} height={4} /></div><div className="relative h-7 rounded bg-white/[0.035] overflow-hidden"><div className="absolute top-1.5 h-4 rounded" style={{ left: `${5 + i * 4}%`, width: `${Math.max(8, 22 + i * 2)}%`, background: m.status === 'critico' ? '#D14A55' : m.status === 'atencao' ? '#E5A11A' : '#1584D1', opacity: 0.8 }} /></div></div>)}
          </div></div>
        </Panel>
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4"><Panel title="Curva S do projeto" subtitle="Baseline atualizada após eventos"><SCurveChart /></Panel><Panel title="Recomendação do Agente de Cronograma" subtitle="Explicável e sujeita a validação humana"><div className="rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 p-3"><div className="text-[12px] text-neutral-100">Plano de recuperação em 3 ações</div><ol className="mt-2 space-y-2 text-[11px] text-neutral-400"><li>1. Antecipar mobilização paralela na EE-03.</li><li>2. Reordenar 1,8 km da rede Lote 2 fora da interferência fundiária.</li><li>3. Reservar 14 dias para reteste integrado antes da licença.</li></ol><div className="mt-3 flex justify-between text-[10px] text-neutral-500"><span>Impacto estimado: −3,5 semanas</span><span>92% confiança</span></div></div></Panel></div>
      </>}

      {section === 'map' && <>
        <div className="flex flex-wrap gap-2">{Object.entries(mapLayers).map(([k, v]) => <button key={k} onClick={() => setMapLayers((p) => ({ ...p, [k]: !v }))} className={cls('rounded-lg border px-3 py-2 text-[11px]', v ? 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC]' : 'border-white/10 text-neutral-500')}>{k === 'obras' ? 'Frentes de obra' : k === 'evidencias' ? 'Evidências' : k === 'riscos' ? 'Riscos territoriais' : 'World Imagery'}</button>)}</div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-4">
          <Panel title="Mapa operacional da carteira" subtitle="ArcGIS como camada integradora · dados sintéticos no mockup"><BrazilMap assets={deliveryAssets} selectedId={selectedAssetId} onSelectAsset={setSelectedAssetId} selectedUF={selectedUF} onSelectUF={setSelectedUF} colorBy="status" height={530} /></Panel>
          <div className="space-y-4"><Panel title="Contexto do ativo" subtitle={`${selectedAsset.city}/${selectedAsset.uf}`}><div className="flex justify-between gap-3"><div><div className="text-[13px] font-semibold text-neutral-100">{selectedAsset.name}</div><div className="text-[10.5px] text-neutral-500 mt-1">{selectedPortfolio.contract} · {selectedAsset.sector}</div></div><StatusChip status={selectedAsset.status} size="sm" /></div><div className="mt-3 grid grid-cols-2 gap-2">{[['Físico', `${Math.round(selectedAsset.physicalProgress * 100)}%`], ['Financeiro', `${Math.round(selectedAsset.disbursed * 100)}%`], ['Ocorrências', String(selectedPortfolio.openIssues)], ['Previsão', selectedPortfolio.forecast]].map(([l, v]) => <div key={l} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><div className="text-[10px] text-neutral-500">{l}</div><div className="text-[12px] text-neutral-100">{v}</div></div>)}</div><button onClick={() => onOpenAsset(selectedAssetId)} className="mt-3 w-full rounded-lg bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Abrir Ativo 360</button></Panel>
          {selectedAssetId === HERO_ASSET_ID && <Panel title="Trechos e vistoria ao vivo" subtitle="Simulação equivalente a StreamLayer"><TrechoMap crewWaypointIndex={Math.min(3, liveStep)} active={liveRunning} /></Panel>}
          <Panel title="Camadas ativas" subtitle="Integração de produção prevista"><div className="space-y-2">{[['Ativos e frentes', mapLayers.obras, 'FeatureLayer'], ['Evidências e vistorias', mapLayers.evidencias, 'FeatureLayer / StreamLayer'], ['Riscos climáticos', mapLayers.riscos, 'Living Atlas / Imagery'], ['World Imagery', mapLayers.imagery, 'Living Atlas item']].map(([n, active, tech]) => <div key={String(n)} className="flex justify-between text-[10.5px]"><span className={active ? 'text-neutral-200' : 'text-neutral-600'}>{String(n)}</span><span className="text-neutral-500">{String(tech)}</span></div>)}</div></Panel></div>
        </div>
      </>}

      {section === 'measurements' && <>
        <div className="flex items-center justify-between gap-3 flex-wrap"><div className="flex gap-2 flex-wrap"><div className="relative"><Icon name="Search" size={13} className="absolute left-3 top-2.5 text-neutral-600" /><input value={measurementSearch} onChange={(e) => setMeasurementSearch(e.target.value)} placeholder="Buscar medição, contrato ou ativo" className="w-[280px] rounded-lg border border-white/10 bg-[#0E2A40] pl-8 pr-3 py-2 text-[11.5px] text-neutral-200 outline-none" /></div><select value={measurementStatus} onChange={(e) => setMeasurementStatus(e.target.value)} className="rounded-lg border border-white/10 bg-[#0E2A40] px-3 py-2 text-[11.5px] text-neutral-200 outline-none"><option value="todos">Todos os status</option><option value="em_analise">Em análise</option><option value="divergente">Divergente</option><option value="aguardando_vistoria">Aguardando vistoria</option><option value="validada">Validada</option><option value="paga">Paga</option></select></div><button onClick={() => setShowNewMeasurement((v) => !v)} className="rounded-lg bg-[#18B7D6] px-3 py-2 text-[11.5px] font-semibold text-[#071521]"><Icon name="Plus" size={12} className="inline mr-1.5" />Nova medição</button></div>
        {showNewMeasurement && <Panel title="Receber nova medição" subtitle="Entrada assistida por IA, validação de metadados e georreferenciamento"><div className="grid grid-cols-1 md:grid-cols-5 gap-3"><label className="text-[10.5px] text-neutral-500">Contrato<input value={draftMeasurement.contract} onChange={(e) => setDraftMeasurement((p) => ({ ...p, contract: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#071521]/50 px-3 py-2 text-[11.5px] text-neutral-200" /></label><label className="text-[10.5px] text-neutral-500">Período<input value={draftMeasurement.period} onChange={(e) => setDraftMeasurement((p) => ({ ...p, period: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#071521]/50 px-3 py-2 text-[11.5px] text-neutral-200" /></label><label className="text-[10.5px] text-neutral-500">Valor solicitado<input value={draftMeasurement.requested} onChange={(e) => setDraftMeasurement((p) => ({ ...p, requested: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#071521]/50 px-3 py-2 text-[11.5px] text-neutral-200" /></label><label className="text-[10.5px] text-neutral-500">Evidências<input value={draftMeasurement.evidenceCount} onChange={(e) => setDraftMeasurement((p) => ({ ...p, evidenceCount: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#071521]/50 px-3 py-2 text-[11.5px] text-neutral-200" /></label><div className="flex items-end"><button onClick={submitMeasurement} className="w-full rounded-lg bg-[#0FA39D] px-3 py-2 text-[11.5px] font-semibold text-white">Receber e validar</button></div></div><div className="mt-3 rounded-lg border border-[#18B7D6]/20 bg-[#18B7D6]/6 p-2.5 text-[10.5px] text-neutral-400">Agentes acionados: Orquestrador → Documental → Engenharia e Custos → Inconsistências → Medição e Desembolso.</div></Panel>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Recebido no período" value={fmtCompactBRL(DELIVERY_MEASUREMENTS.reduce((s, m) => s + m.requested, 0))} delta={`${DELIVERY_MEASUREMENTS.reduce((s, m) => s + m.evidenceCount, 0)} evidências`} icon="Ruler" /><KpiCard label="Validado" value={fmtCompactBRL(totalValidated)} delta={`${Math.round(totalValidated / DELIVERY_MEASUREMENTS.reduce((s, m) => s + m.requested, 0) * 100)}% do solicitado`} icon="FileCheck" /><KpiCard label="Retido" value={fmtCompactBRL(totalRetained)} delta="Exceções e vistorias" deltaTone="red" icon="Lock" /><KpiCard label="Confiança média" value={`${Math.round(DELIVERY_MEASUREMENTS.reduce((s, m) => s + m.confidence, 0) / DELIVERY_MEASUREMENTS.length * 100)}%`} delta="Modelos + validação humana" icon="ShieldCheck" /></div>
        <Panel title="Fila de medições" subtitle="Selecione uma medição para abrir o dossiê, evidências e decisão" actions={<button onClick={() => downloadCsv('nexo-entrega-medicoes.csv', filteredMeasurements.map((m) => ({ id: m.id, contrato: m.contract, periodo: m.period, solicitado: m.requested, validado: m.validated, retido: m.retained, status: STATUS_LABEL[m.status] })))} className="text-[11px] text-[#6FD8EC]"><Icon name="Download" size={12} className="inline mr-1" />CSV</button>}>
          <div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[11.5px]"><thead><tr className="text-left text-neutral-500 text-[10px] uppercase tracking-wide border-b border-white/8"><th className="px-4 py-2">Medição / ativo</th><th>Período</th><th>Solicitado</th><th>Validado</th><th>Retido</th><th>Confiança</th><th>Status</th><th></th></tr></thead><tbody>{filteredMeasurements.map((m) => { const a = ASSETS.find((x) => x.id === m.assetId); return <tr key={m.id} className="border-b border-white/[0.05] hover:bg-white/[0.03]"><td className="px-4 py-3"><div className="text-neutral-200">Medição nº {m.number} · {a?.name}</div><div className="text-[10px] text-neutral-600">{m.id} · {m.contract}</div></td><td className="text-neutral-400">{m.period}</td><td className="text-neutral-300 tnum">{fmtCompactBRL(m.requested)}</td><td className="text-[#7DD8D1] tnum">{fmtCompactBRL(m.validated)}</td><td className="text-[#F0B94A] tnum">{fmtCompactBRL(m.retained)}</td><td className="text-neutral-400">{Math.round(m.confidence * 100)}%</td><td><span className="inline-flex rounded-full px-2 py-0.5 text-[10px]" style={{ color: STATUS_COLOR[m.status], background: `${STATUS_COLOR[m.status]}18`, border: `1px solid ${STATUS_COLOR[m.status]}35` }}>{STATUS_LABEL[m.status]}</span></td><td className="pr-4"><button onClick={() => openMeasurement(m)} className="text-[#6FD8EC]"><Icon name="Eye" size={13} /></button></td></tr>; })}</tbody></table></div>
        </Panel>
      </>}

      {section === 'disbursements' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Solicitado" value={fmtCompactBRL(DISBURSEMENTS.reduce((s, d) => s + d.requested, 0))} delta="Ciclo atual" icon="Banknote" /><KpiCard label="Recomendado" value={fmtCompactBRL(DISBURSEMENTS.reduce((s, d) => s + d.recommended, 0))} delta="Após validações" icon="CheckCircle2" /><KpiCard label="Em decisão humana" value={fmtCompactBRL(pendingDecision)} delta="Alçadas obrigatórias" deltaTone="amber" icon="User" /><KpiCard label="Saldo dos envelopes" value={fmtCompactBRL(DISBURSEMENTS.reduce((s, d) => s + d.envelopeBalance, 0))} delta="Funding reconciliado" icon="Landmark" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4"><Panel title="Previsão de desembolso" subtitle="Carteira consolidada · R$ milhões"><TimeSeriesChart data={DELIVERY_ANALYTICS_TREND.map((x) => ({ ...x, previsto: x.previsto * 1000, realizado: x.realizado * 1000 }))} xKey="mes" aKey="previsto" bKey="realizado" aLabel="Previsto" bLabel="Realizado / previsão atual" /></Panel><Panel title="Composição por status" subtitle="Solicitações de desembolso"><DonutChart data={[{ name: 'Pronto', value: 1, fill: '#0FA39D' }, { name: 'Decisão humana', value: 1, fill: '#7C5CBF' }, { name: 'Retido', value: 1, fill: '#D14A55' }, { name: 'Processando', value: 1, fill: '#1584D1' }, { name: 'Pago', value: 1, fill: '#18B7D6' }]} /></Panel></div>
        <Panel title="Fila de desembolsos" subtitle="Condições, funding, recomendação e gate humano"><div className="space-y-2.5">{DISBURSEMENTS.map((d) => { const asset = ASSETS.find((a) => a.id === d.assetId); return <div key={d.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] text-neutral-100">{d.id} · {asset?.name}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{d.funding} · vencimento {d.dueDate}</div></div><span className="rounded-full px-2 py-0.5 text-[10px]" style={{ color: STATUS_COLOR[d.status], background: `${STATUS_COLOR[d.status]}18`, border: `1px solid ${STATUS_COLOR[d.status]}35` }}>{STATUS_LABEL[d.status]}</span></div><div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">{[['Solicitado', fmtCompactBRL(d.requested)], ['Recomendado', fmtCompactBRL(d.recommended)], ['Pago', fmtCompactBRL(d.paid)], ['Condições', `${d.conditionsMet}/${d.conditions}`], ['Saldo', fmtCompactBRL(d.envelopeBalance)]].map(([l, v]) => <div key={l} className="rounded-lg border border-white/8 bg-[#071521]/35 p-2"><div className="text-[9.5px] text-neutral-600">{l}</div><div className="text-[11px] text-neutral-200 mt-0.5">{v}</div></div>)}</div><div className="mt-3 flex items-center justify-between gap-3 flex-wrap"><div className="text-[10.5px] text-neutral-500">Gate: {d.humanGate}</div><div className="flex gap-2"><button onClick={() => openMeasurement(DELIVERY_MEASUREMENTS.find((m) => m.id === d.measurementId)!)} className="rounded-lg border border-white/10 px-3 py-1.5 text-[10.5px] text-neutral-300">Ver dossiê</button>{d.status !== 'pago' && <button onClick={() => onPushEvent(`Despacho ${d.id} enviado para ${d.humanGate}.`, 'agent')} className="rounded-lg border border-[#7C5CBF]/30 bg-[#7C5CBF]/10 px-3 py-1.5 text-[10.5px] text-[#B9A7E8]">Encaminhar decisão</button>}</div></div></div>; })}</div></Panel>
      </>}

      {section === 'workflows' && <>
        <div className="flex items-center justify-between gap-3 flex-wrap"><div><div className="text-[13px] font-semibold text-neutral-100">Workflows de execução</div><div className="text-[11px] text-neutral-500">Automação de baixo risco; exceções e decisões críticas seguem para humanos.</div></div><Pill tone="cyan">{workflowCards.filter((w) => w.stage !== 'Concluído').length} em andamento</Pill></div>
        <div className="overflow-x-auto nexo-scroll pb-2"><div className="grid grid-cols-6 gap-3 min-w-[1320px]">{WORKFLOW_STAGES.map((stage) => <div key={stage}><div className="flex items-center gap-2 mb-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: WORKFLOW_COLOR[stage] }} /><span className="text-[11px] font-semibold text-neutral-300">{stage}</span><span className="text-[10px] text-neutral-600">{workflowCards.filter((w) => w.stage === stage).length}</span></div><div className="space-y-2">{workflowCards.filter((w) => w.stage === stage).map((w) => <div key={w.id} className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3"><div className="flex justify-between gap-2"><span className="text-[10px] font-semibold" style={{ color: PRIORITY_COLOR[w.priority] }}>{w.priority}</span><span className="text-[9.5px] text-neutral-600">{w.id}</span></div><div className="text-[11.5px] text-neutral-100 mt-1.5 leading-snug">{w.title}</div><div className="text-[10px] text-neutral-500 mt-1">{w.type} · {w.owner}</div><div className="mt-2"><ProgressBar value={w.progress / 100} tone={w.priority === 'P0' ? 'red' : w.priority === 'P1' ? 'amber' : 'cyan'} height={4} /></div><div className="mt-2 text-[10px] text-neutral-500">Agente: {w.agent}</div><div className="mt-1 text-[10px] text-[#F0B94A]">Bloqueio: {w.blocker}</div><div className="mt-2 flex justify-between items-center"><span className="text-[9.5px] text-neutral-600">{w.automation}% automatizado</span>{stage !== 'Concluído' && <button onClick={() => advanceWorkflow(w.id)} className="text-[#6FD8EC]"><Icon name="ArrowRight" size={12} /></button>}</div></div>)}</div></div>)}</div></div>
        <Panel title="Orquestração do fluxo crítico" subtitle="Medição → evidência → vistoria → decisão → liquidação"><div className="grid grid-cols-2 md:grid-cols-6 gap-2">{['Recebimento', 'Validação', 'Exceções', 'Vistoria', 'Gate humano', 'Liquidação'].map((x, i) => <div key={x} className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><div className="text-[10px] text-neutral-600">Etapa {i + 1}</div><div className="text-[11.5px] text-neutral-200 mt-0.5">{x}</div><div className="text-[9.5px] text-neutral-500 mt-1">{i === 4 ? 'Obrigatório' : i < 4 ? 'Agentes + analista' : 'Sistema financeiro'}</div></div>)}</div></Panel>
      </>}

      {section === 'analytics' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Precisão da previsão" value="89%" delta="+6 p.p. em 90 dias" icon="Target" /><KpiCard label="Tempo médio medição" value="4,8 dias" delta="−1,7 dia" icon="Clock" /><KpiCard label="Vistorias evitadas" value="38%" delta="Amostragem por risco" icon="Route" /><KpiCard label="Desembolso antecipado" value="R$ 41 mi" delta="Ganho de previsibilidade" icon="TrendingUp" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Previsão × realização" subtitle="Desembolsos em R$ milhões"><TimeSeriesChart data={DELIVERY_ANALYTICS_TREND.map((x) => ({ ...x, previsto: x.previsto * 1000, realizado: x.realizado * 1000 }))} xKey="mes" aKey="previsto" bKey="realizado" aLabel="Previsto" bLabel="Realizado" /></Panel><Panel title="Gargalo por categoria" subtitle="Quantidade de ocorrências"><DonutChart data={DELIVERY_BOTTLENECKS} /></Panel></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Gap físico-financeiro" subtitle="Percentual por projeto"><BarProgramChart data={PHYSICAL_FINANCIAL_GAP} xKey="projeto" aKey="fisico" bKey="financeiro" aLabel="Físico" bLabel="Financeiro" unit="%" /></Panel><Panel title="Produtividade por etapa" subtitle="Tempo médio em dias"><SingleBarChart data={[{ etapa: 'Validação', dias: 1.2 }, { etapa: 'Análise', dias: 2.1 }, { etapa: 'Vistoria', dias: 4.6 }, { etapa: 'Decisão', dias: 1.4 }, { etapa: 'Liquidação', dias: 0.8 }]} xKey="etapa" yKey="dias" color="#18B7D6" /></Panel></div>
        <Panel title="Insights e recomendações" subtitle="Explicação, confiança e impacto estimado"><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[
          ['Correlação entre evidência incompleta e atraso', 'Projetos com menos de 85% das evidências esperadas apresentam ciclo de medição 2,4× maior.', '94%', 'Reduzir 3,1 dias'],
          ['Rio Norte concentra o risco de desembolso', 'Reprogramação dos dois reservatórios explica 61% do desvio previsto para os próximos 90 dias.', '88%', 'R$ 29 mi'],
          ['Vistoria direcionada é mais eficiente', 'Amostragem por risco reduz deslocamentos e mantém 93% de confiança na decisão.', '91%', '38% menos viagens'],
        ].map(([t, d, c, impact]) => <div key={t} className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><div className="text-[12px] text-neutral-100">{t}</div><div className="text-[11px] text-neutral-400 mt-1.5 leading-snug">{d}</div><div className="mt-3 flex justify-between text-[10px] text-neutral-500"><span>{c} confiança</span><span>{impact}</span></div></div>)}</div></Panel>
      </>}

      {section === 'agents' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Agentes ativos" value={String(agents.filter((a) => a.status === 'running').length)} delta="Execução ao vivo" icon="Bot" /><KpiCard label="Aguardando humano" value={String(agents.filter((a) => a.status === 'waiting').length)} delta="Gate protegido" deltaTone="amber" icon="User" /><KpiCard label="Alertas" value={String(agents.filter((a) => a.status === 'alert').length)} delta="Exceções críticas" deltaTone="red" icon="AlertOctagon" /><KpiCard label="Confiança média" value={`${Math.round(agents.reduce((s, a) => s + a.confidence, 0) / agents.length)}%`} delta="Fontes rastreáveis" icon="ShieldCheck" /></div>
        <Panel title="Cockpit de agentes" subtitle="Status, etapas, fontes, recomendação e ação humana" actions={<button onClick={toggleLive} className="rounded-lg bg-[#18B7D6] px-3 py-1.5 text-[10.5px] font-semibold text-[#071521]"><Icon name={liveRunning ? 'Pause' : 'Play'} size={11} className="inline mr-1" />{liveRunning ? 'Pausar' : 'Executar ciclo'}</button>}><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{agents.map((a) => <AgentRuntimeCard key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel>
        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-4"><Panel title="Execução corrente" subtitle="Etapas visíveis sem exposição de raciocínio interno"><div className="space-y-0">{DELIVERY_LIVE_STEPS.map((s, i) => <div key={i} className="relative pl-7 pb-5 last:pb-0"><span className="absolute left-[6px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: i < liveStep ? '#0FA39D' : i === liveStep && liveRunning ? '#18B7D6' : '#394B59' }} /><span className="absolute left-[10.5px] top-4 bottom-0 w-px bg-white/10 last:hidden" /><div className={cls('text-[11.5px]', i <= liveStep ? 'text-neutral-200' : 'text-neutral-600')}>{s.text}</div><div className="text-[9.5px] text-neutral-600 mt-0.5">Fonte, regra aplicada e resultado registrados em log.</div></div>)}</div></Panel><Panel title="Eventos do ciclo" subtitle="Atualização contínua"><EventFeed events={events.slice(-12)} /></Panel></div>
      </>}

      {section === 'reports' && <>
        <div className="flex justify-between gap-3 flex-wrap"><div><div className="text-[13px] font-semibold text-neutral-100">Biblioteca de relatórios</div><div className="text-[11px] text-neutral-500">Modelos corporativos, dados rastreáveis e resumo assistido por IA.</div></div><button onClick={() => downloadCsv('nexo-entrega-carteira.csv', DELIVERY_PORTFOLIO.map((p) => ({ ativo: p.shortName, contrato: p.contract, valor: p.value, fisico: p.physical, financeiro: p.financial, previsao: p.forecast, status: p.status })))} className="rounded-lg border border-white/10 px-3 py-2 text-[11.5px] text-neutral-300"><Icon name="Download" size={12} className="inline mr-1" />Exportar carteira</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{DELIVERY_REPORTS.map((r) => { const progress = reportProgress[r.id] ?? 0; return <div key={r.id} className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-4"><div className="flex items-start justify-between gap-3"><div className="w-8 h-8 rounded-lg border border-white/10 bg-[#071521]/60 flex items-center justify-center"><Icon name="FileText" size={14} className="text-[#6FD8EC]" /></div><Pill tone="neutral">{r.format}</Pill></div><div className="mt-3 text-[12.5px] font-semibold text-neutral-100">{r.title}</div><div className="text-[11px] text-neutral-400 mt-1 min-h-[34px]">{r.description}</div><div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-neutral-500"><span>{r.frequency}</span><span className="text-right">{r.audience}</span><span className="col-span-2">Último: {r.lastGenerated}</span></div>{progress > 0 && progress < 100 && <div className="mt-3"><ProgressBar value={progress / 100} tone="cyan" height={5} /><div className="text-[9.5px] text-neutral-600 mt-1">Gerando {progress}%</div></div>}{progress === 100 && <div className="mt-3 text-[10.5px] text-[#7DD8D1] flex items-center gap-1"><Icon name="CheckCircle2" size={11} />Relatório pronto</div>}<button onClick={() => generateReport(r.id)} className="mt-3 w-full rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/8 px-3 py-2 text-[11px] text-[#6FD8EC]">{progress === 100 ? 'Gerar nova versão' : 'Gerar relatório'}</button></div>; })}</div>
        <Panel title="Construtor de pacote executivo" subtitle="Selecione conteúdo e encaminhe para aprovação"><div className="grid grid-cols-2 md:grid-cols-5 gap-2">{['Resumo executivo', 'Curva S', 'Mapa e criticidade', 'Medições e retenções', 'Previsão de desembolso', 'Workflows', 'Agentes', 'Riscos', 'Decisões', 'Anexos'].map((x, i) => <label key={x} className="rounded-lg border border-white/10 bg-white/[0.025] p-2.5 flex items-center gap-2 text-[10.5px] text-neutral-300"><input type="checkbox" defaultChecked={i < 7} className="accent-[#18B7D6]" />{x}</label>)}</div><div className="mt-3 flex justify-end"><button onClick={() => onPushEvent('Pacote executivo de Entrega preparado para aprovação.', 'success')} className="rounded-lg bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Preparar pacote</button></div></Panel>
      </>}

      {section === 'integrations' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Conectores online" value={`${integrationStates.filter((i) => i.status === 'online').length}/${integrationStates.length}`} delta="Arquitetura federada" icon="Plug" /><KpiCard label="Eventos processados" value="18.420" delta="Últimas 24 horas" icon="Activity" /><KpiCard label="Latência média" value="1,9 s" delta="Serviços críticos" icon="Zap" /><KpiCard label="Fontes degradadas" value={String(integrationStates.filter((i) => i.status === 'degraded').length)} delta="Monitoramento ativo" deltaTone="amber" icon="AlertTriangle" /></div>
        <Panel title="Matriz de integrações" subtitle="Sistemas existentes permanecem como fontes oficiais de registro"><div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[11px]"><thead><tr className="text-left text-neutral-500 text-[9.5px] uppercase tracking-wide border-b border-white/8"><th className="px-4 py-2">Integração</th><th>Direção</th><th>Objetos</th><th>Método</th><th>Frequência</th><th>Latência</th><th>Status</th><th></th></tr></thead><tbody>{integrationStates.map((i) => <tr key={i.id} className="border-b border-white/[0.05]"><td className="px-4 py-3"><div className="text-neutral-200">{i.name}</div><div className="text-[9.5px] text-neutral-600">{i.owner}</div></td><td className="text-neutral-400">{i.direction}</td><td className="text-neutral-400 max-w-[260px]">{i.objects}</td><td className="text-neutral-500">{i.method}</td><td className="text-neutral-500">{i.frequency}</td><td className="text-neutral-400">{i.latency}</td><td><span className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: i.status === 'online' ? '#0FA39D' : i.status === 'degraded' ? '#E5A11A' : '#D14A55' }}><span className="w-2 h-2 rounded-full" style={{ background: i.status === 'online' ? '#0FA39D' : i.status === 'degraded' ? '#E5A11A' : '#D14A55' }} />{i.status === 'online' ? 'Online' : i.status === 'degraded' ? 'Degradada' : 'Offline'}</span></td><td className="pr-4"><button disabled={syncing === i.id} onClick={() => syncIntegration(i)} className="text-[#6FD8EC] disabled:opacity-50"><Icon name={syncing === i.id ? 'Loader2' : 'RefreshCw'} size={12} className={syncing === i.id ? 'animate-spin' : ''} /></button></td></tr>)}</tbody></table></div></Panel>
        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4"><Panel title="Arquitetura de integração" subtitle="System of intelligence and orchestration"><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><div className="text-[11.5px] text-neutral-100">Sistemas de registro</div><div className="mt-2 text-[10.5px] text-neutral-500 space-y-1"><div>Transferegov</div><div>Obrasgov / CIPI</div><div>Financeiro CAIXA</div><div>SINAPI e contratos</div></div></div><div className="rounded-xl border border-[#18B7D6]/25 bg-[#18B7D6]/7 p-3"><div className="text-[11.5px] text-[#6FD8EC]">Nexo Entrega</div><div className="mt-2 text-[10.5px] text-neutral-400 space-y-1"><div>Identidade do ativo</div><div>Modelos e agentes</div><div>Eventos e workflows</div><div>Decisões auditáveis</div></div></div><div className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><div className="text-[11.5px] text-neutral-100">Execução e ação</div><div className="mt-2 text-[10.5px] text-neutral-500 space-y-1"><div>Vistorias</div><div>Diligências</div><div>Desembolsos</div><div>Comissionamento</div></div></div></div></Panel><Panel title="Dependências dos agentes" subtitle="Fontes mínimas para operar"><div className="space-y-2">{agents.slice(0, 6).map((a) => <div key={a.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><div className="text-[10.5px] text-neutral-200">{a.name}</div><div className="text-[9.5px] text-neutral-600 mt-1">{a.sources.join(' · ')}</div></div>)}</div></Panel></div>
      </>}

      <MeasurementSheet item={selectedMeasurement} open={measurementOpen} onClose={() => setMeasurementOpen(false)} onOpenAsset={onOpenAsset} vistoriaStage={vistoriaStage} decision={decision} onDecision={onDecision} onNavigateProduct={onNavigateProduct} />
    </div>
  );
}
