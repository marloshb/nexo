import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import {
  CARTEIRA_ADMIN_RULES,
  CARTEIRA_AGENT_RUNTIME,
  CARTEIRA_LIVE_STEPS,
  CARTEIRA_PIPELINE_HISTORY,
  CARTEIRA_REPORTS,
  CARTEIRA_ROLE_MATRIX,
  OPPORTUNITIES,
  PRIORITY_WEIGHTS,
  TERRITORIAL_SIGNALS,
  type CarteiraAgentRuntime,
  type CarteiraSection,
  type Opportunity,
  type OpportunityDimension,
  type OpportunityStage,
} from '@/data/carteiraData';
import { INTEGRATIONS, type Integration } from '@/data/integrationsData';
import type { EventItem } from '@/data/mockData';
import type { ProductKey } from '@/data/navConfig';
import { fmtCompactBRL, fmtCompactNum, fmtDate, cls, nowStr } from '@/lib/tokens';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import { BarProgramChart, DonutChart, FunnelGeneric, RadarComparison, RiskMatrixChart, SingleBarChart, TreemapSource } from '@/components/shared/Charts';
import { GeoDotMap } from '@/components/shared/BrazilMap';
import { EventFeed } from '@/components/shared/EventFeed';

interface CarteiraViewProps {
  section: CarteiraSection;
  onSectionChange: (section: CarteiraSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}

const STAGES: OpportunityStage[] = ['Triagem', 'Georreferenciada', 'Enriquecida', 'Verificada', 'Estruturação', 'Arquivada'];
const STAGE_COLOR: Record<OpportunityStage, string> = {
  Triagem: '#9AACB8', Georreferenciada: '#1584D1', Enriquecida: '#18B7D6', Verificada: '#0FA39D', Estruturação: '#E5A11A', Arquivada: '#394B59',
};
const PRIORITY_COLOR: Record<string, string> = { P0: '#D14A55', P1: '#E5A11A', P2: '#1584D1', P3: '#9AACB8' };

const SECTION_META: Record<CarteiraSection, { title: string; subtitle: string; icon: string }> = {
  overview: { title: 'Visão geral', subtitle: 'Originação, funil, prioridades, sinais territoriais e decisões da carteira', icon: 'LayoutGrid' },
  radar: { title: 'Radar territorial', subtitle: 'Detecção de déficits, oportunidades e vazios de investimento por território', icon: 'Radar' },
  opportunities: { title: 'Oportunidades', subtitle: 'Cadastro, triagem, enriquecimento, verificação e encaminhamento de oportunidades', icon: 'Sparkles' },
  prioritization: { title: 'Priorização', subtitle: 'Ranking multicritério, cenários e alinhamento com funding e capacidade de execução', icon: 'ListOrdered' },
  map: { title: 'Mapa', subtitle: 'Distribuição espacial da carteira, áreas de influência e contexto geográfico', icon: 'Map' },
  analytics: { title: 'Analytics', subtitle: 'Desempenho do funil, maturidade, demanda, concentração e previsões da carteira', icon: 'BarChart3' },
  agents: { title: 'Agentes', subtitle: 'Radar, geocodificação, enriquecimento, duplicidades, priorização e despachos', icon: 'Bot' },
  reports: { title: 'Relatórios', subtitle: 'Relatórios executivos, territoriais, analíticos e de integridade da carteira', icon: 'FileText' },
  integrations: { title: 'Integrações', subtitle: 'Conectores externos, sistemas internos, qualidade e linhagem dos dados', icon: 'Plug' },
  admin: { title: 'Administração', subtitle: 'Regras, critérios, perfis, alçadas e governança da originação', icon: 'Settings' },
};

const AGENT_STATUS: Record<CarteiraAgentRuntime['status'], { label: string; color: string }> = {
  idle: { label: 'Disponível', color: '#9AACB8' }, running: { label: 'Em execução', color: '#18B7D6' }, waiting: { label: 'Aguardando humano', color: '#7C5CBF' }, done: { label: 'Concluído', color: '#0FA39D' }, alert: { label: 'Alerta', color: '#E5A11A' },
};
const INTEGRATION_STATUS: Record<Integration['status'], { label: string; color: string }> = {
  ativa: { label: 'Ativa', color: '#0FA39D' }, degradada: { label: 'Degradada', color: '#E5A11A' }, falha: { label: 'Falha', color: '#D14A55' },
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

function SectionHeader({ section, liveRunning, onStartLive }: { section: CarteiraSection; liveRunning: boolean; onStartLive: () => void }) {
  const meta = SECTION_META[section];
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-[#1584D1]/15 border border-[#1584D1]/25 flex items-center justify-center shrink-0"><Icon name={meta.icon} size={18} className="text-[#5FB4E8]" /></span>
        <div>
          <div className="flex items-center gap-2 text-[10.5px] text-neutral-500 mb-0.5"><span>Nexo Carteira</span><Icon name="ChevronRight" size={10} /><span>{meta.title}</span></div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">{meta.title}</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-400">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-2 w-2 rounded-full bg-[#0FA39D] opacity-40 nexo-pulse-ring" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#0FA39D]" /></span>
          Carteira sincronizada · {nowStr()}
        </span>
        <button onClick={onStartLive} disabled={liveRunning} className={cls('inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11.5px] font-medium border transition-colors', liveRunning ? 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC] cursor-wait' : 'border-[#1584D1]/35 bg-[#1584D1]/12 text-[#5FB4E8] hover:bg-[#1584D1]/20')}>
          <Icon name={liveRunning ? 'Loader2' : 'Play'} size={13} className={liveRunning ? 'animate-spin' : ''} />{liveRunning ? 'Ciclo da carteira ao vivo' : 'Executar ciclo ao vivo'}
        </button>
      </div>
    </div>
  );
}

function ProductLink({ icon, label, onClick, tone = 'blue' }: { icon: string; label: string; onClick: () => void; tone?: 'blue' | 'teal' | 'neutral' }) {
  const classes = tone === 'teal' ? 'border-[#0FA39D]/30 bg-[#0FA39D]/10 text-[#6DD7D1] hover:bg-[#0FA39D]/18' : tone === 'neutral' ? 'border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.07]' : 'border-[#1584D1]/30 bg-[#1584D1]/10 text-[#5FB4E8] hover:bg-[#1584D1]/18';
  return <button onClick={onClick} className={cls('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors', classes)}><Icon name={icon} size={12} />{label}<Icon name="ArrowUpRight" size={11} /></button>;
}

function StagePill({ stage }: { stage: OpportunityStage }) {
  return <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10.5px] font-medium" style={{ color: STAGE_COLOR[stage], borderColor: `${STAGE_COLOR[stage]}45`, background: `${STAGE_COLOR[stage]}14` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_COLOR[stage] }} />{stage}</span>;
}

function PriorityPill({ priority }: { priority: string }) {
  return <span className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: PRIORITY_COLOR[priority], borderColor: `${PRIORITY_COLOR[priority]}45`, background: `${PRIORITY_COLOR[priority]}12` }}>{priority}</span>;
}

function DimensionBars({ opportunity }: { opportunity: Opportunity }) {
  const labels: Array<[keyof OpportunityDimension, string]> = [['demanda', 'Demanda'], ['impacto', 'Impacto'], ['prontidao', 'Prontidão'], ['capacidade', 'Capacidade'], ['aderencia', 'Aderência'], ['resiliencia', 'Resiliência']];
  return <div className="space-y-2">{labels.map(([key, label]) => <div key={key}><div className="flex items-center justify-between text-[10.5px] mb-1"><span className="text-neutral-500">{label}</span><span className="text-neutral-300 tnum">{opportunity.dimensions[key]}</span></div><ProgressBar value={opportunity.dimensions[key] / 100} tone={opportunity.dimensions[key] >= 80 ? 'teal' : opportunity.dimensions[key] >= 60 ? 'blue' : 'amber'} height={4} /></div>)}</div>;
}

function LiveAgentRow({ agent, onRun }: { agent: CarteiraAgentRuntime; onRun: () => void }) {
  const meta = AGENT_STATUS[agent.status];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#18B7D6]/10 border border-[#18B7D6]/20 flex items-center justify-center shrink-0"><Icon name={agent.icon} size={15} className="text-[#6FD8EC]" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[12px] font-medium text-neutral-200 truncate">{agent.name}</div><span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: meta.color }}><span className={cls('w-1.5 h-1.5 rounded-full', agent.status === 'running' && 'nexo-pulse-ring')} style={{ background: meta.color }} />{meta.label}</span></div>
          <div className="text-[10.5px] text-neutral-500 mt-0.5 truncate">{agent.entity}</div>
          <div className="text-[11.5px] text-neutral-300 mt-1.5 leading-snug">{agent.step}</div>
          <div className="flex items-center gap-2 mt-2"><div className="flex-1"><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'amber' : agent.status === 'done' ? 'teal' : 'cyan'} height={4} /></div><span className="font-mono-id text-[10px] text-neutral-500 tnum">{agent.progress}%</span></div>
          <div className="flex items-center justify-between gap-2 mt-2"><span className="text-[10.5px] text-neutral-500">Confiança {agent.confidence}% · {agent.impact}</span><button onClick={onRun} disabled={agent.status === 'running'} className="text-[10.5px] text-[#5FB4E8] disabled:opacity-40">Executar</button></div>
        </div>
      </div>
    </div>
  );
}

function OpportunitySheet({ opportunity, onClose, onOpenAsset, onNavigateProduct, onEnrich, onArchive }: { opportunity: Opportunity | null; onClose: () => void; onOpenAsset: (id: string) => void; onNavigateProduct: (p: ProductKey) => void; onEnrich: (id: string) => void; onArchive: (id: string) => void }) {
  return (
    <Sheet open={!!opportunity} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-xl overflow-y-auto nexo-scroll">
        {opportunity && <>
          <SheetHeader><SheetTitle className="font-display text-neutral-50 pr-6">{opportunity.titulo}</SheetTitle><SheetDescription className="text-neutral-400">Ficha da oportunidade · {opportunity.id}</SheetDescription></SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2"><PriorityPill priority={opportunity.prioridade} /><StagePill stage={opportunity.estagio} /><Pill tone="blue">Score {opportunity.score.toFixed(1)}</Pill><Pill tone="cyan">Confiança {opportunity.confidence}%</Pill></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><div className="text-[10.5px] uppercase tracking-wide text-neutral-500">Problema territorial</div><p className="text-[12px] text-neutral-200 mt-1 leading-relaxed">{opportunity.problema}</p></div>
            <div className="grid grid-cols-2 gap-2.5 text-[11.5px]">
              {[['Proponente', opportunity.proponente], ['Território', `${opportunity.city} · ${opportunity.uf}`], ['Setor', opportunity.setor], ['Ativo previsto', opportunity.ativoPrevisto], ['Valor estimado', fmtCompactBRL(opportunity.valorEstimado)], ['Beneficiários', fmtCompactNum(opportunity.populacaoBeneficiada)], ['Fonte desejada', opportunity.fonteDesejada], ['Data-alvo', fmtDate(opportunity.dataAlvo)]].map(([label, value]) => <div key={label} className="rounded-md border border-white/8 bg-white/[0.02] p-2.5"><div className="text-[10px] text-neutral-500">{label}</div><div className="text-neutral-200 mt-0.5">{value}</div></div>)}
            </div>
            <Panel title="Dimensões de priorização" dense><DimensionBars opportunity={opportunity} /></Panel>
            <Panel title="Encaminhamento operacional" dense><div className="space-y-2 text-[11.5px]"><div><span className="text-neutral-500">Programa recomendado: </span><span className="text-neutral-200">{opportunity.programaRecomendado}</span></div><div><span className="text-neutral-500">Responsável: </span><span className="text-neutral-200">{opportunity.responsavel}</span></div><div><span className="text-neutral-500">Próxima ação: </span><span className="text-[#5FB4E8]">{opportunity.proximaAcao}</span></div><div><span className="text-neutral-500">Origem: </span><span className="text-neutral-300">{opportunity.origem}</span></div></div></Panel>
            {opportunity.restricoesConhecidas.length > 0 && <div className="rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/8 p-3"><div className="flex items-center gap-2 text-[11.5px] font-medium text-[#F0B94A]"><Icon name="AlertTriangle" size={13} />Restrições conhecidas</div><ul className="mt-2 space-y-1 text-[11px] text-neutral-300">{opportunity.restricoesConhecidas.map((r) => <li key={r}>• {r}</li>)}</ul></div>}
            {opportunity.duplicidadeDetectada && <div className="rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/10 p-3 text-[11.5px] text-[#F08A92] flex items-start gap-2"><Icon name="ScanLine" size={14} className="mt-0.5" />Duplicidade ou sobreposição provável. A oportunidade não deve avançar sem validação humana.</div>}
            <div className="grid grid-cols-2 gap-2"><button onClick={() => onEnrich(opportunity.id)} className="rounded-md border border-[#18B7D6]/30 bg-[#18B7D6]/10 px-3 py-2 text-[11.5px] text-[#6FD8EC]"><Icon name="Sparkles" size={12} className="inline mr-1.5" />Enriquecer com agentes</button><button onClick={() => onNavigateProduct('estrutura')} className="rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white"><Icon name="Layers" size={12} className="inline mr-1.5" />Abrir Nexo Estrutura</button>{opportunity.linkedAssetId && <button onClick={() => onOpenAsset(opportunity.linkedAssetId!)} className="rounded-md border border-white/10 px-3 py-2 text-[11.5px] text-neutral-300"><Icon name="Building2" size={12} className="inline mr-1.5" />Ativo relacionado</button>}<button onClick={() => onArchive(opportunity.id)} className="rounded-md border border-white/10 px-3 py-2 text-[11.5px] text-neutral-400">Arquivar oportunidade</button></div>
          </div>
        </>}
      </SheetContent>
    </Sheet>
  );
}

function NewOpportunitySheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (o: Opportunity) => void }) {
  const [form, setForm] = useState({ titulo: '', proponente: '', setor: 'Saneamento', city: '', uf: 'SP', valor: '100000000', beneficiarios: '50000', problema: '' });
  function submit() {
    if (!form.titulo.trim() || !form.city.trim()) return;
    const id = `OPP-2026-${String(Math.floor(220 + Math.random() * 700)).padStart(4, '0')}`;
    onCreate({ id, titulo: form.titulo, proponente: form.proponente || 'Proponente em validação', setor: form.setor, problema: form.problema || 'Problema territorial a detalhar', uf: form.uf, city: form.city, region: 'A definir', lat: -15.7, lon: -47.9, populacaoBeneficiada: Number(form.beneficiarios) || 0, ativoPrevisto: 'Ativo a definir', valorEstimado: Number(form.valor) || 0, fonteDesejada: 'A definir', programaRecomendado: 'A classificar pelo Agente de Elegibilidade', origem: 'Cadastro manual', estagio: 'Triagem', prioridade: 'P2', score: 55, confidence: 61, documentosDisponiveis: 0, documentosEsperados: 10, restricoesConhecidas: [], dataAlvo: '2028-12-01', contato: 'A definir', responsavel: 'Fila de Originação', proximaAcao: 'Executar geocodificação e enriquecimento automático', atualizacao: 'Agora', duplicidadeDetectada: false, dimensions: { demanda: 60, impacto: 58, prontidao: 22, capacidade: 50, aderencia: 52, resiliencia: 55 } });
    setForm({ titulo: '', proponente: '', setor: 'Saneamento', city: '', uf: 'SP', valor: '100000000', beneficiarios: '50000', problema: '' });
  }
  return <Sheet open={open} onOpenChange={(v) => !v && onClose()}><SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-lg overflow-y-auto nexo-scroll"><SheetHeader><SheetTitle className="font-display text-neutral-50">Nova oportunidade</SheetTitle><SheetDescription className="text-neutral-400">Entrada inicial no funil de originação</SheetDescription></SheetHeader><div className="mt-5 space-y-3">{[['Título', 'titulo'], ['Proponente', 'proponente'], ['Município', 'city'], ['Problema a resolver', 'problema']].map(([label, key]) => <label key={key} className="block"><span className="text-[10.5px] text-neutral-500">{label}</span><input value={form[key as keyof typeof form]} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} className="mt-1 w-full rounded-md border border-white/12 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-200 outline-none focus:border-[#1584D1]/60" /></label>)}<div className="grid grid-cols-2 gap-3"><label><span className="text-[10.5px] text-neutral-500">Setor</span><select value={form.setor} onChange={(e) => setForm((s) => ({ ...s, setor: e.target.value }))} className="mt-1 w-full rounded-md border border-white/12 bg-[#0E2A40] px-3 py-2 text-[12px] text-neutral-200">{['Saneamento', 'Habitação', 'Drenagem', 'Mobilidade', 'Saúde', 'Educação', 'Energia', 'Recursos Hídricos'].map((x) => <option key={x}>{x}</option>)}</select></label><label><span className="text-[10.5px] text-neutral-500">UF</span><input value={form.uf} onChange={(e) => setForm((s) => ({ ...s, uf: e.target.value.toUpperCase().slice(0, 2) }))} className="mt-1 w-full rounded-md border border-white/12 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-200" /></label></div><div className="grid grid-cols-2 gap-3"><label><span className="text-[10.5px] text-neutral-500">Valor estimado</span><input type="number" value={form.valor} onChange={(e) => setForm((s) => ({ ...s, valor: e.target.value }))} className="mt-1 w-full rounded-md border border-white/12 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-200" /></label><label><span className="text-[10.5px] text-neutral-500">Beneficiários</span><input type="number" value={form.beneficiarios} onChange={(e) => setForm((s) => ({ ...s, beneficiarios: e.target.value }))} className="mt-1 w-full rounded-md border border-white/12 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-200" /></label></div><div className="rounded-lg border border-[#18B7D6]/20 bg-[#18B7D6]/8 p-3 text-[11px] text-neutral-300"><Icon name="Bot" size={13} className="inline mr-1.5 text-[#6FD8EC]" />Após o cadastro, agentes de geocodificação, duplicidade e enriquecimento serão acionados.</div><div className="flex gap-2 pt-2"><button onClick={onClose} className="flex-1 rounded-md border border-white/10 px-3 py-2 text-[11.5px] text-neutral-300">Cancelar</button><button onClick={submit} className="flex-1 rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Criar oportunidade</button></div></div></SheetContent></Sheet>;
}

export function CarteiraView({ section, onSectionChange, onOpenAsset, onNavigateProduct, events, onPushEvent }: CarteiraViewProps) {
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(TERRITORIAL_SIGNALS[0]);
  const [newOpportunityOpen, setNewOpportunityOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'Todos' | OpportunityStage>('Todos');
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [selectedUF, setSelectedUF] = useState('Todos');
  const [mapLayer, setMapLayer] = useState<'stage' | 'priority'>('stage');
  const [liveAgents, setLiveAgents] = useState(CARTEIRA_AGENT_RUNTIME);
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveIndex, setLiveIndex] = useState(0);
  const [reportState, setReportState] = useState<Record<string, number>>({});
  const [integrationState, setIntegrationState] = useState<Record<string, Integration['status']>>({});
  const [ruleState, setRuleState] = useState<Record<string, boolean>>(() => Object.fromEntries(CARTEIRA_ADMIN_RULES.map((r) => [r.id, true])));
  const [weights, setWeights] = useState<Record<keyof OpportunityDimension, number>>(() => Object.fromEntries(PRIORITY_WEIGHTS.map((w) => [w.key, w.value])) as Record<keyof OpportunityDimension, number>);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (!liveRunning) return;
    if (liveIndex >= CARTEIRA_LIVE_STEPS.length) { setLiveRunning(false); setLiveIndex(0); return; }
    const timer = window.setTimeout(() => {
      const step = CARTEIRA_LIVE_STEPS[liveIndex];
      setLiveAgents((prev) => prev.map((a) => a.id === step.agentId ? { ...a, progress: step.progress, status: step.status, step: step.step } : a));
      onPushEvent(step.text, step.type);
      setLiveIndex((i) => i + 1);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [liveRunning, liveIndex, onPushEvent]);

  const active = opportunities.filter((o) => o.estagio !== 'Arquivada');
  const totalDemand = active.reduce((s, o) => s + o.valorEstimado, 0);
  const averageScore = active.reduce((s, o) => s + o.score, 0) / active.length;
  const qualified = active.filter((o) => ['Verificada', 'Estruturação'].includes(o.estagio));
  const sectors = ['Todos', ...Array.from(new Set(opportunities.map((o) => o.setor)))];
  const ufs = ['Todos', ...Array.from(new Set(opportunities.map((o) => o.uf))).sort()];

  const normalizedWeights = useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / total])) as Record<keyof OpportunityDimension, number>;
  }, [weights]);
  const ranking = useMemo(() => active.map((o) => ({ opportunity: o, dynamicScore: Object.entries(normalizedWeights).reduce((sum, [key, weight]) => sum + o.dimensions[key as keyof OpportunityDimension] * weight, 0) })).sort((a, b) => b.dynamicScore - a.dynamicScore), [active, normalizedWeights]);

  const filtered = opportunities.filter((o) => {
    const text = `${o.titulo} ${o.proponente} ${o.city} ${o.uf} ${o.setor}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (stageFilter === 'Todos' || o.estagio === stageFilter) && (sectorFilter === 'Todos' || o.setor === sectorFilter) && (selectedUF === 'Todos' || o.uf === selectedUF);
  });
  const mapPoints = filtered.map((o) => ({ id: o.id, name: o.titulo, lat: o.lat, lon: o.lon, color: mapLayer === 'stage' ? STAGE_COLOR[o.estagio] : PRIORITY_COLOR[o.prioridade], sublabel: `${o.city} · ${o.uf} · ${o.estagio}` }));
  const funnelData = STAGES.filter((s) => s !== 'Arquivada').map((s) => ({ name: s, value: opportunities.filter((o) => o.estagio === s).length, fill: STAGE_COLOR[s] }));
  const sectorData = Array.from(new Set(active.map((o) => o.setor))).map((sector) => ({ setor: sector, valor: Math.round(active.filter((o) => o.setor === sector).reduce((s, o) => s + o.valorEstimado, 0) / 1_000_000) }));
  const stageDonut = STAGES.map((s) => ({ name: s, value: opportunities.filter((o) => o.estagio === s).length, fill: STAGE_COLOR[s] })).filter((x) => x.value > 0);
  const impactReadiness = active.map((o) => ({ name: o.titulo, probabilidade: Math.max(1, Math.min(5, Math.round(o.dimensions.prontidao / 20))), impacto: Math.max(1, Math.min(5, Math.round(o.dimensions.impacto / 20))), categoria: o.setor }));
  const treemapData = sectorData.map((x) => ({ name: x.setor, value: x.valor }));

  function startLive() {
    if (liveRunning) return;
    setLiveAgents(CARTEIRA_AGENT_RUNTIME.map((a) => ({ ...a, status: a.id === 'AG-CAR-03' ? 'alert' : 'idle', progress: a.id === 'AG-CAR-03' ? 74 : 0 })));
    setLiveIndex(0);
    setLiveRunning(true);
    onPushEvent('Ciclo integrado do Nexo Carteira iniciado pelo Agente Orquestrador.', 'agent');
  }

  function runAgent(id: string) {
    setLiveAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'running', progress: 12, step: 'Inicializando conectores, regras e modelos...' } : a));
    onPushEvent(`${liveAgents.find((a) => a.id === id)?.name ?? 'Agente'} iniciado manualmente.`, 'agent');
    [35, 64, 88, 100].forEach((progress, idx) => {
      const t = window.setTimeout(() => setLiveAgents((prev) => prev.map((a) => a.id === id ? { ...a, progress, status: progress === 100 ? (id === 'AG-CAR-03' ? 'alert' : id === 'AG-CAR-06' ? 'waiting' : 'done') : 'running', step: progress === 100 ? a.recommendation : `Processando etapa ${idx + 2} de 5...` } : a)), 650 * (idx + 1));
      timers.current.push(t);
    });
  }

  function enrichOpportunity(id: string) {
    const opportunity = opportunities.find((o) => o.id === id);
    if (!opportunity) return;
    onPushEvent(`${opportunity.id}: agentes de geocodificação e enriquecimento acionados.`, 'agent');
    runAgent('AG-CAR-04');
    const t = window.setTimeout(() => {
      setOpportunities((prev) => prev.map((o) => o.id === id ? { ...o, estagio: o.estagio === 'Triagem' ? 'Georreferenciada' : o.estagio === 'Georreferenciada' ? 'Enriquecida' : o.estagio, documentosDisponiveis: Math.min(o.documentosEsperados, o.documentosDisponiveis + 2), score: Math.min(99, o.score + 3.4), confidence: Math.min(99, o.confidence + 4), atualizacao: 'Agora' } : o));
      setSelected((current) => current?.id === id ? { ...current, estagio: current.estagio === 'Triagem' ? 'Georreferenciada' : current.estagio === 'Georreferenciada' ? 'Enriquecida' : current.estagio, documentosDisponiveis: Math.min(current.documentosEsperados, current.documentosDisponiveis + 2), score: Math.min(99, current.score + 3.4), confidence: Math.min(99, current.confidence + 4), atualizacao: 'Agora' } : current);
      onPushEvent(`${opportunity.id}: enriquecimento concluído; score e completude atualizados.`, 'success');
    }, 2600);
    timers.current.push(t);
  }

  function archiveOpportunity(id: string) {
    setOpportunities((prev) => prev.map((o) => o.id === id ? { ...o, estagio: 'Arquivada', proximaAcao: 'Aguardar novo ciclo de revisão' } : o));
    setSelected(null);
    setDetailsOpen(false);
    onPushEvent(`${id}: oportunidade arquivada com trilha de decisão registrada.`, 'info');
  }

  function createOpportunity(o: Opportunity) {
    setOpportunities((prev) => [o, ...prev]);
    setSelected(o);
    setDetailsOpen(true);
    setNewOpportunityOpen(false);
    onPushEvent(`${o.id}: nova oportunidade criada; agentes de geocodificação e duplicidade acionados.`, 'success');
    runAgent('AG-CAR-02');
  }

  function generateReport(id: string) {
    if ((reportState[id] ?? 0) > 0 && (reportState[id] ?? 0) < 100) return;
    setReportState((s) => ({ ...s, [id]: 8 }));
    onPushEvent(`${id}: geração de relatório iniciada.`, 'agent');
    [28, 51, 77, 100].forEach((p, idx) => { const t = window.setTimeout(() => setReportState((s) => ({ ...s, [id]: p })), 600 * (idx + 1)); timers.current.push(t); });
  }

  function syncIntegration(id: string) {
    setIntegrationState((s) => ({ ...s, [id]: 'degradada' }));
    onPushEvent(`${id}: sincronização manual iniciada.`, 'info');
    const t = window.setTimeout(() => { setIntegrationState((s) => ({ ...s, [id]: 'ativa' })); onPushEvent(`${id}: sincronização concluída e linhagem atualizada.`, 'success'); }, 1700);
    timers.current.push(t);
  }

  function applyScenario(name: 'base' | 'climate' | 'execution') {
    const next = name === 'climate' ? { demanda: 17, impacto: 22, prontidao: 13, capacidade: 12, aderencia: 14, resiliencia: 22 } : name === 'execution' ? { demanda: 15, impacto: 18, prontidao: 24, capacidade: 23, aderencia: 12, resiliencia: 8 } : Object.fromEntries(PRIORITY_WEIGHTS.map((w) => [w.key, w.value]));
    setWeights(next as Record<keyof OpportunityDimension, number>);
    onPushEvent(`Cenário de priorização ${name === 'base' ? 'base' : name === 'climate' ? 'adaptação climática' : 'aceleração da execução'} aplicado.`, 'info');
  }

  return (
    <div className="p-5 space-y-4 max-w-[1560px] mx-auto nexo-fade-in">
      <SectionHeader section={section} liveRunning={liveRunning} onStartLive={startLive} />

      {section === 'overview' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Oportunidades ativas" value={String(active.length)} icon="Briefcase" delta="+4 no mês" /><KpiCard label="Demanda mapeada" value={fmtCompactBRL(totalDemand)} icon="TrendingUp" /><KpiCard label="Qualificadas" value={String(qualified.length)} icon="BadgeCheck" delta={`${qualified.length} prontas para decisão`} /><KpiCard label="Score médio" value={averageScore.toFixed(1)} icon="Target" delta="+3,8 pts" /><KpiCard label="Sinais prioritários" value={String(TERRITORIAL_SIGNALS.filter((s) => s.score >= 80).length)} icon="Radar" deltaTone="amber" hint="Radar territorial" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7"><Panel title="Funil de originação" subtitle="Da triagem ao encaminhamento para estruturação" actions={<button onClick={() => onSectionChange('opportunities')} className="text-[10.5px] text-[#5FB4E8]">Abrir oportunidades</button>}><FunnelGeneric data={funnelData} /></Panel></div>
          <div className="xl:col-span-5"><Panel title="Demanda por setor" subtitle="Valor estimado em R$ milhões"><TreemapSource data={treemapData} /></Panel></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7"><Panel title="Radar territorial da carteira" subtitle="Oportunidades sintéticas georreferenciadas"><GeoDotMap points={opportunities.filter((o) => o.estagio !== 'Arquivada').map((o) => ({ id: o.id, name: o.titulo, lat: o.lat, lon: o.lon, color: STAGE_COLOR[o.estagio], sublabel: `${o.city} · ${o.uf} · Score ${o.score.toFixed(1)}` }))} selectedId={selected?.id} onSelectPoint={(id) => { setSelected(opportunities.find((o) => o.id === id) ?? null); setDetailsOpen(true); }} height={330} /><div className="flex flex-wrap gap-3 mt-2">{STAGES.slice(0, -1).map((s) => <span key={s} className="inline-flex items-center gap-1 text-[10px] text-neutral-500"><span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLOR[s] }} />{s}</span>)}</div></Panel></div>
          <div className="xl:col-span-5"><Panel title="Prioridades recomendadas" subtitle="Ranking dinâmico do cenário atual"><div className="space-y-2">{ranking.slice(0, 5).map(({ opportunity: o, dynamicScore }, i) => <button key={o.id} onClick={() => { setSelected(o); setDetailsOpen(true); }} className="w-full flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-2.5 text-left hover:bg-white/[0.05]"><span className="w-6 h-6 rounded-full bg-[#1584D1]/12 text-[#5FB4E8] flex items-center justify-center text-[10px] font-semibold">{i + 1}</span><div className="flex-1 min-w-0"><div className="text-[11.5px] text-neutral-200 truncate">{o.titulo}</div><div className="text-[10px] text-neutral-500">{o.setor} · {o.uf} · {fmtCompactBRL(o.valorEstimado)}</div></div><PriorityPill priority={o.prioridade} /><span className="font-display text-[13px] text-[#5FB4E8] tnum">{dynamicScore.toFixed(1)}</span></button>)}</div><div className="flex flex-wrap gap-2 mt-4"><ProductLink icon="DollarSign" label="Ver funding no Nexo Capital" onClick={() => onNavigateProduct('capital')} tone="teal" /><ProductLink icon="Layers" label="Encaminhar à Estrutura" onClick={() => onNavigateProduct('estrutura')} /></div></Panel></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Agentes críticos" subtitle="Execuções e gates humanos"><div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">{liveAgents.slice(0, 4).map((a) => <LiveAgentRow key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel><Panel title="Eventos da carteira" subtitle="Barramento operacional simulado"><EventFeed events={events.slice(-12)} dense maxHeight={310} /></Panel></div>
      </>}

      {section === 'radar' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Sinais analisados" value="37" icon="Radar" /><KpiCard label="Acima do limiar" value="5" icon="AlertTriangle" deltaTone="amber" /><KpiCard label="Novas oportunidades" value="4" icon="Sparkles" delta="+2 esta semana" /><KpiCard label="Cobertura territorial" value="91%" icon="MapPinned" /><KpiCard label="Última varredura" value="05:40" icon="Clock" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-8"><Panel title="Mapa de sinais e oportunidades" subtitle="ArcGIS como base integradora; camada demonstrativa local"><GeoDotMap points={opportunities.filter((o) => o.estagio !== 'Arquivada').map((o) => ({ id: o.id, name: o.titulo, lat: o.lat, lon: o.lon, color: PRIORITY_COLOR[o.prioridade], sublabel: `${o.programaRecomendado} · ${o.prioridade}` }))} selectedId={selected?.id} onSelectPoint={(id) => { setSelected(opportunities.find((o) => o.id === id) ?? null); setDetailsOpen(true); }} height={470} /><div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">{['Living Atlas · WorldCover', 'IBGE · População', 'Obrasgov · Projetos', 'Riscos climáticos'].map((x, i) => <label key={x} className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.02] p-2 text-[10.5px] text-neutral-400"><input type="checkbox" defaultChecked={i < 3} className="accent-[#1584D1]" />{x}</label>)}</div></Panel></div><div className="xl:col-span-4 space-y-4"><Panel title="Sinais territoriais prioritários" subtitle="Clique para detalhar"><div className="space-y-2">{TERRITORIAL_SIGNALS.map((s) => <button key={s.id} onClick={() => setSelectedSignal(s)} className={cls('w-full rounded-lg border p-3 text-left transition-colors', selectedSignal.id === s.id ? 'border-[#1584D1]/40 bg-[#1584D1]/10' : 'border-white/8 bg-white/[0.025] hover:bg-white/[0.05]')}><div className="flex items-start justify-between gap-2"><div><div className="text-[11.5px] text-neutral-200">{s.title}</div><div className="text-[10px] text-neutral-500 mt-0.5">{s.territory} · {s.sector}</div></div><StatusChip status={s.status} size="sm" /></div><div className="flex items-center justify-between mt-2"><span className="text-[10.5px] text-neutral-500">Tendência {s.trend}</span><span className="font-display text-[14px] text-[#5FB4E8]">{s.score}</span></div></button>)}</div></Panel><Panel title={selectedSignal.title} subtitle={selectedSignal.territory}><p className="text-[11.5px] text-neutral-300 leading-relaxed">{selectedSignal.evidence}</p><div className="rounded-md border border-[#18B7D6]/20 bg-[#18B7D6]/8 p-2.5 text-[11px] text-[#6FD8EC] mt-3"><Icon name="Bot" size={12} className="inline mr-1.5" />{selectedSignal.recommendation}</div><button onClick={() => { setNewOpportunityOpen(true); onPushEvent(`${selectedSignal.id}: conversão de sinal em oportunidade iniciada.`, 'agent'); }} className="w-full mt-3 rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Converter em oportunidade</button></Panel></div></div>
      </>}

      {section === 'opportunities' && <>
        <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2"><div className="relative"><Icon name="Search" size={13} className="absolute left-2.5 top-2.5 text-neutral-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar oportunidade..." className="w-64 rounded-md border border-white/10 bg-white/[0.035] pl-8 pr-3 py-2 text-[11.5px] text-neutral-200 outline-none focus:border-[#1584D1]/50" /></div><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as 'Todos' | OpportunityStage)} className="rounded-md border border-white/10 bg-[#0E2A40] px-2.5 py-2 text-[11px] text-neutral-300"><option>Todos</option>{STAGES.map((s) => <option key={s}>{s}</option>)}</select><select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="rounded-md border border-white/10 bg-[#0E2A40] px-2.5 py-2 text-[11px] text-neutral-300">{sectors.map((s) => <option key={s}>{s}</option>)}</select></div><button onClick={() => setNewOpportunityOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white"><Icon name="Plus" size={13} />Nova oportunidade</button></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Registros filtrados" value={String(filtered.length)} icon="ListChecks" /><KpiCard label="Valor potencial" value={fmtCompactBRL(filtered.reduce((s, o) => s + o.valorEstimado, 0))} icon="DollarSign" /><KpiCard label="Com duplicidade" value={String(filtered.filter((o) => o.duplicidadeDetectada).length)} icon="ScanLine" deltaTone="amber" /><KpiCard label="Documentação média" value={`${Math.round(filtered.reduce((s, o) => s + o.documentosDisponiveis / o.documentosEsperados, 0) / Math.max(1, filtered.length) * 100)}%`} icon="FileCheck" /></div>
        <Panel title="Carteira de oportunidades" subtitle="Selecione uma linha para abrir a ficha 360"><div className="overflow-x-auto nexo-scroll -mx-4"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="px-4 py-2">Prior.</th><th className="py-2 pr-3">Oportunidade</th><th className="py-2 pr-3">Território</th><th className="py-2 pr-3">Valor</th><th className="py-2 pr-3">Score</th><th className="py-2 pr-3">Documentos</th><th className="py-2 pr-3">Estágio</th><th className="py-2 pr-4">Próxima ação</th></tr></thead><tbody>{filtered.map((o) => <tr key={o.id} onClick={() => { setSelected(o); setDetailsOpen(true); }} className="border-b border-white/[0.05] hover:bg-white/[0.04] cursor-pointer"><td className="px-4 py-2.5"><PriorityPill priority={o.prioridade} /></td><td className="py-2.5 pr-3"><div className="text-neutral-200 font-medium">{o.titulo}</div><div className="text-[10px] text-neutral-500">{o.id} · {o.setor}</div></td><td className="py-2.5 pr-3 text-neutral-400">{o.city} · {o.uf}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{fmtCompactBRL(o.valorEstimado)}</td><td className="py-2.5 pr-3"><div className="font-display text-[13px] text-[#5FB4E8] tnum">{o.score.toFixed(1)}</div><div className="text-[9.5px] text-neutral-600">conf. {o.confidence}%</div></td><td className="py-2.5 pr-3 min-w-[110px]"><div className="flex items-center gap-2"><div className="w-16"><ProgressBar value={o.documentosDisponiveis / o.documentosEsperados} tone={o.documentosDisponiveis / o.documentosEsperados > .75 ? 'teal' : 'blue'} height={4} /></div><span className="text-[10px] text-neutral-500">{o.documentosDisponiveis}/{o.documentosEsperados}</span></div></td><td className="py-2.5 pr-3"><StagePill stage={o.estagio} /></td><td className="py-2.5 pr-4 text-neutral-400 max-w-[260px]"><span className="line-clamp-2">{o.proximaAcao}</span></td></tr>)}</tbody></table></div></Panel>
      </>}

      {section === 'prioritization' && <>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-4"><Panel title="Critérios e pesos" subtitle="O score é normalizado automaticamente"><div className="space-y-3">{PRIORITY_WEIGHTS.map((w) => <label key={w.key} className="block"><div className="flex items-center justify-between text-[11px]"><span className="text-neutral-300">{w.label}</span><span className="font-mono-id text-[#5FB4E8]">{weights[w.key]}%</span></div><input type="range" min="0" max="40" value={weights[w.key]} onChange={(e) => setWeights((s) => ({ ...s, [w.key]: Number(e.target.value) }))} className="w-full accent-[#1584D1] mt-1" /></label>)}</div><div className="grid grid-cols-3 gap-2 mt-4"><button onClick={() => applyScenario('base')} className="rounded-md border border-white/10 px-2 py-2 text-[10.5px] text-neutral-300">Base</button><button onClick={() => applyScenario('climate')} className="rounded-md border border-[#0FA39D]/25 bg-[#0FA39D]/8 px-2 py-2 text-[10.5px] text-[#6DD7D1]">Clima</button><button onClick={() => applyScenario('execution')} className="rounded-md border border-[#E5A11A]/25 bg-[#E5A11A]/8 px-2 py-2 text-[10.5px] text-[#F0B94A]">Execução</button></div><button onClick={() => runAgent('AG-CAR-05')} className="w-full mt-3 rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white"><Icon name="Bot" size={12} className="inline mr-1.5" />Recalcular com agente</button></Panel></div><div className="xl:col-span-8"><Panel title="Ranking multicritério" subtitle="Resultado do cenário ativo"><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">#</th><th className="py-2 pr-3">Oportunidade</th><th className="py-2 pr-3">Demanda</th><th className="py-2 pr-3">Impacto</th><th className="py-2 pr-3">Prontidão</th><th className="py-2 pr-3">Score</th><th className="py-2"></th></tr></thead><tbody>{ranking.map(({ opportunity: o, dynamicScore }, i) => <tr key={o.id} className="border-b border-white/[0.05]"><td className="py-2.5 pr-3 font-display text-neutral-500">{i + 1}</td><td className="py-2.5 pr-3"><div className="text-neutral-200">{o.titulo}</div><div className="text-[10px] text-neutral-500">{o.setor} · {o.uf}</div></td><td className="py-2.5 pr-3 text-neutral-400 tnum">{o.dimensions.demanda}</td><td className="py-2.5 pr-3 text-neutral-400 tnum">{o.dimensions.impacto}</td><td className="py-2.5 pr-3 text-neutral-400 tnum">{o.dimensions.prontidao}</td><td className="py-2.5 pr-3 font-display text-[14px] text-[#5FB4E8] tnum">{dynamicScore.toFixed(1)}</td><td className="py-2.5 text-right"><button onClick={() => { setSelected(o); setDetailsOpen(true); onPushEvent(`${o.id}: despacho de encaminhamento preparado.`, 'agent'); }} className="text-[#5FB4E8]">Detalhar</button></td></tr>)}</tbody></table></div></Panel></div></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Matriz impacto × prontidão"><RiskMatrixChart data={impactReadiness} xLabel="Prontidão" yLabel="Impacto" onSelect={(name) => { setSelected(opportunities.find((o) => o.titulo === name) ?? null); setDetailsOpen(true); }} /></Panel><Panel title="Comparação das três líderes" subtitle="Dimensões normalizadas"><RadarComparison data={(['demanda', 'impacto', 'prontidao', 'capacidade', 'aderencia', 'resiliencia'] as Array<keyof OpportunityDimension>).map((key) => ({ dimensao: key[0].toUpperCase() + key.slice(1), top1: ranking[0]?.opportunity.dimensions[key] ?? 0, top2: ranking[1]?.opportunity.dimensions[key] ?? 0, top3: ranking[2]?.opportunity.dimensions[key] ?? 0 }))} keys={[{ key: 'top1', label: ranking[0]?.opportunity.titulo ?? '1º', color: '#1584D1' }, { key: 'top2', label: ranking[1]?.opportunity.titulo ?? '2º', color: '#0FA39D' }, { key: 'top3', label: ranking[2]?.opportunity.titulo ?? '3º', color: '#E5A11A' }]} /></Panel></div>
        <Panel title="Decisão de carteira" subtitle="Ações críticas exigem gate humano"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"><div><div className="text-[12px] text-neutral-200">O agente recomenda encaminhar as três primeiras oportunidades ao Nexo Estrutura.</div><div className="text-[10.5px] text-neutral-500 mt-1">Valor combinado: {fmtCompactBRL(ranking.slice(0, 3).reduce((s, x) => s + x.opportunity.valorEstimado, 0))} · confiança média 93%</div></div><div className="flex flex-wrap gap-2"><button onClick={() => onPushEvent('Ranking homologado pelo Gestor da Carteira; despachos liberados.', 'success')} className="rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Homologar ranking</button><ProductLink icon="Layers" label="Abrir Nexo Estrutura" onClick={() => onNavigateProduct('estrutura')} /></div></div></Panel>
      </>}

      {section === 'map' && <>
        <div className="flex flex-wrap gap-2"><select value={selectedUF} onChange={(e) => setSelectedUF(e.target.value)} className="rounded-md border border-white/10 bg-[#0E2A40] px-2.5 py-2 text-[11px] text-neutral-300">{ufs.map((x) => <option key={x}>{x}</option>)}</select><select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="rounded-md border border-white/10 bg-[#0E2A40] px-2.5 py-2 text-[11px] text-neutral-300">{sectors.map((x) => <option key={x}>{x}</option>)}</select><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as 'Todos' | OpportunityStage)} className="rounded-md border border-white/10 bg-[#0E2A40] px-2.5 py-2 text-[11px] text-neutral-300"><option>Todos</option>{STAGES.map((x) => <option key={x}>{x}</option>)}</select><div className="inline-flex rounded-md border border-white/10 p-0.5 bg-white/[0.025]"><button onClick={() => setMapLayer('stage')} className={cls('px-2.5 py-1.5 rounded text-[10.5px]', mapLayer === 'stage' ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>Estágio</button><button onClick={() => setMapLayer('priority')} className={cls('px-2.5 py-1.5 rounded text-[10.5px]', mapLayer === 'priority' ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>Prioridade</button></div></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-8"><Panel title="Mapa integrado de oportunidades" subtitle={`${filtered.length} oportunidades visíveis`}><GeoDotMap points={mapPoints} selectedId={selected?.id} onSelectPoint={(id) => setSelected(opportunities.find((o) => o.id === id) ?? null)} height={520} /><div className="flex flex-wrap gap-2 mt-3">{(mapLayer === 'stage' ? STAGES : ['P0', 'P1', 'P2', 'P3']).map((x) => <span key={x} className="inline-flex items-center gap-1 text-[10px] text-neutral-500"><span className="w-2 h-2 rounded-full" style={{ background: mapLayer === 'stage' ? STAGE_COLOR[x as OpportunityStage] : PRIORITY_COLOR[x] }} />{x}</span>)}</div></Panel></div><div className="xl:col-span-4 space-y-4"><Panel title="Camadas e serviços" subtitle="ArcGIS Maps SDK — integração prevista"><div className="space-y-2">{[['Oportunidades Nexo', true], ['Áreas de influência', true], ['Living Atlas — WorldCover', true], ['World Imagery', false], ['Obrasgov/CIPI', true], ['Risco climático', true], ['Equipamentos públicos', false]].map(([name, checked]) => <label key={String(name)} className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.025] p-2.5 text-[11px] text-neutral-300"><input type="checkbox" defaultChecked={Boolean(checked)} className="accent-[#1584D1]" />{String(name)}</label>)}</div></Panel>{selected && <Panel title={selected.titulo} subtitle={`${selected.city} · ${selected.uf}`}><div className="flex flex-wrap gap-2 mb-3"><PriorityPill priority={selected.prioridade} /><StagePill stage={selected.estagio} /></div><div className="grid grid-cols-2 gap-2 text-[11px]"><div><span className="text-neutral-500">Valor</span><div className="text-neutral-200">{fmtCompactBRL(selected.valorEstimado)}</div></div><div><span className="text-neutral-500">Score</span><div className="text-[#5FB4E8]">{selected.score.toFixed(1)}</div></div><div><span className="text-neutral-500">Beneficiários</span><div className="text-neutral-200">{fmtCompactNum(selected.populacaoBeneficiada)}</div></div><div><span className="text-neutral-500">Programa</span><div className="text-neutral-200 line-clamp-2">{selected.programaRecomendado}</div></div></div><button onClick={() => setDetailsOpen(true)} className="w-full mt-3 rounded-md border border-[#1584D1]/30 bg-[#1584D1]/10 px-3 py-2 text-[11px] text-[#5FB4E8]">Abrir ficha completa</button></Panel>}</div></div>
      </>}

      {section === 'analytics' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Taxa de qualificação" value={`${Math.round(qualified.length / active.length * 100)}%`} icon="BadgeCheck" delta="+6 p.p." /><KpiCard label="Tempo médio no funil" value="42 dias" icon="Clock" delta="-8 dias" /><KpiCard label="Valor P0/P1" value={fmtCompactBRL(active.filter((o) => ['P0', 'P1'].includes(o.prioridade)).reduce((s, o) => s + o.valorEstimado, 0))} icon="TrendingUp" /><KpiCard label="Duplicidade evitada" value="R$ 54 mi" icon="ScanLine" /><KpiCard label="Aderência ao funding" value="81%" icon="DollarSign" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Entradas versus estruturações" subtitle="Evolução mensal do pipeline"><BarProgramChart data={CARTEIRA_PIPELINE_HISTORY} xKey="mes" aKey="entradas" bKey="estruturadas" aLabel="Entradas" bLabel="Estruturadas" /></Panel><Panel title="Distribuição por estágio"><DonutChart data={stageDonut} /></Panel></div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><Panel title="Valor potencial por setor" subtitle="R$ milhões"><SingleBarChart data={sectorData} xKey="setor" yKey="valor" color="#18B7D6" /></Panel><Panel title="Funil de originação"><FunnelGeneric data={funnelData} /></Panel></div>
        <Panel title="Insights explicáveis" subtitle="Recomendações geradas a partir de carteira, capital e território"><div className="grid grid-cols-1 lg:grid-cols-3 gap-3">{[
          ['Mobilidade com funding disponível', 'Quatro oportunidades de mobilidade somam R$ 1,1 bi; o envelope BIRD está apenas 5,9% utilizado.', 'R$ 602 mi disponíveis', 91, 'capital'],
          ['Saneamento regional supera projetos isolados', 'O agrupamento Alto Tietê apresenta melhor custo por beneficiário e maior aderência programática.', '365 mil beneficiários', 94, 'prioritization'],
          ['Risco de baixa funcionalidade', 'Duas oportunidades sociais não possuem plano de custeio operacional suficientemente maduro.', 'R$ 256 mi expostos', 88, 'opportunities'],
        ].map(([title, detail, impact, confidence, target]) => <div key={String(title)} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex items-start gap-2"><Icon name="Sparkles" size={14} className="text-[#6FD8EC] mt-0.5" /><div><div className="text-[12px] font-medium text-neutral-200">{title}</div><p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{detail}</p></div></div><div className="flex items-center justify-between mt-3"><span className="text-[10.5px] text-[#5FB4E8]">{impact}</span><span className="text-[10px] text-neutral-500">Confiança {confidence}%</span></div><button onClick={() => target === 'capital' ? onNavigateProduct('capital') : onSectionChange(target as CarteiraSection)} className="mt-3 text-[10.5px] text-[#5FB4E8]">Explorar insight →</button></div>)}</div></Panel>
      </>}

      {section === 'agents' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Agentes configurados" value={String(liveAgents.length)} icon="Bot" /><KpiCard label="Em execução" value={String(liveAgents.filter((a) => a.status === 'running').length)} icon="Loader2" /><KpiCard label="Aguardando humano" value={String(liveAgents.filter((a) => a.status === 'waiting').length)} icon="User" deltaTone="amber" /><KpiCard label="Alertas" value={String(liveAgents.filter((a) => a.status === 'alert').length)} icon="AlertTriangle" deltaTone="amber" /><KpiCard label="Confiança média" value={`${Math.round(liveAgents.reduce((s, a) => s + a.confidence, 0) / liveAgents.length)}%`} icon="Target" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-8"><Panel title="Cockpit de agentes" subtitle="Execução controlada, explicável e com gate humano"><div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{liveAgents.map((a) => <LiveAgentRow key={a.id} agent={a} onRun={() => runAgent(a.id)} />)}</div></Panel></div><div className="xl:col-span-4"><Panel title="Eventos em tempo real" subtitle="Ações, alertas e encaminhamentos"><EventFeed events={events.slice(-18)} dense maxHeight={650} /></Panel></div></div>
        <Panel title="Orquestração do processo" subtitle="Agentes apoiam; decisões materiais permanecem humanas"><div className="grid grid-cols-1 md:grid-cols-6 gap-2">{[['Radar', 'Detecta sinal'], ['Geocodificação', 'Localiza e contextualiza'], ['Duplicidade', 'Verifica sobreposição'], ['Enriquecimento', 'Agrega dados'], ['Priorização', 'Simula cenários'], ['Despacho', 'Encaminha com gate']].map(([t, d], i) => <div key={t} className="relative rounded-lg border border-white/8 bg-white/[0.025] p-3 text-center"><span className="w-7 h-7 mx-auto rounded-full bg-[#1584D1]/14 text-[#5FB4E8] flex items-center justify-center text-[10px]">{i + 1}</span><div className="text-[11px] text-neutral-200 mt-2">{t}</div><div className="text-[9.5px] text-neutral-500 mt-1">{d}</div>{i < 5 && <Icon name="ChevronRight" size={12} className="hidden md:block absolute -right-2 top-1/2 text-neutral-600" />}</div>)}</div></Panel>
      </>}

      {section === 'reports' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Modelos disponíveis" value={String(CARTEIRA_REPORTS.length)} icon="FileText" /><KpiCard label="Gerados no mês" value="18" icon="FileCheck" /><KpiCard label="Agendados" value="5" icon="CalendarClock" /><KpiCard label="Em revisão" value="2" icon="User" deltaTone="amber" /></div>
        <Panel title="Biblioteca de relatórios" subtitle="Geração dinâmica com dados, mapas e narrativa assistida por IA"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{CARTEIRA_REPORTS.map((r) => { const progress = reportState[r.id] ?? 0; return <div key={r.id} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex items-start justify-between gap-2"><span className="w-8 h-8 rounded-lg bg-[#1584D1]/10 flex items-center justify-center"><Icon name="FileText" size={15} className="text-[#5FB4E8]" /></span><Pill>{r.cadence}</Pill></div><div className="text-[12.5px] font-medium text-neutral-200 mt-3">{r.name}</div><p className="text-[11px] text-neutral-400 mt-1 leading-relaxed min-h-[48px]">{r.description}</p><div className="text-[10.5px] text-neutral-500 mt-2">{r.owner} · {r.format} · Último: {r.last}</div>{progress > 0 && <div className="mt-3"><ProgressBar value={progress / 100} tone="blue" height={4} /><div className="text-[10px] text-neutral-500 mt-1">{progress < 100 ? `Agentes consolidando dados e mapas... ${progress}%` : 'Relatório pronto para revisão e download.'}</div></div>}<div className="flex gap-2 mt-3"><button onClick={() => generateReport(r.id)} className="flex-1 rounded-md border border-[#1584D1]/30 bg-[#1584D1]/10 px-2.5 py-2 text-[10.5px] text-[#5FB4E8]">{progress > 0 && progress < 100 ? 'Gerando...' : 'Gerar'}</button><button disabled={progress < 100} onClick={() => downloadText(`${r.id}.csv`, `relatorio;${r.name}\ndata;${nowStr()}\nstatus;gerado`, 'text/csv;charset=utf-8')} className="rounded-md border border-white/10 px-3 py-2 text-neutral-300 disabled:opacity-35"><Icon name="Download" size={12} /></button></div></div>; })}</div></Panel>
        <Panel title="Construtor de pacote de decisão" subtitle="Monte um pacote para o Comitê de Carteira"><div className="grid grid-cols-2 lg:grid-cols-5 gap-2">{['Radar territorial', 'Ranking', 'Funding', 'Riscos e duplicidades', 'Mapas e anexos'].map((x) => <label key={x} className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.025] p-3 text-[11px] text-neutral-300"><input type="checkbox" defaultChecked className="accent-[#1584D1]" />{x}</label>)}</div><div className="flex flex-wrap gap-2 mt-4"><button onClick={() => onPushEvent('Pacote de decisão da carteira preparado e encaminhado para revisão.', 'success')} className="rounded-md bg-[#1584D1] px-3 py-2 text-[11.5px] text-white">Gerar pacote executivo</button><ProductLink icon="Gauge" label="Enviar ao Nexo Control" onClick={() => onNavigateProduct('control')} tone="neutral" /></div></Panel>
      </>}

      {section === 'integrations' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Conectores" value={String(INTEGRATIONS.length)} icon="Plug" /><KpiCard label="Ativos" value={String(INTEGRATIONS.filter((i) => (integrationState[i.id] ?? i.status) === 'ativa').length)} icon="CheckCircle2" /><KpiCard label="Degradados" value={String(INTEGRATIONS.filter((i) => (integrationState[i.id] ?? i.status) === 'degradada').length)} icon="AlertTriangle" deltaTone="amber" /><KpiCard label="Falhas" value={String(INTEGRATIONS.filter((i) => (integrationState[i.id] ?? i.status) === 'falha').length)} icon="AlertOctagon" deltaTone="red" /><KpiCard label="Entidades resolvidas" value="98,4%" icon="Link2" /></div>
        <Panel title="Matriz de integrações da carteira" subtitle="Transferegov, Obrasgov e sistemas internos permanecem como fontes oficiais"><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Origem</th><th className="py-2 pr-3">Dados</th><th className="py-2 pr-3">Método</th><th className="py-2 pr-3">Frequência</th><th className="py-2 pr-3">Latência</th><th className="py-2 pr-3">Status</th><th className="py-2"></th></tr></thead><tbody>{INTEGRATIONS.map((i) => { const status = integrationState[i.id] ?? i.status; const meta = INTEGRATION_STATUS[status]; return <tr key={i.id} className="border-b border-white/[0.05]"><td className="py-2.5 pr-3"><div className="text-neutral-200">{i.origem}</div><div className="text-[10px] text-neutral-500">{i.id} · {i.categoria}</div></td><td className="py-2.5 pr-3 text-neutral-400 max-w-[320px]">{i.dadosEsperados}</td><td className="py-2.5 pr-3 text-neutral-400">{i.metodo}</td><td className="py-2.5 pr-3 text-neutral-400">{i.frequencia}</td><td className="py-2.5 pr-3 text-neutral-300 tnum">{i.latenciaMs || '—'}{i.latenciaMs ? ' ms' : ''}</td><td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: meta.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />{meta.label}</span></td><td className="py-2.5 text-right"><button onClick={() => syncIntegration(i.id)} className="text-[#5FB4E8]">Sincronizar</button></td></tr>; })}</tbody></table></div></Panel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel title="Dependência dos agentes" subtitle="Fontes utilizadas no fluxo de originação"><div className="space-y-2">{liveAgents.slice(0, 5).map((a) => <div key={a.id} className="rounded-md border border-white/8 p-2.5"><div className="flex items-center gap-2"><Icon name={a.icon} size={12} className="text-[#5FB4E8]" /><span className="text-[11.5px] text-neutral-200">{a.name}</span></div><div className="flex flex-wrap gap-1 mt-2">{a.sources.map((s) => <Pill key={s}>{s}</Pill>)}</div></div>)}</div></Panel><Panel title="Arquitetura federada" subtitle="Integração sem substituir os sistemas de registro"><div className="space-y-3">{[['Systems of record', 'Transferegov, Obrasgov, planos setoriais, cadastros e sistemas CAIXA'], ['Nexo Carteira', 'Identidade, contexto territorial, scores, agentes e decisões'], ['Systems of execution', 'Nexo Estrutura, Contrata, Capital, workflows e despachos']].map(([t, d], i) => <div key={t} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[#1584D1]/12 text-[#5FB4E8] flex items-center justify-center text-[10px] shrink-0">{i + 1}</span><div><div className="text-[11.5px] font-medium text-neutral-200">{t}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{d}</div></div></div>)}</div><div className="mt-4"><ProductLink icon="Database" label="Abrir Nexo Data" onClick={() => onNavigateProduct('data')} tone="neutral" /></div></Panel></div>
      </>}

      {section === 'admin' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Regras ativas" value={String(Object.values(ruleState).filter(Boolean).length)} icon="Settings" /><KpiCard label="Perfis" value={String(CARTEIRA_ROLE_MATRIX.length)} icon="Users" /><KpiCard label="Critérios" value={String(PRIORITY_WEIGHTS.length)} icon="SlidersHorizontal" /><KpiCard label="Alterações auditadas" value="94" icon="ShieldCheck" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4"><div className="xl:col-span-7"><Panel title="Regras corporativas" subtitle="Guardrails da originação e priorização"><div className="space-y-2.5">{CARTEIRA_ADMIN_RULES.map((r) => <div key={r.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3 flex items-start gap-3"><button onClick={() => { setRuleState((s) => ({ ...s, [r.id]: !s[r.id] })); onPushEvent(`${r.name}: regra ${ruleState[r.id] ? 'desativada' : 'ativada'} por usuário autorizado.`, 'info'); }} className={cls('mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors', ruleState[r.id] ? 'bg-[#1584D1]' : 'bg-neutral-700')}><span className={cls('block w-4 h-4 rounded-full bg-white transition-transform', ruleState[r.id] && 'translate-x-4')} /></button><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[12px] font-medium text-neutral-200">{r.name}</div><Pill tone={ruleState[r.id] ? 'blue' : 'neutral'}>{r.value}</Pill></div><p className="text-[11px] text-neutral-400 mt-1">{r.description}</p><div className="text-[10px] text-neutral-600 mt-1">{r.id} · alterações exigem trilha de auditoria</div></div></div>)}</div></Panel></div><div className="xl:col-span-5"><Panel title="Pesos padrão de priorização" subtitle="Baseline corporativa"><div className="space-y-2.5">{PRIORITY_WEIGHTS.map((w) => <div key={w.key}><div className="flex items-center justify-between text-[11px]"><span className="text-neutral-300">{w.label}</span><span className="text-[#5FB4E8]">{w.value}%</span></div><ProgressBar value={w.value / 40} tone="blue" height={4} /></div>)}</div><button onClick={() => applyScenario('base')} className="w-full mt-4 rounded-md border border-white/10 px-3 py-2 text-[11px] text-neutral-300">Restaurar pesos padrão</button></Panel></div></div>
        <Panel title="Matriz de perfis e alçadas" subtitle="Acesso por papel e responsabilidade"><div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead className="text-neutral-500 border-b border-white/10"><tr><th className="py-2 pr-3">Papel</th><th className="py-2 pr-3">Radar</th><th className="py-2 pr-3">Oportunidades</th><th className="py-2 pr-3">Priorização</th><th className="py-2">Alçada</th></tr></thead><tbody>{CARTEIRA_ROLE_MATRIX.map((r) => <tr key={r.role} className="border-b border-white/[0.05]"><td className="py-2.5 pr-3 text-neutral-200">{r.role}</td><td className="py-2.5 pr-3 text-neutral-400">{r.radar}</td><td className="py-2.5 pr-3 text-neutral-400">{r.opportunities}</td><td className="py-2.5 pr-3 text-neutral-400">{r.prioritization}</td><td className="py-2.5 text-neutral-300">{r.approvals}</td></tr>)}</tbody></table></div></Panel>
      </>}

      <OpportunitySheet opportunity={detailsOpen ? selected : null} onClose={() => setDetailsOpen(false)} onOpenAsset={onOpenAsset} onNavigateProduct={onNavigateProduct} onEnrich={enrichOpportunity} onArchive={archiveOpportunity} />
      <NewOpportunitySheet open={newOpportunityOpen} onClose={() => setNewOpportunityOpen(false)} onCreate={createOpportunity} />
    </div>
  );
}
