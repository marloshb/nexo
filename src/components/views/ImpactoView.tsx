import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, type EventItem } from '@/data/mockData';
import {
  ASSET_IMPACT,
  BENEFICIARY_SEGMENTS,
  BENEFICIARY_TERRITORIES,
  FRAMEWORK_COVERAGE,
  IMPACT_AGENTS,
  IMPACT_AUDIT,
  IMPACT_DIMENSION_DISTRIBUTION,
  IMPACT_FRAMEWORKS,
  IMPACT_INTEGRATIONS,
  IMPACT_LIVE_STEPS,
  IMPACT_REPORTS,
  IMPACT_RULES,
  IMPACT_TIME_SERIES,
  IMPACT_VALUE_SERIES,
  INDICATORS,
  RESULT_CHAIN,
  type ImpactAgentRuntime,
  type ImpactIntegration,
  type ImpactoSection,
  type Indicator,
  type IndicatorStatus,
} from '@/data/impactoData';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { BarProgramChart, DonutChart, RadarComparison, TimeSeriesChart } from '@/components/shared/Charts';
import { EventFeed } from '@/components/shared/EventFeed';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import { cls, fmtCompactBRL, fmtCompactNum, fmtPct, type StatusKey } from '@/lib/tokens';
import type { ProductKey } from '@/data/navConfig';

const SECTION_TITLE: Record<ImpactoSection, { title: string; subtitle: string }> = {
  overview: { title: 'Visão geral', subtitle: 'Capital, ativos, serviços, beneficiários, resultados e impacto em uma linha contínua' },
  indicators: { title: 'Indicadores', subtitle: 'Catálogo, fórmulas, baseline, metas, materialidade, validação e linhagem' },
  beneficiaries: { title: 'Beneficiários', subtitle: 'Cobertura, segmentação, deduplicação, elegibilidade e comprovação territorial' },
  map: { title: 'Mapa de impacto', subtitle: 'Resultados, áreas de influência, vulnerabilidades, beneficiários e evidências geoespaciais' },
  reports: { title: 'Relatórios', subtitle: 'Demonstração de valor, alocação, impacto, prestação de contas e publicação' },
  admin: { title: 'Administração', subtitle: 'Frameworks, regras, integrações, alçadas, periodicidade e governança de IA' },
};

const INDICATOR_STATUS: Record<IndicatorStatus, { label: string; tone: StatusKey; color: string }> = {
  validado: { label: 'Validado', tone: 'normal', color: '#0FA39D' },
  divergente: { label: 'Divergente', tone: 'critico', color: '#D14A55' },
  pendente: { label: 'Pendente', tone: 'pendente', color: '#9AACB8' },
  em_validacao: { label: 'Em validação', tone: 'analise', color: '#1584D1' },
};

const AGENT_STATUS: Record<ImpactAgentRuntime['status'], { label: string; color: string }> = {
  idle: { label: 'Disponível', color: '#9AACB8' },
  running: { label: 'Em execução', color: '#18B7D6' },
  waiting: { label: 'Aguardando humano', color: '#7C5CBF' },
  done: { label: 'Concluído', color: '#0FA39D' },
  alert: { label: 'Alerta', color: '#D14A55' },
};

const INTEGRATION_STATUS: Record<ImpactIntegration['status'], { label: string; tone: StatusKey }> = {
  operational: { label: 'Operacional', tone: 'normal' },
  attention: { label: 'Atenção', tone: 'atencao' },
  error: { label: 'Falha', tone: 'critico' },
};

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

function AgentRuntimeCard({ agent, onRun }: { agent: ImpactAgentRuntime; onRun: () => void }) {
  const meta = AGENT_STATUS[agent.status];
  return (
    <div className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-neutral-100">{agent.name}</div>
          <div className="text-[10px] text-neutral-500 mt-1 leading-snug">{agent.function}</div>
        </div>
        <span className="text-[9.5px] rounded-full border px-2 py-0.5 whitespace-nowrap" style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}15` }}>{meta.label}</span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-neutral-500 mb-1"><span className="truncate pr-2">{agent.entity}</span><span>{agent.progress}%</span></div>
        <ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'red' : agent.status === 'done' ? 'teal' : 'cyan'} height={5} />
      </div>
      <div className="mt-2 text-[10.5px] text-neutral-300">{agent.stage}</div>
      <div className="mt-2 rounded-lg border border-white/8 bg-white/[0.025] p-2 text-[10px] text-neutral-400 leading-snug">{agent.recommendation}</div>
      <div className="mt-2 flex justify-between gap-2 text-[9.5px] text-neutral-600"><span>{Math.round(agent.confidence * 100)}% confiança</span><span className="truncate">{agent.impact}</span></div>
      <button onClick={onRun} className="mt-3 w-full rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 py-1.5 text-[10.5px] text-[#6FD8EC]"><Icon name="Play" size={10} className="inline mr-1" />Executar análise</button>
    </div>
  );
}

function SectionHeader({ section, liveRunning, onToggleLive, onNavigateProduct }: { section: ImpactoSection; liveRunning: boolean; onToggleLive: () => void; onNavigateProduct: (p: ProductKey) => void }) {
  const meta = SECTION_TITLE[section];
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div><h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Impacto · {meta.title}</h1><p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onNavigateProduct('ativos')} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300"><Icon name="Building2" size={12} className="inline mr-1.5" />Ativos</button>
        <button onClick={() => onNavigateProduct('evidencia')} className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300"><Icon name="ShieldCheck" size={12} className="inline mr-1.5" />Evidências</button>
        <button onClick={onToggleLive} className={cls('rounded-lg border px-3 py-2 text-[11px] font-medium', liveRunning ? 'border-[#E5A11A]/40 bg-[#E5A11A]/10 text-[#F2C15A]' : 'border-[#18B7D6]/35 bg-[#18B7D6]/10 text-[#6FD8EC]')}>
          <Icon name={liveRunning ? 'Pause' : 'Play'} size={12} className="inline mr-1.5" />{liveRunning ? 'Pausar ciclo ao vivo' : 'Executar ciclo ao vivo'}
        </button>
      </div>
    </div>
  );
}

function ResultChain() {
  const chainValues: Record<string, { value: string; detail: string; tone: string }> = {
    Insumo: { value: 'R$ 3,2 bi', detail: 'capital rastreado', tone: '#1584D1' },
    Atividade: { value: '41', detail: 'intervenções ativas', tone: '#18B7D6' },
    Produto: { value: '18', detail: 'ativos entregues', tone: '#7C5CBF' },
    Serviço: { value: '14', detail: 'serviços operacionais', tone: '#E5A11A' },
    Resultado: { value: '1,19 mi', detail: 'beneficiários comprovados', tone: '#0FA39D' },
    Impacto: { value: '78/100', detail: 'índice de valor verificado', tone: '#56D2C9' },
  };
  return (
    <div className="flex items-stretch overflow-x-auto nexo-scroll pb-2">
      {RESULT_CHAIN.map((stage, index) => {
        const item = chainValues[stage];
        return (
          <div key={stage} className="flex items-center shrink-0">
            <div className="w-[155px] rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <div className="text-[9.5px] uppercase tracking-wider text-neutral-500">{stage}</div>
              <div className="font-display text-[19px] font-semibold mt-1" style={{ color: item.tone }}>{item.value}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{item.detail}</div>
            </div>
            {index < RESULT_CHAIN.length - 1 && <div className="w-8 flex justify-center"><Icon name="ArrowRight" size={15} className="text-neutral-600" /></div>}
          </div>
        );
      })}
    </div>
  );
}

export function ImpactoView({
  section,
  onSectionChange,
  onOpenAsset,
  onNavigateProduct,
  events,
  onPushEvent,
}: {
  section: ImpactoSection;
  onSectionChange: (section: ImpactoSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}) {
  const [indicators, setIndicators] = useState(INDICATORS);
  const [agents, setAgents] = useState(IMPACT_AGENTS);
  const [integrations, setIntegrations] = useState(IMPACT_INTEGRATIONS);
  const [rules, setRules] = useState(IMPACT_RULES);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(INDICATORS[0].id);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dimensionFilter, setDimensionFilter] = useState('todas');
  const [selectedAssetId, setSelectedAssetId] = useState(ASSET_IMPACT[0].assetId);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState(BENEFICIARY_SEGMENTS.map((s) => s.name));
  const [reportProgress, setReportProgress] = useState<Record<string, number>>({});
  const [selectedReportIndicators, setSelectedReportIndicators] = useState(INDICATORS.slice(0, 5).map((i) => i.id));
  const [showNewIndicator, setShowNewIndicator] = useState(false);
  const [newIndicatorName, setNewIndicatorName] = useState('');
  const [publicationDecision, setPublicationDecision] = useState<string | null>(null);
  const [materialityThreshold, setMaterialityThreshold] = useState(70);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  const selectedIndicator = indicators.find((i) => i.id === selectedIndicatorId) ?? indicators[0];
  const selectedAssetImpact = ASSET_IMPACT.find((a) => a.assetId === selectedAssetId) ?? ASSET_IMPACT[0];
  const impactAssets = ASSETS.filter((asset) => ASSET_IMPACT.some((item) => item.assetId === asset.id));
  const validados = indicators.filter((i) => i.status === 'validado').length;
  const pending = indicators.filter((i) => i.status !== 'validado').length;
  const beneficiariesVerified = ASSET_IMPACT.reduce((sum, item) => sum + item.beneficiariosComprovados, 0);
  const beneficiariesPlanned = ASSET_IMPACT.reduce((sum, item) => sum + item.beneficiariosPrevistos, 0);
  const tracedCapital = ASSET_IMPACT.reduce((sum, item) => sum + item.valor, 0);
  const weightedScore = Math.round(ASSET_IMPACT.reduce((sum, item) => sum + item.impactoScore * item.valor, 0) / tracedCapital);
  const avgConfidence = indicators.reduce((sum, i) => sum + i.confidence, 0) / indicators.length;

  const filteredIndicators = useMemo(() => indicators.filter((i) => {
    const query = indicatorSearch.toLowerCase();
    return (!query || `${i.nome} ${i.ativo} ${i.territorio} ${i.framework.join(' ')}`.toLowerCase().includes(query))
      && (statusFilter === 'todos' || i.status === statusFilter)
      && (dimensionFilter === 'todas' || i.dimensao === dimensionFilter);
  }), [indicators, indicatorSearch, statusFilter, dimensionFilter]);

  const selectedRadar = [
    { dimensao: 'Social', atual: selectedAssetImpact.social, referencia: 85 },
    { dimensao: 'Ambiental', atual: selectedAssetImpact.ambiental, referencia: 85 },
    { dimensao: 'Econômica', atual: selectedAssetImpact.economica, referencia: 85 },
    { dimensao: 'Climática', atual: selectedAssetImpact.climatica, referencia: 85 },
    { dimensao: 'Territorial', atual: selectedAssetImpact.territorial, referencia: 85 },
  ];

  useEffect(() => {
    if (!liveRunning) return;
    if (liveStep >= IMPACT_LIVE_STEPS.length) {
      setLiveRunning(false);
      setAgents((prev) => prev.map((a) => a.id === 'orchestrator' ? { ...a, status: 'waiting', progress: 100, stage: 'Gate humano preparado', recommendation: 'Publicar 7 indicadores e reter os indicadores habitacional e de drenagem.' } : a.status === 'running' ? { ...a, status: 'done', progress: 100 } : a));
      return;
    }
    const timer = window.setTimeout(() => {
      const step = IMPACT_LIVE_STEPS[liveStep];
      onPushEvent(step.text, liveStep === 5 ? 'warning' : liveStep === IMPACT_LIVE_STEPS.length - 1 ? 'success' : 'agent');
      setAgents((prev) => prev.map((agent) => agent.id === step.agentId ? { ...agent, status: liveStep === IMPACT_LIVE_STEPS.length - 1 ? 'waiting' : 'running', progress: Math.min(100, Math.max(agent.progress, 14 + liveStep * 12)), stage: step.text } : agent));
      if (liveStep === 1) setIndicators((prev) => prev.map((i) => i.id === 'IND-004' ? { ...i, status: 'validado', confidence: 0.91 } : i));
      if (liveStep === 5) setIndicators((prev) => prev.map((i) => i.id === 'IND-007' ? { ...i, status: 'divergente', confidence: 0.72 } : i));
      setLiveStep((stepIndex) => stepIndex + 1);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [liveRunning, liveStep, onPushEvent]);

  function toggleLive() {
    if (liveRunning) { setLiveRunning(false); return; }
    if (liveStep >= IMPACT_LIVE_STEPS.length) {
      setLiveStep(0);
      setPublicationDecision(null);
      setAgents(IMPACT_AGENTS.map((agent) => ({ ...agent, status: agent.id === 'orchestrator' ? 'running' : 'idle', progress: agent.id === 'orchestrator' ? 8 : 0 })));
    }
    setLiveRunning(true);
    onPushEvent('Nexo Impacto iniciou ciclo mensal de validação, atribuição e reporte.', 'agent');
  }

  function runAgent(id: string) {
    const name = agents.find((agent) => agent.id === id)?.name ?? 'Agente';
    setAgents((prev) => prev.map((agent) => agent.id === id ? { ...agent, status: 'running', progress: 10, stage: 'Consultando fontes autorizadas' } : agent));
    onPushEvent(`${name} iniciado sob demanda.`, 'agent');
    let progress = 10;
    const interval = window.setInterval(() => {
      progress += 18;
      setAgents((prev) => prev.map((agent) => agent.id === id ? { ...agent, progress: Math.min(100, progress), status: progress >= 100 ? 'done' : 'running', stage: progress >= 100 ? 'Análise concluída e log registrada' : `Processando etapa ${Math.ceil(progress / 20)} de 5` } : agent));
      if (progress >= 100) { window.clearInterval(interval); onPushEvent(`${name} concluiu a execução.`, 'success'); }
    }, 380);
  }

  function validateIndicator(id: string) {
    const indicator = indicators.find((item) => item.id === id);
    setIndicators((prev) => prev.map((item) => item.id === id ? { ...item, status: 'em_validacao' } : item));
    setAgents((prev) => prev.map((agent) => agent.id === 'indicator' ? { ...agent, status: 'running', progress: 18, entity: indicator?.nome ?? id, stage: 'Validando fórmula e evidências' } : agent));
    onPushEvent(`Validação iniciada para ${indicator?.nome ?? id}.`, 'agent');
    window.setTimeout(() => {
      const blocked = id === 'IND-007' || id === 'IND-006';
      setIndicators((prev) => prev.map((item) => item.id === id ? { ...item, status: blocked ? 'divergente' : 'validado', confidence: blocked ? Math.max(item.confidence, 0.73) : Math.max(item.confidence, 0.92), lastUpdate: '2026-07-21' } : item));
      setAgents((prev) => prev.map((agent) => agent.id === 'indicator' ? { ...agent, status: blocked ? 'alert' : 'done', progress: 100, stage: blocked ? 'Divergência material identificada' : 'Indicador validado' } : agent));
      onPushEvent(blocked ? `Indicador ${indicator?.nome} mantido como divergente.` : `Indicador ${indicator?.nome} validado.`, blocked ? 'warning' : 'success');
    }, 1650);
  }

  function createIndicator() {
    if (!newIndicatorName.trim()) return;
    const newIndicator: Indicator = {
      ...INDICATORS[0], id: `IND-${String(indicators.length + 1).padStart(3, '0')}`, nome: newIndicatorName.trim(), descricao: 'Novo indicador em definição metodológica.',
      ativoId: selectedAssetImpact.assetId, ativo: selectedAssetImpact.asset, baseline: 0, meta: 100, realizado: 0, unidade: '%', status: 'pendente', confidence: 0.2,
      evidenceCount: 0, lastUpdate: '2026-07-21', framework: ['CAIXA Nexo'], trend: 'stable', materiality: 'média', verification: 'humana',
    };
    setIndicators((prev) => [...prev, newIndicator]);
    setSelectedIndicatorId(newIndicator.id);
    setNewIndicatorName('');
    setShowNewIndicator(false);
    onPushEvent(`Novo indicador cadastrado: ${newIndicator.nome}.`, 'success');
  }

  function generateReport(id: string) {
    setReportProgress((prev) => ({ ...prev, [id]: 6 }));
    const report = IMPACT_REPORTS.find((item) => item.id === id);
    setAgents((prev) => prev.map((agent) => agent.id === 'report' ? { ...agent, status: 'running', progress: 12, stage: `Gerando ${report?.title}` } : agent));
    let progress = 6;
    const interval = window.setInterval(() => {
      progress += 14;
      setReportProgress((prev) => ({ ...prev, [id]: Math.min(100, progress) }));
      setAgents((prev) => prev.map((agent) => agent.id === 'report' ? { ...agent, progress: Math.min(100, progress), status: progress >= 100 ? 'waiting' : 'running', stage: progress >= 100 ? 'Aguardando revisão e publicação' : `Consolidando seção ${Math.ceil(progress / 20)} de 5` } : agent));
      if (progress >= 100) { window.clearInterval(interval); onPushEvent(`${report?.title ?? 'Relatório'} gerado e encaminhado ao gate humano.`, 'success'); }
    }, 280);
  }

  function publishValidated() {
    const note = `Publicação aprovada: ${validados} indicadores divulgados; ${pending} mantidos em ambiente restrito.`;
    setPublicationDecision(note);
    onPushEvent(note, 'success');
  }

  function synchronizeIntegration(id: string) {
    const integration = integrations.find((item) => item.id === id);
    setIntegrations((prev) => prev.map((item) => item.id === id ? { ...item, status: 'operational', lastSync: 'agora', latency: item.latency === '—' ? '2,4 s' : item.latency } : item));
    onPushEvent(`${integration?.name ?? 'Integração'} sincronizada manualmente.`, 'success');
  }

  function renderOverview() {
    const criticalAssets = ASSET_IMPACT.filter((item) => item.status === 'critico' || item.status === 'atencao');
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
          <KpiCard label="Capital rastreado" value={fmtCompactBRL(tracedCapital)} icon="DollarSign" delta="100%" hint="ligado a ativos" />
          <KpiCard label="Beneficiários comprovados" value={fmtCompactNum(beneficiariesVerified)} icon="Users" delta={fmtPct(beneficiariesVerified / beneficiariesPlanned)} hint="do previsto" />
          <KpiCard label="Indicadores validados" value={`${validados}/${indicators.length}`} icon="BadgeCheck" delta={`${pending} pendentes`} deltaTone={pending > 2 ? 'amber' : 'teal'} />
          <KpiCard label="Índice de valor" value={`${weightedScore}/100`} icon="TrendingUp" delta="+8 p.p." hint="desde 2025" />
          <KpiCard label="Confiança média" value={fmtPct(avgConfidence)} icon="ShieldCheck" delta="+3 p.p." />
          <KpiCard label="Emissões evitadas" value="447 mil t" icon="Wind" delta="109%" hint="da meta anual" />
        </div>

        <Panel title="Linha Capital–Ativo–Resultado" subtitle="Rastreabilidade corporativa do recurso ao impacto verificado"><ResultChain /></Panel>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Beneficiários previstos × comprovados" subtitle="Evolução acumulada da carteira" className="xl:col-span-3"><TimeSeriesChart data={IMPACT_TIME_SERIES} xKey="ano" aKey="previsto" bKey="comprovado" aLabel="Previsto" bLabel="Comprovado" /></Panel>
          <Panel title="Composição do impacto" subtitle="Indicadores materiais por dimensão" className="xl:col-span-2"><DonutChart data={IMPACT_DIMENSION_DISTRIBUTION} /></Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Valor esperado × verificado" subtitle="Índice consolidado por trimestre" className="xl:col-span-3"><TimeSeriesChart data={IMPACT_VALUE_SERIES} xKey="periodo" aKey="esperado" bKey="verificado" aLabel="Esperado" bLabel="Verificado" /></Panel>
          <Panel title="Decisões prioritárias" subtitle="Itens que impedem reconhecimento ou publicação" className="xl:col-span-2">
            <div className="space-y-2.5">
              {criticalAssets.map((item) => (
                <button key={item.assetId} onClick={() => onOpenAsset(item.assetId)} className="w-full text-left rounded-lg border border-white/9 bg-white/[0.025] p-3 hover:border-[#18B7D6]/35">
                  <div className="flex items-start justify-between gap-2"><div className="text-[11.5px] text-neutral-200 font-medium">{item.asset}</div><StatusChip status={item.status === 'critico' ? 'critico' : 'atencao'} size="sm" /></div>
                  <div className="text-[10.5px] text-neutral-500 mt-1 leading-snug">{item.keyOutcome}</div>
                  <div className="text-[10px] text-[#6FD8EC] mt-2"><Icon name="ArrowRight" size={10} className="inline mr-1" />{item.nextAction}</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Agentes críticos" subtitle="Validação, beneficiários, atribuição, evidências e reporte" className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{agents.slice(0, 4).map((agent) => <AgentRuntimeCard key={agent.id} agent={agent} onRun={() => runAgent(agent.id)} />)}</div>
          </Panel>
          <Panel title="Eventos do ciclo" subtitle="Operação em tempo real" className="xl:col-span-2"><EventFeed events={events.slice(-12)} dense maxHeight={530} /></Panel>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={() => onSectionChange('indicators')} className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-4 text-left hover:border-[#18B7D6]/35"><Icon name="Target" size={18} className="text-[#18B7D6]" /><div className="text-[12px] text-neutral-100 font-semibold mt-2">Validar indicadores</div><div className="text-[10.5px] text-neutral-500 mt-1">Revisar fórmulas, evidências e materialidade.</div></button>
          <button onClick={() => onSectionChange('beneficiaries')} className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-4 text-left hover:border-[#18B7D6]/35"><Icon name="Users" size={18} className="text-[#0FA39D]" /><div className="text-[12px] text-neutral-100 font-semibold mt-2">Comprovar beneficiários</div><div className="text-[10.5px] text-neutral-500 mt-1">Deduplicação, segmentos e cobertura territorial.</div></button>
          <button onClick={() => onSectionChange('reports')} className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-4 text-left hover:border-[#18B7D6]/35"><Icon name="FileText" size={18} className="text-[#E5A11A]" /><div className="text-[12px] text-neutral-100 font-semibold mt-2">Emitir demonstração de valor</div><div className="text-[10.5px] text-neutral-500 mt-1">Gerar pacote executivo e prestação de contas.</div></button>
        </div>
      </div>
    );
  }

  function renderIndicators() {
    const ratio = selectedIndicator.meta ? selectedIndicator.realizado / selectedIndicator.meta : 0;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <KpiCard label="Indicadores cadastrados" value={String(indicators.length)} icon="Target" />
          <KpiCard label="Validados" value={String(validados)} icon="BadgeCheck" delta={fmtPct(validados / indicators.length)} />
          <KpiCard label="Confiança média" value={fmtPct(avgConfidence)} icon="ShieldCheck" />
          <KpiCard label="Evidências vinculadas" value={fmtCompactNum(indicators.reduce((sum, i) => sum + i.evidenceCount, 0))} icon="FileCheck" />
          <KpiCard label="Alta materialidade" value={String(indicators.filter((i) => i.materiality === 'alta').length)} icon="AlertTriangle" />
        </div>

        <Panel title="Catálogo corporativo" subtitle="Indicadores, frameworks, fontes, fórmulas e estado de validação" actions={<div className="flex gap-2"><button onClick={() => downloadCsv('nexo-impacto-indicadores.csv', filteredIndicators.map((i) => ({ id: i.id, indicador: i.nome, ativo: i.ativo, dimensao: i.dimensao, meta: i.meta, realizado: i.realizado, status: i.status, confianca: i.confidence })))} className="rounded-lg border border-white/12 px-2.5 py-1.5 text-[10.5px] text-neutral-300"><Icon name="Download" size={10} className="inline mr-1" />CSV</button><button onClick={() => setShowNewIndicator((value) => !value)} className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/8 px-2.5 py-1.5 text-[10.5px] text-[#6FD8EC]"><Icon name="Plus" size={10} className="inline mr-1" />Novo indicador</button></div>}>
          {showNewIndicator && <div className="mb-4 rounded-xl border border-[#18B7D6]/25 bg-[#18B7D6]/5 p-3 flex flex-col md:flex-row gap-2"><input value={newIndicatorName} onChange={(event) => setNewIndicatorName(event.target.value)} placeholder="Nome do novo indicador" className="flex-1 rounded-lg border border-white/12 bg-[#071521] px-3 py-2 text-[11px] text-neutral-200 outline-none" /><select className="rounded-lg border border-white/12 bg-[#071521] px-3 py-2 text-[11px] text-neutral-300"><option>{selectedAssetImpact.asset}</option></select><button onClick={createIndicator} className="rounded-lg bg-[#1584D1] px-4 py-2 text-[11px] text-white">Criar definição</button></div>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="relative md:col-span-2"><Icon name="Search" size={13} className="absolute left-3 top-2.5 text-neutral-600" /><input value={indicatorSearch} onChange={(event) => setIndicatorSearch(event.target.value)} placeholder="Buscar indicador, ativo ou framework" className="w-full rounded-lg border border-white/10 bg-[#071521]/75 pl-9 pr-3 py-2 text-[11px] text-neutral-200 outline-none" /></div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-white/10 bg-[#071521]/75 px-3 py-2 text-[11px] text-neutral-300"><option value="todos">Todos os status</option><option value="validado">Validados</option><option value="em_validacao">Em validação</option><option value="divergente">Divergentes</option><option value="pendente">Pendentes</option></select>
            <select value={dimensionFilter} onChange={(event) => setDimensionFilter(event.target.value)} className="rounded-lg border border-white/10 bg-[#071521]/75 px-3 py-2 text-[11px] text-neutral-300"><option value="todas">Todas as dimensões</option>{['Social', 'Ambiental', 'Econômica', 'Climática', 'Territorial'].map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="overflow-x-auto nexo-scroll -mx-4">
            <table className="w-full text-[11px]">
              <thead><tr className="text-left text-neutral-500 text-[9.5px] uppercase tracking-wide border-b border-white/8"><th className="font-medium px-4 py-2">Indicador</th><th className="font-medium px-2 py-2">Dimensão / nível</th><th className="font-medium px-2 py-2">Meta</th><th className="font-medium px-2 py-2">Realizado</th><th className="font-medium px-2 py-2">Confiança</th><th className="font-medium px-2 py-2">Status</th><th className="font-medium px-4 py-2">Ação</th></tr></thead>
              <tbody>{filteredIndicators.map((indicator) => {
                const meta = INDICATOR_STATUS[indicator.status];
                return <tr key={indicator.id} onClick={() => setSelectedIndicatorId(indicator.id)} className={cls('border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.025]', selectedIndicatorId === indicator.id && 'bg-[#1584D1]/8')}><td className="px-4 py-2.5"><div className="text-neutral-200 font-medium">{indicator.nome}</div><div className="text-[9.5px] text-neutral-600 mt-0.5">{indicator.id} · {indicator.ativo}</div></td><td className="px-2 py-2.5"><div className="text-neutral-300">{indicator.dimensao}</div><div className="text-[9.5px] text-neutral-600">{indicator.nivelCadeia}</div></td><td className="px-2 py-2.5 text-neutral-400 tnum">{fmtCompactNum(indicator.meta)} {indicator.unidade}</td><td className="px-2 py-2.5 text-neutral-200 tnum">{fmtCompactNum(indicator.realizado)}</td><td className="px-2 py-2.5"><div className="w-20"><div className="flex justify-between text-[9.5px] mb-1"><span className="text-neutral-500">{Math.round(indicator.confidence * 100)}%</span></div><ProgressBar value={indicator.confidence} tone={indicator.confidence >= 0.85 ? 'teal' : indicator.confidence >= 0.65 ? 'amber' : 'red'} height={4} /></div></td><td className="px-2 py-2.5"><span className="inline-flex items-center gap-1 text-[10px]" style={{ color: meta.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />{meta.label}</span></td><td className="px-4 py-2.5"><button onClick={(event) => { event.stopPropagation(); validateIndicator(indicator.id); }} className="rounded-md border border-[#18B7D6]/20 px-2 py-1 text-[9.5px] text-[#6FD8EC]">Validar</button></td></tr>;
              })}</tbody>
            </table>
          </div>
        </Panel>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title={selectedIndicator.nome} subtitle={`${selectedIndicator.id} · ${selectedIndicator.ativo}`} className="xl:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-white/[0.025] p-3"><div className="text-[9.5px] text-neutral-600 uppercase">Meta</div><div className="text-[15px] text-neutral-100 tnum mt-1">{fmtCompactNum(selectedIndicator.meta)} {selectedIndicator.unidade}</div></div>
              <div className="rounded-lg bg-white/[0.025] p-3"><div className="text-[9.5px] text-neutral-600 uppercase">Realizado</div><div className="text-[15px] text-neutral-100 tnum mt-1">{fmtCompactNum(selectedIndicator.realizado)}</div></div>
              <div className="rounded-lg bg-white/[0.025] p-3"><div className="text-[9.5px] text-neutral-600 uppercase">Atingimento</div><div className="text-[15px] text-neutral-100 tnum mt-1">{fmtPct(Math.max(0, Math.min(1.3, ratio)))}</div></div>
              <div className="rounded-lg bg-white/[0.025] p-3"><div className="text-[9.5px] text-neutral-600 uppercase">Evidências</div><div className="text-[15px] text-neutral-100 tnum mt-1">{fmtCompactNum(selectedIndicator.evidenceCount)}</div></div>
            </div>
            <div className="space-y-3 text-[11px]"><div><div className="text-neutral-500 mb-1">Descrição</div><div className="text-neutral-300 leading-relaxed">{selectedIndicator.descricao}</div></div><div><div className="text-neutral-500 mb-1">Fórmula</div><div className="rounded-lg border border-white/8 bg-[#071521]/55 p-2.5 text-neutral-300 font-mono-id">{selectedIndicator.formula}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><div className="text-neutral-500 mb-1">Fonte e método</div><div className="text-neutral-300">{selectedIndicator.fonte}</div><div className="text-neutral-600 mt-0.5">{selectedIndicator.metodo}</div></div><div><div className="text-neutral-500 mb-1">Governança</div><div className="text-neutral-300">{selectedIndicator.responsavel} · {selectedIndicator.periodicidade}</div><div className="text-neutral-600 mt-0.5">Tolerância {selectedIndicator.tolerancia} · {selectedIndicator.verification}</div></div></div><div className="flex flex-wrap gap-1.5">{selectedIndicator.framework.map((framework) => <Pill key={framework} tone="cyan">{framework}</Pill>)}</div></div>
          </Panel>
          <Panel title="Linha de validação" subtitle="Dados, evidências, regras e decisão" className="xl:col-span-2">
            <div className="space-y-2.5">
              {[
                ['Fonte disponível', true, selectedIndicator.fonte],
                ['Fórmula executável', selectedIndicator.status !== 'pendente', selectedIndicator.formula],
                ['Evidência suficiente', selectedIndicator.evidenceCount >= 10, `${selectedIndicator.evidenceCount} itens vinculados`],
                ['Confiança mínima', selectedIndicator.confidence >= confidenceThreshold / 100, `${Math.round(selectedIndicator.confidence * 100)}% / ${confidenceThreshold}%`],
                ['Gate humano', selectedIndicator.status === 'validado', selectedIndicator.status === 'validado' ? 'Aprovado' : 'Pendente'],
              ].map(([label, ok, detail]) => <div key={String(label)} className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><Icon name={ok ? 'CheckCircle2' : 'Clock'} size={12} className={ok ? 'text-[#0FA39D]' : 'text-[#E5A11A]'} /><div><div className="text-[10.5px] text-neutral-300">{String(label)}</div><div className="text-[9.5px] text-neutral-600 mt-0.5 line-clamp-2">{String(detail)}</div></div></div>)}
            </div>
            <button onClick={() => onOpenAsset(selectedIndicator.ativoId)} className="mt-3 w-full rounded-lg border border-white/12 bg-white/[0.03] py-2 text-[10.5px] text-neutral-300"><Icon name="ExternalLink" size={10} className="inline mr-1" />Abrir Ativo 360</button>
          </Panel>
        </div>
      </div>
    );
  }

  function renderBeneficiaries() {
    const segmentData = BENEFICIARY_SEGMENTS.filter((item) => selectedSegments.includes(item.name)).map((item) => ({ nome: item.name.split(' ').slice(0, 2).join(' '), previsto: item.previsto, comprovado: item.comprovado }));
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <KpiCard label="Previstos" value={fmtCompactNum(beneficiariesPlanned)} icon="Users" />
          <KpiCard label="Comprovados" value={fmtCompactNum(beneficiariesVerified)} icon="BadgeCheck" delta={fmtPct(beneficiariesVerified / beneficiariesPlanned)} />
          <KpiCard label="Registros conciliados" value="1,19 mi" icon="Database" />
          <KpiCard label="Duplicidade potencial" value="4,8%" icon="Link2" delta="-1,7 p.p." />
          <KpiCard label="Confiança cadastral" value="91%" icon="ShieldCheck" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Previstos × comprovados por segmento" subtitle="Segmentação social com resolução de duplicidades" className="xl:col-span-3"><BarProgramChart data={segmentData} xKey="nome" aKey="previsto" bKey="comprovado" aLabel="Previsto" bLabel="Comprovado" /></Panel>
          <Panel title="Segmentos incluídos" subtitle="Controle da análise e do relatório" className="xl:col-span-2">
            <div className="space-y-2">{BENEFICIARY_SEGMENTS.map((segment) => <label key={segment.name} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-2.5 cursor-pointer"><input type="checkbox" checked={selectedSegments.includes(segment.name)} onChange={() => setSelectedSegments((prev) => prev.includes(segment.name) ? prev.filter((item) => item !== segment.name) : [...prev, segment.name])} className="accent-[#1584D1]" /><span className="w-2 h-2 rounded-full" style={{ background: segment.color }} /><span className="flex-1 text-[10.5px] text-neutral-300">{segment.name}</span><span className="text-[9.5px] text-neutral-600 tnum">{fmtPct(segment.confidence)}</span></label>)}</div>
          </Panel>
        </div>

        <Panel title="Beneficiários por ativo" subtitle="Previsão, comprovação, confiança e ação recomendada">
          <div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[11px]"><thead><tr className="text-left text-neutral-500 text-[9.5px] uppercase tracking-wide border-b border-white/8"><th className="px-4 py-2 font-medium">Ativo</th><th className="px-2 py-2 font-medium">Previstos</th><th className="px-2 py-2 font-medium">Comprovados</th><th className="px-2 py-2 font-medium">Cobertura</th><th className="px-2 py-2 font-medium">Confiança</th><th className="px-4 py-2 font-medium">Próxima ação</th></tr></thead><tbody>{ASSET_IMPACT.map((item) => <tr key={item.assetId} onClick={() => onOpenAsset(item.assetId)} className="border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.025]"><td className="px-4 py-2.5"><div className="text-neutral-200">{item.asset}</div><div className="text-[9.5px] text-neutral-600">{item.setor} · {item.uf}</div></td><td className="px-2 py-2.5 text-neutral-400 tnum">{fmtCompactNum(item.beneficiariosPrevistos)}</td><td className="px-2 py-2.5 text-neutral-200 tnum">{fmtCompactNum(item.beneficiariosComprovados)}</td><td className="px-2 py-2.5"><div className="w-24"><div className="text-[9px] text-neutral-500 mb-1">{fmtPct(item.beneficiariosPrevistos ? item.beneficiariosComprovados / item.beneficiariosPrevistos : 0)}</div><ProgressBar value={item.beneficiariosPrevistos ? item.beneficiariosComprovados / item.beneficiariosPrevistos : 0} tone={item.beneficiariosComprovados > 0 ? 'teal' : 'amber'} height={4} /></div></td><td className="px-2 py-2.5 text-neutral-400 tnum">{fmtPct(item.confidence)}</td><td className="px-4 py-2.5 text-[10px] text-[#6FD8EC] max-w-[260px]">{item.nextAction}</td></tr>)}</tbody></table></div>
        </Panel>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Cobertura territorial" subtitle="Beneficiários previstos e comprovados por região" className="xl:col-span-3"><BarProgramChart data={BENEFICIARY_TERRITORIES} xKey="territorio" aKey="previsto" bKey="comprovado" aLabel="Previsto" bLabel="Comprovado" /></Panel>
          <Panel title="Agente de Beneficiários" subtitle="Deduplicação, elegibilidade e segmentação" className="xl:col-span-2"><AgentRuntimeCard agent={agents.find((agent) => agent.id === 'beneficiary')!} onRun={() => runAgent('beneficiary')} /><div className="mt-3 rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/7 p-3 text-[10.5px] text-neutral-300"><div className="font-semibold text-[#F2C15A] mb-1">Exceção relevante</div>57.420 registros aparecem em mais de um programa. A consolidação corporativa aplicará uma identidade única, preservando a atribuição por ativo.</div></Panel>
        </div>
      </div>
    );
  }

  function renderMap() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Mapa corporativo de impacto" subtitle="Ativos, beneficiários, áreas de influência, riscos e evidências" className="xl:col-span-3" actions={<div className="flex gap-1"><Pill tone="cyan">Living Atlas</Pill><Pill>IBGE</Pill><Pill>Áreas de influência</Pill></div>}>
            <BrazilMap assets={impactAssets} selectedId={selectedAssetId} onSelectAsset={setSelectedAssetId} selectedUF={selectedUF} onSelectUF={setSelectedUF} height={480} colorBy="status" />
          </Panel>
          <div className="xl:col-span-2 space-y-4">
            <Panel title={selectedAssetImpact.asset} subtitle={`${selectedAssetImpact.setor} · ${selectedAssetImpact.uf}`}>
              <div className="grid grid-cols-2 gap-2 mb-3"><div className="rounded-lg bg-white/[0.025] p-2.5"><div className="text-[9px] text-neutral-600 uppercase">Impacto</div><div className="text-[18px] text-neutral-100 tnum">{selectedAssetImpact.impactoScore}</div></div><div className="rounded-lg bg-white/[0.025] p-2.5"><div className="text-[9px] text-neutral-600 uppercase">Confiança</div><div className="text-[18px] text-neutral-100 tnum">{fmtPct(selectedAssetImpact.confidence)}</div></div><div className="rounded-lg bg-white/[0.025] p-2.5"><div className="text-[9px] text-neutral-600 uppercase">Beneficiários</div><div className="text-[14px] text-neutral-100 tnum">{fmtCompactNum(selectedAssetImpact.beneficiariosComprovados)}</div></div><div className="rounded-lg bg-white/[0.025] p-2.5"><div className="text-[9px] text-neutral-600 uppercase">Capital</div><div className="text-[14px] text-neutral-100 tnum">{fmtCompactBRL(selectedAssetImpact.valor)}</div></div></div>
              <div className="text-[10.5px] text-neutral-400 leading-relaxed">{selectedAssetImpact.keyOutcome}</div>
              <div className="mt-3 rounded-lg border border-[#18B7D6]/20 bg-[#18B7D6]/6 p-2.5 text-[10px] text-[#6FD8EC]">{selectedAssetImpact.nextAction}</div>
              <button onClick={() => onOpenAsset(selectedAssetImpact.assetId)} className="mt-3 w-full rounded-lg border border-white/12 py-2 text-[10.5px] text-neutral-300"><Icon name="ExternalLink" size={10} className="inline mr-1" />Abrir Ativo 360</button>
            </Panel>
            <Panel title="Perfil de impacto" subtitle="Comparação com referência corporativa"><RadarComparison data={selectedRadar} keys={[{ key: 'atual', label: 'Ativo', color: '#18B7D6' }, { key: 'referencia', label: 'Referência', color: '#394B59' }]} /></Panel>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {[
            ['Beneficiários e vulnerabilidade', 'IBGE, Cadastros sociais e pesquisas', 'Users', '#1584D1'],
            ['Área de serviço e acessibilidade', 'Service area e redes funcionais', 'MapPin', '#18B7D6'],
            ['Mudança ambiental e cobertura', 'Living Atlas, imagens e WorldCover', 'Images', '#0FA39D'],
            ['Riscos e resiliência', 'CEMADEN, clima e modelos territoriais', 'ShieldAlert', '#E5A11A'],
          ].map(([title, detail, icon, color]) => <div key={String(title)} className="rounded-xl border border-white/10 bg-[#0E2A40]/55 p-3.5"><Icon name={String(icon)} size={15} style={{ color: String(color) }} /><div className="text-[11px] text-neutral-200 font-medium mt-2">{title}</div><div className="text-[9.5px] text-neutral-600 mt-1">{detail}</div><div className="mt-2"><StatusChip status="normal" size="sm" /></div></div>)}
        </div>
      </div>
    );
  }

  function renderReports() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <KpiCard label="Relatórios ativos" value={String(IMPACT_REPORTS.length)} icon="FileText" />
          <KpiCard label="Indicadores publicáveis" value={String(validados)} icon="BadgeCheck" />
          <KpiCard label="Relatórios no prazo" value="96%" icon="CalendarClock" />
          <KpiCard label="Frameworks reconciliados" value="5" icon="Layers" />
          <KpiCard label="Gate pendente" value="1" icon="User" delta="Green Bond" deltaTone="amber" />
        </div>

        <Panel title="Biblioteca de relatórios" subtitle="Pacotes executivos, regulatórios, financeiros e públicos">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">{IMPACT_REPORTS.map((report) => {
            const progress = reportProgress[report.id] ?? 0;
            return <div key={report.id} className="rounded-xl border border-white/9 bg-white/[0.025] p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] text-neutral-100 font-semibold">{report.title}</div><div className="text-[10px] text-neutral-600 mt-1">{report.audience} · {report.period} · {report.framework}</div></div><Pill tone={report.status === 'pronto' ? 'cyan' : 'neutral'}>{report.status.replace('_', ' ')}</Pill></div><div className="grid grid-cols-3 gap-2 mt-3 text-[9.5px]"><div><div className="text-neutral-600">Indicadores</div><div className="text-neutral-300 mt-0.5">{report.indicators}</div></div><div><div className="text-neutral-600">Ativos</div><div className="text-neutral-300 mt-0.5">{report.assets}</div></div><div><div className="text-neutral-600">Formato</div><div className="text-neutral-300 mt-0.5">{report.format}</div></div></div>{progress > 0 && <div className="mt-3"><div className="flex justify-between text-[9.5px] text-neutral-500 mb-1"><span>{progress >= 100 ? 'Pronto para revisão' : 'Gerando pacote'}</span><span>{progress}%</span></div><ProgressBar value={progress / 100} tone={progress >= 100 ? 'teal' : 'cyan'} height={4} /></div>}<div className="mt-3 flex gap-2"><button onClick={() => generateReport(report.id)} className="flex-1 rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/6 py-1.5 text-[10px] text-[#6FD8EC]"><Icon name={progress > 0 && progress < 100 ? 'Loader2' : 'Play'} size={10} className={cls('inline mr-1', progress > 0 && progress < 100 && 'animate-spin')} />Gerar</button><button className="rounded-lg border border-white/10 px-2.5 text-neutral-400"><Icon name="Download" size={11} /></button></div></div>;
          })}</div>
        </Panel>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Construtor de pacote" subtitle="Selecione indicadores e destino" className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><div className="text-[10px] text-neutral-500 mb-2">Indicadores</div><div className="max-h-64 overflow-y-auto nexo-scroll space-y-1.5">{indicators.map((indicator) => <label key={indicator.id} className="flex items-center gap-2 rounded-lg border border-white/8 p-2 cursor-pointer"><input type="checkbox" checked={selectedReportIndicators.includes(indicator.id)} onChange={() => setSelectedReportIndicators((prev) => prev.includes(indicator.id) ? prev.filter((item) => item !== indicator.id) : [...prev, indicator.id])} className="accent-[#1584D1]" /><div className="flex-1 min-w-0"><div className="text-[10.5px] text-neutral-300 truncate">{indicator.nome}</div><div className="text-[9px] text-neutral-600">{INDICATOR_STATUS[indicator.status].label} · {Math.round(indicator.confidence * 100)}%</div></div></label>)}</div></div>
              <div className="space-y-3"><div><label className="text-[10px] text-neutral-500">Destinatário</label><select className="mt-1 w-full rounded-lg border border-white/10 bg-[#071521] px-3 py-2 text-[11px] text-neutral-300"><option>Conselho Diretor</option><option>Investidores / Financiador</option><option>Ministério gestor</option><option>Painel público</option></select></div><div><label className="text-[10px] text-neutral-500">Framework principal</label><select className="mt-1 w-full rounded-lg border border-white/10 bg-[#071521] px-3 py-2 text-[11px] text-neutral-300">{IMPACT_FRAMEWORKS.map((framework) => <option key={framework.name}>{framework.name}</option>)}</select></div><div className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><div className="text-[10px] text-neutral-500">Conteúdo selecionado</div><div className="text-[18px] text-neutral-100 mt-1">{selectedReportIndicators.length} indicadores</div><div className="text-[9.5px] text-neutral-600 mt-1">Apenas indicadores validados serão publicados externamente.</div></div><button onClick={() => generateReport('custom')} className="w-full rounded-lg bg-[#1584D1] py-2 text-[11px] text-white"><Icon name="Sparkles" size={11} className="inline mr-1.5" />Gerar pacote com IA</button></div>
            </div>
          </Panel>
          <Panel title="Gate de publicação" subtitle="Decisão humana obrigatória" className="xl:col-span-2">
            <div className="space-y-2.5">{indicators.filter((i) => i.status !== 'validado').map((indicator) => <div key={indicator.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><div className="flex justify-between gap-2"><span className="text-[10.5px] text-neutral-300">{indicator.nome}</span><StatusChip status={INDICATOR_STATUS[indicator.status].tone} size="sm" /></div><div className="text-[9.5px] text-neutral-600 mt-1">Confiança {Math.round(indicator.confidence * 100)}% · {indicator.ativo}</div></div>)}</div>
            <button onClick={publishValidated} className="mt-3 w-full rounded-lg border border-[#7C5CBF]/35 bg-[#7C5CBF]/10 py-2 text-[10.5px] text-[#C6B0F0]"><Icon name="User" size={10} className="inline mr-1" />Aprovar publicação validada</button>
            {publicationDecision && <div className="mt-3 rounded-lg border border-[#0FA39D]/25 bg-[#0FA39D]/7 p-3 text-[10px] text-[#56D2C9]">{publicationDecision}</div>}
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Cobertura de frameworks" subtitle="Percentual dos requisitos atendidos" className="xl:col-span-3"><BarProgramChart data={FRAMEWORK_COVERAGE} xKey="framework" aKey="previsto" bKey="realizado" aLabel="Requisito" bLabel="Atendido" unit="%" /></Panel>
          <Panel title="Agente de Relatórios" subtitle="Narrativa, reconciliação e anexos" className="xl:col-span-2"><AgentRuntimeCard agent={agents.find((agent) => agent.id === 'report')!} onRun={() => runAgent('report')} /></Panel>
        </div>
      </div>
    );
  }

  function renderAdmin() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Regras corporativas" subtitle="Materialidade, confiança, dupla contagem, evidências e gates" className="xl:col-span-3">
            <div className="space-y-2.5">{rules.map((rule) => <div key={rule.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-start gap-3"><button onClick={() => setRules((prev) => prev.map((item) => item.id === rule.id ? { ...item, enabled: !item.enabled } : item))} className={cls('mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors', rule.enabled ? 'bg-[#0FA39D]' : 'bg-white/10')}><span className={cls('block w-4 h-4 rounded-full bg-white transition-transform', rule.enabled && 'translate-x-4')} /></button><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[11px] text-neutral-200 font-medium">{rule.name}</div><Pill>{rule.value}</Pill></div><div className="text-[9.5px] text-neutral-600 mt-1">{rule.description}</div><div className="text-[9px] text-neutral-700 mt-1">Escopo: {rule.scope}</div></div></div>)}</div>
          </Panel>
          <Panel title="Parâmetros de decisão" subtitle="Aplicados por agentes e revisores" className="xl:col-span-2">
            <div className="space-y-5"><div><div className="flex justify-between text-[10.5px] mb-2"><span className="text-neutral-400">Confiança mínima</span><span className="text-neutral-100 tnum">{confidenceThreshold}%</span></div><input type="range" min="60" max="100" value={confidenceThreshold} onChange={(event) => setConfidenceThreshold(Number(event.target.value))} className="w-full accent-[#1584D1]" /></div><div><div className="flex justify-between text-[10.5px] mb-2"><span className="text-neutral-400">Materialidade mínima</span><span className="text-neutral-100 tnum">{materialityThreshold}/100</span></div><input type="range" min="40" max="100" value={materialityThreshold} onChange={(event) => setMaterialityThreshold(Number(event.target.value))} className="w-full accent-[#0FA39D]" /></div><div className="rounded-lg border border-[#7C5CBF]/25 bg-[#7C5CBF]/7 p-3 text-[10px] text-neutral-300"><Icon name="User" size={11} className="inline mr-1 text-[#C6B0F0]" />Alterações metodológicas e publicações externas exigem gate humano.</div></div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel title="Frameworks e taxonomias" subtitle="Versionamento e cobertura da carteira" className="xl:col-span-3"><div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-[11px]"><thead><tr className="text-left text-neutral-500 text-[9.5px] uppercase border-b border-white/8"><th className="px-4 py-2 font-medium">Framework</th><th className="px-2 py-2 font-medium">Versão</th><th className="px-2 py-2 font-medium">Cobertura</th><th className="px-2 py-2 font-medium">Indicadores</th><th className="px-4 py-2 font-medium">Status</th></tr></thead><tbody>{IMPACT_FRAMEWORKS.map((framework) => <tr key={framework.name} className="border-b border-white/[0.05]"><td className="px-4 py-2.5 text-neutral-200">{framework.name}</td><td className="px-2 py-2.5 text-neutral-500">{framework.version}</td><td className="px-2 py-2.5"><div className="w-24"><div className="text-[9px] text-neutral-500 mb-1">{framework.coverage}%</div><ProgressBar value={framework.coverage / 100} tone={framework.coverage >= 90 ? 'teal' : 'blue'} height={4} /></div></td><td className="px-2 py-2.5 text-neutral-400 tnum">{framework.indicators}</td><td className="px-4 py-2.5"><Pill tone="cyan">{framework.status}</Pill></td></tr>)}</tbody></table></div></Panel>
          <Panel title="Trilha de auditoria" subtitle="Decisões, validações e publicações" className="xl:col-span-2"><div className="space-y-2.5">{IMPACT_AUDIT.map((entry) => <div key={`${entry.t}-${entry.action}`} className="border-l border-white/12 pl-3"><div className="text-[9.5px] text-neutral-600">{entry.t} · {entry.user}</div><div className="text-[10.5px] text-neutral-300 mt-0.5">{entry.action}</div><div className="text-[9.5px] text-neutral-600 mt-0.5">{entry.detail}</div></div>)}</div></Panel>
        </div>

        <Panel title="Integrações" subtitle="Fontes de verdade, serviços geoespaciais, evidências e publicação">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">{integrations.map((integration) => { const status = INTEGRATION_STATUS[integration.status]; return <div key={integration.id} className="rounded-xl border border-white/9 bg-white/[0.025] p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="text-[11.5px] text-neutral-100 font-semibold">{integration.name}</div><div className="text-[9.5px] text-neutral-600 mt-1">{integration.direction} · {integration.method} · {integration.frequency}</div></div><StatusChip status={status.tone} size="sm" /></div><div className="text-[10px] text-neutral-400 mt-2">{integration.objects}</div><div className="flex items-center justify-between mt-3 text-[9.5px] text-neutral-600"><span>Latência {integration.latency}</span><span>Sync {integration.lastSync}</span></div><div className="flex flex-wrap gap-1 mt-2">{integration.agents.map((agent) => <Pill key={agent}>{agent}</Pill>)}</div><button onClick={() => synchronizeIntegration(integration.id)} className="mt-3 w-full rounded-lg border border-white/10 py-1.5 text-[10px] text-neutral-300"><Icon name="RefreshCw" size={10} className="inline mr-1" />Sincronizar</button></div>; })}</div>
        </Panel>

        <Panel title="Governança dos agentes" subtitle="Execuções auditáveis, fontes autorizadas e alçadas">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{agents.map((agent) => <AgentRuntimeCard key={agent.id} agent={agent} onRun={() => runAgent(agent.id)} />)}</div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4 max-w-[1600px] mx-auto nexo-fade-in">
      <SectionHeader section={section} liveRunning={liveRunning} onToggleLive={toggleLive} onNavigateProduct={onNavigateProduct} />
      {section === 'overview' && renderOverview()}
      {section === 'indicators' && renderIndicators()}
      {section === 'beneficiaries' && renderBeneficiaries()}
      {section === 'map' && renderMap()}
      {section === 'reports' && renderReports()}
      {section === 'admin' && renderAdmin()}
    </div>
  );
}
