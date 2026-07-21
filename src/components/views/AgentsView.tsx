import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import type { EventItem } from '@/data/mockData';
import {
  AGENT_DEFINITIONS,
  AGENT_DURATION_BY_TYPE,
  AGENT_INTEGRATIONS,
  AGENT_LIVE_STEPS,
  AGENT_THROUGHPUT,
  INITIAL_AUTHORITY_RULES,
  INITIAL_CASES,
  INITIAL_EXCEPTIONS,
  INITIAL_EXECUTIONS,
  INITIAL_LOGS,
  type AgentCase,
  type AgentExecution,
  type AgentIntegration,
  type AgentLog,
  type AgentPriority,
  type AgentRuntimeStatus,
  type AgentsSection,
  type ExceptionSeverity,
  type LogLevel,
} from '@/data/agentsData';
import { BarProgramChart, DonutChart, SingleBarChart, TimeSeriesChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { KpiCard, Panel, Pill, ProgressBar } from '@/components/shared/Primitives';
import { cls, fmtCompactBRL, nowStr } from '@/lib/tokens';
import type { ProductKey } from '@/data/navConfig';
import { NAV_PRODUCTS } from '@/data/navConfig';

const SECTION_TITLE: Record<AgentsSection, { title: string; subtitle: string }> = {
  cockpit: { title: 'Cockpit', subtitle: 'Operação corporativa dos agentes, gates humanos, eventos e impacto em tempo real' },
  queue: { title: 'Fila de execuções', subtitle: 'Prioridades, progresso, dependências, reprocessamentos e controle operacional' },
  cases: { title: 'Casos', subtitle: 'Orquestrações ponta a ponta agrupadas por ativo, operação e decisão' },
  exceptions: { title: 'Exceções', subtitle: 'Anomalias, falhas, alertas, SLA, responsáveis e planos de resolução' },
  logs: { title: 'Logs', subtitle: 'Telemetria estruturada, correlação, eventos técnicos e trilha auditável' },
  authorities: { title: 'Alçadas', subtitle: 'Autonomia, limites, gates humanos, segregação de funções e governança dos agentes' },
};

const STATUS_META: Record<AgentRuntimeStatus, { label: string; color: string; tone: 'blue' | 'teal' | 'amber' | 'red' | 'cyan' }> = {
  scheduled: { label: 'Agendado', color: '#9AACB8', tone: 'blue' },
  running: { label: 'Em execução', color: '#18B7D6', tone: 'cyan' },
  collecting: { label: 'Coletando', color: '#18B7D6', tone: 'cyan' },
  analyzing: { label: 'Analisando', color: '#1584D1', tone: 'blue' },
  waiting_system: { label: 'Aguardando sistema', color: '#9AACB8', tone: 'blue' },
  waiting_human: { label: 'Aguardando humano', color: '#7C5CBF', tone: 'blue' },
  completed: { label: 'Concluído', color: '#0FA39D', tone: 'teal' },
  completed_alert: { label: 'Concluído com alerta', color: '#E5A11A', tone: 'amber' },
  failed: { label: 'Falhou', color: '#D14A55', tone: 'red' },
  canceled: { label: 'Cancelado', color: '#9AACB8', tone: 'blue' },
};

const PRIORITY_META: Record<AgentPriority, { color: string; label: string }> = {
  P0: { color: '#D14A55', label: 'Crítica' }, P1: { color: '#E5A11A', label: 'Alta' }, P2: { color: '#1584D1', label: 'Média' }, P3: { color: '#9AACB8', label: 'Baixa' },
};

const SEVERITY_META: Record<ExceptionSeverity, { label: string; color: string }> = {
  critical: { label: 'Crítica', color: '#D14A55' }, high: { label: 'Alta', color: '#E5A11A' }, medium: { label: 'Média', color: '#1584D1' }, low: { label: 'Baixa', color: '#9AACB8' },
};

const LOG_META: Record<LogLevel, { color: string; label: string; icon: string }> = {
  debug: { color: '#9AACB8', label: 'DEBUG', icon: 'Terminal' }, info: { color: '#1584D1', label: 'INFO', icon: 'Info' }, success: { color: '#0FA39D', label: 'SUCCESS', icon: 'CheckCircle2' }, warning: { color: '#E5A11A', label: 'WARN', icon: 'AlertTriangle' }, error: { color: '#D14A55', label: 'ERROR', icon: 'AlertOctagon' }, decision: { color: '#7C5CBF', label: 'GATE', icon: 'User' },
};

const INTEGRATION_META: Record<AgentIntegration['status'], { label: string; color: string }> = {
  operational: { label: 'Operacional', color: '#0FA39D' }, attention: { label: 'Atenção', color: '#E5A11A' }, error: { label: 'Falha', color: '#D14A55' },
};

function productMeta(product: ProductKey) {
  return NAV_PRODUCTS.find((item) => item.key === product) ?? { name: product, iconKey: 'LayoutGrid', color: '#9AACB8' };
}

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(';'), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(';'))].join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: AgentRuntimeStatus }) {
  const meta = STATUS_META[status];
  const pulsing = ['running', 'collecting', 'analyzing'].includes(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}14` }}>
      <span className="relative flex h-1.5 w-1.5">
        {pulsing && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: meta.color }} />}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      </span>
      {meta.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: AgentPriority }) {
  const meta = PRIORITY_META[priority];
  return <span className="rounded-md border px-1.5 py-0.5 text-[9.5px] font-semibold" style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}12` }}>{priority}</span>;
}

function SectionHeader({ section, liveRunning, onToggleLive, onNavigateProduct }: { section: AgentsSection; liveRunning: boolean; onToggleLive: () => void; onNavigateProduct: (p: ProductKey) => void }) {
  const meta = SECTION_TITLE[section];
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div><h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Agents · {meta.title}</h1><p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onNavigateProduct('data')} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300"><Icon name="Database" size={12} className="inline mr-1.5" />Nexo Data</button>
        <button onClick={() => onNavigateProduct('control')} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300"><Icon name="Gauge" size={12} className="inline mr-1.5" />Nexo Control</button>
        <button onClick={onToggleLive} className={cls('rounded-lg border px-3 py-2 text-[11px] font-medium', liveRunning ? 'border-[#E5A11A]/40 bg-[#E5A11A]/10 text-[#F2C15A]' : 'border-[#18B7D6]/35 bg-[#18B7D6]/10 text-[#6FD8EC]')}>
          <Icon name={liveRunning ? 'Pause' : 'Play'} size={12} className="inline mr-1.5" />{liveRunning ? 'Pausar ciclo ao vivo' : 'Executar ciclo ao vivo'}
        </button>
      </div>
    </div>
  );
}

function ExecutionCard({ execution, selected, onSelect }: { execution: AgentExecution; selected?: boolean; onSelect: () => void }) {
  const agent = AGENT_DEFINITIONS.find((item) => item.id === execution.agentId);
  const module = productMeta(execution.module);
  return (
    <button onClick={onSelect} className={cls('w-full text-left rounded-xl border p-3.5 transition-all', selected ? 'border-[#18B7D6]/55 bg-[#18B7D6]/8' : 'border-white/10 bg-[#0E2A40]/55 hover:border-white/20')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="flex items-center gap-2"><PriorityBadge priority={execution.priority} /><span className="font-mono text-[9.5px] text-neutral-600">{execution.id}</span></div><div className="mt-1.5 text-[12px] font-semibold text-neutral-100 truncate">{agent?.name}</div><div className="text-[10.5px] text-neutral-500 truncate mt-0.5">{execution.entity}</div></div>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${module.color}1c` }}><Icon name={module.iconKey} size={13} style={{ color: module.color }} /></span>
      </div>
      <div className="mt-3"><div className="flex justify-between items-center mb-1.5"><StatusBadge status={execution.status} /><span className="text-[10px] text-neutral-500 tnum">{execution.progress}%</span></div><ProgressBar value={execution.progress / 100} tone={STATUS_META[execution.status].tone} height={5} /></div>
      <div className="mt-2 text-[10.5px] text-neutral-300 line-clamp-2 min-h-[30px]">{execution.currentStep}</div>
      <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between text-[9.5px] text-neutral-600"><span>{execution.duration}</span><span>{execution.confidence == null ? 'confiança pendente' : `${Math.round(execution.confidence * 100)}% confiança`}</span></div>
    </button>
  );
}

function ExecutionDetail({ execution, onRun, onCancel, onNavigateProduct, onOpenAsset, cases }: { execution: AgentExecution; onRun: () => void; onCancel: () => void; onNavigateProduct: (p: ProductKey) => void; onOpenAsset: (id: string) => void; cases: AgentCase[] }) {
  const agent = AGENT_DEFINITIONS.find((item) => item.id === execution.agentId);
  const relatedCase = cases.find((item) => item.id === execution.caseId);
  const module = productMeta(execution.module);
  return (
    <Panel title={<span className="flex items-center gap-2"><Icon name="Bot" size={14} className="text-[#18B7D6]" />{agent?.name}</span>} subtitle={`${execution.id} · ${execution.correlationId}`} actions={<StatusBadge status={execution.status} />}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-[10.5px]"><div><div className="text-neutral-600">Entidade</div><div className="text-neutral-200 mt-0.5">{execution.entity}</div></div><div><div className="text-neutral-600">Caso</div><div className="text-neutral-200 mt-0.5">{relatedCase?.title ?? execution.caseId}</div></div><div><div className="text-neutral-600">Impacto estimado</div><div className="text-neutral-200 mt-0.5">{execution.estimatedImpact}</div></div><div><div className="text-neutral-600">Responsável humano</div><div className="text-neutral-200 mt-0.5">{execution.humanOwner}</div></div></div>
        <div><div className="flex justify-between text-[10px] text-neutral-500 mb-1"><span>Progresso da execução</span><span>{execution.progress}%</span></div><ProgressBar value={execution.progress / 100} tone={STATUS_META[execution.status].tone} height={6} /></div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Linha de execução</div>
          <div className="space-y-0">
            {execution.steps.map((step, index) => {
              const color = step.status === 'done' ? '#0FA39D' : step.status === 'active' ? '#18B7D6' : step.status === 'alert' ? '#E5A11A' : '#394B59';
              return <div key={`${step.label}-${index}`} className="relative pl-6 pb-3 last:pb-0">{index < execution.steps.length - 1 && <span className="absolute left-[7px] top-3 bottom-0 w-px bg-white/10" />}<span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: color, background: `${color}20` }}><span className="w-1 h-1 rounded-full" style={{ background: color }} /></span><div className="flex justify-between gap-2"><span className="text-[10.5px] font-medium text-neutral-200">{step.label}</span><span className="text-[9px] text-neutral-600 tnum">{step.timestamp}</span></div><div className="text-[9.5px] text-neutral-500 mt-0.5">{step.detail}</div></div>;
            })}
          </div>
        </div>
        <div className="rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 p-3"><div className="text-[9.5px] uppercase tracking-wider text-neutral-500">Recomendação</div><div className="text-[11px] text-neutral-200 mt-1 leading-relaxed">{execution.recommendation}</div></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onRun} className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/10 px-3 py-2 text-[10.5px] text-[#6FD8EC]"><Icon name={execution.status === 'failed' ? 'RefreshCw' : 'Play'} size={11} className="inline mr-1.5" />{execution.status === 'failed' ? 'Reprocessar' : 'Executar / continuar'}</button>
          <button onClick={onCancel} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[10.5px] text-neutral-300"><Icon name="X" size={11} className="inline mr-1.5" />Cancelar</button>
          <button onClick={() => onNavigateProduct(execution.module)} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[10.5px] text-neutral-300"><Icon name={module.iconKey} size={11} className="inline mr-1.5" />Abrir {module.name}</button>
          {relatedCase?.assetId && <button onClick={() => onOpenAsset(relatedCase.assetId!)} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[10.5px] text-neutral-300"><Icon name="Building2" size={11} className="inline mr-1.5" />Ativo 360</button>}
        </div>
      </div>
    </Panel>
  );
}

export function AgentsView({
  section,
  onSectionChange,
  onOpenAsset,
  onNavigateProduct,
  events,
  onPushEvent,
}: {
  section: AgentsSection;
  onSectionChange: (section: AgentsSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}) {
  const [executions, setExecutions] = useState(INITIAL_EXECUTIONS);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [exceptions, setExceptions] = useState(INITIAL_EXCEPTIONS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [authorityRules, setAuthorityRules] = useState(INITIAL_AUTHORITY_RULES);
  const [definitions, setDefinitions] = useState(AGENT_DEFINITIONS);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [selectedExecutionId, setSelectedExecutionId] = useState(INITIAL_EXECUTIONS[0].id);
  const [selectedCaseId, setSelectedCaseId] = useState(INITIAL_CASES[0].id);
  const [selectedExceptionId, setSelectedExceptionId] = useState(INITIAL_EXCEPTIONS[0].id);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueStatus, setQueueStatus] = useState('todos');
  const [queuePriority, setQueuePriority] = useState('todas');
  const [caseStatus, setCaseStatus] = useState('todos');
  const [exceptionSeverity, setExceptionSeverity] = useState('todas');
  const [logSearch, setLogSearch] = useState('');
  const [logLevel, setLogLevel] = useState('todos');
  const [logAgent, setLogAgent] = useState('todos');
  const [logStreaming, setLogStreaming] = useState(true);
  const [authorityActionId, setAuthorityActionId] = useState(INITIAL_AUTHORITY_RULES[3].id);
  const [simAmount, setSimAmount] = useState(15_700_000);
  const [simConfidence, setSimConfidence] = useState(0.91);

  const selectedExecution = executions.find((item) => item.id === selectedExecutionId) ?? executions[0];
  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const selectedException = exceptions.find((item) => item.id === selectedExceptionId) ?? exceptions[0];
  const selectedRule = authorityRules.find((item) => item.id === authorityActionId) ?? authorityRules[0];

  const activeExecutions = executions.filter((item) => ['running', 'collecting', 'analyzing'].includes(item.status)).length;
  const waitingHuman = executions.filter((item) => item.status === 'waiting_human').length;
  const failures = executions.filter((item) => item.status === 'failed').length;
  const openExceptions = exceptions.filter((item) => item.status !== 'resolved').length;
  const avgConfidence = executions.filter((item) => item.confidence != null).reduce((sum, item) => sum + (item.confidence ?? 0), 0) / executions.filter((item) => item.confidence != null).length;
  const automatedRate = definitions.filter((item) => item.autonomy === 'automatizado').length / definitions.length;

  const statusDonut = useMemo(() => {
    const groups: Array<{ status: AgentRuntimeStatus; name: string; fill: string }> = [
      { status: 'running', name: 'Em execução', fill: '#18B7D6' }, { status: 'waiting_human', name: 'Gate humano', fill: '#7C5CBF' },
      { status: 'completed', name: 'Concluído', fill: '#0FA39D' }, { status: 'completed_alert', name: 'Com alerta', fill: '#E5A11A' },
      { status: 'failed', name: 'Falhou', fill: '#D14A55' }, { status: 'scheduled', name: 'Agendado', fill: '#9AACB8' },
    ];
    return groups.map((group) => ({ name: group.name, value: executions.filter((item) => item.status === group.status || (group.status === 'running' && ['collecting', 'analyzing'].includes(item.status))).length, fill: group.fill })).filter((item) => item.value > 0);
  }, [executions]);

  const moduleVolume = useMemo(() => NAV_PRODUCTS.filter((product) => product.key !== 'agents' && product.key !== 'data').map((product) => ({ modulo: product.name.replace('Nexo ', ''), execucoes: executions.filter((item) => item.module === product.key).length })).filter((item) => item.execucoes > 0), [executions]);

  const filteredExecutions = useMemo(() => executions.filter((execution) => {
    const agent = definitions.find((item) => item.id === execution.agentId);
    const query = queueSearch.toLowerCase();
    return (!query || `${execution.id} ${execution.entity} ${execution.correlationId} ${agent?.name ?? ''}`.toLowerCase().includes(query))
      && (queueStatus === 'todos' || execution.status === queueStatus)
      && (queuePriority === 'todas' || execution.priority === queuePriority);
  }), [definitions, executions, queuePriority, queueSearch, queueStatus]);

  const filteredCases = useMemo(() => cases.filter((item) => caseStatus === 'todos' || item.status === caseStatus), [caseStatus, cases]);
  const filteredExceptions = useMemo(() => exceptions.filter((item) => exceptionSeverity === 'todas' || item.severity === exceptionSeverity), [exceptionSeverity, exceptions]);
  const filteredLogs = useMemo(() => logs.filter((log) => {
    const query = logSearch.toLowerCase();
    return (!query || `${log.message} ${log.event} ${log.correlationId} ${log.executionId}`.toLowerCase().includes(query))
      && (logLevel === 'todos' || log.level === logLevel)
      && (logAgent === 'todos' || log.agentId === logAgent);
  }), [logAgent, logLevel, logSearch, logs]);

  useEffect(() => {
    if (!liveRunning) return;
    if (liveStep >= AGENT_LIVE_STEPS.length) {
      setLiveRunning(false);
      setExecutions((prev) => prev.map((execution) => execution.id === 'EXE-240721-001' || execution.id === 'EXE-240721-004' || execution.id === 'EXE-240721-012'
        ? { ...execution, status: 'waiting_human', progress: 100, currentStep: 'Gate humano preparado', awaiting: 'Decisão da Gerência de Operações' }
        : execution.id === 'EXE-240721-003' ? { ...execution, status: 'completed', progress: 100, currentStep: 'Laudo preliminar concluído', confidence: 0.93 } : execution));
      setCases((prev) => prev.map((item) => item.id === 'CAS-001' ? { ...item, status: 'waiting', orchestration: 100, outcome: 'Vistoria concluída; R$ 15,7 mi recomendados para liberação parcial.', nextDecision: 'Gate humano pronto para aprovação.' } : item));
      return;
    }
    const timer = window.setTimeout(() => {
      const step = AGENT_LIVE_STEPS[liveStep];
      const execution = executions.find((item) => item.id === step.executionId);
      const timestamp = `${nowStr()}.${String(100 + liveStep * 73).padStart(3, '0')}`;
      const newLog: AgentLog = { id: `LOG-LIVE-${liveStep + 1}`, timestamp, level: step.level, agentId: step.agentId, executionId: step.executionId, correlationId: execution?.correlationId ?? 'corr-live', event: step.event, message: step.text, durationMs: 140 + liveStep * 92 };
      setLogs((prev) => [newLog, ...prev]);
      onPushEvent(step.text, step.level === 'warning' ? 'warning' : step.level === 'decision' ? 'agent' : step.level === 'success' ? 'success' : 'info');
      setExecutions((prev) => prev.map((item) => item.id === step.executionId ? { ...item, status: step.level === 'decision' ? 'waiting_human' : 'running', progress: Math.min(100, Math.max(item.progress, 70 + liveStep * 6)), currentStep: step.text, confidence: item.confidence ?? 0.90 } : item));
      if (liveStep === 2) setExceptions((prev) => prev.map((item) => item.id === 'EXC-001' ? { ...item, description: 'T-14 e T-22 confirmados em campo; T-17 dentro da tolerância.', status: 'assigned' } : item));
      setLiveStep((current) => current + 1);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [executions, liveRunning, liveStep, onPushEvent]);

  useEffect(() => {
    if (!logStreaming || liveRunning) return;
    const timer = window.setInterval(() => {
      const tick = Date.now();
      const value = 7.1 + ((tick / 1000) % 7) * 0.04;
      const log: AgentLog = { id: `LOG-STREAM-${tick}`, timestamp: `${nowStr()}.${String(tick % 1000).padStart(3, '0')}`, level: 'debug', agentId: 'asset_health', executionId: 'EXE-240721-006', correlationId: 'corr-cecb-wtg14', event: 'telemetry.received', message: `Leitura WTG-14 recebida: vibração ${value.toFixed(2)} mm/s; temperatura 71,4 °C.`, durationMs: 24 };
      setLogs((prev) => [log, ...prev].slice(0, 120));
    }, 2600);
    return () => window.clearInterval(timer);
  }, [liveRunning, logStreaming]);

  function toggleLive() {
    if (!liveRunning && liveStep >= AGENT_LIVE_STEPS.length) {
      setLiveStep(0);
      setExecutions(INITIAL_EXECUTIONS);
      setCases(INITIAL_CASES);
    }
    setLiveRunning((value) => !value);
  }

  function runExecution(id: string) {
    const target = executions.find((item) => item.id === id);
    if (!target) return;
    setExecutions((prev) => prev.map((item) => item.id === id ? { ...item, status: 'running', progress: Math.max(8, Math.min(item.progress, 88)), currentStep: item.status === 'failed' ? 'Reprocessamento iniciado com fallback de integração' : 'Execução retomada pelo operador' } : item));
    const log: AgentLog = { id: `LOG-MANUAL-${Date.now()}`, timestamp: `${nowStr()}.001`, level: 'info', agentId: target.agentId, executionId: target.id, correlationId: target.correlationId, event: 'execution.manual.start', message: `Execução ${target.id} iniciada manualmente.` };
    setLogs((prev) => [log, ...prev]);
    onPushEvent(`${target.id} iniciado manualmente — ${target.entity}`, 'agent');
  }

  function cancelExecution(id: string) {
    const target = executions.find((item) => item.id === id);
    if (!target) return;
    setExecutions((prev) => prev.map((item) => item.id === id ? { ...item, status: 'canceled', currentStep: 'Cancelado pelo operador', awaiting: 'Nenhuma' } : item));
    setLogs((prev) => [{ id: `LOG-CANCEL-${Date.now()}`, timestamp: `${nowStr()}.001`, level: 'decision', agentId: target.agentId, executionId: target.id, correlationId: target.correlationId, event: 'execution.canceled', message: `Execução ${target.id} cancelada pelo operador.` }, ...prev]);
    onPushEvent(`${target.id} cancelado pelo operador`, 'warning');
  }

  function resolveException(id: string) {
    setExceptions((prev) => prev.map((item) => item.id === id ? { ...item, status: 'resolved', sla: 'Concluída' } : item));
    const exception = exceptions.find((item) => item.id === id);
    onPushEvent(`Exceção ${id} resolvida — ${exception?.title ?? ''}`, 'success');
  }

  function escalateException(id: string) {
    setExceptions((prev) => prev.map((item) => item.id === id ? { ...item, severity: item.severity === 'critical' ? 'critical' : 'critical', status: 'assigned', owner: 'Comitê de Exceções' } : item));
    onPushEvent(`Exceção ${id} escalada ao Comitê de Exceções`, 'warning');
  }

  function toggleRule(id: string) {
    setAuthorityRules((prev) => prev.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  }

  function toggleDefinition(id: string) {
    setDefinitions((prev) => prev.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  }

  const simulation = useMemo(() => {
    const withinAmount = selectedRule.maxAutomaticAmount === 0 ? simAmount === 0 : simAmount <= selectedRule.maxAutomaticAmount;
    const enoughConfidence = simConfidence >= selectedRule.minConfidence;
    if (!selectedRule.enabled) return { result: 'Bloqueado', color: '#D14A55', detail: 'A regra está desativada.' };
    if (selectedRule.mandatoryHuman) return { result: selectedRule.twoPersonRule ? 'Dupla aprovação humana' : 'Gate humano obrigatório', color: '#7C5CBF', detail: `Encaminhar para ${selectedRule.requiredRole}; o agente pode preparar a decisão, mas não executá-la.` };
    if (!withinAmount || !enoughConfidence) return { result: 'Escalonamento humano', color: '#E5A11A', detail: !withinAmount ? 'Valor acima da autonomia configurada.' : 'Confiança abaixo do limiar mínimo.' };
    return { result: 'Automação permitida', color: '#0FA39D', detail: 'Ação pode ser executada e registrada automaticamente.' };
  }, [selectedRule, simAmount, simConfidence]);

  return (
    <div className="p-5 space-y-4 max-w-[1650px] mx-auto nexo-fade-in">
      <SectionHeader section={section} liveRunning={liveRunning} onToggleLive={toggleLive} onNavigateProduct={onNavigateProduct} />

      {section === 'cockpit' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <KpiCard label="Agentes ativos" value={String(activeExecutions)} delta="+2 na última hora" icon="Activity" />
            <KpiCard label="Execuções 24h" value="1.284" delta="+11,8%" icon="Bot" />
            <KpiCard label="Gates humanos" value={String(waitingHuman)} delta="2 P0/P1" deltaTone="amber" icon="User" />
            <KpiCard label="Exceções abertas" value={String(openExceptions)} delta="1 crítica" deltaTone="red" icon="AlertOctagon" />
            <KpiCard label="Confiança média" value={`${Math.round(avgConfidence * 100)}%`} delta="+2,1 p.p." icon="Target" />
            <KpiCard label="Taxa automatizada" value={`${Math.round(automatedRate * 100)}%`} hint={`${failures} falha técnica`} icon="Zap" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4">
            <Panel title="Execuções corporativas" subtitle="Estado atual por agente e produto" actions={<button onClick={() => onSectionChange('queue')} className="text-[10.5px] text-[#6FD8EC]">Abrir fila <Icon name="ArrowRight" size={10} className="inline" /></button>}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {executions.slice(0, 6).map((execution) => <ExecutionCard key={execution.id} execution={execution} selected={execution.id === selectedExecutionId} onSelect={() => setSelectedExecutionId(execution.id)} />)}
              </div>
            </Panel>
            <ExecutionDetail execution={selectedExecution} onRun={() => runExecution(selectedExecution.id)} onCancel={() => cancelExecution(selectedExecution.id)} onNavigateProduct={onNavigateProduct} onOpenAsset={onOpenAsset} cases={cases} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel title="Estado das execuções" subtitle="Distribuição da fila atual"><DonutChart data={statusDonut} /></Panel>
            <Panel title="Throughput operacional" subtitle="Execuções iniciadas e concluídas por hora"><TimeSeriesChart data={AGENT_THROUGHPUT} xKey="hora" aKey="iniciadas" bKey="concluidas" aLabel="Iniciadas" bLabel="Concluídas" /></Panel>
            <Panel title="Volume por módulo" subtitle="Execuções ativas e recentes"><SingleBarChart data={moduleVolume} xKey="modulo" yKey="execucoes" color="#18B7D6" /></Panel>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-4">
            <Panel title="Casos críticos e decisões" subtitle="Orquestrações que requerem atenção">
              <div className="space-y-2">
                {cases.filter((item) => item.priority === 'P0' || item.priority === 'P1').slice(0, 5).map((item) => {
                  const module = productMeta(item.module);
                  return <button key={item.id} onClick={() => { setSelectedCaseId(item.id); onSectionChange('cases'); }} className="w-full rounded-lg border border-white/9 bg-white/[0.025] p-3 text-left hover:border-white/18"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><PriorityBadge priority={item.priority} /><span className="text-[10.5px] font-semibold text-neutral-200 truncate">{item.title}</span></div><div className="text-[9.5px] text-neutral-500 mt-1 truncate">{item.nextDecision}</div></div><span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${module.color}18` }}><Icon name={module.iconKey} size={12} style={{ color: module.color }} /></span></div></button>;
                })}
              </div>
            </Panel>
            <Panel title="Barramento de eventos" subtitle="Eventos de negócio, agentes e decisões em tempo real"><EventFeed events={events.slice(-12)} maxHeight={310} /></Panel>
          </div>

          <Panel title="Integração com os produtos Nexo" subtitle="Objetos, direção, latência e volume de eventos">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {AGENT_INTEGRATIONS.map((integration) => {
                const product = productMeta(integration.product);
                const meta = INTEGRATION_META[integration.status];
                return <button key={integration.product} onClick={() => onNavigateProduct(integration.product)} className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-left hover:border-white/20"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${product.color}18` }}><Icon name={product.iconKey} size={12} style={{ color: product.color }} /></span><div><div className="text-[11px] font-semibold text-neutral-200">{product.name}</div><div className="text-[9px] text-neutral-600">{integration.direction}</div></div></div><span className="text-[9px]" style={{ color: meta.color }}>{meta.label}</span></div><div className="mt-2 text-[9.5px] text-neutral-500 line-clamp-2">{integration.object}</div><div className="mt-2 flex justify-between text-[9px] text-neutral-600"><span>{integration.latency}</span><span>{integration.events24h.toLocaleString('pt-BR')} eventos/24h</span></div></button>;
              })}
            </div>
          </Panel>
        </>
      )}

      {section === 'queue' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard label="Na fila" value={String(executions.filter((item) => !['completed', 'completed_alert', 'canceled'].includes(item.status)).length)} icon="ListOrdered" />
            <KpiCard label="Em execução" value={String(activeExecutions)} icon="Activity" />
            <KpiCard label="Aguardando sistema" value={String(executions.filter((item) => item.status === 'waiting_system').length)} icon="Plug" />
            <KpiCard label="Aguardando humano" value={String(waitingHuman)} icon="User" />
            <KpiCard label="Falhas" value={String(failures)} deltaTone="red" icon="AlertOctagon" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[240px]"><Icon name="Search" size={13} className="absolute left-3 top-2.5 text-neutral-600" /><input value={queueSearch} onChange={(event) => setQueueSearch(event.target.value)} placeholder="Buscar execução, entidade, agente ou correlação" className="w-full rounded-lg border border-white/10 bg-[#0B2235] py-2 pl-9 pr-3 text-[11px] text-neutral-200 outline-none focus:border-[#18B7D6]/40" /></div>
            <select value={queueStatus} onChange={(event) => setQueueStatus(event.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os status</option>{Object.entries(STATUS_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
            <select value={queuePriority} onChange={(event) => setQueuePriority(event.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todas">Todas as prioridades</option>{Object.keys(PRIORITY_META).map((key) => <option key={key} value={key}>{key}</option>)}</select>
            <button onClick={() => downloadCsv('nexo-agents-execucoes.csv', filteredExecutions.map((item) => ({ id: item.id, agente: item.agentId, entidade: item.entity, modulo: item.module, status: item.status, prioridade: item.priority, progresso: item.progress, correlacao: item.correlationId })))} className="rounded-lg border border-white/12 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Download" size={11} className="inline mr-1.5" />Exportar</button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.85fr] gap-4">
            <Panel title="Fila corporativa" subtitle={`${filteredExecutions.length} execuções encontradas`} dense>
              <div className="overflow-x-auto nexo-scroll">
                <table className="w-full text-left min-w-[900px]"><thead><tr className="border-b border-white/10 text-[9.5px] uppercase tracking-wider text-neutral-600"><th className="py-2 px-2">Prioridade</th><th className="py-2 px-2">Execução / agente</th><th className="py-2 px-2">Entidade</th><th className="py-2 px-2">Status</th><th className="py-2 px-2">Progresso</th><th className="py-2 px-2">Duração</th><th className="py-2 px-2">Aguardando</th></tr></thead><tbody>
                  {filteredExecutions.map((execution) => { const agent = definitions.find((item) => item.id === execution.agentId); return <tr key={execution.id} onClick={() => setSelectedExecutionId(execution.id)} className={cls('border-b border-white/6 text-[10.5px] cursor-pointer hover:bg-white/[0.025]', selectedExecutionId === execution.id && 'bg-[#18B7D6]/6')}><td className="py-2.5 px-2"><PriorityBadge priority={execution.priority} /></td><td className="py-2.5 px-2"><div className="font-mono text-[9px] text-neutral-600">{execution.id}</div><div className="text-neutral-200 mt-0.5">{agent?.shortName}</div></td><td className="py-2.5 px-2 text-neutral-300 max-w-[230px] truncate">{execution.entity}</td><td className="py-2.5 px-2"><StatusBadge status={execution.status} /></td><td className="py-2.5 px-2 w-[130px]"><div className="flex items-center gap-2"><ProgressBar value={execution.progress / 100} tone={STATUS_META[execution.status].tone} height={4} /><span className="text-[9px] text-neutral-600">{execution.progress}%</span></div></td><td className="py-2.5 px-2 text-neutral-500 tnum">{execution.duration}</td><td className="py-2.5 px-2 text-neutral-500 max-w-[180px] truncate">{execution.awaiting}</td></tr>; })}
                </tbody></table>
              </div>
            </Panel>
            <ExecutionDetail execution={selectedExecution} onRun={() => runExecution(selectedExecution.id)} onCancel={() => cancelExecution(selectedExecution.id)} onNavigateProduct={onNavigateProduct} onOpenAsset={onOpenAsset} cases={cases} />
          </div>
        </>
      )}

      {section === 'cases' && (
        <>
          <div className="flex flex-wrap gap-2"><select value={caseStatus} onChange={(event) => setCaseStatus(event.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os casos</option><option value="active">Ativos</option><option value="waiting">Aguardando decisão</option><option value="critical">Críticos</option><option value="resolved">Resolvidos</option></select><span className="text-[10.5px] text-neutral-600 self-center">{filteredCases.length} casos · {fmtCompactBRL(filteredCases.reduce((sum, item) => sum + item.value, 0))} relacionados</span></div>
          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.5fr] gap-4">
            <Panel title="Casos orquestrados" subtitle="Selecione um caso para acompanhar agentes e decisões" dense>
              <div className="space-y-2 max-h-[660px] overflow-y-auto nexo-scroll pr-1">
                {filteredCases.map((item) => { const module = productMeta(item.module); return <button key={item.id} onClick={() => setSelectedCaseId(item.id)} className={cls('w-full text-left rounded-xl border p-3 transition-all', selectedCaseId === item.id ? 'border-[#18B7D6]/50 bg-[#18B7D6]/7' : 'border-white/10 bg-white/[0.02] hover:border-white/20')}><div className="flex justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><PriorityBadge priority={item.priority} /><span className="font-mono text-[9px] text-neutral-600">{item.id}</span></div><div className="text-[11px] font-semibold text-neutral-200 mt-1.5 truncate">{item.title}</div><div className="text-[9.5px] text-neutral-500 mt-0.5 line-clamp-2">{item.subtitle}</div></div><span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${module.color}18` }}><Icon name={module.iconKey} size={13} style={{ color: module.color }} /></span></div><div className="mt-3"><div className="flex justify-between text-[9px] text-neutral-600 mb-1"><span>Orquestração</span><span>{item.orchestration}%</span></div><ProgressBar value={item.orchestration / 100} tone={item.status === 'critical' ? 'red' : item.status === 'resolved' ? 'teal' : 'cyan'} height={4} /></div><div className="mt-2 flex justify-between text-[9px] text-neutral-600"><span>{item.agentIds.length} agentes</span><span>{fmtCompactBRL(item.value)}</span></div></button>; })}
              </div>
            </Panel>
            <div className="space-y-4">
              <Panel title={selectedCase.title} subtitle={`${selectedCase.id} · ${selectedCase.subtitle}`} actions={<PriorityBadge priority={selectedCase.priority} />}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[10.5px]"><div><div className="text-neutral-600">Valor relacionado</div><div className="text-neutral-200 mt-1 font-semibold">{fmtCompactBRL(selectedCase.value)}</div></div><div><div className="text-neutral-600">Responsável</div><div className="text-neutral-200 mt-1">{selectedCase.owner}</div></div><div><div className="text-neutral-600">Iniciado</div><div className="text-neutral-200 mt-1 tnum">{selectedCase.startedAt}</div></div><div><div className="text-neutral-600">Próxima decisão</div><div className="text-neutral-200 mt-1">{selectedCase.nextDecision}</div></div></div>
                <div className="mt-4 rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="text-[9px] uppercase tracking-wider text-neutral-600">Resultado consolidado</div><div className="text-[11px] text-neutral-200 mt-1">{selectedCase.outcome}</div></div>
                <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto nexo-scroll pb-2">
                  {selectedCase.agentIds.map((agentId, index) => { const definition = definitions.find((item) => item.id === agentId); const execution = executions.find((item) => item.caseId === selectedCase.id && item.agentId === agentId); const color = execution ? STATUS_META[execution.status].color : '#9AACB8'; return <div key={agentId} className="flex items-center shrink-0"><button onClick={() => { if (execution) { setSelectedExecutionId(execution.id); onSectionChange('queue'); } }} className="w-[160px] rounded-xl border p-3 text-left" style={{ borderColor: `${color}35`, background: `${color}0c` }}><div className="flex items-center gap-2"><Icon name="Bot" size={12} style={{ color }} /><span className="text-[10px] font-semibold text-neutral-200 truncate">{definition?.shortName}</span></div><div className="mt-2 text-[9px] text-neutral-500 line-clamp-2">{execution?.currentStep ?? 'Agente disponível para acionamento'}</div><div className="mt-2"><ProgressBar value={(execution?.progress ?? 0) / 100} tone={execution ? STATUS_META[execution.status].tone : 'blue'} height={3} /></div></button>{index < selectedCase.agentIds.length - 1 && <Icon name="ArrowRight" size={13} className="mx-2 text-neutral-700" />}</div>; })}
                </div>
                <div className="mt-2 flex flex-wrap gap-2"><button onClick={() => onNavigateProduct(selectedCase.module)} className="rounded-lg border border-white/12 px-3 py-2 text-[10.5px] text-neutral-300"><Icon name={productMeta(selectedCase.module).iconKey} size={11} className="inline mr-1.5" />Abrir módulo responsável</button>{selectedCase.assetId && <button onClick={() => onOpenAsset(selectedCase.assetId!)} className="rounded-lg border border-white/12 px-3 py-2 text-[10.5px] text-neutral-300"><Icon name="Building2" size={11} className="inline mr-1.5" />Abrir Ativo 360</button>}<button onClick={() => { setLiveRunning(true); setLiveStep(0); }} className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/9 px-3 py-2 text-[10.5px] text-[#6FD8EC]"><Icon name="Play" size={11} className="inline mr-1.5" />Executar orquestração</button></div>
              </Panel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Exceções do caso" subtitle="Alertas e impedimentos associados"><div className="space-y-2">{exceptions.filter((item) => item.caseId === selectedCase.id).map((item) => <button key={item.id} onClick={() => { setSelectedExceptionId(item.id); onSectionChange('exceptions'); }} className="w-full rounded-lg border border-white/9 bg-white/[0.02] p-2.5 text-left"><div className="flex justify-between gap-2"><span className="text-[10.5px] text-neutral-200">{item.title}</span><span className="text-[9px]" style={{ color: SEVERITY_META[item.severity].color }}>{SEVERITY_META[item.severity].label}</span></div><div className="text-[9px] text-neutral-600 mt-1">{item.impact} · SLA {item.sla}</div></button>)}{!exceptions.some((item) => item.caseId === selectedCase.id) && <div className="text-[10.5px] text-neutral-600">Nenhuma exceção aberta.</div>}</div></Panel><Panel title="Execuções do caso" subtitle="Tempo, confiança e impacto"><div className="space-y-2">{executions.filter((item) => item.caseId === selectedCase.id).map((item) => <button key={item.id} onClick={() => { setSelectedExecutionId(item.id); onSectionChange('queue'); }} className="w-full flex items-center justify-between gap-3 rounded-lg border border-white/9 bg-white/[0.02] p-2.5 text-left"><div className="min-w-0"><div className="text-[10px] text-neutral-200 truncate">{definitions.find((agent) => agent.id === item.agentId)?.shortName}</div><div className="text-[9px] text-neutral-600 mt-0.5">{item.duration} · {item.estimatedImpact}</div></div><StatusBadge status={item.status} /></button>)}</div></Panel></div>
            </div>
          </div>
        </>
      )}

      {section === 'exceptions' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><KpiCard label="Abertas" value={String(openExceptions)} icon="AlertOctagon" /><KpiCard label="Críticas" value={String(exceptions.filter((item) => item.severity === 'critical' && item.status !== 'resolved').length)} deltaTone="red" icon="AlertTriangle" /><KpiCard label="Valor exposto" value="R$ 490 mi" icon="DollarSign" /><KpiCard label="SLA atendido" value="93,8%" delta="+1,4 p.p." icon="Clock" /></div>
          <div className="flex gap-2"><select value={exceptionSeverity} onChange={(event) => setExceptionSeverity(event.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todas">Todas as severidades</option>{Object.entries(SEVERITY_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select><button onClick={() => downloadCsv('nexo-agents-excecoes.csv', filteredExceptions.map((item) => ({ id: item.id, severidade: item.severity, tipo: item.type, titulo: item.title, impacto: item.impact, status: item.status, responsavel: item.owner })))} className="rounded-lg border border-white/12 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Download" size={11} className="inline mr-1.5" />Exportar</button></div>
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
            <Panel title="Central de exceções" subtitle={`${filteredExceptions.length} ocorrências`} dense><div className="space-y-2 max-h-[650px] overflow-y-auto nexo-scroll pr-1">{filteredExceptions.map((item) => { const meta = SEVERITY_META[item.severity]; return <button key={item.id} onClick={() => setSelectedExceptionId(item.id)} className={cls('w-full rounded-xl border p-3 text-left', selectedExceptionId === item.id ? 'border-[#E5A11A]/50 bg-[#E5A11A]/6' : 'border-white/10 bg-white/[0.02] hover:border-white/20')}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-[9px] text-neutral-600">{item.id}</span><span className="text-[9px] font-semibold" style={{ color: meta.color }}>{meta.label}</span></div><div className="text-[11px] font-semibold text-neutral-200 mt-1.5">{item.title}</div><div className="text-[9.5px] text-neutral-500 mt-0.5 line-clamp-2">{item.description}</div></div><div className="text-right shrink-0"><div className="text-[9px] text-neutral-600">SLA</div><div className="text-[10px] text-neutral-300 tnum mt-0.5">{item.sla}</div></div></div><div className="mt-2 flex justify-between text-[9px] text-neutral-600"><span>{item.owner}</span><span>{item.impact}</span></div></button>; })}</div></Panel>
            <Panel title={selectedException.title} subtitle={`${selectedException.id} · ${selectedException.type}`} actions={<span className="text-[10px] font-semibold" style={{ color: SEVERITY_META[selectedException.severity].color }}>{SEVERITY_META[selectedException.severity].label}</span>}>
              <div className="space-y-4"><div className="rounded-lg border border-white/9 bg-white/[0.025] p-3 text-[11px] text-neutral-300 leading-relaxed">{selectedException.description}</div><div className="grid grid-cols-2 gap-3 text-[10.5px]"><div><div className="text-neutral-600">Impacto</div><div className="text-neutral-200 mt-1">{selectedException.impact}</div></div><div><div className="text-neutral-600">SLA restante</div><div className="text-neutral-200 mt-1 tnum">{selectedException.sla}</div></div><div><div className="text-neutral-600">Responsável</div><div className="text-neutral-200 mt-1">{selectedException.owner}</div></div><div><div className="text-neutral-600">Fonte</div><div className="text-neutral-200 mt-1">{selectedException.source}</div></div></div><div className="rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 p-3"><div className="text-[9px] uppercase tracking-wider text-neutral-600">Recomendação</div><div className="text-[11px] text-neutral-200 mt-1">{selectedException.recommendation}</div></div><div className="flex flex-wrap gap-2"><button onClick={() => resolveException(selectedException.id)} disabled={selectedException.status === 'resolved'} className="rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/9 px-3 py-2 text-[10.5px] text-[#56D2C9] disabled:opacity-40"><Icon name="CheckCircle2" size={11} className="inline mr-1.5" />Resolver</button><button onClick={() => escalateException(selectedException.id)} className="rounded-lg border border-[#E5A11A]/30 bg-[#E5A11A]/9 px-3 py-2 text-[10.5px] text-[#F2C15A]"><Icon name="ArrowUpRight" size={11} className="inline mr-1.5" />Escalar</button><button onClick={() => { setSelectedExecutionId(selectedException.executionId); onSectionChange('queue'); }} className="rounded-lg border border-white/12 px-3 py-2 text-[10.5px] text-neutral-300"><Icon name="Bot" size={11} className="inline mr-1.5" />Abrir execução</button></div></div>
            </Panel>
          </div>
        </>
      )}

      {section === 'logs' && (
        <>
          <div className="flex flex-wrap gap-2 items-center"><div className="relative flex-1 min-w-[250px]"><Icon name="Search" size={13} className="absolute left-3 top-2.5 text-neutral-600" /><input value={logSearch} onChange={(event) => setLogSearch(event.target.value)} placeholder="Buscar mensagem, evento, correlação ou execução" className="w-full rounded-lg border border-white/10 bg-[#0B2235] py-2 pl-9 pr-3 text-[11px] text-neutral-200 outline-none" /></div><select value={logLevel} onChange={(event) => setLogLevel(event.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os níveis</option>{Object.entries(LOG_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select><select value={logAgent} onChange={(event) => setLogAgent(event.target.value)} className="rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os agentes</option>{definitions.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select><button onClick={() => setLogStreaming((value) => !value)} className={cls('rounded-lg border px-3 py-2 text-[11px]', logStreaming ? 'border-[#0FA39D]/35 bg-[#0FA39D]/8 text-[#56D2C9]' : 'border-white/12 text-neutral-300')}><Icon name={logStreaming ? 'Radio' : 'Pause'} size={11} className="inline mr-1.5" />{logStreaming ? 'Streaming ativo' : 'Streaming pausado'}</button><button onClick={() => downloadCsv('nexo-agents-logs.csv', filteredLogs.map((item) => ({ timestamp: item.timestamp, nivel: item.level, agente: item.agentId, execucao: item.executionId, correlacao: item.correlationId, evento: item.event, mensagem: item.message, duracao_ms: item.durationMs })))} className="rounded-lg border border-white/12 px-3 py-2 text-[11px] text-neutral-300"><Icon name="Download" size={11} className="inline mr-1.5" />Exportar</button></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><KpiCard label="Eventos exibidos" value={String(filteredLogs.length)} icon="Terminal" /><KpiCard label="Erros" value={String(logs.filter((item) => item.level === 'error').length)} deltaTone="red" icon="AlertOctagon" /><KpiCard label="Warnings" value={String(logs.filter((item) => item.level === 'warning').length)} deltaTone="amber" icon="AlertTriangle" /><KpiCard label="Gates registrados" value={String(logs.filter((item) => item.level === 'decision').length)} icon="User" /><KpiCard label="Latência P95" value="1,84 s" delta="-240 ms" icon="Activity" /></div>
          <Panel title="Console estruturado" subtitle="Logs técnicos e de negócio correlacionados por caso e execução" dense>
            <div className="rounded-lg bg-[#06111b] border border-white/8 overflow-hidden"><div className="grid grid-cols-[110px_70px_140px_145px_1fr_70px] gap-2 px-3 py-2 border-b border-white/8 text-[9px] uppercase tracking-wider text-neutral-700 min-w-[900px]"><span>Timestamp</span><span>Nível</span><span>Agente</span><span>Evento</span><span>Mensagem</span><span>Duração</span></div><div className="max-h-[600px] overflow-auto nexo-scroll min-w-[900px]">{filteredLogs.map((log) => { const meta = LOG_META[log.level]; return <div key={log.id} className="grid grid-cols-[110px_70px_140px_145px_1fr_70px] gap-2 px-3 py-2 border-b border-white/[0.04] font-mono text-[9.5px] hover:bg-white/[0.02]"><span className="text-neutral-600">{log.timestamp}</span><span className="font-semibold flex items-center gap-1" style={{ color: meta.color }}><Icon name={meta.icon} size={9} />{meta.label}</span><span className="text-neutral-400 truncate">{definitions.find((item) => item.id === log.agentId)?.shortName ?? log.agentId}</span><span className="text-[#5FB4E8] truncate">{log.event}</span><span className="text-neutral-300"><span>{log.message}</span>{log.details && <span className="block text-neutral-600 mt-0.5">{log.details}</span>}<span className="block text-neutral-700 mt-0.5">{log.correlationId} · {log.executionId}</span></span><span className="text-neutral-600 tnum">{log.durationMs == null ? '—' : `${log.durationMs}ms`}</span></div>; })}</div></div>
          </Panel>
        </>
      )}

      {section === 'authorities' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><KpiCard label="Agentes registrados" value={String(definitions.length)} icon="Bot" /><KpiCard label="Agentes habilitados" value={String(definitions.filter((item) => item.enabled).length)} icon="CheckCircle2" /><KpiCard label="Regras de alçada" value={String(authorityRules.length)} icon="Settings" /><KpiCard label="Gates obrigatórios" value={String(authorityRules.filter((item) => item.mandatoryHuman).length)} icon="User" /><KpiCard label="Dupla aprovação" value={String(authorityRules.filter((item) => item.twoPersonRule).length)} icon="Users" /></div>
          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-4">
            <Panel title="Matriz de alçadas" subtitle="Limites de autonomia, confiança e papéis exigidos" dense><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left min-w-[900px]"><thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-wider text-neutral-600"><th className="py-2 px-2">Ativa</th><th className="py-2 px-2">Ação</th><th className="py-2 px-2">Escopo</th><th className="py-2 px-2">Limite automático</th><th className="py-2 px-2">Confiança</th><th className="py-2 px-2">Gate</th><th className="py-2 px-2">Papel</th></tr></thead><tbody>{authorityRules.map((rule) => <tr key={rule.id} onClick={() => setAuthorityActionId(rule.id)} className={cls('border-b border-white/6 text-[10px] cursor-pointer hover:bg-white/[0.025]', authorityActionId === rule.id && 'bg-[#7C5CBF]/7')}><td className="py-2.5 px-2"><button onClick={(event) => { event.stopPropagation(); toggleRule(rule.id); }} className={cls('w-8 h-4 rounded-full relative transition-colors', rule.enabled ? 'bg-[#0FA39D]/60' : 'bg-white/12')}><span className={cls('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', rule.enabled ? 'left-4' : 'left-0.5')} /></button></td><td className="py-2.5 px-2 text-neutral-200 font-medium max-w-[190px]">{rule.action}</td><td className="py-2.5 px-2 text-neutral-500 max-w-[230px]">{rule.scope}</td><td className="py-2.5 px-2 text-neutral-300">{rule.maxAutomaticAmount === 0 ? 'Sem autonomia' : fmtCompactBRL(rule.maxAutomaticAmount)}</td><td className="py-2.5 px-2 text-neutral-300">{Math.round(rule.minConfidence * 100)}%</td><td className="py-2.5 px-2">{rule.mandatoryHuman ? <span className="text-[#A78BFA]">Humano{rule.twoPersonRule ? ' + dupla' : ''}</span> : <span className="text-[#56D2C9]">Automático</span>}</td><td className="py-2.5 px-2 text-neutral-500">{rule.requiredRole}</td></tr>)}</tbody></table></div></Panel>
            <Panel title="Simulador de alçada" subtitle="Teste uma ação antes de alterar regras"><div className="space-y-4"><div><label className="text-[9.5px] text-neutral-500">Ação</label><select value={authorityActionId} onChange={(event) => setAuthorityActionId(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B2235] px-3 py-2 text-[10.5px] text-neutral-300">{authorityRules.map((item) => <option key={item.id} value={item.id}>{item.action}</option>)}</select></div><div><div className="flex justify-between text-[9.5px] text-neutral-500"><label>Valor relacionado</label><span>{fmtCompactBRL(simAmount)}</span></div><input type="range" min="0" max="150000000" step="1000000" value={simAmount} onChange={(event) => setSimAmount(Number(event.target.value))} className="w-full mt-2 accent-[#18B7D6]" /></div><div><div className="flex justify-between text-[9.5px] text-neutral-500"><label>Confiança do agente</label><span>{Math.round(simConfidence * 100)}%</span></div><input type="range" min="0.5" max="1" step="0.01" value={simConfidence} onChange={(event) => setSimConfidence(Number(event.target.value))} className="w-full mt-2 accent-[#18B7D6]" /></div><div className="rounded-xl border p-3" style={{ borderColor: `${simulation.color}55`, background: `${simulation.color}10` }}><div className="text-[12px] font-semibold" style={{ color: simulation.color }}>{simulation.result}</div><div className="text-[10px] text-neutral-400 mt-1 leading-relaxed">{simulation.detail}</div></div><div className="rounded-lg border border-white/9 bg-white/[0.025] p-3 text-[9.5px] text-neutral-500 leading-relaxed">{selectedRule.rationale}</div></div></Panel>
          </div>
          <Panel title="Registro corporativo de agentes" subtitle="Proprietário, autonomia, risco, SLA, fontes, entregas e gates">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{definitions.map((definition) => { const module = productMeta(definition.module); return <div key={definition.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5"><div className="flex justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${module.color}18` }}><Icon name={module.iconKey} size={12} style={{ color: module.color }} /></span><div><div className="text-[11px] font-semibold text-neutral-200">{definition.shortName}</div><div className="text-[9px] text-neutral-600">{definition.owner}</div></div></div></div><button onClick={() => toggleDefinition(definition.id)} className={cls('w-8 h-4 rounded-full relative transition-colors shrink-0', definition.enabled ? 'bg-[#0FA39D]/60' : 'bg-white/12')}><span className={cls('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', definition.enabled ? 'left-4' : 'left-0.5')} /></button></div><div className="mt-3 text-[9.5px] text-neutral-500 leading-relaxed min-h-[42px]">{definition.function}</div><div className="mt-3 flex flex-wrap gap-1"><Pill>{definition.autonomy}</Pill><span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] text-neutral-500">risco {definition.riskClass}</span><span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] text-neutral-500">SLA {definition.slaMinutes} min</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-[9px]"><div><div className="text-neutral-700 uppercase">Fontes</div><div className="text-neutral-500 mt-1">{definition.sources.slice(0, 2).join(' · ')}</div></div><div><div className="text-neutral-700 uppercase">Gates</div><div className="text-neutral-500 mt-1">{definition.humanGates.join(' · ') || 'Nenhum'}</div></div></div></div>; })}</div>
          </Panel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Tempo médio por agente" subtitle="Duração das execuções recentes"><BarProgramChart data={AGENT_DURATION_BY_TYPE.map((item) => ({ agente: item.agente, atual: item.segundos, sla: Math.max(item.segundos * 1.2, 60) }))} xKey="agente" aKey="sla" bKey="atual" aLabel="SLA referência (s)" bLabel="Atual (s)" unit="s" /></Panel><Panel title="Princípios de governança" subtitle="Controles aplicados em todas as execuções"><div className="space-y-2">{['Agentes recomendam e orquestram; decisões irreversíveis permanecem humanas.', 'Toda recomendação registra fontes, versão de regras, confiança e correlação.', 'Overrides humanos exigem fundamentação e permanecem na trilha auditável.', 'Falhas de integração acionam fallback controlado; nunca silenciam evidências.', 'Acesso a dados e ações respeita papel, território, sigilo e segregação de funções.'].map((text, index) => <div key={text} className="flex gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-2.5"><span className="w-5 h-5 rounded-full bg-[#7C5CBF]/15 text-[#A78BFA] text-[9px] flex items-center justify-center shrink-0">{index + 1}</span><span className="text-[10.5px] text-neutral-400 leading-relaxed">{text}</span></div>)}</div></Panel></div>
        </>
      )}
    </div>
  );
}
