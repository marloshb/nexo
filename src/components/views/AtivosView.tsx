import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, type EventItem } from '@/data/mockData';
import {
  ASSET_AGENTS,
  ASSET_ANALYTICS_INSIGHTS,
  ASSET_INTEGRATIONS,
  ASSET_LIVE_STEPS,
  ASSET_OPERATION,
  ASSET_REPORTS,
  ASSET_SECTOR_VALUE,
  COMMISSIONING_FLOW,
  COMMISSIONING_ITEMS,
  FAILURE_PREDICTIONS,
  HEALTH_DIMENSIONS,
  HEALTH_DISTRIBUTION,
  HEALTH_TREND,
  MAINTENANCE_SERIES,
  OPERATION_SERIES,
  REINVESTMENT_PLAN,
  SENSORS,
  WORK_ORDERS,
  CLIMATE_RISK,
  type AssetAgentRuntime,
  type AssetIntegration,
  type AtivosSection,
  type CommissioningItem,
} from '@/data/ativosData';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { BarProgramChart, DonutChart, RadarComparison, SingleBarChart, TimeSeriesChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import { Sparkline } from '@/components/shared/Sparkline';
import { WindComplexScene } from '@/components/shared/WindComplexScene';
import { cls, fmtCompactBRL, fmtPct, type StatusKey } from '@/lib/tokens';
import type { ProductKey } from '@/data/navConfig';

const SECTION_TITLE: Record<AtivosSection, { title: string; subtitle: string }> = {
  overview: { title: 'Visão geral', subtitle: 'Comissionamento, operação, manutenção, resiliência e reinvestimento do portfólio' },
  portfolio: { title: 'Portfólio de ativos', subtitle: 'Cadastro persistente, operador, estágio, saúde e trajetória Capital–Ativo–Resultado' },
  map: { title: 'Mapa operacional', subtitle: 'Ativos, redes, condição, riscos, dependências e telemetria territorializada' },
  health: { title: 'Saúde dos ativos', subtitle: 'Disponibilidade, desempenho, sensores, integridade e previsão de falhas' },
  maintenance: { title: 'Manutenção', subtitle: 'Ordens, backlog, planejamento preventivo e intervenção preditiva' },
  analytics: { title: 'Analytics', subtitle: 'Desempenho, causalidade, benchmarks, custo evitado e previsão de vida útil' },
  agents: { title: 'Agentes', subtitle: 'Orquestração auditável dos processos críticos do ciclo operacional' },
  reports: { title: 'Relatórios', subtitle: 'Pacotes executivos, operacionais, técnicos e de reinvestimento' },
  integrations: { title: 'Integrações', subtitle: 'Telemetria, manutenção, GIS, evidências, capital e impacto' },
};

const RESULT_TONE: Record<CommissioningItem['result'], StatusKey> = { approved: 'normal', pending: 'pendente', failed: 'critico' };
const AGENT_STATUS: Record<AssetAgentRuntime['status'], { label: string; color: string }> = {
  idle: { label: 'Disponível', color: '#9AACB8' }, running: { label: 'Em execução', color: '#18B7D6' }, waiting: { label: 'Aguardando humano', color: '#7C5CBF' }, done: { label: 'Concluído', color: '#0FA39D' }, alert: { label: 'Alerta', color: '#D14A55' },
};
const INTEGRATION_STATUS: Record<AssetIntegration['status'], { label: string; tone: StatusKey }> = {
  operational: { label: 'Operacional', tone: 'normal' }, attention: { label: 'Atenção', tone: 'atencao' }, error: { label: 'Falha', tone: 'critico' },
};
const ASSET_STATUS_LABEL: Record<string, string> = { operational: 'Operacional', commissioning: 'Comissionamento', maintenance: 'Em manutenção', degraded: 'Degradado', restricted: 'Restrito' };
const COMMISSION_ASSET_ID = 'NEXO-ASSET-BR-PE-2611606-HAB-000512';
const WIND_ASSET_ID = 'NEXO-ASSET-BR-RN-2408102-ENE-000029';

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(';'), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(';'))].join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function AgentRuntimeCard({ agent, onRun }: { agent: AssetAgentRuntime; onRun: () => void }) {
  const meta = AGENT_STATUS[agent.status];
  return (
    <div className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="text-[12px] font-semibold text-neutral-100">{agent.name}</div><div className="text-[10px] text-neutral-500 mt-1 leading-snug">{agent.function}</div></div>
        <span className="text-[9.5px] rounded-full border px-2 py-0.5 whitespace-nowrap" style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}15` }}>{meta.label}</span>
      </div>
      <div className="mt-3"><div className="flex justify-between text-[10px] text-neutral-500 mb-1"><span className="truncate pr-2">{agent.entity}</span><span>{agent.progress}%</span></div><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'red' : agent.status === 'done' ? 'teal' : 'cyan'} height={5} /></div>
      <div className="mt-2 text-[10.5px] text-neutral-300">{agent.stage}</div>
      <div className="mt-2 rounded-lg border border-white/8 bg-white/[0.025] p-2 text-[10px] text-neutral-400 leading-snug">{agent.recommendation}</div>
      <div className="mt-2 flex justify-between gap-2 text-[9.5px] text-neutral-600"><span>{Math.round(agent.confidence * 100)}% confiança</span><span className="truncate">{agent.impact}</span></div>
      <button onClick={onRun} className="mt-3 w-full rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 py-1.5 text-[10.5px] text-[#6FD8EC]"><Icon name="Play" size={10} className="inline mr-1" />Executar análise</button>
    </div>
  );
}

function SectionHeader({ section, liveRunning, onToggleLive, onNavigateProduct }: { section: AtivosSection; liveRunning: boolean; onToggleLive: () => void; onNavigateProduct: (p: ProductKey) => void }) {
  const meta = SECTION_TITLE[section];
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div><h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Ativos · {meta.title}</h1><p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onNavigateProduct('evidencia')} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300"><Icon name="ShieldCheck" size={12} className="inline mr-1.5" />Evidências</button>
        <button onClick={() => onNavigateProduct('impacto')} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300"><Icon name="Sprout" size={12} className="inline mr-1.5" />Impacto</button>
        <button onClick={onToggleLive} className={cls('rounded-lg border px-3 py-2 text-[11px] font-medium', liveRunning ? 'border-[#E5A11A]/40 bg-[#E5A11A]/10 text-[#F2C15A]' : 'border-[#18B7D6]/35 bg-[#18B7D6]/10 text-[#6FD8EC]')}>
          <Icon name={liveRunning ? 'Pause' : 'Play'} size={12} className="inline mr-1.5" />{liveRunning ? 'Pausar ciclo ao vivo' : 'Executar ciclo ao vivo'}
        </button>
      </div>
    </div>
  );
}

function CommissioningPanel({ items, onApproveGate }: { items: CommissioningItem[]; onApproveGate: () => void }) {
  const approved = items.filter((i) => i.result === 'approved').length;
  const progress = approved / items.length;
  const blockers = items.filter((i) => i.blocker);
  const stopIndex = blockers.length ? 7 : 9;
  return (
    <div className="space-y-4">
      <Panel title="Fluxo de comissionamento — Residencial Horizonte Azul" subtitle="Conclusão física não equivale à prontidão operacional">
        <div className="flex items-start overflow-x-auto nexo-scroll pb-2">
          {COMMISSIONING_FLOW.map((step, index) => (
            <div key={step} className="flex items-start shrink-0">
              <div className="w-[112px] text-center">
                <div className={cls('mx-auto w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-semibold', index < stopIndex ? 'border-[#0FA39D]/40 bg-[#0FA39D]/15 text-[#56D2C9]' : index === stopIndex ? 'border-[#E5A11A]/55 bg-[#E5A11A]/15 text-[#F2C15A]' : 'border-white/12 bg-white/[0.03] text-neutral-600')}>{index < stopIndex ? <Icon name="CheckCircle2" size={13} /> : index === stopIndex ? <Icon name="AlertTriangle" size={13} /> : index + 1}</div>
                <div className="mt-1.5 text-[9.5px] text-neutral-400 leading-tight">{step}</div>
              </div>
              {index < COMMISSIONING_FLOW.length - 1 && <div className={cls('w-6 h-px mt-3.5', index < stopIndex ? 'bg-[#0FA39D]/45' : 'bg-white/10')} />}
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Panel title="Checklist de prontidão" subtitle={`${approved}/${items.length} verificações aprovadas`} className="xl:col-span-3">
          <div className="space-y-2.5">
            {items.map((item) => <div key={item.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-start gap-3"><StatusChip status={RESULT_TONE[item.result]} size="sm" /><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-x-3 gap-y-1 justify-between"><span className="text-[11.5px] text-neutral-200 font-medium">{item.component}</span><span className="text-[9.5px] text-neutral-600 font-mono-id">{item.evidence}</span></div><div className="text-[10.5px] text-neutral-500 mt-1">{item.test} · {item.responsible} · {item.date}</div>{item.blocker && <div className="text-[10.5px] text-[#F2C15A] mt-1.5"><Icon name="AlertTriangle" size={10} className="inline mr-1" />{item.blocker}</div>}</div></div>)}
          </div>
        </Panel>
        <Panel title="Decisão de prontidão" subtitle="Gate humano obrigatório" className="xl:col-span-2">
          <div className="space-y-4"><div><div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400">Prontidão verificada</span><span className="text-neutral-100 tnum">{Math.round(progress * 100)}%</span></div><ProgressBar value={progress} tone="amber" /></div><div className="rounded-lg border border-[#D14A55]/25 bg-[#D14A55]/8 p-3 text-[11px] text-neutral-300 leading-relaxed"><div className="font-semibold text-[#F27D86] mb-1">Prontidão plena não recomendada</div>O acesso viário e a homologação do transporte impedem o reconhecimento de funcionalidade urbana.</div><button onClick={onApproveGate} className="w-full rounded-lg border border-[#7C5CBF]/35 bg-[#7C5CBF]/10 py-2 text-[11px] text-[#C6B0F0]"><Icon name="User" size={11} className="inline mr-1.5" />Registrar decisão humana</button><button className="w-full rounded-lg border border-white/12 bg-white/[0.03] py-2 text-[11px] text-neutral-300"><Icon name="Send" size={11} className="inline mr-1.5" />Abrir diligência ao município</button></div>
        </Panel>
      </div>
    </div>
  );
}

export function AtivosView({
  section,
  onSectionChange,
  onOpenAsset,
  onNavigateProduct,
  events,
  onPushEvent,
}: {
  section: AtivosSection;
  onSectionChange: (section: AtivosSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}) {
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState(WIND_ASSET_ID);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [healthAssetName, setHealthAssetName] = useState('Complexo Eólico Costa Branca');
  const [agents, setAgents] = useState(ASSET_AGENTS);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [telemetryPulse, setTelemetryPulse] = useState(0);
  const [reportProgress, setReportProgress] = useState<Record<string, number>>({});
  const [integrations, setIntegrations] = useState(ASSET_INTEGRATIONS);
  const [selectedOrderId, setSelectedOrderId] = useState('OS-4471');
  const [decisionNote, setDecisionNote] = useState<string | null>(null);

  const operationalAssets = ASSET_OPERATION.map((op) => ({ ...op, asset: ASSETS.find((a) => a.id === op.assetId)! })).filter((x) => x.asset);
  const selectedAsset = ASSETS.find((a) => a.id === selectedAssetId) ?? ASSETS[0];
  const filteredAssets = useMemo(() => ASSETS.filter((a) => {
    const query = search.toLowerCase();
    return (!query || `${a.name} ${a.city} ${a.uf} ${a.sector}`.toLowerCase().includes(query)) && (sectorFilter === 'todos' || a.sector === sectorFilter) && (!selectedUF || a.uf === selectedUF);
  }), [search, sectorFilter, selectedUF]);
  const avgHealth = Math.round(operationalAssets.filter((x) => x.asset.healthIndex != null).reduce((sum, x) => sum + (x.asset.healthIndex ?? 0), 0) / operationalAssets.filter((x) => x.asset.healthIndex != null).length);
  const portfolioValue = ASSETS.reduce((sum, a) => sum + a.value, 0);
  const openMaintenance = WORK_ORDERS.filter((o) => o.status !== 'concluida');
  const criticalPredictions = FAILURE_PREDICTIONS.filter((p) => p.criticidade === 'critico');
  const healthDimensions = HEALTH_DIMENSIONS[healthAssetName] ?? HEALTH_DIMENSIONS['Complexo Eólico Costa Branca'];
  const healthRadar = healthDimensions.map((d) => ({ dimensao: d.label, atual: d.value, referencia: 92 }));
  const selectedSensors = SENSORS.filter((s) => s.assetId === selectedAssetId || (selectedAssetId === WIND_ASSET_ID && s.ativo === 'Complexo Eólico Costa Branca'));
  const selectedOrder = WORK_ORDERS.find((o) => o.id === selectedOrderId) ?? WORK_ORDERS[0];

  useEffect(() => {
    if (!liveRunning) return;
    const pulse = window.setInterval(() => setTelemetryPulse((p) => p + 1), 850);
    return () => window.clearInterval(pulse);
  }, [liveRunning]);

  useEffect(() => {
    if (!liveRunning) return;
    if (liveStep >= ASSET_LIVE_STEPS.length) {
      setLiveRunning(false);
      setAgents((prev) => prev.map((a) => a.id === 'orchestrator' ? { ...a, status: 'waiting', progress: 100, stage: 'Gate humano preparado', recommendation: 'Aprovar parada conjunta WTG-14/WTG-22 em 4 de setembro.' } : a.id === 'health' || a.id === 'maintenance' ? { ...a, status: 'done', progress: 100 } : a));
      return;
    }
    const timer = window.setTimeout(() => {
      const step = ASSET_LIVE_STEPS[liveStep];
      onPushEvent(step.text, liveStep === 0 || liveStep === 2 ? 'warning' : liveStep === ASSET_LIVE_STEPS.length - 1 ? 'success' : 'agent');
      setAgents((prev) => prev.map((agent) => {
        if (agent.id !== step.agentId) return agent;
        return { ...agent, status: liveStep === ASSET_LIVE_STEPS.length - 1 ? 'waiting' : 'running', progress: Math.min(100, Math.max(agent.progress, 16 + liveStep * 11)), stage: step.text };
      }));
      setLiveStep((s) => s + 1);
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [liveRunning, liveStep, onPushEvent]);

  function toggleLive() {
    if (liveRunning) { setLiveRunning(false); return; }
    if (liveStep >= ASSET_LIVE_STEPS.length) {
      setLiveStep(0);
      setAgents(ASSET_AGENTS.map((a) => ({ ...a, status: a.id === 'orchestrator' || a.id === 'health' ? 'running' : a.status, progress: a.id === 'orchestrator' ? 8 : a.id === 'health' ? 12 : a.progress })));
    }
    setLiveRunning(true);
    onPushEvent('Nexo Ativos iniciou ciclo operacional ao vivo sobre o Complexo Eólico Costa Branca.', 'agent');
  }

  function runAgent(id: string) {
    const name = agents.find((a) => a.id === id)?.name ?? 'Agente';
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'running', progress: 10, stage: 'Consultando fontes autorizadas' } : a));
    onPushEvent(`${name} iniciado sob demanda.`, 'agent');
    let progress = 10;
    const interval = window.setInterval(() => {
      progress += 18;
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, progress: Math.min(100, progress), status: progress >= 100 ? 'done' : 'running', stage: progress >= 100 ? 'Análise concluída e log registrada' : `Processando etapa ${Math.ceil(progress / 20)} de 5` } : a));
      if (progress >= 100) { window.clearInterval(interval); onPushEvent(`${name} concluiu a execução.`, 'success'); }
    }, 380);
  }

  function generateReport(id: string) {
    setReportProgress((p) => ({ ...p, [id]: 7 }));
    let progress = 7;
    const interval = window.setInterval(() => {
      progress += 17;
      setReportProgress((p) => ({ ...p, [id]: Math.min(100, progress) }));
      if (progress >= 100) { window.clearInterval(interval); onPushEvent(`${ASSET_REPORTS.find((r) => r.id === id)?.title} gerado.`, 'success'); }
    }, 280);
  }

  function synchronizeIntegration(id: string) {
    const integration = integrations.find((i) => i.id === id);
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: 'operational', lastSync: 'agora', latency: i.id === 'INT-AT-04' ? '1,9 s' : i.latency } : i));
    onPushEvent(`${integration?.name ?? 'Integração'} sincronizada manualmente.`, 'success');
  }

  function approveCommissioning() {
    const note = 'Decisão registrada: prontidão operacional plena não concedida; comissionamento condicionado à conclusão do acesso e transporte.';
    setDecisionNote(note);
    onPushEvent(note, 'warning');
  }

  function createPredictiveOrder() {
    onPushEvent('Ordem preditiva complementar criada para inspeção conjunta WTG-14/WTG-22.', 'success');
  }

  function renderOverview() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Ativos acompanhados" value={String(ASSETS.length)} icon="Building2" delta="+2 no trimestre" />
          <KpiCard label="Valor do portfólio" value={fmtCompactBRL(portfolioValue)} icon="Landmark" hint="Capital rastreado" />
          <KpiCard label="Em operação / transição" value={`${operationalAssets.length}`} icon="Activity" hint="4 com telemetria" />
          <KpiCard label="Saúde média" value={`${avgHealth}`} icon="HeartPulse" delta="+2 pts" />
          <KpiCard label="Risco evitável" value="R$ 84,2 mi" icon="ShieldAlert" delta="6 ações abertas" deltaTone="amber" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Portfólio nacional" subtitle="Selecione o ativo para abrir o Ativo 360" className="xl:col-span-3">
            <BrazilMap assets={ASSETS} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={setSelectedAssetId} selectedId={selectedAssetId} height={340} />
          </Panel>
          <Panel title="Estado do ciclo operacional" subtitle="Ativos em operação, transição e restrição" className="xl:col-span-2">
            <DonutChart data={HEALTH_DISTRIBUTION} />
            <div className="mt-2 space-y-2">
              {operationalAssets.map(({ asset, status }) => <button key={asset.id} onClick={() => { setSelectedAssetId(asset.id); onOpenAsset(asset.id); }} className="w-full rounded-lg border border-white/8 bg-white/[0.025] p-2.5 flex items-center justify-between text-left hover:bg-white/[0.045]"><div><div className="text-[11px] text-neutral-200">{asset.name}</div><div className="text-[9.5px] text-neutral-600">{ASSET_STATUS_LABEL[status]} · {asset.city}/{asset.uf}</div></div><span className="font-display text-[17px] text-neutral-100 tnum">{asset.healthIndex ?? '—'}</span></button>)}
            </div>
          </Panel>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Ocorrências críticas" subtitle="Decisões que exigem ação nas próximas 72 horas" className="xl:col-span-2">
            <div className="space-y-2.5">
              <button onClick={() => onSectionChange('maintenance')} className="w-full rounded-lg border border-[#D14A55]/25 bg-[#D14A55]/7 p-3 flex items-start gap-3 text-left"><Icon name="AlertOctagon" size={16} className="text-[#F27D86] mt-0.5" /><div className="flex-1"><div className="text-[11.5px] text-neutral-100 font-medium">WTG-14 — probabilidade de falha em 90 dias: 46%</div><div className="text-[10px] text-neutral-500 mt-1">Parada conjunta recomendada para 4 de setembro · custo evitado estimado R$ 12,8 mi.</div></div><Icon name="ChevronRight" size={14} className="text-neutral-600" /></button>
              <button onClick={() => onSectionChange('portfolio')} className="w-full rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/7 p-3 flex items-start gap-3 text-left"><Icon name="AlertTriangle" size={16} className="text-[#F2C15A] mt-0.5" /><div className="flex-1"><div className="text-[11.5px] text-neutral-100 font-medium">Residencial Horizonte Azul — prontidão operacional bloqueada</div><div className="text-[10px] text-neutral-500 mt-1">Acesso viário e transporte público não concluídos; 4.960 beneficiários aguardam entrega funcional.</div></div><Icon name="ChevronRight" size={14} className="text-neutral-600" /></button>
              <button onClick={() => onSectionChange('health')} className="w-full rounded-lg border border-[#1584D1]/25 bg-[#1584D1]/7 p-3 flex items-start gap-3 text-left"><Icon name="Droplets" size={16} className="text-[#5FB4E8] mt-0.5" /><div className="flex-1"><div className="text-[11.5px] text-neutral-100 font-medium">Adutora Sertão Vivo — reforço de resiliência recomendado</div><div className="text-[10px] text-neutral-500 mt-1">Trecho km 38–46 concentra o risco residual do cenário de seca prolongada em 2040.</div></div><Icon name="ChevronRight" size={14} className="text-neutral-600" /></button>
            </div>
          </Panel>
          <Panel title="Ciclo ao vivo" subtitle={liveRunning ? `Etapa ${Math.min(liveStep + 1, ASSET_LIVE_STEPS.length)} de ${ASSET_LIVE_STEPS.length}` : 'Agentes e telemetria sincronizados'}>
            <div className="space-y-3"><div className="flex items-center justify-between"><span className="text-[10.5px] text-neutral-400">Orquestração</span><span className="text-[10px] text-[#6FD8EC]">{liveRunning ? 'LIVE' : liveStep ? 'Concluído' : 'Pronto'}</span></div><ProgressBar value={liveStep / ASSET_LIVE_STEPS.length} tone="cyan" />
              {agents.slice(0, 4).map((agent) => <div key={agent.id} className="flex items-center gap-2 text-[10px]"><span className="w-2 h-2 rounded-full" style={{ background: AGENT_STATUS[agent.status].color }} /><span className="flex-1 text-neutral-400 truncate">{agent.name}</span><span className="text-neutral-600 tnum">{agent.progress}%</span></div>)}
              <button onClick={toggleLive} className="w-full rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/8 py-2 text-[11px] text-[#6FD8EC]"><Icon name={liveRunning ? 'Pause' : 'Play'} size={11} className="inline mr-1.5" />{liveRunning ? 'Pausar' : 'Iniciar simulação'}</button>
            </div>
          </Panel>
        </div>
        <Panel title="Eventos operacionais" subtitle="Barramento corporativo do ciclo de vida"><EventFeed events={events.slice(-9)} maxHeight={245} /></Panel>
      </div>
    );
  }

  function renderPortfolio() {
    const commissioningItems = COMMISSIONING_ITEMS.filter((i) => i.assetId === COMMISSION_ASSET_ID);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Valor patrimonial" value={fmtCompactBRL(portfolioValue)} icon="Landmark" /><KpiCard label="Ativos com operador" value="4/8" icon="Users" /><KpiCard label="Prontidão pendente" value="2" icon="ClipboardCheck" delta="R$ 228 mi" deltaTone="amber" /><KpiCard label="Identidade persistente" value="100%" icon="Link2" hint="Passaporte Capital–Ativo" /></div>
        <Panel title="Portfólio corporativo" subtitle={`${filteredAssets.length} ativos encontrados`} actions={<div className="flex gap-2"><div className="relative"><Icon name="Search" size={12} className="absolute left-2.5 top-2 text-neutral-600" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ativo" className="w-48 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 py-1.5 text-[10.5px] text-neutral-200 outline-none" /></div><select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-2 py-1.5 text-[10.5px] text-neutral-300"><option value="todos">Todos os setores</option>{[...new Set(ASSETS.map((a) => a.sector))].map((s) => <option key={s}>{s}</option>)}</select><button onClick={() => downloadCsv('nexo-ativos-portfolio.csv', filteredAssets.map((a) => ({ id: a.id, ativo: a.name, uf: a.uf, setor: a.sector, etapa: a.stage, valor: a.value, saude: a.healthIndex ?? '' })))} className="rounded-lg border border-white/10 px-2.5 text-neutral-400"><Icon name="Download" size={12} /></button></div>}>
          <div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[11px]"><thead><tr className="text-left text-[9.5px] uppercase tracking-wide text-neutral-600 border-b border-white/8"><th className="px-4 py-2">Ativo</th><th className="px-2 py-2">Etapa</th><th className="px-2 py-2">Operador / responsável</th><th className="px-2 py-2">Valor</th><th className="px-2 py-2">Execução</th><th className="px-2 py-2">Saúde</th><th className="px-4 py-2">Status</th></tr></thead><tbody>{filteredAssets.map((asset) => { const op = ASSET_OPERATION.find((o) => o.assetId === asset.id); return <tr key={asset.id} onClick={() => setSelectedAssetId(asset.id)} className={cls('border-b border-white/[0.05] hover:bg-white/[0.04] cursor-pointer', selectedAssetId === asset.id && 'bg-[#1584D1]/8')}><td className="px-4 py-2.5"><div className="text-neutral-200 font-medium max-w-[250px] truncate">{asset.name}</div><div className="text-[9px] text-neutral-600 font-mono-id truncate max-w-[250px]">{asset.id}</div></td><td className="px-2 text-neutral-400">{asset.stage}</td><td className="px-2"><div className="text-neutral-300 max-w-[190px] truncate">{op?.operator ?? asset.responsible}</div><div className="text-[9.5px] text-neutral-600">{asset.city}/{asset.uf}</div></td><td className="px-2 text-neutral-300 tnum">{fmtCompactBRL(asset.value)}</td><td className="px-2 min-w-[130px]"><div className="flex gap-2 items-center"><ProgressBar value={asset.physicalProgress} tone={asset.status === 'critico' ? 'red' : asset.status === 'atencao' ? 'amber' : 'teal'} /><span className="text-[9.5px] text-neutral-500 tnum">{fmtPct(asset.physicalProgress)}</span></div></td><td className="px-2 text-neutral-200 font-display text-[15px]">{asset.healthIndex ?? '—'}</td><td className="px-4"><StatusChip status={asset.status} size="sm" /></td></tr>; })}</tbody></table></div>
        </Panel>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Passaporte do ativo selecionado" subtitle={selectedAsset.id} className="xl:col-span-1">
            <div className="space-y-3"><div><div className="text-[14px] font-semibold text-neutral-100">{selectedAsset.name}</div><div className="text-[10.5px] text-neutral-500 mt-1">{selectedAsset.summary}</div></div>{[['Programa', selectedAsset.program], ['Funding', selectedAsset.fundingSource], ['Contrato', selectedAsset.contract ?? 'Em estruturação'], ['Responsável', selectedAsset.responsible], ['Última atualização', selectedAsset.lastUpdate]].map(([label, value]) => <div key={label} className="border-t border-white/7 pt-2"><div className="text-[9px] uppercase tracking-wide text-neutral-600">{label}</div><div className="text-[10.5px] text-neutral-300 mt-0.5">{value}</div></div>)}<button onClick={() => onOpenAsset(selectedAsset.id)} className="w-full rounded-lg bg-[#1584D1] py-2 text-[11px] text-white"><Icon name="ArrowUpRight" size={11} className="inline mr-1.5" />Abrir Ativo 360</button></div>
          </Panel>
          <Panel title="Linha Capital–Ativo–Resultado" subtitle="Rastreabilidade do ativo" className="xl:col-span-2">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">{['Capital', 'Operação', 'Projeto', 'Contrato', 'Ativo', 'Resultado'].map((label, index) => <div key={label} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 text-center"><div className={cls('mx-auto w-7 h-7 rounded-full flex items-center justify-center', index <= 4 ? 'bg-[#0FA39D]/15 text-[#56D2C9]' : 'bg-[#1584D1]/15 text-[#5FB4E8]')}><Icon name={index <= 4 ? 'CheckCircle2' : 'Target'} size={13} /></div><div className="text-[9.5px] text-neutral-400 mt-2">{label}</div></div>)}</div>
            <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="flex justify-between text-[10.5px]"><span className="text-neutral-500">Beneficiários previstos</span><span className="text-neutral-200 tnum">{selectedAsset.beneficiaries.toLocaleString('pt-BR')}</span></div><div className="flex justify-between text-[10.5px] mt-2"><span className="text-neutral-500">Beneficiários verificados</span><span className="text-neutral-200 tnum">{selectedAsset.beneficiariesVerified.toLocaleString('pt-BR')}</span></div><ProgressBar value={selectedAsset.beneficiaries ? selectedAsset.beneficiariesVerified / selectedAsset.beneficiaries : 0} tone="cyan" height={5} /></div>
          </Panel>
        </div>
        <CommissioningPanel items={commissioningItems} onApproveGate={approveCommissioning} />
        {decisionNote && <div className="rounded-lg border border-[#7C5CBF]/30 bg-[#7C5CBF]/10 p-3 text-[11px] text-[#C6B0F0]"><Icon name="User" size={12} className="inline mr-1.5" />{decisionNote}</div>}
      </div>
    );
  }

  function renderMap() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Ativos georreferenciados" value="8/8" icon="MapPin" /><KpiCard label="Redes monitoradas" value="4" icon="Route" /><KpiCard label="Alertas territoriais" value="3" icon="AlertTriangle" delta="2 altos" deltaTone="red" /><KpiCard label="Stream ativo" value={liveRunning ? 'LIVE' : 'Pronto'} icon="Radio" hint="SCADA / equipes / sensores" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Mapa operacional do portfólio" subtitle="ArcGIS como integrador de ativos, redes, telemetria e riscos" className="xl:col-span-4" actions={<div className="flex gap-1"><Pill tone="cyan">FeatureLayer</Pill><Pill tone="cyan">StreamLayer</Pill><Pill tone="blue">Living Atlas</Pill></div>}>
            <BrazilMap assets={filteredAssets} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={setSelectedAssetId} selectedId={selectedAssetId} height={520} />
          </Panel>
          <Panel title="Camadas e contexto" subtitle={selectedAsset.name} className="xl:col-span-1">
            <div className="space-y-2">{['Ativos e componentes', 'Redes e dependências', 'Telemetria em tempo real', 'Ordens de manutenção', 'Riscos climáticos', 'World Imagery', 'ESA WorldCover'].map((layer, i) => <label key={layer} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] p-2.5 text-[10.5px] text-neutral-300"><input type="checkbox" defaultChecked={i < 5} className="accent-[#1584D1]" />{layer}</label>)}</div>
            <div className="mt-4 border-t border-white/8 pt-3"><div className="text-[10.5px] text-neutral-500">Ativo selecionado</div><div className="text-[11.5px] text-neutral-100 font-medium mt-1">{selectedAsset.name}</div><div className="text-[10px] text-neutral-500 mt-1">{selectedAsset.city}/{selectedAsset.uf} · {selectedAsset.sector}</div><button onClick={() => onOpenAsset(selectedAsset.id)} className="mt-3 w-full rounded-lg border border-[#1584D1]/30 bg-[#1584D1]/8 py-2 text-[10.5px] text-[#5FB4E8]">Abrir Ativo 360</button></div>
          </Panel>
        </div>
        <Panel title="Risco territorial e medida de resiliência" subtitle="Cruzamento espacial no nível do ativo e do componente">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">{CLIMATE_RISK.map((risk) => <div key={risk.assetId} onClick={() => setSelectedAssetId(risk.assetId)} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 cursor-pointer hover:bg-white/[0.045]"><div className="flex justify-between gap-2"><div className="text-[11px] text-neutral-200 font-medium">{risk.ativo}</div><span className={cls('text-[9px] rounded-full px-2 py-0.5 border', risk.exposicao === 'alto' ? 'text-[#F27D86] border-[#D14A55]/35 bg-[#D14A55]/10' : risk.exposicao === 'medio' ? 'text-[#F2C15A] border-[#E5A11A]/35 bg-[#E5A11A]/10' : 'text-[#56D2C9] border-[#0FA39D]/35 bg-[#0FA39D]/10')}>{risk.exposicao}</span></div><div className="text-[10px] text-neutral-500 mt-2">{risk.ameaca}</div><div className="text-[10px] text-neutral-300 mt-2 border-t border-white/7 pt-2">{risk.medida}</div></div>)}</div>
        </Panel>
      </div>
    );
  }

  function renderHealth() {
    const liveOffset = liveRunning ? Math.sin(telemetryPulse / 1.5) * 0.7 + liveStep * 0.09 : 0;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2"><span className="text-[10.5px] text-neutral-500">Ativo analisado:</span><select value={healthAssetName} onChange={(e) => { setHealthAssetName(e.target.value); const found = ASSETS.find((a) => a.name === e.target.value); if (found) setSelectedAssetId(found.id); }} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-1.5 text-[10.5px] text-neutral-200">{Object.keys(HEALTH_DIMENSIONS).map((name) => <option key={name}>{name}</option>)}</select><Pill tone="cyan"><Icon name="Radio" size={10} />{liveRunning ? 'Telemetria LIVE' : 'Última leitura há 12 s'}</Pill></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><KpiCard label="Índice de saúde" value={String(ASSETS.find((a) => a.name === healthAssetName)?.healthIndex ?? '—')} icon="HeartPulse" delta="+2 pts" /><KpiCard label="Disponibilidade" value="95,3%" icon="Activity" /><KpiCard label="Falhas previstas" value={String(criticalPredictions.length)} icon="AlertOctagon" delta="90 dias" deltaTone="red" /><KpiCard label="Sensores ativos" value="312" icon="Radio" hint="99,7% online" /><KpiCard label="Custo evitável" value="R$ 12,8 mi" icon="TrendingUp" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Índice multidimensional de saúde" subtitle="Atual versus referência corporativa" className="xl:col-span-3"><RadarComparison data={healthRadar} keys={[{ key: 'atual', label: 'Atual', color: '#18B7D6' }, { key: 'referencia', label: 'Referência', color: '#394B59' }]} /></Panel>
          <Panel title="Tendência do portfólio" subtitle="Índice ponderado dos ativos operacionais" className="xl:col-span-2"><TimeSeriesChart data={HEALTH_TREND} xKey="month" aKey="planned" bKey="actual" aLabel="Referência" bLabel="Saúde observada" /></Panel>
        </div>
        {healthAssetName === 'Complexo Eólico Costa Branca' && <Panel title="Gêmeo operacional — Complexo Eólico Costa Branca" subtitle="Componentes, condição e alertas sintéticos em 3D"><div className="h-[390px]"><WindComplexScene /></div></Panel>}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Telemetria de componentes" subtitle="Atualização dinâmica durante a simulação" className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{(selectedSensors.length ? selectedSensors : SENSORS.slice(0, 4)).map((sensor) => { const current = sensor.historico[sensor.historico.length - 1] + liveOffset; const isAlert = sensor.tipo === 'Vazão' ? current < sensor.limiteAlerta : current >= sensor.limiteAlerta * 0.86; return <div key={sensor.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="flex justify-between gap-2"><div><div className="text-[10.5px] text-neutral-200 font-medium">{sensor.componente}</div><div className="text-[9.5px] text-neutral-600">{sensor.tipo} · {sensor.id}</div></div><span className={cls('font-display text-[19px] tnum', isAlert ? 'text-[#F2C15A]' : 'text-[#56D2C9]')}>{current.toFixed(sensor.base > 100 ? 0 : 1)} <span className="text-[9px] text-neutral-500">{sensor.unidade}</span></span></div><div className="mt-3"><Sparkline sensor={sensor} width={260} height={58} /></div></div>; })}</div>
          </Panel>
          <Panel title="Previsão de falhas" subtitle="Horizontes de 30 e 90 dias">
            <div className="space-y-3">{FAILURE_PREDICTIONS.map((prediction) => <div key={prediction.componente} className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="flex justify-between gap-2"><div className="text-[10.5px] text-neutral-200 font-medium">{prediction.componente}</div><StatusChip status={prediction.criticidade} size="sm" /></div><div className="grid grid-cols-2 gap-2 mt-2"><div><div className="text-[9px] text-neutral-600">30 dias</div><div className="text-[14px] text-neutral-200 tnum">{Math.round(prediction.probabilidade30d * 100)}%</div></div><div><div className="text-[9px] text-neutral-600">90 dias</div><div className="text-[14px] text-neutral-200 tnum">{Math.round(prediction.probabilidade90d * 100)}%</div></div></div><div className="text-[9.5px] text-neutral-500 mt-2">{prediction.recomendacao}</div></div>)}</div>
          </Panel>
        </div>
      </div>
    );
  }

  function renderMaintenance() {
    const backlogCost = openMaintenance.reduce((s, o) => s + o.custo, 0);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><KpiCard label="Ordens abertas" value={String(openMaintenance.length)} icon="Wrench" delta="2 preditivas" deltaTone="amber" /><KpiCard label="Backlog estimado" value={fmtCompactBRL(backlogCost)} icon="DollarSign" /><KpiCard label="Conformidade preventiva" value="84%" icon="CheckSquare" delta="-6 p.p." deltaTone="amber" /><KpiCard label="Falha evitada" value="R$ 12,8 mi" icon="ShieldCheck" /><KpiCard label="Janela ótima" value="04 set" icon="CalendarClock" hint="Parada conjunta" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Ordens de manutenção" subtitle="Preventiva, corretiva e preditiva" className="xl:col-span-3" actions={<button onClick={createPredictiveOrder} className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/8 px-3 py-1.5 text-[10.5px] text-[#6FD8EC]"><Icon name="Plus" size={11} className="inline mr-1" />Nova ordem</button>}>
            <div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[10.5px]"><thead><tr className="text-left text-[9px] uppercase tracking-wide text-neutral-600 border-b border-white/8"><th className="px-4 py-2">Ordem / ativo</th><th className="px-2">Componente</th><th className="px-2">Tipo</th><th className="px-2">Status</th><th className="px-2">Previsão</th><th className="px-4">Custo</th></tr></thead><tbody>{WORK_ORDERS.map((order) => <tr key={order.id} onClick={() => setSelectedOrderId(order.id)} className={cls('border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.04]', selectedOrderId === order.id && 'bg-[#1584D1]/8')}><td className="px-4 py-2.5"><div className="text-neutral-200 font-mono-id">{order.id}</div><div className="text-[9px] text-neutral-600 max-w-[170px] truncate">{order.ativo}</div></td><td className="px-2 text-neutral-400 max-w-[190px] truncate">{order.componente}</td><td className="px-2 text-neutral-300">{order.tipo}</td><td className="px-2"><StatusChip status={order.status === 'concluida' ? 'normal' : order.status === 'em_execucao' ? 'analise' : 'atencao'} size="sm" /></td><td className="px-2 text-neutral-400">{order.previsao}</td><td className="px-4 text-neutral-300 tnum">{fmtCompactBRL(order.custo)}</td></tr>)}</tbody></table></div>
          </Panel>
          <Panel title="Dossiê da ordem" subtitle={selectedOrder.id} className="xl:col-span-2">
            <div className="space-y-3"><div><div className="text-[12px] text-neutral-100 font-medium">{selectedOrder.componente}</div><div className="text-[10px] text-neutral-500 mt-1">{selectedOrder.ativo}</div></div>{[['Tipo', selectedOrder.tipo], ['Responsável', selectedOrder.responsavel], ['Abertura', selectedOrder.abertura], ['Previsão', selectedOrder.previsao], ['Custo', fmtCompactBRL(selectedOrder.custo)]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-t border-white/7 pt-2 text-[10.5px]"><span className="text-neutral-500">{label}</span><span className="text-neutral-200 text-right">{value}</span></div>)}<div className="rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/8 p-2.5 text-[10px] text-neutral-300">Agente recomenda sincronizar materiais, equipe e previsão meteorológica antes da parada.</div><button onClick={() => runAgent('maintenance')} className="w-full rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/8 py-2 text-[10.5px] text-[#6FD8EC]">Recalcular janela ótima</button></div>
          </Panel>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Plano versus realizado" subtitle="Ordens concluídas por mês"><BarProgramChart data={MAINTENANCE_SERIES} xKey="month" aKey="planned" bKey="actual" aLabel="Planejadas" bLabel="Concluídas" /></Panel><Panel title="Plano de reinvestimento" subtitle="Vida útil remanescente e Capex futuro"><div className="space-y-3">{REINVESTMENT_PLAN.map((plan) => <div key={plan.assetId} className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="flex justify-between gap-2"><div className="text-[10.5px] text-neutral-200 font-medium">{plan.ativo}</div><span className="text-[10px] text-neutral-500">{plan.anoRecomendado}</span></div><div className="flex justify-between text-[9.5px] mt-2"><span className="text-neutral-500">Vida útil remanescente</span><span className="text-neutral-200">{plan.vidaUtilRemanescente}%</span></div><ProgressBar value={plan.vidaUtilRemanescente / 100} tone={plan.vidaUtilRemanescente < 80 ? 'amber' : 'teal'} height={5} /><div className="text-[9.5px] text-neutral-500 mt-2">{plan.recomendacao} · {fmtCompactBRL(plan.valorEstimado)}</div></div>)}</div></Panel></div>
      </div>
    );
  }

  function renderAnalytics() {
    const dimensionData = Object.entries(HEALTH_DIMENSIONS).map(([name, dimensions]) => ({ name: name.split(' ').slice(0, 2).join(' '), value: Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length) }));
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><KpiCard label="Disponibilidade média" value="97,5%" icon="Activity" /><KpiCard label="Precisão preditiva" value="91%" icon="Target" /><KpiCard label="Opex otimizado" value="R$ 4,7 mi" icon="TrendingDown" delta="12 meses" /><KpiCard label="Indisponibilidade evitada" value="43 h" icon="Clock" /><KpiCard label="Vida útil protegida" value="R$ 94,2 mi" icon="Landmark" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Disponibilidade operacional" subtitle="Meta versus observado"><TimeSeriesChart data={OPERATION_SERIES} xKey="month" aKey="planned" bKey="actual" aLabel="Meta (‰)" bLabel="Realizado (‰)" /></Panel><Panel title="Benchmark de saúde" subtitle="Índice médio por ativo"><SingleBarChart data={dimensionData} xKey="name" yKey="value" color="#18B7D6" /></Panel></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Valor por tipologia" subtitle="Portfólio acompanhado"><SingleBarChart data={ASSET_SECTOR_VALUE} xKey="name" yKey="value" color="#1584D1" /></Panel><Panel title="Risco e reinvestimento" subtitle="Prioridades recomendadas"><div className="space-y-3">{REINVESTMENT_PLAN.map((plan) => <div key={plan.assetId} className="grid grid-cols-[1fr_auto] gap-3 items-center rounded-lg border border-white/8 bg-white/[0.025] p-3"><div><div className="text-[10.5px] text-neutral-200">{plan.ativo}</div><div className="text-[9.5px] text-neutral-500 mt-1">{plan.recomendacao}</div><ProgressBar value={(100 - plan.vidaUtilRemanescente) / 100} tone={plan.vidaUtilRemanescente < 80 ? 'amber' : 'blue'} height={4} /></div><div className="text-right"><div className="text-[13px] text-neutral-100 tnum">{plan.anoRecomendado}</div><div className="text-[9px] text-neutral-600">{fmtCompactBRL(plan.valorEstimado)}</div></div></div>)}</div></Panel></div>
        <Panel title="Insights explicáveis" subtitle="Recomendações geradas a partir de telemetria, GIS, manutenção e histórico"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{ASSET_ANALYTICS_INSIGHTS.map((insight) => { const color = insight.tone === 'teal' ? '#0FA39D' : insight.tone === 'amber' ? '#E5A11A' : insight.tone === 'red' ? '#D14A55' : '#1584D1'; return <div key={insight.title} className="rounded-lg border p-3" style={{ borderColor: `${color}35`, background: `${color}0C` }}><div className="flex justify-between gap-3"><div className="text-[11px] text-neutral-100 font-medium">{insight.title}</div><span className="text-[9.5px]" style={{ color }}>{Math.round(insight.confidence * 100)}%</span></div><div className="text-[10px] text-neutral-400 mt-2 leading-relaxed">{insight.text}</div></div>; })}</div></Panel>
      </div>
    );
  }

  function renderAgents() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Agentes disponíveis" value={String(agents.length)} icon="Bot" /><KpiCard label="Em execução" value={String(agents.filter((a) => a.status === 'running').length)} icon="Loader2" /><KpiCard label="Aguardando humano" value={String(agents.filter((a) => a.status === 'waiting').length)} icon="User" /><KpiCard label="Confiança média" value={`${Math.round(agents.reduce((s, a) => s + a.confidence, 0) / agents.length * 100)}%`} icon="BadgeCheck" /></div>
        <Panel title="Orquestração ao vivo" subtitle="Fluxo: evento → saúde → manutenção → risco → decisão humana"><div className="flex items-center gap-2 overflow-x-auto nexo-scroll pb-2">{['Evento operacional', 'Diagnóstico', 'Previsão de falha', 'Janela de manutenção', 'Resiliência', 'Reinvestimento', 'Gate humano'].map((step, index) => <div key={step} className="flex items-center shrink-0"><div className={cls('rounded-lg border px-3 py-2 text-[10px]', index < Math.ceil(liveStep * 7 / ASSET_LIVE_STEPS.length) ? 'border-[#0FA39D]/35 bg-[#0FA39D]/10 text-[#56D2C9]' : index === Math.ceil(liveStep * 7 / ASSET_LIVE_STEPS.length) && liveRunning ? 'border-[#18B7D6]/35 bg-[#18B7D6]/10 text-[#6FD8EC]' : 'border-white/10 bg-white/[0.025] text-neutral-500')}>{step}</div>{index < 6 && <Icon name="ArrowRight" size={13} className="mx-2 text-neutral-700" />}</div>)}</div></Panel>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{agents.map((agent) => <AgentRuntimeCard key={agent.id} agent={agent} onRun={() => runAgent(agent.id)} />)}</div>
        <Panel title="Log operacional" subtitle="Fontes, etapas e eventos auditáveis"><EventFeed events={events.slice(-12)} maxHeight={330} /></Panel>
      </div>
    );
  }

  function renderReports() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Modelos disponíveis" value={String(ASSET_REPORTS.length)} icon="FileText" /><KpiCard label="Gerados no mês" value="34" icon="PackageCheck" /><KpiCard label="Agendados" value="11" icon="CalendarClock" /><KpiCard label="Com mapa" value="4" icon="Map" /></div>
        <Panel title="Biblioteca de relatórios" subtitle="Geração simulada com dados do portfólio, agentes e evidências"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{ASSET_REPORTS.map((report) => { const progress = reportProgress[report.id] ?? 0; return <div key={report.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="text-[11.5px] text-neutral-100 font-medium">{report.title}</div><div className="text-[9.5px] text-neutral-500 mt-1 leading-snug">{report.description}</div></div><Icon name="FileText" size={16} className="text-neutral-600" /></div><div className="mt-3 flex flex-wrap gap-1.5"><Pill tone="neutral">{report.format}</Pill><Pill tone="blue">{report.frequency}</Pill><Pill tone="cyan">{report.scope}</Pill></div>{progress > 0 && progress < 100 && <div className="mt-3"><div className="flex justify-between text-[9px] text-neutral-600 mb-1"><span>Gerando</span><span>{progress}%</span></div><ProgressBar value={progress / 100} tone="cyan" height={4} /></div>}<button onClick={() => generateReport(report.id)} className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.035] py-2 text-[10.5px] text-neutral-300"><Icon name={progress >= 100 ? 'Download' : 'Play'} size={10} className="inline mr-1.5" />{progress >= 100 ? 'Baixar pacote' : 'Gerar relatório'}</button></div>; })}</div></Panel>
        <Panel title="Construtor de pacote executivo" subtitle="Selecione conteúdo, escopo e anexos"><div className="grid grid-cols-1 lg:grid-cols-4 gap-4"><div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-2">{['Resumo do portfólio', 'Mapa de ativos', 'Índice de saúde', 'Falhas previstas', 'Backlog de manutenção', 'Resiliência climática', 'Plano de reinvestimento', 'Evidências e laudos', 'Narrativa gerada por IA'].map((item, i) => <label key={item} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5 text-[10.5px] text-neutral-300 flex gap-2"><input type="checkbox" defaultChecked={i < 7} className="accent-[#1584D1]" />{item}</label>)}</div><div><select className="w-full rounded-lg border border-white/10 bg-[#0B2235] p-2 text-[10.5px] text-neutral-300"><option>Visão corporativa</option><option>Somente operação</option><option>Comitê de reinvestimento</option></select><button onClick={() => onPushEvent('Pacote executivo de Nexo Ativos preparado para revisão humana.', 'success')} className="mt-3 w-full rounded-lg bg-[#1584D1] py-2 text-[10.5px] text-white">Preparar pacote</button></div></div></Panel>
      </div>
    );
  }

  function renderIntegrations() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Conectores" value={String(integrations.length)} icon="Plug" /><KpiCard label="Operacionais" value={String(integrations.filter((i) => i.status === 'operational').length)} icon="CheckCircle2" /><KpiCard label="Streaming" value="1" icon="Radio" hint="SCADA / IoT" /><KpiCard label="Latência média" value="2,0 s" icon="Activity" /></div>
        <Panel title="Matriz de integrações" subtitle="Sistemas de registro permanecem como fontes oficiais"><div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[10.5px]"><thead><tr className="text-left text-[9px] uppercase tracking-wide text-neutral-600 border-b border-white/8"><th className="px-4 py-2">Integração</th><th className="px-2">Direção</th><th className="px-2">Objetos</th><th className="px-2">Método / frequência</th><th className="px-2">Status</th><th className="px-2">Última sincronização</th><th className="px-4">Ação</th></tr></thead><tbody>{integrations.map((integration) => <tr key={integration.id} className="border-b border-white/[0.05]"><td className="px-4 py-3"><div className="text-neutral-200 font-medium">{integration.name}</div><div className="text-[9px] text-neutral-600 font-mono-id">{integration.id}</div></td><td className="px-2 text-neutral-400">{integration.direction}</td><td className="px-2 text-neutral-400 max-w-[260px]">{integration.objects}</td><td className="px-2"><div className="text-neutral-300">{integration.method}</div><div className="text-[9px] text-neutral-600">{integration.cadence} · {integration.latency}</div></td><td className="px-2"><StatusChip status={INTEGRATION_STATUS[integration.status].tone} size="sm" /></td><td className="px-2 text-neutral-500">{integration.lastSync}</td><td className="px-4"><button onClick={() => synchronizeIntegration(integration.id)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[9.5px] text-neutral-400"><Icon name="RefreshCw" size={10} className="inline mr-1" />Sincronizar</button></td></tr>)}</tbody></table></div></Panel>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Dependência dos agentes" subtitle="Conectores utilizados em cada decisão"><div className="space-y-2">{agents.map((agent) => <div key={agent.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="text-[10.5px] text-neutral-200">{agent.name}</div><div className="flex flex-wrap gap-1.5 mt-2">{agent.sources.map((source) => <Pill key={source} tone="neutral">{source}</Pill>)}</div></div>)}</div></Panel><Panel title="Arquitetura federada" subtitle="System of Intelligence and Orchestration"><div className="space-y-3">{[['Sistemas de registro', 'Entrega · Evidência · SCADA · Manutenção · Capital'], ['Nexo Ativos', 'Identidade · Saúde · Modelos · Agentes · Recomendação'], ['Sistemas de execução', 'Ordens · Diligências · Paradas · Reinvestimento · Impacto']].map(([label, value], index) => <div key={label}><div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center"><div className="text-[10px] uppercase tracking-wide text-neutral-600">{label}</div><div className="text-[11px] text-neutral-200 mt-1">{value}</div></div>{index < 2 && <div className="flex justify-center py-1"><Icon name="ArrowRight" size={15} className="text-[#18B7D6] rotate-90" /></div>}</div>)}</div></Panel></div>
      </div>
    );
  }

  const content = section === 'overview' ? renderOverview() : section === 'portfolio' ? renderPortfolio() : section === 'map' ? renderMap() : section === 'health' ? renderHealth() : section === 'maintenance' ? renderMaintenance() : section === 'analytics' ? renderAnalytics() : section === 'agents' ? renderAgents() : section === 'reports' ? renderReports() : renderIntegrations();

  return <div className="p-5 space-y-4 max-w-[1550px] mx-auto nexo-fade-in"><SectionHeader section={section} liveRunning={liveRunning} onToggleLive={toggleLive} onNavigateProduct={onNavigateProduct} />{content}</div>;
}
