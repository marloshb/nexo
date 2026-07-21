import { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import {
  CAPITAL_ADMIN_RULES,
  CAPITAL_AGENT_RUNTIME,
  CAPITAL_ANALYTICS_INSIGHTS,
  CAPITAL_CASHFLOW_FORECAST,
  CAPITAL_LIVE_STEPS,
  CAPITAL_REPORTS,
  CAPITAL_ROLE_MATRIX,
  COVENANTS,
  FUNDING_SOURCES,
  PROGRAM_ENVELOPES,
  type CapitalAgentRuntime,
  type CapitalSection,
  type FundingSource,
} from '@/data/capitalData';
import { ASSETS, type EventItem } from '@/data/mockData';
import { INTEGRATIONS, type Integration } from '@/data/integrationsData';
import type { ProductKey } from '@/data/navConfig';
import { fmtCompactBRL, fmtDate, cls, nowStr } from '@/lib/tokens';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import {
  BarProgramChart,
  DonutChart,
  RadarComparison,
  RiskMatrixChart,
  SingleBarChart,
  TimeSeriesChart,
  TreemapSource,
} from '@/components/shared/Charts';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { EventFeed } from '@/components/shared/EventFeed';

interface CapitalViewProps {
  section: CapitalSection;
  onSectionChange: (section: CapitalSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}

const SECTION_META: Record<CapitalSection, { title: string; subtitle: string; icon: string }> = {
  overview: { title: 'Visão geral', subtitle: 'Funding, disponibilidade, alocação, obrigações e decisões de capital', icon: 'LayoutGrid' },
  sources: { title: 'Fontes de capital', subtitle: 'Passaportes, condições financeiras, elegibilidade e rastreabilidade', icon: 'Landmark' },
  programs: { title: 'Programas e envelopes', subtitle: 'Planejamento, alocação e otimização dos recursos por programa e território', icon: 'Package' },
  covenants: { title: 'Covenants', subtitle: 'Compromissos financeiros, socioambientais e de reporte associados ao funding', icon: 'FileWarning' },
  map: { title: 'Mapa de capital', subtitle: 'Distribuição territorial do funding, ativos financiados e exposição da carteira', icon: 'Map' },
  analytics: { title: 'Analytics', subtitle: 'Liquidez, custo, concentração, utilização e previsão de desembolsos', icon: 'BarChart3' },
  agents: { title: 'Agentes', subtitle: 'Orquestração de funding, alocação, covenants, liquidez e reporte', icon: 'Bot' },
  reports: { title: 'Relatórios', subtitle: 'Relatórios executivos, regulatórios, financeiros e para financiadores', icon: 'FileText' },
  integrations: { title: 'Integrações', subtitle: 'Conectores, sincronização, linhagem e dependências do Nexo Capital', icon: 'Plug' },
  admin: { title: 'Administração', subtitle: 'Regras, alçadas, taxonomias, limites e governança do capital', icon: 'Settings' },
};

const AGENT_STATUS: Record<CapitalAgentRuntime['status'], { label: string; color: string }> = {
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

function SectionHeader({ section, liveRunning, onStartLive }: { section: CapitalSection; liveRunning: boolean; onStartLive: () => void }) {
  const meta = SECTION_META[section];
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-[#087C78]/15 border border-[#0FA39D]/25 flex items-center justify-center shrink-0">
          <Icon name={meta.icon} size={18} className="text-[#6DD7D1]" />
        </span>
        <div>
          <div className="flex items-center gap-2 text-[10.5px] text-neutral-500 mb-0.5"><span>Nexo Capital</span><Icon name="ChevronRight" size={10} /><span>{meta.title}</span></div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">{meta.title}</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-400">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-2 w-2 rounded-full bg-[#0FA39D] opacity-40 nexo-pulse-ring" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#0FA39D]" /></span>
          Funding sincronizado · {nowStr()}
        </span>
        <button
          onClick={onStartLive}
          disabled={liveRunning}
          className={cls('inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11.5px] font-medium border transition-colors', liveRunning ? 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC] cursor-wait' : 'border-[#0FA39D]/35 bg-[#0FA39D]/12 text-[#6DD7D1] hover:bg-[#0FA39D]/20')}
        >
          <Icon name={liveRunning ? 'Loader2' : 'Play'} size={13} className={liveRunning ? 'animate-spin' : ''} />
          {liveRunning ? 'Ciclo de capital ao vivo' : 'Executar ciclo ao vivo'}
        </button>
      </div>
    </div>
  );
}

function ProductLink({ icon, label, onClick, tone = 'teal' }: { icon: string; label: string; onClick: () => void; tone?: 'teal' | 'blue' | 'neutral' }) {
  const classes = tone === 'blue'
    ? 'border-[#1584D1]/30 bg-[#1584D1]/10 text-[#5FB4E8] hover:bg-[#1584D1]/18'
    : tone === 'neutral'
      ? 'border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.07]'
      : 'border-[#0FA39D]/30 bg-[#0FA39D]/10 text-[#6DD7D1] hover:bg-[#0FA39D]/18';
  return <button onClick={onClick} className={cls('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors', classes)}><Icon name={icon} size={12} />{label}<Icon name="ArrowUpRight" size={11} /></button>;
}

function LiveAgentRow({ agent, onRun }: { agent: CapitalAgentRuntime; onRun: () => void }) {
  const meta = AGENT_STATUS[agent.status];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#18B7D6]/10 border border-[#18B7D6]/20 flex items-center justify-center shrink-0"><Icon name={agent.icon} size={15} className="text-[#6FD8EC]" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[12px] font-medium text-neutral-200 truncate">{agent.name}</div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: meta.color }}><span className={cls('w-1.5 h-1.5 rounded-full', agent.status === 'running' && 'nexo-pulse-ring')} style={{ background: meta.color }} />{meta.label}</span>
          </div>
          <div className="text-[10.5px] text-neutral-500 mt-0.5 truncate">{agent.entity}</div>
          <div className="text-[11.5px] text-neutral-300 mt-1.5 leading-snug">{agent.step}</div>
          <div className="flex items-center gap-2 mt-2"><div className="flex-1"><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'amber' : agent.status === 'done' ? 'teal' : 'cyan'} height={4} /></div><span className="font-mono-id text-[10px] text-neutral-500 tnum">{agent.progress}%</span></div>
          <div className="flex items-center justify-between gap-2 mt-2"><span className="text-[10.5px] text-neutral-500">Confiança {agent.confidence}% · {agent.impact}</span><button onClick={onRun} disabled={agent.status === 'running'} className="text-[10.5px] text-[#6DD7D1] disabled:opacity-40">Executar</button></div>
        </div>
      </div>
    </div>
  );
}

function FundingPassport({ source, onClose, onOpenAsset }: { source: FundingSource | null; onClose: () => void; onOpenAsset: (id: string) => void }) {
  const relatedAssets = source ? ASSETS.filter((a) => source.programasElegiveis.includes(a.program) || a.fundingSource.toLowerCase().includes(source.instituicao.toLowerCase().split(' ')[0].toLowerCase())) : [];
  return (
    <Sheet open={!!source} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-xl overflow-y-auto nexo-scroll">
        {source && <>
          <SheetHeader><SheetTitle className="font-display text-neutral-50 pr-6">{source.nome}</SheetTitle><SheetDescription className="text-neutral-400">Passaporte do capital · {source.id}</SheetDescription></SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2"><StatusChip status={source.status} size="sm" /><Pill tone="blue">{source.tipoInstrumento}</Pill><Pill tone="cyan">{source.moeda}</Pill></div>
            <div className="grid grid-cols-2 gap-2.5 text-[12px]">
              {[['Instituição', source.instituicao], ['Valor', fmtCompactBRL(source.valor)], ['Custo', source.custo], ['Indexador', source.indexador], ['Prazo', `${source.prazoAnos} anos`], ['Carência', `${source.carenciaAnos} anos`], ['Vigência inicial', fmtDate(source.vigenciaInicio)], ['Vigência final', fmtDate(source.vigenciaFim)]].map(([label, value]) => <div key={label} className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-neutral-500 text-[10.5px]">{label}</div><div className="text-neutral-200 mt-0.5">{value}</div></div>)}
            </div>
            <div><div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Destinação e elegibilidade</div><div className="flex flex-wrap gap-1.5">{source.programasElegiveis.map((p) => <Pill key={p}>{p}</Pill>)}</div><div className="text-[11.5px] text-neutral-400 mt-2">Setores: {source.setores.join(', ')} · Territórios: {source.territorios.join(', ')}</div><div className="text-[11.5px] text-neutral-400 mt-1">Público: {source.publicoBeneficiario}</div>{source.atividadesExcluidas.length > 0 && <div className="rounded-md border border-[#D14A55]/25 bg-[#D14A55]/8 p-2.5 mt-2 text-[11px] text-[#F08B94]">Exclusões: {source.atividadesExcluidas.join('; ')}</div>}</div>
            <div><div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Sustentabilidade e reporte</div><div className="text-[12px] text-neutral-300">{source.taxonomia}</div><div className="flex flex-wrap gap-1.5 mt-1.5">{source.categoriasVerdesSociais.map((c) => <Pill key={c} tone="cyan">{c}</Pill>)}</div><div className="text-[11.5px] text-neutral-400 mt-2">Meta: {source.metasSustentaveis}</div><div className="text-[11px] text-neutral-500 mt-1">Reporte: {source.frequenciaReporte}</div></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><div className="flex justify-between text-[12px] mb-1.5"><span className="text-neutral-400">Utilização</span><span className="text-neutral-200 tnum">{fmtCompactBRL(source.valorUtilizado)} de {fmtCompactBRL(source.valorAlocado)}</span></div><ProgressBar value={source.valorUtilizado / source.valorAlocado} tone={source.status === 'critico' ? 'red' : source.status === 'atencao' ? 'amber' : 'teal'} /><div className="flex justify-between text-[10.5px] text-neutral-500 mt-1.5"><span>Saldo alocado</span><span>{fmtCompactBRL(source.valorAlocado - source.valorUtilizado)}</span></div></div>
            <div><div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Governança</div><div className="text-[12px] text-neutral-300">{source.unidadeResponsavel}</div><div className="text-[11.5px] text-neutral-400 mt-1">Alçada: {source.alcadas}</div><div className="text-[11px] text-neutral-500 mt-1">Revisão: {source.periodicidadeRevisao}</div></div>
            <div><div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Rastreabilidade até ativos</div>{relatedAssets.length ? <div className="space-y-1.5">{relatedAssets.map((a) => <button key={a.id} onClick={() => onOpenAsset(a.id)} className="w-full flex items-center justify-between rounded-md border border-white/8 bg-white/[0.025] px-2.5 py-2 text-left hover:bg-white/[0.05]"><span><span className="block text-[11.5px] text-neutral-200">{a.name}</span><span className="block text-[10px] text-neutral-500">{a.city} · {a.uf} · {a.stage}</span></span><Icon name="ArrowRight" size={12} className="text-neutral-500" /></button>)}</div> : <div className="text-[11.5px] text-neutral-500">Nenhum ativo diretamente reconciliado nesta demonstração.</div>}</div>
          </div>
        </>}
      </SheetContent>
    </Sheet>
  );
}

function NewFundingSheet({ open, onClose, onCreated, onPushEvent }: { open: boolean; onClose: () => void; onCreated: (source: FundingSource) => void; onPushEvent: CapitalViewProps['onPushEvent'] }) {
  const [form, setForm] = useState({ nome: '', instituicao: '', valor: '250000000', custo: 'IPCA + 5,2% a.a.', setor: 'Saneamento', moeda: 'BRL' });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('Preencha os dados e execute a validação assistida.');
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  function validate() {
    if (!form.nome.trim() || !form.instituicao.trim()) return;
    setRunning(true); setProgress(4); setStep('Agente de Funding consultando regras e disponibilidade...');
    const steps = [
      [22, 'Agente de Elegibilidade verificando destinação e atividades excluídas...'],
      [46, 'Agente de Funding normalizando custo, indexador e cronograma...'],
      [68, 'Agente de Covenants extraindo compromissos e requisitos de reporte...'],
      [84, 'Agente de Alocação identificando programas e territórios aderentes...'],
      [100, 'Validação concluída. Passaporte do capital preparado para aprovação humana.'],
    ] as const;
    let i = 0;
    timerRef.current = window.setInterval(() => {
      const [p, s] = steps[i]; setProgress(p); setStep(s); onPushEvent(`Nova fonte: ${s}`, p === 100 ? 'success' : 'info'); i += 1;
      if (i >= steps.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setRunning(false);
        const value = Math.max(1, Number(form.valor) || 250_000_000);
        onCreated({
          id: `FND-${String(Date.now()).slice(-3)}`, nome: form.nome, instituicao: form.instituicao, tipoInstrumento: 'Nova fonte em aprovação', moeda: form.moeda,
          valor: value, custo: form.custo, indexador: form.custo.split(' ')[0] || '—', prazoAnos: 15, carenciaAnos: 3,
          vigenciaInicio: '2026-08-01', vigenciaFim: '2041-08-01', programasElegiveis: [`Programa de ${form.setor}`], setores: [form.setor], territorios: ['Nacional'],
          publicoBeneficiario: 'A definir no comitê de alocação', atividadesExcluidas: ['Atividades sem aderência à política de risco'], taxonomia: 'Em classificação', categoriasVerdesSociais: ['Em validação'],
          metasSustentaveis: 'Meta a validar', frequenciaReporte: 'Trimestral', unidadeResponsavel: 'Nexo Capital — Novas Captações', responsaveis: ['Gestor de Funding'],
          alcadas: 'Comitê de Funding', periodicidadeRevisao: 'Trimestral', valorAlocado: 0, valorUtilizado: 0, status: 'atencao',
        });
      }
    }, 720);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-xl overflow-y-auto nexo-scroll">
        <SheetHeader><SheetTitle className="text-neutral-50">Nova fonte de capital</SheetTitle><SheetDescription className="text-neutral-400">Cadastro e validação assistida por agentes</SheetDescription></SheetHeader>
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="sm:col-span-2 text-[11px] text-neutral-400">Nome da fonte<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Linha CAF Cidades Resilientes" className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-100 outline-none focus:border-[#0FA39D]/60" /></label>
            <label className="text-[11px] text-neutral-400">Instituição<input value={form.instituicao} onChange={(e) => setForm({ ...form, instituicao: e.target.value })} placeholder="Instituição provedora" className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-100 outline-none" /></label>
            <label className="text-[11px] text-neutral-400">Valor<input value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} type="number" className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-100 outline-none" /></label>
            <label className="text-[11px] text-neutral-400">Moeda<select value={form.moeda} onChange={(e) => setForm({ ...form, moeda: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#0E2A40] px-3 py-2 text-[12px] text-neutral-100"><option>BRL</option><option>USD</option><option>EUR</option></select></label>
            <label className="text-[11px] text-neutral-400">Setor<select value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#0E2A40] px-3 py-2 text-[12px] text-neutral-100"><option>Saneamento</option><option>Habitação</option><option>Mobilidade</option><option>Energia</option><option>Adaptação climática</option></select></label>
            <label className="sm:col-span-2 text-[11px] text-neutral-400">Custo / indexador<input value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-100 outline-none" /></label>
          </div>
          <div className="rounded-lg border border-[#18B7D6]/20 bg-[#18B7D6]/7 p-3"><div className="flex items-center justify-between text-[11.5px]"><span className="text-[#6FD8EC] flex items-center gap-1.5"><Icon name={running ? 'Loader2' : 'Bot'} size={13} className={running ? 'animate-spin' : ''} />Validação multiagente</span><span className="text-neutral-400 tnum">{progress}%</span></div><div className="mt-2"><ProgressBar value={progress / 100} tone="cyan" height={5} /></div><p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">{step}</p></div>
          <button onClick={validate} disabled={running || !form.nome.trim() || !form.instituicao.trim()} className="w-full rounded-md bg-[#087C78] px-3 py-2.5 text-[12px] font-medium text-white hover:bg-[#0A918B] disabled:opacity-40">{running ? 'Agentes analisando...' : progress === 100 ? 'Validar novamente' : 'Validar e criar passaporte'}</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CapitalView({ section, onSectionChange, onOpenAsset, onNavigateProduct, events, onPushEvent }: CapitalViewProps) {
  const [sources, setSources] = useState<FundingSource[]>(FUNDING_SOURCES);
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(null);
  const [newSourceOpen, setNewSourceOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceStatus, setSourceStatus] = useState<'Todos' | FundingSource['status']>('Todos');
  const [liveAgents, setLiveAgents] = useState<CapitalAgentRuntime[]>(CAPITAL_AGENT_RUNTIME);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const liveRef = useRef<number | null>(null);

  const [programSelected, setProgramSelected] = useState(PROGRAM_ENVELOPES[0].programa);
  const [simImpact, setSimImpact] = useState(78);
  const [simRisk, setSimRisk] = useState(66);
  const [simExecution, setSimExecution] = useState(72);
  const [simClimate, setSimClimate] = useState(61);
  const [simProgress, setSimProgress] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simApplied, setSimApplied] = useState(false);

  const [covenantState, setCovenantState] = useState<Record<string, 'open' | 'running' | 'resolved'>>({});
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState(ASSETS[0]?.id ?? '');
  const [mapColorBy, setMapColorBy] = useState<'status' | 'region'>('status');
  const [reportState, setReportState] = useState<Record<string, number>>({});
  const [integrationState, setIntegrationState] = useState<Record<string, Integration['status']>>({});
  const [ruleState, setRuleState] = useState<Record<string, boolean>>(Object.fromEntries(CAPITAL_ADMIN_RULES.map((r) => [r.id, true])));

  useEffect(() => () => { if (liveRef.current) window.clearInterval(liveRef.current); }, []);

  const totalCapital = sources.reduce((s, f) => s + f.valor, 0);
  const totalUsed = sources.reduce((s, f) => s + f.valorUtilizado, 0);
  const totalAvailable = totalCapital - totalUsed;
  const custoMedioPonderado = 6.4;

  const treemapData = sources.map((f) => ({ name: f.instituicao, value: Math.round(f.valor / 1_000_000) }));
  const envelopeBarData = PROGRAM_ENVELOPES.map((p) => ({ programa: p.programa.replace('Programa ', '').replace('Nacional de ', ''), envelope: p.envelope, alocado: p.alocado }));
  const statusDonut = [
    { name: 'Normal', value: sources.filter((f) => f.status === 'normal').length, fill: '#0FA39D' },
    { name: 'Atenção', value: sources.filter((f) => f.status === 'atencao').length, fill: '#E5A11A' },
    { name: 'Crítico', value: sources.filter((f) => f.status === 'critico').length, fill: '#D14A55' },
  ];
  const concentrationData = sources.map((f) => ({ fonte: f.instituicao.replace('Tesouro Nacional (OGU)', 'OGU').replace('Recursos Próprios CAIXA', 'Próprios'), participacao: Math.round((f.valor / totalCapital) * 1000) / 10 }));
  const costRiskData = sources.map((f, i) => ({ name: f.instituicao, probabilidade: Math.min(5, 1 + i % 5), impacto: f.status === 'critico' ? 5 : f.status === 'atencao' ? 4 : Math.max(1, 3 - (i % 2)), categoria: f.tipoInstrumento }));
  const radarData = [
    { dimensao: 'Custo', atual: 72, otimizado: 84 }, { dimensao: 'Liquidez', atual: 68, otimizado: 86 }, { dimensao: 'Impacto', atual: 81, otimizado: 92 },
    { dimensao: 'Risco', atual: 63, otimizado: 80 }, { dimensao: 'Execução', atual: 69, otimizado: 85 }, { dimensao: 'Diversificação', atual: 57, otimizado: 76 },
  ];

  const filteredSources = sources.filter((f) => {
    const matchSearch = `${f.nome} ${f.instituicao} ${f.setores.join(' ')}`.toLowerCase().includes(sourceSearch.toLowerCase());
    const matchStatus = sourceStatus === 'Todos' || f.status === sourceStatus;
    return matchSearch && matchStatus;
  });
  const filteredAssets = selectedUF ? ASSETS.filter((a) => a.uf === selectedUF) : ASSETS;
  const selectedAsset = ASSETS.find((a) => a.id === selectedAssetId) ?? ASSETS[0];
  const currentProgram = PROGRAM_ENVELOPES.find((p) => p.programa === programSelected) ?? PROGRAM_ENVELOPES[0];
  const simScore = Math.round(simImpact * 0.32 + (100 - simRisk) * 0.18 + simExecution * 0.3 + simClimate * 0.2);
  const simReallocation = Math.round((simImpact + simExecution + simClimate - simRisk) * 3.2);

  function startLiveCycle() {
    if (liveRunning) return;
    if (liveRef.current) window.clearInterval(liveRef.current);
    setLiveAgents(CAPITAL_AGENT_RUNTIME.map((a) => ({ ...a, status: a.status === 'alert' || a.status === 'waiting' ? a.status : 'idle', progress: a.status === 'alert' || a.status === 'waiting' ? a.progress : 0 })));
    setLiveStep(0); setLiveRunning(true);
    let idx = 0;
    liveRef.current = window.setInterval(() => {
      const step = CAPITAL_LIVE_STEPS[idx];
      setLiveAgents((prev) => prev.map((a) => a.id === step.agentId ? { ...a, progress: step.progress, status: step.status, step: step.step, lastRun: 'Agora' } : a));
      onPushEvent(step.text, step.type);
      setLiveStep(idx + 1);
      idx += 1;
      if (idx >= CAPITAL_LIVE_STEPS.length) { if (liveRef.current) window.clearInterval(liveRef.current); setLiveRunning(false); }
    }, 1250);
  }

  function runSingleAgent(id: string) {
    setLiveAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'running', progress: 12, step: 'Coletando dados e executando regras especializadas...' } : a));
    onPushEvent(`${liveAgents.find((a) => a.id === id)?.name ?? 'Agente'} iniciado manualmente.`, 'info');
    window.setTimeout(() => setLiveAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'done', progress: 100, step: 'Análise concluída; recomendação atualizada e registrada.', lastRun: 'Agora' } : a)), 1800);
  }

  function runProgramSimulation() {
    if (simRunning) return;
    setSimRunning(true); setSimProgress(5); setSimApplied(false);
    const timer = window.setInterval(() => setSimProgress((p) => {
      const n = Math.min(100, p + 13);
      if (n >= 100) { window.clearInterval(timer); setSimRunning(false); onPushEvent(`Agente de Alocação concluiu cenário com score ${simScore}/100.`, 'success'); }
      return n;
    }), 280);
  }

  function verifyCovenant(id: string) {
    setCovenantState((prev) => ({ ...prev, [id]: 'running' }));
    const cov = COVENANTS.find((c) => c.id === id);
    onPushEvent(`Agente de Covenants iniciou verificação de ${id}.`, 'info');
    window.setTimeout(() => { setCovenantState((prev) => ({ ...prev, [id]: 'resolved' })); onPushEvent(`${id}: evidências reconciliadas e despacho preparado para revisão.`, cov?.status === 'critico' ? 'warning' : 'success'); }, 2100);
  }

  function generateReport(id: string) {
    if (reportState[id] && reportState[id] < 100) return;
    setReportState((p) => ({ ...p, [id]: 8 }));
    const timer = window.setInterval(() => setReportState((prev) => {
      const n = Math.min(100, (prev[id] ?? 0) + 17);
      if (n >= 100) { window.clearInterval(timer); onPushEvent(`${CAPITAL_REPORTS.find((r) => r.id === id)?.name} gerado com sucesso.`, 'success'); }
      return { ...prev, [id]: n };
    }), 260);
  }

  function syncIntegration(id: string) {
    setIntegrationState((s) => ({ ...s, [id]: 'degradada' }));
    onPushEvent(`Sincronização manual iniciada para ${INTEGRATIONS.find((i) => i.id === id)?.origem}.`, 'info');
    window.setTimeout(() => { setIntegrationState((s) => ({ ...s, [id]: 'ativa' })); onPushEvent(`Integração ${INTEGRATIONS.find((i) => i.id === id)?.origem} sincronizada.`, 'success'); }, 1600);
  }

  return (
    <div className="p-5 space-y-4 max-w-[1600px] mx-auto nexo-fade-in">
      <SectionHeader section={section} liveRunning={liveRunning} onStartLive={startLiveCycle} />

      {section === 'overview' && <>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Capital captado" value={fmtCompactBRL(totalCapital)} icon="Landmark" delta="+R$ 430 mi" />
          <KpiCard label="Capital utilizado" value={fmtCompactBRL(totalUsed)} icon="Banknote" hint={`${Math.round((totalUsed / totalCapital) * 100)}% do total`} />
          <KpiCard label="Saldo disponível" value={fmtCompactBRL(totalAvailable)} icon="DollarSign" deltaTone="teal" />
          <KpiCard label="Custo médio ponderado" value={`${custoMedioPonderado.toFixed(1)}% a.a.`} icon="Calculator" delta="-0,3 p.p." />
          <KpiCard label="Covenants críticos" value={String(COVENANTS.filter((c) => c.status === 'critico').length)} icon="FileWarning" delta="US$ 52 mi expostos" deltaTone="red" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-5"><Panel title="Capital por fonte" subtitle="Participação equivalente · R$ milhões" actions={<button onClick={() => onSectionChange('sources')} className="text-[11px] text-[#6DD7D1]">Detalhar fontes →</button>}><TreemapSource data={treemapData} /></Panel></div>
          <div className="xl:col-span-4"><Panel title="Utilização por programa" subtitle="Envelope × alocado · R$ milhões" actions={<button onClick={() => onSectionChange('programs')} className="text-[11px] text-[#6DD7D1]">Otimizar →</button>}><BarProgramChart data={envelopeBarData} aKey="envelope" bKey="alocado" aLabel="Envelope" bLabel="Alocado" /></Panel></div>
          <div className="xl:col-span-3"><Panel title="Saúde das fontes" subtitle="Situação corrente"><DonutChart data={statusDonut} /></Panel></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7">
            <Panel title="Decisões prioritárias de capital" subtitle="Exposição, prazo e ação recomendada pelos agentes" actions={<button onClick={() => onSectionChange('covenants')} className="text-[11px] text-[#6DD7D1]">Abrir agenda completa →</button>}>
              <div className="space-y-2.5">
                {CAPITAL_ANALYTICS_INSIGHTS.slice(0, 3).map((i, idx) => <button key={i.id} onClick={() => onSectionChange(i.target)} className="w-full text-left rounded-lg border border-white/8 bg-white/[0.025] p-3 hover:bg-white/[0.05]"><div className="flex items-start gap-3"><span className={cls('w-7 h-7 rounded-md flex items-center justify-center shrink-0', idx === 0 ? 'bg-[#E5A11A]/12 text-[#F0B94A]' : 'bg-[#18B7D6]/10 text-[#6FD8EC]')}><Icon name={idx === 0 ? 'AlertTriangle' : 'Sparkles'} size={13} /></span><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[12px] font-medium text-neutral-200">{i.title}</span><span className="text-[10.5px] text-neutral-500">Confiança {i.confidence}%</span></div><p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{i.detail}</p><div className="text-[10.5px] text-[#6DD7D1] mt-1.5">{i.impact}</div></div></div></button>)}
              </div>
            </Panel>
          </div>
          <div className="xl:col-span-5">
            <Panel title="Orquestração ao vivo" subtitle={`${liveStep}/${CAPITAL_LIVE_STEPS.length} eventos do ciclo`} actions={<button onClick={() => onSectionChange('agents')} className="text-[11px] text-[#6DD7D1]">Central de agentes →</button>}>
              <div className="space-y-2">{liveAgents.slice(0, 3).map((a) => <LiveAgentRow key={a.id} agent={a} onRun={() => runSingleAgent(a.id)} />)}</div>
            </Panel>
          </div>
        </div>

        <Panel title="Integração do capital ao ciclo de vida" subtitle="O funding é preservado até o ativo e o resultado final">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {[
              ['Carteira', 'Oportunidades aderentes', 'carteira' as ProductKey, 'Briefcase'], ['Estrutura', 'Modelagem e cenários', 'estrutura' as ProductKey, 'Layers'], ['Contrata', 'Elegibilidade e risco', 'contrata' as ProductKey, 'ClipboardCheck'], ['Entrega', 'Desembolso e execução', 'entrega' as ProductKey, 'HardHat'], ['Impacto', 'Reporte e evidências', 'impacto' as ProductKey, 'Sprout'],
            ].map(([name, desc, target, icon]) => <button key={name} onClick={() => onNavigateProduct(target as ProductKey)} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 text-left hover:bg-white/[0.055]"><Icon name={icon} size={15} className="text-[#6DD7D1]" /><div className="text-[12px] font-medium text-neutral-200 mt-2">Nexo {name}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{desc}</div></button>)}
          </div>
        </Panel>
      </>}

      {section === 'sources' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Fontes ativas" value={String(sources.length)} icon="Landmark" /><KpiCard label="Multilaterais" value={fmtCompactBRL(sources.filter((f) => f.tipoInstrumento.includes('multilateral')).reduce((s, f) => s + f.valor, 0))} icon="Building" /><KpiCard label="Sustentáveis" value={fmtCompactBRL(sources.filter((f) => f.taxonomia !== 'Não aplicável').reduce((s, f) => s + f.valor, 0))} icon="Sprout" /><KpiCard label="Concentração máxima" value={`${Math.max(...sources.map((f) => (f.valor / totalCapital) * 100)).toFixed(1)}%`} icon="Layers" hint="FGTS" /><KpiCard label="Em atenção/crítico" value={String(sources.filter((f) => f.status !== 'normal').length)} icon="AlertTriangle" deltaTone="amber" /></div>
        <Panel title="Inventário de fontes" subtitle={`${filteredSources.length} fontes no contexto`} actions={<button onClick={() => setNewSourceOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-[#087C78] px-3 py-1.5 text-[11.5px] font-medium text-white hover:bg-[#0A918B]"><Icon name="Plus" size={12} />Nova fonte</button>}>
          <div className="flex flex-wrap gap-2 mb-3"><div className="relative flex-1 min-w-[220px]"><Icon name="Search" size={13} className="absolute left-2.5 top-2.5 text-neutral-500" /><input value={sourceSearch} onChange={(e) => setSourceSearch(e.target.value)} placeholder="Buscar fonte, instituição ou setor" className="w-full rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-3 py-2 text-[11.5px] text-neutral-200 outline-none" /></div>{(['Todos', 'normal', 'atencao', 'critico'] as const).map((s) => <button key={s} onClick={() => setSourceStatus(s)} className={cls('rounded-full border px-3 py-1.5 text-[10.5px]', sourceStatus === s ? 'border-[#0FA39D]/50 bg-[#0FA39D]/15 text-[#6DD7D1]' : 'border-white/10 text-neutral-400')}>{s === 'Todos' ? 'Todos' : s === 'normal' ? 'Normal' : s === 'atencao' ? 'Atenção' : 'Crítico'}</button>)}</div>
          <div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pl-4 pr-3">Fonte</th><th className="py-2 pr-3">Instrumento</th><th className="py-2 pr-3">Valor</th><th className="py-2 pr-3">Custo</th><th className="py-2 pr-3">Utilização</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-4"></th></tr></thead><tbody>{filteredSources.map((f) => <tr key={f.id} className="border-b border-white/[0.05] hover:bg-white/[0.025]"><td className="py-2.5 pl-4 pr-3"><div className="text-neutral-200 font-medium">{f.nome}</div><div className="text-[10px] text-neutral-500 mt-0.5">{f.id} · {f.instituicao}</div></td><td className="py-2.5 pr-3 text-neutral-400">{f.tipoInstrumento}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{fmtCompactBRL(f.valor)}</td><td className="py-2.5 pr-3 text-neutral-400">{f.custo}</td><td className="py-2.5 pr-3 min-w-[140px]"><div className="flex justify-between text-[10px] text-neutral-500 mb-1"><span>{Math.round((f.valorUtilizado / Math.max(1, f.valorAlocado)) * 100)}%</span><span>{fmtCompactBRL(f.valorUtilizado)}</span></div><ProgressBar value={f.valorUtilizado / Math.max(1, f.valorAlocado)} tone={f.status === 'critico' ? 'red' : f.status === 'atencao' ? 'amber' : 'teal'} height={4} /></td><td className="py-2.5 pr-3"><StatusChip status={f.status} size="sm" /></td><td className="py-2.5 pr-4 text-right"><button onClick={() => setSelectedSource(f)} className="text-[#6DD7D1]">Passaporte →</button></td></tr>)}</tbody></table></div>
        </Panel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Concentração por fonte" subtitle="Participação percentual"><SingleBarChart data={concentrationData} xKey="fonte" yKey="participacao" color="#0FA39D" /></Panel><Panel title="Agente de Elegibilidade" subtitle="Validação automática antes da alocação"><LiveAgentRow agent={liveAgents.find((a) => a.id === 'AG-CAP-04')!} onRun={() => runSingleAgent('AG-CAP-04')} /></Panel></div>
      </>}

      {section === 'programs' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Programas" value={String(PROGRAM_ENVELOPES.length)} icon="Package" /><KpiCard label="Envelope total" value={`R$ ${PROGRAM_ENVELOPES.reduce((s, p) => s + p.envelope, 0).toLocaleString('pt-BR')} mi`} icon="Landmark" /><KpiCard label="Alocado" value={`R$ ${PROGRAM_ENVELOPES.reduce((s, p) => s + p.alocado, 0).toLocaleString('pt-BR')} mi`} icon="Banknote" /><KpiCard label="Saldo programático" value={`R$ ${PROGRAM_ENVELOPES.reduce((s, p) => s + p.envelope - p.alocado, 0).toLocaleString('pt-BR')} mi`} icon="DollarSign" /><KpiCard label="Subutilizados" value={String(PROGRAM_ENVELOPES.filter((p) => p.alocado / p.envelope < 0.5).length)} icon="AlertTriangle" deltaTone="amber" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7"><Panel title="Envelopes programáticos" subtitle="Planejado × alocado por programa"><BarProgramChart data={envelopeBarData} aKey="envelope" bKey="alocado" aLabel="Envelope" bLabel="Alocado" /></Panel></div>
          <div className="xl:col-span-5"><Panel title="Simulador de alocação" subtitle="Otimização assistida por agentes">
            <div className="space-y-3">
              <label className="text-[11px] text-neutral-400">Programa<select value={programSelected} onChange={(e) => setProgramSelected(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-[#0E2A40] px-3 py-2 text-[11.5px] text-neutral-200">{PROGRAM_ENVELOPES.map((p) => <option key={p.programa}>{p.programa}</option>)}</select></label>
              {[["Peso de impacto", simImpact, setSimImpact], ["Aversão a risco", simRisk, setSimRisk], ["Capacidade de execução", simExecution, setSimExecution], ["Adaptação climática", simClimate, setSimClimate]].map(([label, value, setter]) => <div key={String(label)}><div className="flex justify-between text-[11px] mb-1.5"><span className="text-neutral-400">{String(label)}</span><span className="text-[#6DD7D1]">{Number(value)}%</span></div><input type="range" min={0} max={100} value={Number(value)} onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))} className="w-full accent-[#0FA39D]" /></div>)}
              <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><div className="flex justify-between"><span className="text-[11px] text-neutral-500">Score do cenário</span><span className="text-[18px] font-semibold text-neutral-100">{simScore}/100</span></div><div className="grid grid-cols-2 gap-2 mt-2 text-[10.5px]"><div className="rounded bg-white/[0.04] p-2"><span className="text-neutral-500">Saldo atual</span><div className="text-neutral-200 mt-0.5">R$ {(currentProgram.envelope - currentProgram.alocado).toLocaleString('pt-BR')} mi</div></div><div className="rounded bg-white/[0.04] p-2"><span className="text-neutral-500">Realocação sugerida</span><div className="text-[#6DD7D1] mt-0.5">R$ {Math.max(0, simReallocation).toLocaleString('pt-BR')} mi</div></div></div>{simProgress > 0 && <div className="mt-3"><ProgressBar value={simProgress / 100} tone="teal" height={5} /><div className="text-[10px] text-neutral-500 mt-1">{simRunning ? 'Agente de Alocação executando cenários...' : 'Simulação concluída e pronta para decisão humana.'}</div></div>}</div>
              <div className="flex gap-2"><button onClick={runProgramSimulation} disabled={simRunning} className="flex-1 rounded-md bg-[#087C78] px-3 py-2 text-[11.5px] text-white disabled:opacity-50">{simRunning ? 'Simulando...' : 'Executar otimização'}</button><button onClick={() => { setSimApplied(true); onPushEvent(`Cenário de ${programSelected} encaminhado ao Comitê de Alocação.`, 'success'); }} disabled={simProgress < 100 || simApplied} className="flex-1 rounded-md border border-[#0FA39D]/30 bg-[#0FA39D]/10 px-3 py-2 text-[11.5px] text-[#6DD7D1] disabled:opacity-40">{simApplied ? 'Encaminhado' : 'Submeter ao comitê'}</button></div>
            </div>
          </Panel></div>
        </div>
        <Panel title="Carteira de programas" subtitle="Alocação, saldo, território e conexões operacionais"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{PROGRAM_ENVELOPES.map((p) => { const utilization = p.alocado / p.envelope; return <button key={p.programa} onClick={() => setProgramSelected(p.programa)} className={cls('rounded-lg border p-3 text-left transition-colors', programSelected === p.programa ? 'border-[#0FA39D]/45 bg-[#0FA39D]/8' : 'border-white/8 bg-white/[0.025] hover:bg-white/[0.05]')}><div className="flex justify-between gap-2"><div className="text-[12px] font-medium text-neutral-200 leading-snug">{p.programa}</div><Pill>{p.territorio}</Pill></div><div className="flex justify-between text-[10.5px] text-neutral-500 mt-3"><span>Alocado R$ {p.alocado.toLocaleString('pt-BR')} mi</span><span>{Math.round(utilization * 100)}%</span></div><div className="mt-1"><ProgressBar value={utilization} tone={utilization > 0.9 ? 'amber' : utilization < 0.25 ? 'cyan' : 'teal'} height={5} /></div><div className="text-[10.5px] text-neutral-500 mt-2">Saldo: R$ {(p.envelope - p.alocado).toLocaleString('pt-BR')} mi</div></button>; })}</div></Panel>
        <div className="flex flex-wrap gap-2"><ProductLink icon="Briefcase" label="Ver oportunidades no Nexo Carteira" onClick={() => onNavigateProduct('carteira')} /><ProductLink icon="ClipboardCheck" label="Ver operações no Nexo Contrata" onClick={() => onNavigateProduct('contrata')} tone="blue" /><ProductLink icon="Sprout" label="Ver metas no Nexo Impacto" onClick={() => onNavigateProduct('impacto')} tone="neutral" /></div>
      </>}

      {section === 'covenants' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Obrigações" value={String(COVENANTS.length)} icon="FileWarning" /><KpiCard label="Críticas" value={String(COVENANTS.filter((c) => c.status === 'critico').length)} icon="AlertOctagon" deltaTone="red" /><KpiCard label="Em atenção" value={String(COVENANTS.filter((c) => c.status === 'atencao').length)} icon="AlertTriangle" deltaTone="amber" /><KpiCard label="Evidências vinculadas" value="94" icon="ShieldCheck" /><KpiCard label="Conformidade" value="92,4%" icon="BadgeCheck" delta="+1,8 p.p." /></div>
        <Panel title="Agenda de covenants" subtitle="Monitoramento, verificação assistida e decisão humana"><div className="space-y-3">{COVENANTS.map((c) => { const source = sources.find((f) => f.id === c.fonteId); const state = covenantState[c.id] ?? 'open'; return <div key={c.id} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center"><div className="xl:col-span-6"><div className="flex flex-wrap items-center gap-2"><span className="font-mono-id text-[10px] text-neutral-500">{c.id}</span><StatusChip status={state === 'resolved' ? 'normal' : c.status} size="sm" /></div><div className="text-[12.5px] font-medium text-neutral-200 mt-2">{c.descricao}</div><button onClick={() => source && setSelectedSource(source)} className="text-[10.5px] text-[#6DD7D1] mt-1">{source?.nome ?? c.fonteId}</button></div><div className="xl:col-span-3 text-[11px]"><div className="flex justify-between"><span className="text-neutral-500">Próxima verificação</span><span className="text-neutral-300">{fmtDate(c.proximaVerificacao)}</span></div><div className="flex justify-between mt-1.5"><span className="text-neutral-500">Responsável</span><span className="text-neutral-300">Sustentabilidade</span></div><div className="flex justify-between mt-1.5"><span className="text-neutral-500">Evidências</span><span className="text-neutral-300">{c.status === 'critico' ? '7/9' : '12/12'}</span></div></div><div className="xl:col-span-3 flex gap-2"><button onClick={() => verifyCovenant(c.id)} disabled={state === 'running' || state === 'resolved'} className="flex-1 rounded-md border border-[#18B7D6]/30 bg-[#18B7D6]/10 px-3 py-2 text-[11px] text-[#6FD8EC] disabled:opacity-45">{state === 'running' ? 'Agente analisando...' : state === 'resolved' ? 'Verificado' : 'Executar verificação'}</button><button onClick={() => onNavigateProduct('impacto')} className="rounded-md border border-white/10 px-3 py-2 text-[11px] text-neutral-300">Evidências</button></div></div>{state === 'running' && <div className="mt-3"><ProgressBar value={0.68} tone="cyan" height={4} /><div className="text-[10px] text-neutral-500 mt-1">Reconciliando dados financeiros, indicadores e evidências territoriais...</div></div>}</div>; })}</div></Panel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Agente de Covenants" subtitle="Ocorrência prioritária"><LiveAgentRow agent={liveAgents.find((a) => a.id === 'AG-CAP-02')!} onRun={() => runSingleAgent('AG-CAP-02')} /></Panel><Panel title="Fluxo de resolução" subtitle="Gate humano preservado"><div className="grid grid-cols-5 gap-2">{['Detectar', 'Coletar', 'Validar', 'Despachar', 'Aprovar'].map((s, i) => <div key={s} className="text-center"><div className={cls('mx-auto w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium', i < 3 ? 'bg-[#0FA39D]/18 text-[#6DD7D1]' : i === 3 ? 'bg-[#18B7D6]/15 text-[#6FD8EC]' : 'bg-[#7C5CBF]/15 text-[#BDA8E6]')}>{i + 1}</div><div className="text-[10px] text-neutral-400 mt-1.5">{s}</div></div>)}</div><div className="rounded-md border border-[#7C5CBF]/25 bg-[#7C5CBF]/8 p-2.5 mt-4 text-[11px] text-neutral-300"><Icon name="User" size={12} className="inline mr-1.5 text-[#BDA8E6]" />Envio ao financiador, aceite de ressalva e alteração de covenant exigem decisão humana.</div></Panel></div>
      </>}

      {section === 'map' && <>
        <div className="flex flex-wrap items-center gap-2"><button onClick={() => setMapColorBy('status')} className={cls('rounded-full border px-3 py-1.5 text-[10.5px]', mapColorBy === 'status' ? 'border-[#0FA39D]/50 bg-[#0FA39D]/15 text-[#6DD7D1]' : 'border-white/10 text-neutral-400')}>Status do ativo</button><button onClick={() => setMapColorBy('region')} className={cls('rounded-full border px-3 py-1.5 text-[10.5px]', mapColorBy === 'region' ? 'border-[#0FA39D]/50 bg-[#0FA39D]/15 text-[#6DD7D1]' : 'border-white/10 text-neutral-400')}>Região</button>{selectedUF && <button onClick={() => setSelectedUF(null)} className="rounded-full border border-white/10 px-3 py-1.5 text-[10.5px] text-neutral-400">Limpar UF {selectedUF}</button>}</div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-9"><Panel title="Distribuição territorial do capital" subtitle="Ativos, fontes e programas financiados"><BrazilMap assets={filteredAssets} selectedId={selectedAssetId} selectedUF={selectedUF} onSelectUF={setSelectedUF} onSelectAsset={setSelectedAssetId} height={560} colorBy={mapColorBy} /></Panel></div><div className="xl:col-span-3 space-y-4"><Panel title="Camadas" subtitle="Contexto geoespacial" dense><div className="space-y-2">{[['Ativos financiados', 'Building2'], ['Fontes e programas', 'Landmark'], ['Beneficiários', 'Users'], ['Risco climático', 'Wind'], ['Living Atlas · WorldCover', 'Layers'], ['World Imagery', 'Images']].map(([l, i], idx) => <label key={l} className="flex items-center gap-2 rounded-md border border-white/8 px-2.5 py-2 cursor-pointer"><input type="checkbox" defaultChecked={idx < 4} className="accent-[#0FA39D]" /><Icon name={i} size={13} className="text-neutral-500" /><span className="text-[11px] text-neutral-300">{l}</span></label>)}</div></Panel>{selectedAsset && <Panel title="Ativo selecionado" subtitle={selectedAsset.id} dense><div className="text-[12.5px] font-medium text-neutral-100">{selectedAsset.name}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{selectedAsset.city} · {selectedAsset.uf}</div><div className="mt-2"><StatusChip status={selectedAsset.status} size="sm" /></div><div className="grid grid-cols-2 gap-2 mt-3 text-[10.5px]"><div className="rounded bg-white/[0.04] p-2"><span className="text-neutral-500">Valor</span><div className="text-neutral-200 mt-0.5">{fmtCompactBRL(selectedAsset.value)}</div></div><div className="rounded bg-white/[0.04] p-2"><span className="text-neutral-500">Funding</span><div className="text-neutral-200 mt-0.5 line-clamp-2">{selectedAsset.fundingSource}</div></div></div><button onClick={() => onOpenAsset(selectedAsset.id)} className="w-full mt-3 rounded-md bg-[#087C78] px-3 py-2 text-[11px] text-white">Abrir Ativo 360</button></Panel>}</div></div>
        <Panel title="Ativos e capital territorializado" subtitle={`${filteredAssets.length} ativos no contexto`}><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Ativo</th><th className="py-2 pr-3">Território</th><th className="py-2 pr-3">Fonte</th><th className="py-2 pr-3">Programa</th><th className="py-2 pr-3">Valor</th><th className="py-2"></th></tr></thead><tbody>{filteredAssets.map((a) => <tr key={a.id} className="border-b border-white/[0.05]"><td className="py-2.5 pr-3 text-neutral-200">{a.name}</td><td className="py-2.5 pr-3 text-neutral-400">{a.city} · {a.uf}</td><td className="py-2.5 pr-3 text-neutral-400">{a.fundingSource}</td><td className="py-2.5 pr-3 text-neutral-400">{a.program}</td><td className="py-2.5 pr-3 text-neutral-300">{fmtCompactBRL(a.value)}</td><td className="py-2.5 text-right"><button onClick={() => onOpenAsset(a.id)} className="text-[#6DD7D1]">Detalhar →</button></td></tr>)}</tbody></table></div></Panel>
      </>}

      {section === 'analytics' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Utilização" value={`${Math.round(totalUsed / totalCapital * 100)}%`} icon="Gauge" /><KpiCard label="Buffer de liquidez" value="14,8%" icon="Droplets" delta="+2,8 p.p. acima do mínimo" /><KpiCard label="Desembolso 90 dias" value="R$ 1,53 bi" icon="Banknote" delta="+11,4% vs plano" deltaTone="amber" /><KpiCard label="Funding sustentável" value="87%" icon="Sprout" /><KpiCard label="Diversificação" value="72/100" icon="Layers" delta="+5 pontos" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Previsão de desembolsos" subtitle="Planejado × projetado · R$ milhões"><TimeSeriesChart data={CAPITAL_CASHFLOW_FORECAST} xKey="mes" aKey="planejado" bKey="projetado" aLabel="Planejado" bLabel="Projetado" /></Panel></div><div className="xl:col-span-5"><Panel title="Perfil atual × carteira otimizada" subtitle="Resultado da modelagem multiobjetivo"><RadarComparison data={radarData} keys={[{ key: 'atual', label: 'Atual', color: '#394B59' }, { key: 'otimizado', label: 'Otimizado', color: '#0FA39D' }]} /></Panel></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Risco das fontes" subtitle="Probabilidade × impacto"><RiskMatrixChart data={costRiskData} /></Panel><Panel title="Concentração" subtitle="Participação por fonte"><SingleBarChart data={concentrationData} xKey="fonte" yKey="participacao" color="#18B7D6" /></Panel></div>
        <Panel title="Insights explicáveis" subtitle="Recomendações geradas pelos modelos e agentes"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{CAPITAL_ANALYTICS_INSIGHTS.map((i) => <button key={i.id} onClick={() => onSectionChange(i.target)} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]"><div className="flex justify-between gap-2"><div className="text-[12px] font-medium text-neutral-200">{i.title}</div><Pill tone="cyan">{i.confidence}%</Pill></div><p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">{i.detail}</p><div className="text-[10.5px] text-[#6DD7D1] mt-2">{i.impact}</div></button>)}</div></Panel>
      </>}

      {section === 'agents' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Agentes ativos" value={String(liveAgents.length)} icon="Bot" /><KpiCard label="Em execução" value={String(liveAgents.filter((a) => a.status === 'running').length)} icon="Loader2" /><KpiCard label="Aguardando humano" value={String(liveAgents.filter((a) => a.status === 'waiting').length)} icon="User" /><KpiCard label="Alertas" value={String(liveAgents.filter((a) => a.status === 'alert').length)} icon="AlertTriangle" deltaTone="amber" /><KpiCard label="Confiança média" value={`${Math.round(liveAgents.reduce((s, a) => s + a.confidence, 0) / liveAgents.length)}%`} icon="BadgeCheck" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Cockpit de agentes" subtitle="Execuções, recomendações e gates humanos"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{liveAgents.map((a) => <LiveAgentRow key={a.id} agent={a} onRun={() => runSingleAgent(a.id)} />)}</div></Panel></div><div className="xl:col-span-5 space-y-4"><Panel title="Eventos do ciclo" subtitle="Atividade live da plataforma"><EventFeed events={events.slice(-10)} /></Panel><Panel title="Governança de decisão" subtitle="A IA prepara; a alçada humana decide"><div className="space-y-2 text-[11px]">{[['Automático', 'Reconciliação, classificação e cálculo de cenários', 'teal'], ['Assistido', 'Diligências, relatórios e propostas de alocação', 'cyan'], ['Humano obrigatório', 'Captação, realocação, exceção e envio externo', 'neutral']].map(([l, d, t]) => <div key={l} className="rounded-md border border-white/8 bg-white/[0.025] p-2.5"><Pill tone={t === 'cyan' ? 'cyan' : t === 'neutral' ? 'neutral' : 'cyan'}>{l}</Pill><div className="text-neutral-400 mt-1.5">{d}</div></div>)}</div></Panel></div></div>
      </>}

      {section === 'reports' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Modelos disponíveis" value={String(CAPITAL_REPORTS.length)} icon="FileText" /><KpiCard label="Agendados" value="4" icon="CalendarClock" /><KpiCard label="Aguardando aprovação" value="1" icon="User" deltaTone="amber" /><KpiCard label="Entregues no prazo" value="98,6%" icon="BadgeCheck" /></div>
        <Panel title="Biblioteca de relatórios" subtitle="Geração assistida, revisão humana e exportação"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{CAPITAL_REPORTS.map((r) => { const progress = reportState[r.id] ?? 0; return <div key={r.id} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex items-start justify-between gap-2"><span className="w-8 h-8 rounded-lg bg-[#0FA39D]/10 flex items-center justify-center"><Icon name="FileText" size={15} className="text-[#6DD7D1]" /></span><Pill>{r.cadence}</Pill></div><div className="text-[12.5px] font-medium text-neutral-200 mt-3">{r.name}</div><p className="text-[11px] text-neutral-400 mt-1 leading-relaxed min-h-[48px]">{r.description}</p><div className="text-[10.5px] text-neutral-500 mt-2">{r.owner} · {r.format} · Último: {r.last}</div>{progress > 0 && <div className="mt-3"><ProgressBar value={progress / 100} tone="teal" height={4} /><div className="text-[10px] text-neutral-500 mt-1">{progress < 100 ? `Agentes consolidando dados... ${progress}%` : 'Relatório pronto para revisão e download.'}</div></div>}<div className="flex gap-2 mt-3"><button onClick={() => generateReport(r.id)} className="flex-1 rounded-md border border-[#0FA39D]/30 bg-[#0FA39D]/10 px-2.5 py-2 text-[10.5px] text-[#6DD7D1]">{progress > 0 && progress < 100 ? 'Gerando...' : 'Gerar'}</button><button disabled={progress < 100} onClick={() => downloadText(`${r.id}.csv`, `relatorio;${r.name}\ndata;${nowStr()}\nstatus;gerado`,'text/csv;charset=utf-8')} className="rounded-md border border-white/10 px-3 py-2 text-neutral-300 disabled:opacity-35"><Icon name="Download" size={12} /></button></div></div>; })}</div></Panel>
        <Panel title="Construtor de pacote executivo" subtitle="Relatório customizado para comitê, conselho ou financiador"><div className="grid grid-cols-1 lg:grid-cols-4 gap-3">{['Funding e liquidez', 'Programas e alocação', 'Covenants', 'Impacto e ativos'].map((x) => <label key={x} className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.025] p-3 text-[11.5px] text-neutral-300"><input type="checkbox" defaultChecked className="accent-[#0FA39D]" />{x}</label>)}</div><div className="flex flex-wrap gap-2 mt-4"><button onClick={() => onPushEvent('Pacote executivo preparado e encaminhado para revisão do Comitê de Alocação.', 'success')} className="rounded-md bg-[#087C78] px-3 py-2 text-[11.5px] text-white">Gerar pacote executivo</button><ProductLink icon="Sprout" label="Complementar com Nexo Impacto" onClick={() => onNavigateProduct('impacto')} tone="neutral" /></div></Panel>
      </>}

      {section === 'integrations' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Conectores" value={String(INTEGRATIONS.length)} icon="Plug" /><KpiCard label="Ativos" value={String(INTEGRATIONS.filter((i) => (integrationState[i.id] ?? i.status) === 'ativa').length)} icon="CheckCircle2" /><KpiCard label="Degradados" value={String(INTEGRATIONS.filter((i) => (integrationState[i.id] ?? i.status) === 'degradada').length)} icon="AlertTriangle" deltaTone="amber" /><KpiCard label="Falhas" value={String(INTEGRATIONS.filter((i) => (integrationState[i.id] ?? i.status) === 'falha').length)} icon="AlertOctagon" deltaTone="red" /><KpiCard label="Eventos 24h" value="2,14 mi" icon="Activity" /></div>
        <Panel title="Matriz de integrações do capital" subtitle="Fontes oficiais permanecem como systems of record"><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Origem</th><th className="py-2 pr-3">Dados</th><th className="py-2 pr-3">Método</th><th className="py-2 pr-3">Frequência</th><th className="py-2 pr-3">Latência</th><th className="py-2 pr-3">Status</th><th className="py-2"></th></tr></thead><tbody>{INTEGRATIONS.map((i) => { const status = integrationState[i.id] ?? i.status; const meta = INTEGRATION_STATUS[status]; return <tr key={i.id} className="border-b border-white/[0.05]"><td className="py-2.5 pr-3"><div className="text-neutral-200">{i.origem}</div><div className="text-[10px] text-neutral-500">{i.id} · {i.categoria}</div></td><td className="py-2.5 pr-3 text-neutral-400 max-w-[320px]">{i.dadosEsperados}</td><td className="py-2.5 pr-3 text-neutral-400">{i.metodo}</td><td className="py-2.5 pr-3 text-neutral-400">{i.frequencia}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{i.latenciaMs || '—'}{i.latenciaMs ? ' ms' : ''}</td><td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: meta.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />{meta.label}</span></td><td className="py-2.5 text-right"><button onClick={() => syncIntegration(i.id)} className="text-[#6DD7D1]">Sincronizar</button></td></tr>; })}</tbody></table></div></Panel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Dependência dos agentes" subtitle="Fontes utilizadas em decisões críticas"><div className="space-y-2">{liveAgents.slice(0, 5).map((a) => <div key={a.id} className="rounded-md border border-white/8 p-2.5"><div className="flex items-center gap-2"><Icon name={a.icon} size={12} className="text-[#6DD7D1]" /><span className="text-[11.5px] text-neutral-200">{a.name}</span></div><div className="flex flex-wrap gap-1 mt-2">{a.sources.map((s) => <Pill key={s}>{s}</Pill>)}</div></div>)}</div></Panel><Panel title="Arquitetura federada" subtitle="Sem substituição dos sistemas transacionais"><div className="space-y-3">{[['Systems of record', 'SIAFF, sistemas financeiros, contratos, Transferegov e bases regulatórias'], ['Nexo Capital', 'Identidade, regras, analytics, agentes, cenários e rastreabilidade'], ['Systems of execution', 'Workflows, aprovações, relatórios, alocação e integração com demais Nexos']].map(([t, d], i) => <div key={t} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[#0FA39D]/12 text-[#6DD7D1] flex items-center justify-center text-[10px] shrink-0">{i + 1}</span><div><div className="text-[11.5px] font-medium text-neutral-200">{t}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{d}</div></div></div>)}</div><ProductLink icon="Database" label="Abrir Nexo Data" onClick={() => onNavigateProduct('data')} tone="neutral" /></Panel></div>
      </>}

      {section === 'admin' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Regras ativas" value={String(Object.values(ruleState).filter(Boolean).length)} icon="Settings" /><KpiCard label="Perfis" value={String(CAPITAL_ROLE_MATRIX.length)} icon="Users" /><KpiCard label="Taxonomias" value="4" icon="BadgeCheck" /><KpiCard label="Alterações auditadas" value="128" icon="ShieldCheck" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Regras corporativas" subtitle="Parâmetros, limites e guardrails"><div className="space-y-2.5">{CAPITAL_ADMIN_RULES.map((r) => <div key={r.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-start gap-3"><button onClick={() => { setRuleState((s) => ({ ...s, [r.id]: !s[r.id] })); onPushEvent(`${r.name}: regra ${ruleState[r.id] ? 'desativada' : 'ativada'} por usuário autorizado.`, 'info'); }} className={cls('mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors', ruleState[r.id] ? 'bg-[#0FA39D]' : 'bg-neutral-700')}><span className={cls('block w-4 h-4 rounded-full bg-white transition-transform', ruleState[r.id] && 'translate-x-4')} /></button><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[12px] font-medium text-neutral-200">{r.name}</div><Pill tone={ruleState[r.id] ? 'cyan' : 'neutral'}>{r.value}</Pill></div><p className="text-[11px] text-neutral-400 mt-1">{r.description}</p><div className="text-[10px] text-neutral-600 mt-1">{r.id} · alterações exigem trilha de auditoria</div></div></div>)}</div></Panel></div><div className="xl:col-span-5"><Panel title="Taxonomias e frameworks" subtitle="Configuração de classificação"><div className="space-y-2">{[['Taxonomia Social CAIXA v2', 'Ativa', 'Social'], ['Taxonomia Sustentável Brasileira', 'Em harmonização', 'Verde/social'], ['Green Bond Principles — ICMA', 'Ativa', 'Mercado'], ['Climate Bonds Standard', 'Ativa', 'Clima']].map(([name, status, type]) => <div key={name} className="rounded-md border border-white/8 bg-white/[0.025] p-2.5 flex justify-between gap-2"><div><div className="text-[11.5px] text-neutral-200">{name}</div><div className="text-[10px] text-neutral-500 mt-0.5">{type}</div></div><Pill tone={status === 'Ativa' ? 'cyan' : 'neutral'}>{status}</Pill></div>)}</div></Panel></div></div>
        <Panel title="Matriz de perfis e alçadas" subtitle="Acesso por papel e responsabilidade"><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Papel</th><th className="py-2 pr-3">Fontes</th><th className="py-2 pr-3">Alocações</th><th className="py-2 pr-3">Covenants</th><th className="py-2">Alçada</th></tr></thead><tbody>{CAPITAL_ROLE_MATRIX.map((r) => <tr key={r.role} className="border-b border-white/[0.05]"><td className="py-2.5 pr-3 text-neutral-200">{r.role}</td><td className="py-2.5 pr-3 text-neutral-400">{r.sources}</td><td className="py-2.5 pr-3 text-neutral-400">{r.allocations}</td><td className="py-2.5 pr-3 text-neutral-400">{r.covenants}</td><td className="py-2.5 text-neutral-300">{r.approvals}</td></tr>)}</tbody></table></div></Panel>
      </>}

      <FundingPassport source={selectedSource} onClose={() => setSelectedSource(null)} onOpenAsset={onOpenAsset} />
      <NewFundingSheet open={newSourceOpen} onClose={() => setNewSourceOpen(false)} onPushEvent={onPushEvent} onCreated={(source) => { setSources((prev) => [...prev, source]); setSelectedSource(source); setNewSourceOpen(false); onPushEvent(`${source.nome}: passaporte criado e encaminhado para aprovação.`, 'success'); }} />
    </div>
  );
}
