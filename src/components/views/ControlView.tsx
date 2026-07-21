import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, KPI_CONTROL, AGENTS, type EventItem } from '@/data/mockData';
import { INTEGRATIONS, type Integration } from '@/data/integrationsData';
import type { ProductKey } from '@/data/navConfig';
import {
  CONTROL_ADMIN_RULES,
  CONTROL_AGENT_RUNTIME,
  CONTROL_CAUSAL_INSIGHTS,
  CONTROL_FORECAST,
  CONTROL_LIVE_STEPS,
  CONTROL_REPORTS,
  CONTROL_ROLE_MATRIX,
  CONTROL_WORKFLOWS,
  CRITICAL_AGENDA,
  type ControlAgentRuntime,
  type ControlSection,
} from '@/data/controlData';
import { fmtCompactBRL, fmtPct, fmtCompactNum, cls, nowStr } from '@/lib/tokens';
import { KpiCard, Panel, StatusChip, Pill, ProgressBar } from '@/components/shared/Primitives';
import { BrazilMap } from '@/components/shared/BrazilMap';
import {
  FunnelCapitalResultado,
  SCurveChart,
  RiskMatrixChart,
  TreemapSource,
  BarProgramChart,
  SingleBarChart,
  DonutChart,
  RadarComparison,
} from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { AgentCard } from '@/components/shared/AgentCard';

interface ControlViewProps {
  section: ControlSection;
  onSectionChange: (section: ControlSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}

const SECTION_META: Record<ControlSection, { title: string; subtitle: string; icon: string }> = {
  overview: { title: 'Visão geral', subtitle: 'Cockpit executivo do ciclo capital–ativo–resultado', icon: 'LayoutGrid' },
  situation: { title: 'Sala de situação', subtitle: 'Eventos críticos, decisões, workflows e coordenação ao vivo', icon: 'Radio' },
  map: { title: 'Mapa nacional', subtitle: 'Leitura territorial integrada da carteira, riscos e entregas', icon: 'Map' },
  agenda: { title: 'Agenda crítica', subtitle: 'Fila priorizada de decisões, gargalos, responsáveis e SLA', icon: 'AlertTriangle' },
  simulator: { title: 'Simulador', subtitle: 'Cenários de alocação, execução, risco e impacto da carteira', icon: 'SlidersHorizontal' },
  analytics: { title: 'Analytics', subtitle: 'Previsões, relações causais, desempenho e insights de decisão', icon: 'BarChart3' },
  agents: { title: 'Agentes', subtitle: 'Orquestração corporativa e automações críticas em tempo real', icon: 'Bot' },
  reports: { title: 'Relatórios', subtitle: 'Pacotes executivos, operacionais, regulatórios e de prestação de contas', icon: 'FileText' },
  integrations: { title: 'Integrações', subtitle: 'Saúde dos conectores, sincronizações e dependências dos agentes', icon: 'Plug' },
  admin: { title: 'Administração', subtitle: 'Regras, alçadas, perfis, parâmetros e trilha de governança', icon: 'Settings' },
};

const AGENT_STATUS: Record<ControlAgentRuntime['status'], { label: string; color: string }> = {
  idle: { label: 'Disponível', color: '#9AACB8' },
  running: { label: 'Em execução', color: '#18B7D6' },
  waiting: { label: 'Aguardando humano', color: '#7C5CBF' },
  done: { label: 'Concluído', color: '#0FA39D' },
  alert: { label: 'Alerta', color: '#E5A11A' },
};

const INTEGRATION_STATUS: Record<Integration['status'], { label: string; color: string }> = {
  ativa: { label: 'Ativa', color: '#0FA39D' },
  degradada: { label: 'Degradada', color: '#E5A11A' },
  falha: { label: 'Falha', color: '#D14A55' },
};

function SectionHeader({ section, liveRunning, onStartLive }: { section: ControlSection; liveRunning: boolean; onStartLive: () => void }) {
  const meta = SECTION_META[section];
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-[#1584D1]/15 border border-[#1584D1]/25 flex items-center justify-center shrink-0">
          <Icon name={meta.icon} size={18} className="text-[#5FB4E8]" />
        </span>
        <div>
          <div className="flex items-center gap-2 text-[10.5px] text-neutral-500 mb-0.5">
            <span>Nexo Control</span><Icon name="ChevronRight" size={10} /><span>{meta.title}</span>
          </div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">{meta.title}</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#0FA39D] opacity-40 nexo-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0FA39D]" />
          </span>
          Dados sincronizados · {nowStr()}
        </span>
        <button
          onClick={onStartLive}
          disabled={liveRunning}
          className={cls(
            'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11.5px] font-medium border transition-colors',
            liveRunning
              ? 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC] cursor-wait'
              : 'border-[#1584D1]/40 bg-[#1584D1]/15 text-[#5FB4E8] hover:bg-[#1584D1]/25'
          )}
        >
          <Icon name={liveRunning ? 'Loader2' : 'Play'} size={13} className={liveRunning ? 'animate-spin' : ''} />
          {liveRunning ? 'Orquestração ao vivo' : 'Executar ciclo ao vivo'}
        </button>
      </div>
    </div>
  );
}

function ProductLink({ icon, label, onClick, tone = 'blue' }: { icon: string; label: string; onClick: () => void; tone?: 'blue' | 'cyan' | 'neutral' }) {
  const classes = tone === 'cyan'
    ? 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC] hover:bg-[#18B7D6]/18'
    : tone === 'neutral'
      ? 'border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.07]'
      : 'border-[#1584D1]/30 bg-[#1584D1]/10 text-[#5FB4E8] hover:bg-[#1584D1]/18';
  return (
    <button onClick={onClick} className={cls('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors', classes)}>
      <Icon name={icon} size={12} />{label}<Icon name="ArrowUpRight" size={11} />
    </button>
  );
}

function LiveAgentRow({ agent, onOpen }: { agent: ControlAgentRuntime; onOpen: () => void }) {
  const meta = AGENT_STATUS[agent.status];
  return (
    <button onClick={onOpen} className="w-full text-left rounded-lg border border-white/10 bg-white/[0.025] p-3 hover:bg-white/[0.055] transition-colors">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#18B7D6]/10 border border-[#18B7D6]/20 flex items-center justify-center shrink-0">
          <Icon name={agent.icon} size={15} className="text-[#6FD8EC]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[12px] font-medium text-neutral-200 truncate">{agent.name}</div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: meta.color }}>
              <span className={cls('w-1.5 h-1.5 rounded-full', agent.status === 'running' && 'nexo-pulse-ring')} style={{ background: meta.color }} />
              {meta.label}
            </span>
          </div>
          <div className="text-[10.5px] text-neutral-500 mt-0.5 truncate">{agent.entity}</div>
          <div className="text-[11.5px] text-neutral-300 mt-1.5 leading-snug">{agent.step}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1"><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'amber' : agent.status === 'done' ? 'teal' : 'cyan'} height={4} /></div>
            <span className="font-mono-id text-[10px] text-neutral-500 tnum">{agent.progress}%</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1.5 text-[10.5px] text-neutral-500">
            <span>{agent.impact}</span><span>{agent.lastRun}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ControlView({
  section,
  onSectionChange,
  onOpenAsset,
  onNavigateProduct,
  events,
  onPushEvent,
}: ControlViewProps) {
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [selectedAssetId, setSelectedAssetId] = useState(ASSETS[0]?.id ?? '');
  const [mapLayer, setMapLayer] = useState<'status' | 'region'>('status');
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    assets: true, risks: true, beneficiaries: false, evidence: false, worldCover: true, imagery: false,
  });

  const [agendaStatus, setAgendaStatus] = useState<Record<string, 'open' | 'processing' | 'done'>>({});
  const [agendaFilter, setAgendaFilter] = useState<'Todos' | 'P0' | 'P1' | 'P2'>('Todos');

  const [simFunding, setSimFunding] = useState(58);
  const [simRisk, setSimRisk] = useState(72);
  const [simCapacity, setSimCapacity] = useState(61);
  const [simClimate, setSimClimate] = useState(68);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simApplied, setSimApplied] = useState(false);

  const [liveAgents, setLiveAgents] = useState<ControlAgentRuntime[]>(CONTROL_AGENT_RUNTIME);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const liveRunId = useRef(0);

  const [integrationRows, setIntegrationRows] = useState(INTEGRATIONS.map((i) => ({ ...i })));
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [integrationFilter, setIntegrationFilter] = useState<'Todos' | Integration['status']>('Todos');

  const [reportGenerating, setReportGenerating] = useState<string | null>(null);
  const [reportProgress, setReportProgress] = useState(0);
  const [generatedReports, setGeneratedReports] = useState<Record<string, string>>({});
  const [reportPeriod, setReportPeriod] = useState('Julho/2026');
  const [reportScope, setReportScope] = useState('Carteira corporativa');

  const [adminRules, setAdminRules] = useState(CONTROL_ADMIN_RULES);
  const [decisionThreshold, setDecisionThreshold] = useState(85);
  const [spatialTolerance, setSpatialTolerance] = useState(25);
  const [slaEscalation, setSlaEscalation] = useState(80);

  const sectors = useMemo(() => ['Todos', ...Array.from(new Set(ASSETS.map((a) => a.sector)))], []);
  const filteredAssets = useMemo(
    () => ASSETS.filter((a) => (selectedUF ? a.uf === selectedUF : true) && (sectorFilter === 'Todos' ? true : a.sector === sectorFilter)),
    [selectedUF, sectorFilter]
  );
  const selectedAsset = ASSETS.find((a) => a.id === selectedAssetId) ?? filteredAssets[0] ?? ASSETS[0];
  const filteredAgenda = CRITICAL_AGENDA.filter((a) => agendaFilter === 'Todos' || a.priority === agendaFilter);
  const filteredIntegrations = integrationRows.filter((i) => integrationFilter === 'Todos' || i.status === integrationFilter);

  const simulation = useMemo(() => {
    const allocation = 5.1 + simFunding * 0.026;
    const disbursement = 3.2 + simCapacity * 0.017 - simClimate * 0.003;
    const riskReduction = 8 + simRisk * 0.31 + simClimate * 0.08;
    const beneficiaries = 2.39 + simFunding * 0.014 + simCapacity * 0.009;
    const impact = Math.min(96, 54 + simRisk * 0.17 + simClimate * 0.13 + simCapacity * 0.09);
    return { allocation, disbursement, riskReduction, beneficiaries, impact };
  }, [simFunding, simRisk, simCapacity, simClimate]);

  useEffect(() => {
    if (!liveRunning) return;
    if (liveStep >= CONTROL_LIVE_STEPS.length) {
      setLiveRunning(false);
      return;
    }
    const runAtStart = liveRunId.current;
    const step = CONTROL_LIVE_STEPS[liveStep];
    const timer = window.setTimeout(() => {
      if (runAtStart !== liveRunId.current) return;
      setLiveAgents((prev) => prev.map((a) => a.id === step.agentId ? { ...a, progress: step.progress, status: step.status, step: step.step, lastRun: 'agora' } : a));
      onPushEvent(step.event, step.type);
      setLiveStep((v) => v + 1);
    }, step.delay);
    return () => window.clearTimeout(timer);
  }, [liveRunning, liveStep, onPushEvent]);

  useEffect(() => {
    if (!simRunning) return;
    const timer = window.setInterval(() => {
      setSimProgress((prev) => {
        const next = Math.min(100, prev + 8 + Math.round(Math.random() * 10));
        if (prev < 28 && next >= 28) onPushEvent('Simulador integrou funding, carteira e capacidade territorial', 'agent');
        if (prev < 58 && next >= 58) onPushEvent('Modelo de risco climático recalculou exposição de 214 ativos', 'info');
        if (prev < 82 && next >= 82) onPushEvent('Agente de Alocação comparou 480 cenários elegíveis', 'agent');
        if (next >= 100) {
          window.clearInterval(timer);
          setSimRunning(false);
          onPushEvent('Cenário concluído: maior impacto com redução estimada de risco de execução', 'success');
        }
        return next;
      });
    }, 430);
    return () => window.clearInterval(timer);
  }, [simRunning, onPushEvent]);

  useEffect(() => {
    if (!reportGenerating) return;
    const timer = window.setInterval(() => {
      setReportProgress((prev) => {
        const next = Math.min(100, prev + 14);
        if (next >= 100) {
          window.clearInterval(timer);
          setGeneratedReports((current) => ({ ...current, [reportGenerating]: `Gerado às ${nowStr()}` }));
          onPushEvent(`Relatório ${reportGenerating} gerado e registrado na trilha de auditoria`, 'success');
          setReportGenerating(null);
        }
        return next;
      });
    }, 350);
    return () => window.clearInterval(timer);
  }, [reportGenerating, onPushEvent]);

  function startLiveCycle() {
    liveRunId.current += 1;
    setLiveAgents(CONTROL_AGENT_RUNTIME.map((a) => ({ ...a })));
    setLiveStep(0);
    setLiveRunning(true);
    onPushEvent('Novo ciclo corporativo de orquestração iniciado pelo Nexo Control', 'agent');
  }

  function runSimulation() {
    setSimApplied(false);
    setSimProgress(0);
    setSimRunning(true);
    onPushEvent('Simulação de alocação e execução iniciada', 'agent');
  }

  function applySimulation() {
    setSimApplied(true);
    onPushEvent('Cenário SIM-2026-0041 aprovado para análise no Nexo Capital e Nexo Estrutura', 'success');
  }

  function actOnAgenda(id: string, action: 'process' | 'done') {
    const item = CRITICAL_AGENDA.find((a) => a.id === id);
    if (!item) return;
    setAgendaStatus((prev) => ({ ...prev, [id]: action === 'done' ? 'done' : 'processing' }));
    onPushEvent(
      action === 'done' ? `${item.id} concluído: ${item.title}` : `${item.agent} acionado para ${item.id}`,
      action === 'done' ? 'success' : 'agent'
    );
  }

  function syncIntegration(integration: Integration) {
    setSyncingId(integration.id);
    onPushEvent(`Sincronização manual iniciada: ${integration.origem}`, 'info');
    window.setTimeout(() => {
      setIntegrationRows((prev) => prev.map((i) => i.id === integration.id ? {
        ...i,
        status: 'ativa',
        ultimaExecucao: `Agora, ${nowStr()}`,
        proximaExecucao: i.frequencia === 'Tempo real' ? 'Contínua' : 'Conforme frequência',
        erro: undefined,
        latenciaMs: Math.max(42, integration.latenciaMs || 380),
        volume24h: integration.volume24h === '0 registros' ? '1.742 registros' : integration.volume24h,
      } : i));
      setSyncingId(null);
      onPushEvent(`Sincronização concluída: ${integration.origem} — dados liberados para os agentes dependentes`, 'success');
    }, 1800);
  }

  function generateReport(id: string) {
    setReportProgress(4);
    setReportGenerating(id);
    onPushEvent(`Geração do relatório ${id} iniciada com consolidação de dados e narrativa assistida`, 'agent');
  }

  function exportExecutiveCsv() {
    const rows = [
      ['Ativo', 'UF', 'Setor', 'Valor', 'Desembolsado', 'Execução', 'Status'],
      ...ASSETS.map((a) => [a.name, a.uf, a.sector, String(a.value), String(a.disbursed), String(a.physicalProgress), a.status]),
    ];
    downloadText('caixa-nexo-carteira-executiva.csv', rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv;charset=utf-8');
    onPushEvent('Carteira executiva exportada em CSV', 'success');
  }

  const header = <SectionHeader section={section} liveRunning={liveRunning} onStartLive={startLiveCycle} />;

  return (
    <div className="p-5 space-y-4 max-w-[1600px] mx-auto nexo-fade-in">
      {header}

      {section === 'overview' && (
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
            <KpiCard label="Decisões no SLA" value="92,4%" icon="CheckSquare" delta="+3,1 p.p." deltaTone="teal" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-3">
              <Panel title="Mapa nacional" subtitle="Carteira integrada por criticidade" actions={<button onClick={() => onSectionChange('map')} className="text-[11px] text-[#5FB4E8] hover:text-white">Abrir mapa completo →</button>}>
                <BrazilMap assets={filteredAssets} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={onOpenAsset} height={350} colorBy="status" />
              </Panel>
            </div>
            <div className="xl:col-span-2">
              <Panel title="Decisões prioritárias" subtitle="Ordenadas por SLA e exposição" actions={<button onClick={() => onSectionChange('agenda')} className="text-[11px] text-[#5FB4E8]">Ver agenda</button>}>
                <div className="space-y-2 max-h-[350px] overflow-y-auto nexo-scroll pr-1">
                  {CRITICAL_AGENDA.slice(0, 5).map((item) => (
                    <button key={item.id} onClick={() => onOpenAsset(item.assetId)} className="w-full text-left rounded-lg border border-white/10 bg-white/[0.025] p-2.5 hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold" style={{ color: item.priority === 'P0' ? '#D14A55' : item.priority === 'P1' ? '#E5A11A' : '#9AACB8' }}>{item.priority}</span>
                        <span className="text-[10px] text-neutral-500">{item.due}</span>
                      </div>
                      <div className="text-[12px] text-neutral-200 mt-1 leading-snug">{item.title}</div>
                      <div className="text-[10.5px] text-neutral-500 mt-1 truncate">{item.asset}</div>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Panel title="Funil capital → resultado" subtitle="R$ milhões"><FunnelCapitalResultado /></Panel>
            <Panel title="Planejado × realizado" subtitle="Execução física acumulada"><SCurveChart /></Panel>
            <Panel title="Matriz de risco" subtitle="Probabilidade × impacto"><RiskMatrixChart /></Panel>
            <Panel title="Capital por fonte" subtitle="R$ milhões"><TreemapSource /></Panel>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2"><Panel title="Execução por programa" subtitle="Planejado × realizado — R$ milhões"><BarProgramChart /></Panel></div>
            <Panel title="Agentes em operação" subtitle="Processos críticos e decisões assistidas" actions={<button onClick={() => onSectionChange('agents')} className="text-[11px] text-[#6FD8EC]">Abrir cockpit</button>}>
              <div className="space-y-2">
                {liveAgents.slice(0, 4).map((agent) => <LiveAgentRow key={agent.id} agent={agent} onOpen={() => onNavigateProduct(agent.module)} />)}
              </div>
            </Panel>
          </div>

          <Panel title="Integração ponta a ponta" subtitle="Acesso direto aos produtos especializados mantendo o contexto do ativo">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
              {[
                ['Landmark', 'Capital', 'capital'], ['Briefcase', 'Carteira', 'carteira'], ['Layers', 'Estrutura', 'estrutura'], ['ClipboardCheck', 'Contrata', 'contrata'],
                ['HardHat', 'Entrega', 'entrega'], ['ShieldCheck', 'Evidência', 'evidencia'], ['Building2', 'Ativos', 'ativos'], ['Target', 'Impacto', 'impacto'],
              ].map(([icon, label, product]) => (
                <button key={product} onClick={() => onNavigateProduct(product as ProductKey)} className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-3 text-left hover:bg-white/[0.06] hover:border-[#1584D1]/35 transition-colors">
                  <Icon name={icon} size={15} className="text-[#5FB4E8] mb-2" />
                  <div className="text-[12px] text-neutral-200">Nexo {label}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Abrir produto →</div>
                </button>
              ))}
            </div>
          </Panel>
        </>
      )}

      {section === 'situation' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Ocorrências P0" value="2" icon="AlertOctagon" delta="+1" deltaTone="red" />
            <KpiCard label="Decisões pendentes" value="3" icon="User" />
            <KpiCard label="Workflows ativos" value="28" icon="Workflow" />
            <KpiCard label="Agentes executando" value={String(liveAgents.filter((a) => a.status === 'running').length)} icon="Bot" />
            <KpiCard label="Exposição crítica" value="R$ 116 mi" icon="DollarSign" deltaTone="red" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 space-y-4">
              <Panel title="Incidentes e decisões em curso" subtitle="Atualização coordenada por agentes e responsáveis humanos" actions={<ProductLink icon="AlertTriangle" label="Abrir Agenda" onClick={() => onSectionChange('agenda')} />}>
                <div className="space-y-2">
                  {CRITICAL_AGENDA.slice(0, 4).map((item) => {
                    const state = agendaStatus[item.id] ?? 'open';
                    const consumed = Math.min(1, item.elapsedHours / item.slaHours);
                    return (
                      <div key={item.id} className={cls('rounded-lg border p-3', item.priority === 'P0' ? 'border-[#D14A55]/35 bg-[#D14A55]/7' : 'border-white/10 bg-white/[0.025]')}>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-[#D14A55]">{item.priority}</span><span className="font-mono-id text-[10px] text-neutral-500">{item.id}</span></div>
                            <div className="text-[13px] font-medium text-neutral-100 mt-1">{item.title}</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">{item.asset} · {item.owner}</div>
                            <div className="mt-2"><ProgressBar value={consumed} tone={consumed > 0.8 ? 'red' : consumed > 0.6 ? 'amber' : 'blue'} height={5} /></div>
                            <div className="flex justify-between mt-1 text-[10px] text-neutral-500"><span>SLA consumido: {Math.round(consumed * 100)}%</span><span>{item.due}</span></div>
                          </div>
                          <div className="flex md:flex-col gap-2 shrink-0">
                            <button onClick={() => actOnAgenda(item.id, 'process')} className="rounded-md border border-[#18B7D6]/30 bg-[#18B7D6]/10 px-2.5 py-1.5 text-[10.5px] text-[#6FD8EC]">
                              {state === 'processing' ? 'Agente acionado' : 'Acionar agente'}
                            </button>
                            <button onClick={() => onOpenAsset(item.assetId)} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10.5px] text-neutral-300">Ativo 360</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="Pipeline de resolução" subtitle="Workflows em processamento por etapa">
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2">
                  {CONTROL_WORKFLOWS.map((w) => (
                    <div key={w.stage} className="rounded-lg border border-white/10 bg-white/[0.025] p-3 min-h-[132px]">
                      <div className="flex items-center justify-between"><span className="text-[10.5px] text-neutral-400">{w.stage}</span><span className="font-display text-[18px] font-semibold" style={{ color: w.color }}>{w.count}</span></div>
                      <div className="space-y-1.5 mt-3">{w.items.map((i) => <div key={i} className="rounded bg-white/[0.04] px-2 py-1.5 text-[10px] text-neutral-400 leading-snug">{i}</div>)}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-5 space-y-4">
              <Panel title="Barramento corporativo" subtitle="Eventos de processos, dados e agentes — ao vivo" actions={<Pill tone="cyan">LIVE</Pill>}>
                <EventFeed events={events} maxHeight={430} />
              </Panel>
              <Panel title="Agentes acionados" subtitle="Execuções mais relevantes para a sala">
                <div className="space-y-2">{liveAgents.slice(0, 4).map((agent) => <LiveAgentRow key={agent.id} agent={agent} onOpen={() => onNavigateProduct(agent.module)} />)}</div>
              </Panel>
            </div>
          </div>
        </>
      )}

      {section === 'map' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-neutral-500 flex items-center gap-1"><Icon name="Filter" size={12} /> Carteira:</span>
            {sectors.map((s) => (
              <button key={s} onClick={() => setSectorFilter(s)} className={cls('rounded-full px-2.5 py-1 text-[11px] border transition-colors', sectorFilter === s ? 'bg-[#1584D1]/20 border-[#1584D1]/50 text-[#5FB4E8]' : 'border-white/10 text-neutral-400')}>{s}</button>
            ))}
            {selectedUF && <button onClick={() => setSelectedUF(null)} className="rounded-full px-2.5 py-1 text-[11px] bg-[#18B7D6]/15 border border-[#18B7D6]/40 text-[#6FD8EC]">UF: {selectedUF} ×</button>}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-9">
              <Panel title="Mapa integrado capital–ativo–resultado" subtitle="Ativos, riscos, evidências, beneficiários e contexto territorial" actions={
                <div className="flex gap-1">
                  <button onClick={() => setMapLayer('status')} className={cls('px-2 py-1 rounded text-[10px]', mapLayer === 'status' ? 'bg-[#1584D1] text-white' : 'bg-white/5 text-neutral-400')}>Status</button>
                  <button onClick={() => setMapLayer('region')} className={cls('px-2 py-1 rounded text-[10px]', mapLayer === 'region' ? 'bg-[#1584D1] text-white' : 'bg-white/5 text-neutral-400')}>Região</button>
                </div>
              }>
                <BrazilMap assets={filteredAssets} selectedId={selectedAssetId} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={setSelectedAssetId} height={560} colorBy={mapLayer} />
              </Panel>
            </div>
            <div className="xl:col-span-3 space-y-4">
              <Panel title="Camadas" subtitle="Catálogo espacial da demonstração" dense>
                <div className="space-y-2">
                  {[
                    ['assets', 'Ativos financiados', 'Building2'], ['risks', 'Riscos territoriais', 'ShieldAlert'], ['beneficiaries', 'Beneficiários', 'Users'],
                    ['evidence', 'Evidências e vistorias', 'Camera'], ['worldCover', 'Living Atlas · WorldCover', 'Layers'], ['imagery', 'World Imagery', 'Images'],
                  ].map(([key, label, icon]) => (
                    <label key={key} className="flex items-center gap-2 rounded-md border border-white/8 px-2.5 py-2 cursor-pointer hover:bg-white/[0.04]">
                      <input type="checkbox" checked={!!layerVisibility[key]} onChange={() => setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }))} className="accent-[#1584D1]" />
                      <Icon name={icon} size={13} className="text-neutral-500" />
                      <span className="text-[11.5px] text-neutral-300">{label}</span>
                    </label>
                  ))}
                </div>
              </Panel>

              {selectedAsset && (
                <Panel title="Ativo selecionado" subtitle={selectedAsset.id} dense>
                  <div className="space-y-3">
                    <div><div className="text-[13px] font-medium text-neutral-100">{selectedAsset.name}</div><div className="text-[11px] text-neutral-500 mt-0.5">{selectedAsset.city} · {selectedAsset.uf} · {selectedAsset.sector}</div></div>
                    <StatusChip status={selectedAsset.status} size="sm" />
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded bg-white/[0.04] p-2"><div className="text-neutral-500">Valor</div><div className="text-neutral-200 mt-0.5">{fmtCompactBRL(selectedAsset.value)}</div></div>
                      <div className="rounded bg-white/[0.04] p-2"><div className="text-neutral-500">Execução</div><div className="text-neutral-200 mt-0.5">{fmtPct(selectedAsset.physicalProgress)}</div></div>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{selectedAsset.summary}</p>
                    <button onClick={() => onOpenAsset(selectedAsset.id)} className="w-full rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] font-medium text-white hover:bg-[#0B6FC2]">Abrir Ativo 360</button>
                  </div>
                </Panel>
              )}
            </div>
          </div>

          <Panel title="Carteira territorial filtrada" subtitle={`${filteredAssets.length} ativos no contexto atual`} actions={<ProductLink icon="Database" label="Abrir Nexo Data" onClick={() => onNavigateProduct('data')} tone="neutral" />}>
            <div className="overflow-x-auto nexo-scroll">
              <table className="w-full text-left text-[11.5px]">
                <thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Ativo</th><th className="py-2 pr-3">Território</th><th className="py-2 pr-3">Programa</th><th className="py-2 pr-3">Valor</th><th className="py-2 pr-3">Execução</th><th className="py-2 pr-3">Status</th><th className="py-2"></th></tr></thead>
                <tbody>{filteredAssets.map((a) => <tr key={a.id} className="border-b border-white/[0.05] hover:bg-white/[0.025]"><td className="py-2.5 pr-3 text-neutral-200">{a.name}</td><td className="py-2.5 pr-3 text-neutral-400">{a.city} · {a.uf}</td><td className="py-2.5 pr-3 text-neutral-400">{a.program}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{fmtCompactBRL(a.value)}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{fmtPct(a.physicalProgress)}</td><td className="py-2.5 pr-3"><StatusChip status={a.status} size="sm" /></td><td className="py-2.5 text-right"><button onClick={() => onOpenAsset(a.id)} className="text-[#5FB4E8]">Detalhar →</button></td></tr>)}</tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {section === 'agenda' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Itens críticos" value={String(CRITICAL_AGENDA.length)} icon="AlertTriangle" />
            <KpiCard label="P0" value={String(CRITICAL_AGENDA.filter((a) => a.priority === 'P0').length)} icon="AlertOctagon" deltaTone="red" />
            <KpiCard label="SLA em risco" value="2" icon="Clock" delta="+1" deltaTone="red" />
            <KpiCard label="Exposição financeira" value="R$ 125,7 mi" icon="DollarSign" />
            <KpiCard label="Automação assistida" value="78%" icon="Bot" />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['Todos', 'P0', 'P1', 'P2'] as const).map((f) => <button key={f} onClick={() => setAgendaFilter(f)} className={cls('rounded-full px-3 py-1.5 text-[11px] border', agendaFilter === f ? 'bg-[#1584D1]/20 border-[#1584D1]/50 text-[#5FB4E8]' : 'border-white/10 text-neutral-400')}>{f}</button>)}
          </div>

          <div className="space-y-3">
            {filteredAgenda.map((item) => {
              const state = agendaStatus[item.id] ?? 'open';
              const consumed = Math.min(1, item.elapsedHours / item.slaHours);
              return (
                <Panel key={item.id} className={state === 'done' ? 'opacity-60' : ''}>
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                    <div className="xl:col-span-6">
                      <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold" style={{ color: item.priority === 'P0' ? '#D14A55' : item.priority === 'P1' ? '#E5A11A' : '#9AACB8' }}>{item.priority}</span><span className="font-mono-id text-[10px] text-neutral-500">{item.id}</span><StatusChip status={state === 'done' ? 'normal' : item.status} size="sm" /></div>
                      <div className="text-[14px] font-medium text-neutral-100 mt-2">{item.title}</div>
                      <button onClick={() => onOpenAsset(item.assetId)} className="text-[11.5px] text-[#5FB4E8] mt-1 hover:underline">{item.asset}</button>
                      <p className="text-[11.5px] text-neutral-400 mt-2 leading-relaxed">{item.recommendation}</p>
                    </div>
                    <div className="xl:col-span-3 space-y-2 text-[11px]">
                      <div className="flex justify-between"><span className="text-neutral-500">Responsável</span><span className="text-neutral-300">{item.owner}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Prazo</span><span className="text-neutral-300">{item.due}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Exposição</span><span className="text-neutral-300">{item.financialExposure ? fmtCompactBRL(item.financialExposure) : 'Não financeira'}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Agente</span><span className="text-neutral-300 text-right">{item.agent}</span></div>
                      <div className="pt-1"><ProgressBar value={consumed} tone={consumed > 0.8 ? 'red' : consumed > 0.6 ? 'amber' : 'blue'} height={5} /><div className="text-[10px] text-neutral-500 mt-1">{Math.round(consumed * 100)}% do SLA consumido</div></div>
                    </div>
                    <div className="xl:col-span-3 flex xl:flex-col gap-2">
                      <button disabled={state !== 'open'} onClick={() => actOnAgenda(item.id, 'process')} className="flex-1 rounded-md border border-[#18B7D6]/30 bg-[#18B7D6]/10 px-3 py-2 text-[11px] text-[#6FD8EC] disabled:opacity-50">{state === 'processing' ? 'Agente em execução' : 'Acionar agente crítico'}</button>
                      <button onClick={() => onNavigateProduct(item.target)} className="flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300">Abrir Nexo {item.target}</button>
                      <button disabled={state === 'done'} onClick={() => actOnAgenda(item.id, 'done')} className="flex-1 rounded-md border border-[#0FA39D]/30 bg-[#0FA39D]/10 px-3 py-2 text-[11px] text-[#6DD7D1] disabled:opacity-50">Registrar conclusão</button>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </>
      )}

      {section === 'simulator' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4">
              <Panel title="Parâmetros do cenário" subtitle="SIM-2026-0041 · Carteira corporativa">
                <div className="space-y-5">
                  {[
                    ['Disponibilidade de funding', simFunding, setSimFunding, 'Landmark'],
                    ['Prioridade de redução de risco', simRisk, setSimRisk, 'ShieldAlert'],
                    ['Capacidade de execução local', simCapacity, setSimCapacity, 'HardHat'],
                    ['Peso de adaptação climática', simClimate, setSimClimate, 'Wind'],
                  ].map(([label, value, setter, icon]) => (
                    <div key={String(label)}>
                      <div className="flex items-center justify-between text-[11.5px] mb-2"><span className="text-neutral-300 flex items-center gap-1.5"><Icon name={String(icon)} size={12} className="text-neutral-500" />{String(label)}</span><span className="text-[#5FB4E8] tnum">{Number(value)}%</span></div>
                      <input type="range" min={0} max={100} value={Number(value)} onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))} className="w-full accent-[#1584D1]" />
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/8 space-y-2">
                    <button onClick={runSimulation} disabled={simRunning} className="w-full rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"><Icon name={simRunning ? 'Loader2' : 'Play'} size={13} className={simRunning ? 'animate-spin' : ''} />{simRunning ? `Simulando ${simProgress}%` : 'Executar simulação com agentes'}</button>
                    {simProgress > 0 && <ProgressBar value={simProgress / 100} tone={simProgress === 100 ? 'teal' : 'cyan'} height={6} />}
                    <button onClick={() => { setSimFunding(58); setSimRisk(72); setSimCapacity(61); setSimClimate(68); setSimProgress(0); setSimApplied(false); }} className="w-full rounded-md border border-white/10 px-3 py-2 text-[11px] text-neutral-400">Restaurar baseline</button>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-8 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <KpiCard label="Alocação projetada" value={`R$ ${simulation.allocation.toFixed(1).replace('.', ',')} bi`} icon="Package" delta="+8,4%" deltaTone="teal" />
                <KpiCard label="Desembolso 12m" value={`R$ ${Math.max(0, simulation.disbursement).toFixed(1).replace('.', ',')} bi`} icon="Banknote" delta="+11,2%" deltaTone="teal" />
                <KpiCard label="Risco reduzido" value={`${simulation.riskReduction.toFixed(0)}%`} icon="ShieldCheck" />
                <KpiCard label="Beneficiários" value={`${simulation.beneficiaries.toFixed(1).replace('.', ',')} mi`} icon="Users" />
                <KpiCard label="Impacto previsto" value={`${simulation.impact.toFixed(0)}%`} icon="Target" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Panel title="Redistribuição por programa" subtitle="Baseline × cenário — R$ milhões"><BarProgramChart data={[
                  { programa: 'Saneamento', planejado: 1450, realizado: 1450 + simRisk * 2.2 },
                  { programa: 'Habitação', planejado: 980, realizado: 980 + simCapacity * 1.1 },
                  { programa: 'Drenagem', planejado: 720, realizado: 720 + simClimate * 2.8 },
                  { programa: 'Mobilidade', planejado: 610, realizado: 610 + simFunding * 1.4 },
                  { programa: 'Energia', planejado: 890, realizado: 890 + simClimate * 1.2 },
                ]} aLabel="Baseline" bLabel="Cenário" /></Panel>
                <Panel title="Perfil multidimensional" subtitle="Comparação do cenário com a carteira atual"><RadarComparison data={[
                  { dimensao: 'Funding', atual: 62, cenario: simFunding }, { dimensao: 'Risco', atual: 55, cenario: simRisk },
                  { dimensao: 'Execução', atual: 58, cenario: simCapacity }, { dimensao: 'Clima', atual: 48, cenario: simClimate },
                  { dimensao: 'Impacto', atual: 71, cenario: simulation.impact },
                ]} keys={[{ key: 'atual', label: 'Atual', color: '#394B59' }, { key: 'cenario', label: 'Cenário', color: '#18B7D6' }]} /></Panel>
              </div>
              <Panel title="Recomendação do Agente de Alocação" subtitle="Resultado explicável com gate humano">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#18B7D6]/10 border border-[#18B7D6]/25 flex items-center justify-center"><Icon name="Bot" size={19} className="text-[#6FD8EC]" /></div>
                  <div className="flex-1"><div className="text-[13px] font-medium text-neutral-100">Priorizar saneamento e drenagem em municípios com prontidão acima de 70%</div><p className="text-[11.5px] text-neutral-400 mt-1 leading-relaxed">O cenário aumenta o desembolso estimado, reduz exposição climática e preserva as condições do funding. Recomenda-se reservar 7% para assistência técnica e manter gate humano para alterações de envelope.</p></div>
                  <div className="flex flex-wrap gap-2"><button disabled={simProgress < 100} onClick={applySimulation} className="rounded-md bg-[#0FA39D] px-3 py-2 text-[11px] font-medium text-white disabled:opacity-40">{simApplied ? 'Cenário aplicado' : 'Submeter cenário'}</button><ProductLink icon="Landmark" label="Nexo Capital" onClick={() => onNavigateProduct('capital')} /><ProductLink icon="Layers" label="Nexo Estrutura" onClick={() => onNavigateProduct('estrutura')} tone="neutral" /></div>
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}

      {section === 'analytics' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Previsão de desembolso" subtitle="R$ milhões · intervalo de decisão jul–dez/2026"><BarProgramChart data={CONTROL_FORECAST.map((d) => ({ periodo: d.mes, contratado: d.contratado, previsao: d.previsao }))} xKey="periodo" aKey="contratado" bKey="previsao" aLabel="Contratação projetada" bLabel="Desembolso previsto" /></Panel>
            <Panel title="Risco da carteira" subtitle="Probabilidade × impacto — fatores dominantes"><RiskMatrixChart /></Panel>
            <Panel title="Conversão capital → resultado" subtitle="Eficácia acumulada por etapa"><FunnelCapitalResultado /></Panel>
            <Panel title="Fontes de capital" subtitle="Concentração e diversificação"><TreemapSource /></Panel>
          </div>

          <Panel title="Insights causais e recomendações" subtitle="Hipóteses suportadas por dados; exigem validação dos especialistas">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {CONTROL_CAUSAL_INSIGHTS.map((insight) => {
                const color = insight.tone === 'red' ? '#D14A55' : insight.tone === 'amber' ? '#E5A11A' : insight.tone === 'teal' ? '#0FA39D' : '#1584D1';
                return <button key={insight.id} onClick={() => onNavigateProduct(insight.target)} className="text-left rounded-lg border border-white/10 bg-white/[0.025] p-3 hover:bg-white/[0.055] transition-colors"><div className="flex items-center justify-between"><span className="font-mono-id text-[10px] text-neutral-500">{insight.id}</span><span className="text-[10px]" style={{ color }}>{Math.round(insight.confidence * 100)}% confiança</span></div><div className="text-[12.5px] text-neutral-200 mt-2 leading-snug">{insight.title}</div><div className="text-[15px] font-semibold mt-3" style={{ color }}>{insight.value}</div><div className="text-[10px] text-neutral-500 mt-1">Abrir análise no Nexo {insight.target} →</div></button>;
              })}
            </div>
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel title="Distribuição por estágio"><DonutChart data={[
              { name: 'Estruturação/Contratação', value: 24, fill: '#7C5CBF' }, { name: 'Execução', value: 38, fill: '#1584D1' }, { name: 'Comissionamento', value: 12, fill: '#18B7D6' }, { name: 'Operação/Impacto', value: 26, fill: '#0FA39D' },
            ]} /></Panel>
            <Panel title="Desempenho por unidade"><SingleBarChart data={[{ unidade: 'Norte', score: 72 }, { unidade: 'Nordeste', score: 84 }, { unidade: 'Centro-Oeste', score: 77 }, { unidade: 'Sudeste', score: 89 }, { unidade: 'Sul', score: 86 }]} xKey="unidade" yKey="score" color="#18B7D6" /></Panel>
            <Panel title="Qualidade decisória"><div className="space-y-4 pt-2">{[
              ['Decisões no SLA', 0.924, 'teal'], ['Recomendações aceitas', 0.781, 'blue'], ['Evidência com alta confiança', 0.887, 'cyan'], ['Previsão dentro da tolerância', 0.842, 'teal'], ['Workflows sem retrabalho', 0.736, 'amber'],
            ].map(([label, value, tone]) => <div key={String(label)}><div className="flex justify-between text-[11.5px] mb-1.5"><span className="text-neutral-400">{String(label)}</span><span className="text-neutral-200 tnum">{Math.round(Number(value) * 100)}%</span></div><ProgressBar value={Number(value)} tone={tone as 'teal' | 'blue' | 'cyan' | 'amber'} /></div>)}</div></Panel>
          </div>
        </>
      )}

      {section === 'agents' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Agentes configurados" value={String(AGENTS.length)} icon="Bot" />
            <KpiCard label="Executando agora" value={String(liveAgents.filter((a) => a.status === 'running').length)} icon="Activity" />
            <KpiCard label="Aguardando humano" value={String(liveAgents.filter((a) => a.status === 'waiting').length)} icon="User" />
            <KpiCard label="Execuções em 24h" value="1.284" icon="Zap" />
            <KpiCard label="Automação assistida" value="93%" icon="CheckCircle2" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7">
              <Panel title="Orquestração ao vivo" subtitle="Acompanhe a evolução de cada agente e o gate humano" actions={<button onClick={startLiveCycle} disabled={liveRunning} className="rounded-md bg-[#1584D1] px-3 py-1.5 text-[11px] text-white disabled:opacity-50">{liveRunning ? `Executando ${liveStep}/${CONTROL_LIVE_STEPS.length}` : 'Reiniciar ciclo'}</button>}>
                <div className="space-y-2">{liveAgents.map((agent) => <LiveAgentRow key={agent.id} agent={agent} onOpen={() => onNavigateProduct(agent.module)} />)}</div>
              </Panel>
            </div>
            <div className="xl:col-span-5 space-y-4">
              <Panel title="Eventos do ciclo" subtitle="Logs resumidos, auditáveis e em tempo real"><EventFeed events={events} maxHeight={430} /></Panel>
              <Panel title="Governança dos agentes" subtitle="Decisão assistida, não autônoma">
                <div className="space-y-2 text-[11.5px] text-neutral-400 leading-relaxed"><div className="flex gap-2"><Icon name="ShieldCheck" size={14} className="text-[#0FA39D] shrink-0 mt-0.5" /><span>Gate humano obrigatório em aprovação, desembolso, suspensão, alteração contratual e sanção.</span></div><div className="flex gap-2"><Icon name="FileSearch" size={14} className="text-[#18B7D6] shrink-0 mt-0.5" /><span>Fontes, regras, modelos e evidências consultadas ficam registradas na execução.</span></div><div className="flex gap-2"><Icon name="Workflow" size={14} className="text-[#7C5CBF] shrink-0 mt-0.5" /><span>O orquestrador cria tarefas e escalona exceções conforme alçadas e SLA.</span></div></div>
                <div className="mt-3"><ProductLink icon="Bot" label="Abrir Nexo Agents completo" onClick={() => onNavigateProduct('agents')} tone="cyan" /></div>
              </Panel>
            </div>
          </div>

          <Panel title="Catálogo de agentes especializados" subtitle="Detalhamento completo preservado no produto Nexo Agents">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{AGENTS.slice(0, 8).map((a) => <AgentCard key={a.id} agent={a} />)}</div>
          </Panel>
        </>
      )}

      {section === 'reports' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Modelos disponíveis" value={String(CONTROL_REPORTS.length)} icon="FileText" />
            <KpiCard label="Relatórios gerados (30d)" value="186" icon="CheckCircle2" />
            <KpiCard label="Agendamentos ativos" value="14" icon="CalendarClock" />
            <KpiCard label="Tempo médio de geração" value="38 s" icon="Clock" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8">
              <Panel title="Biblioteca de relatórios" subtitle="Modelos executivos e operacionais conectados aos produtos especializados">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONTROL_REPORTS.map((report) => {
                    const generating = reportGenerating === report.id;
                    return (
                      <div key={report.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-3.5">
                        <div className="flex items-start gap-3"><span className="w-8 h-8 rounded-lg bg-[#1584D1]/10 border border-[#1584D1]/20 flex items-center justify-center"><Icon name={report.icon} size={15} className="text-[#5FB4E8]" /></span><div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium text-neutral-100">{report.name}</div><div className="text-[11px] text-neutral-400 mt-1 leading-snug">{report.description}</div></div></div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-3"><span>{report.frequency}</span><span>{generatedReports[report.id] ?? `Último: ${report.last}`}</span></div>
                        {generating && <div className="mt-2"><ProgressBar value={reportProgress / 100} tone="cyan" height={5} /><div className="text-[10px] text-neutral-500 mt-1">Consolidando dados, mapas e narrativa: {reportProgress}%</div></div>}
                        <div className="flex gap-2 mt-3"><button disabled={!!reportGenerating} onClick={() => generateReport(report.id)} className="flex-1 rounded-md bg-[#1584D1] px-2.5 py-1.5 text-[10.5px] text-white disabled:opacity-50">Gerar agora</button><button onClick={() => onNavigateProduct(report.module)} className="rounded-md border border-white/10 px-2.5 py-1.5 text-[10.5px] text-neutral-300">Abrir fonte</button></div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
            <div className="xl:col-span-4">
              <Panel title="Construtor rápido" subtitle="Relatório personalizado para a demonstração">
                <div className="space-y-3">
                  <label className="block"><span className="text-[10.5px] text-neutral-500">Escopo</span><select value={reportScope} onChange={(e) => setReportScope(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-[#071521] px-2.5 py-2 text-[11.5px] text-neutral-200"><option>Carteira corporativa</option><option>VP Governo</option><option>VP Habitação</option><option>VP Agente Operador</option><option>Programa de Saneamento</option></select></label>
                  <label className="block"><span className="text-[10.5px] text-neutral-500">Período</span><select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-[#071521] px-2.5 py-2 text-[11.5px] text-neutral-200"><option>Julho/2026</option><option>2º trimestre/2026</option><option>Acumulado 2026</option><option>Últimos 12 meses</option></select></label>
                  <div><div className="text-[10.5px] text-neutral-500 mb-1.5">Conteúdo</div>{['KPIs executivos', 'Mapa territorial', 'Riscos e agenda', 'Previsão de desembolso', 'Impacto e beneficiários', 'Narrativa gerada por IA'].map((i) => <label key={i} className="flex items-center gap-2 py-1 text-[11px] text-neutral-300"><input type="checkbox" defaultChecked className="accent-[#1584D1]" />{i}</label>)}</div>
                  <button onClick={() => generateReport(`CUSTOM-${reportScope}`)} disabled={!!reportGenerating} className="w-full rounded-md bg-[#0FA39D] px-3 py-2 text-[11.5px] font-medium text-white disabled:opacity-50">Gerar pacote executivo</button>
                  <button onClick={exportExecutiveCsv} className="w-full rounded-md border border-white/10 px-3 py-2 text-[11px] text-neutral-300 flex items-center justify-center gap-2"><Icon name="Download" size={13} />Exportar dados em CSV</button>
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}

      {section === 'integrations' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Conectores" value={String(integrationRows.length)} icon="Plug" />
            <KpiCard label="Ativos" value={String(integrationRows.filter((i) => i.status === 'ativa').length)} icon="CheckCircle2" />
            <KpiCard label="Degradados" value={String(integrationRows.filter((i) => i.status === 'degradada').length)} icon="AlertTriangle" deltaTone="amber" />
            <KpiCard label="Com falha" value={String(integrationRows.filter((i) => i.status === 'falha').length)} icon="AlertOctagon" deltaTone="red" />
            <KpiCard label="Eventos processados (24h)" value="2,34 mi" icon="Database" />
          </div>

          <div className="flex flex-wrap gap-2">{(['Todos', 'ativa', 'degradada', 'falha'] as const).map((f) => <button key={f} onClick={() => setIntegrationFilter(f)} className={cls('rounded-full px-3 py-1.5 text-[11px] border', integrationFilter === f ? 'bg-[#1584D1]/20 border-[#1584D1]/50 text-[#5FB4E8]' : 'border-white/10 text-neutral-400')}>{f === 'Todos' ? 'Todos' : INTEGRATION_STATUS[f].label}</button>)}</div>

          <Panel title="Matriz de integrações" subtitle="System of record → Nexo Control → agentes e produtos especializados" actions={<ProductLink icon="Database" label="Abrir Nexo Data" onClick={() => onNavigateProduct('data')} />}>
            <div className="overflow-x-auto nexo-scroll">
              <table className="w-full text-left text-[11px] min-w-[1050px]">
                <thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Fonte</th><th className="py-2 pr-3">Categoria</th><th className="py-2 pr-3">Método</th><th className="py-2 pr-3">Frequência</th><th className="py-2 pr-3">Última execução</th><th className="py-2 pr-3">Latência</th><th className="py-2 pr-3">Volume</th><th className="py-2 pr-3">Status</th><th className="py-2"></th></tr></thead>
                <tbody>{filteredIntegrations.map((i) => { const meta = INTEGRATION_STATUS[i.status]; return <tr key={i.id} className="border-b border-white/[0.05] hover:bg-white/[0.025]"><td className="py-2.5 pr-3 text-neutral-200"><div>{i.origem}</div><div className="font-mono-id text-[9.5px] text-neutral-600">{i.id}</div></td><td className="py-2.5 pr-3 text-neutral-400">{i.categoria}</td><td className="py-2.5 pr-3 text-neutral-400">{i.metodo}</td><td className="py-2.5 pr-3 text-neutral-400">{i.frequencia}</td><td className="py-2.5 pr-3 text-neutral-400">{i.ultimaExecucao}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{i.latenciaMs ? `${i.latenciaMs} ms` : '—'}</td><td className="py-2.5 pr-3 text-neutral-400">{i.volume24h}</td><td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1 font-medium" style={{ color: meta.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />{meta.label}</span>{i.erro && <div className="text-[9.5px] text-[#D14A55] max-w-[220px] mt-0.5">{i.erro}</div>}</td><td className="py-2.5 text-right"><button disabled={syncingId === i.id} onClick={() => syncIntegration(i)} className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-neutral-300 disabled:opacity-50 inline-flex items-center gap-1"><Icon name={syncingId === i.id ? 'Loader2' : 'RefreshCw'} size={10} className={syncingId === i.id ? 'animate-spin' : ''} />Sincronizar</button></td></tr>; })}</tbody>
              </table>
            </div>
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Dependência dos agentes" subtitle="Fontes críticas utilizadas nas decisões assistidas"><div className="space-y-3">{[
              ['Agente de Medição e Desembolso', 'Sistemas internos · Obrasgov · SINAPI', 0.98], ['Agente de Risco Climático', 'CEMADEN · INPE · Living Atlas', 0.84], ['Agente de Inconsistências', 'Gestão documental · GIS · Compras.gov', 0.76], ['Agente de Impacto e MRV', 'SIBEC / dados sociais · sensores · campo', 0.93],
            ].map(([name, sources, readiness]) => <div key={String(name)}><div className="flex justify-between gap-2 text-[11.5px]"><span className="text-neutral-300">{String(name)}</span><span className="text-neutral-500 tnum">{Math.round(Number(readiness) * 100)}% prontidão</span></div><div className="text-[10px] text-neutral-500 mt-0.5">{String(sources)}</div><div className="mt-1.5"><ProgressBar value={Number(readiness)} tone={Number(readiness) > .9 ? 'teal' : Number(readiness) > .8 ? 'blue' : 'amber'} /></div></div>)}</div></Panel>
            <Panel title="Eventos de integração" subtitle="Últimas sincronizações e falhas"><EventFeed events={events.filter((e) => /sincron|dados|fonte|API|integra/i.test(e.text)).slice(-12)} maxHeight={300} /></Panel>
          </div>
        </>
      )}

      {section === 'admin' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Regras ativas" value={String(adminRules.filter((r) => r.enabled).length)} icon="Settings" />
            <KpiCard label="Perfis configurados" value={String(CONTROL_ROLE_MATRIX.length)} icon="Users" />
            <KpiCard label="Alçadas críticas" value="7" icon="ShieldCheck" />
            <KpiCard label="Eventos de auditoria (30d)" value="18.420" icon="FileSearch" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 space-y-4">
              <Panel title="Regras e guardrails" subtitle="Parâmetros operacionais aplicados pelo orquestrador">
                <div className="space-y-2">{adminRules.map((rule) => <div key={rule.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-3 flex items-start gap-3"><button onClick={() => setAdminRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))} className={cls('w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 mt-0.5', rule.enabled ? 'bg-[#0FA39D]' : 'bg-neutral-700')}><span className={cls('block w-4 h-4 rounded-full bg-white transition-transform', rule.enabled && 'translate-x-4')} /></button><div className="flex-1"><div className="flex items-center gap-2"><span className="text-[12px] font-medium text-neutral-200">{rule.name}</span>{rule.critical && <span className="rounded bg-[#D14A55]/15 px-1.5 py-0.5 text-[9px] text-[#E27A82]">CRÍTICA</span>}</div><div className="text-[11px] text-neutral-500 mt-0.5">{rule.description}</div></div><span className="font-mono-id text-[9.5px] text-neutral-600">{rule.id}</span></div>)}</div>
              </Panel>

              <Panel title="Parâmetros de decisão" subtitle="Alterações ficam restritas ao mockup e registradas como demonstração">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    ['Confiança mínima para recomendação', decisionThreshold, setDecisionThreshold, '%'],
                    ['Tolerância espacial para vistoria', spatialTolerance, setSpatialTolerance, 'm'],
                    ['Consumo do SLA para escalonamento', slaEscalation, setSlaEscalation, '%'],
                  ].map(([label, value, setter, unit]) => <div key={String(label)}><div className="flex justify-between text-[11px] mb-2"><span className="text-neutral-400">{String(label)}</span><span className="text-neutral-200 tnum">{Number(value)}{String(unit)}</span></div><input type="range" min={String(unit) === 'm' ? 5 : 50} max={String(unit) === 'm' ? 100 : 100} value={Number(value)} onChange={(e) => (setter as (n: number) => void)(Number(e.target.value))} className="w-full accent-[#1584D1]" /></div>)}
                </div>
                <button onClick={() => onPushEvent('Parâmetros administrativos atualizados no ambiente de demonstração', 'success')} className="mt-4 rounded-md bg-[#1584D1] px-3 py-2 text-[11px] text-white">Salvar parâmetros</button>
              </Panel>
            </div>

            <div className="xl:col-span-5 space-y-4">
              <Panel title="Matriz de perfis e alçadas" subtitle="Controle de acesso por papel">
                <div className="overflow-x-auto nexo-scroll"><table className="w-full text-[10.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="text-left py-2">Perfil</th><th>Ver</th><th>Simular</th><th>Decidir</th><th>Admin.</th></tr></thead><tbody>{CONTROL_ROLE_MATRIX.map((r) => <tr key={r.role} className="border-b border-white/[0.05]"><td className="py-2.5 text-neutral-300 pr-2">{r.role}</td>{(['view','simulate','decide','administer'] as const).map((key) => <td key={key} className="text-center">{r[key] ? <Icon name="CheckCircle2" size={12} className="text-[#0FA39D] inline" /> : <Icon name="Circle" size={11} className="text-neutral-700 inline" />}</td>)}</tr>)}</tbody></table></div>
              </Panel>
              <Panel title="Ambiente e segurança" subtitle="Estado da plataforma">
                <div className="space-y-2 text-[11.5px]">{[
                  ['Ambiente', 'Demonstração / GitHub Pages', 'Info'], ['Autenticação', 'Simulada · SSO corporativo em produção', 'Lock'], ['Mapas', 'Camada sintética · ArcGIS em produção', 'Map'], ['IA generativa', 'Endpoint protegido requerido', 'Bot'], ['Último deploy', '21/07/2026 · 09:42 BRT', 'RefreshCw'], ['Versão', 'CAIXA Nexo 1.4.0-control', 'PackageCheck'],
                ].map(([label, value, icon]) => <div key={String(label)} className="flex items-center justify-between gap-3 rounded-md bg-white/[0.03] px-2.5 py-2"><span className="text-neutral-500 flex items-center gap-1.5"><Icon name={String(icon)} size={12} />{String(label)}</span><span className="text-neutral-300 text-right">{String(value)}</span></div>)}</div>
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
