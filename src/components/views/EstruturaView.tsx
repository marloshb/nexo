import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import {
  ALTERNATIVES,
  CASHFLOW_BASE,
  FINANCIAL_ASSUMPTIONS,
  INTEGRATION_TOUCHPOINTS,
  LIFE_CYCLE,
  PORTFOLIO_HISTORY,
  SENSITIVITY,
  STRUCTURE_ADMIN_RULES,
  STRUCTURE_AGENTS,
  STRUCTURE_CASES,
  STRUCTURE_LIVE_STEPS,
  STRUCTURE_REPORTS,
  STRUCTURE_ROLE_MATRIX,
  type Alternative,
  type EstruturaSection,
  type FinancialAssumption,
  type StructureAgentRuntime,
  type StructureCase,
} from '@/data/estruturaData';
import type { EventItem } from '@/data/mockData';
import type { ProductKey } from '@/data/navConfig';
import { cls, fmtBRL, fmtCompactBRL, fmtCompactNum, nowStr } from '@/lib/tokens';
import { KpiCard, Panel, Pill, ProgressBar, StatusChip } from '@/components/shared/Primitives';
import { EventFeed } from '@/components/shared/EventFeed';
import { GeoDotMap } from '@/components/shared/BrazilMap';
import { DonutChart, RadarComparison, RiskMatrixChart, SingleBarChart } from '@/components/shared/Charts';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface EstruturaViewProps {
  section: EstruturaSection;
  onSectionChange: (section: EstruturaSection) => void;
  onOpenAsset: (id: string) => void;
  onNavigateProduct: (product: ProductKey) => void;
  events: EventItem[];
  onPushEvent: (text: string, type: EventItem['type']) => void;
}

const SECTION_META: Record<EstruturaSection, { title: string; subtitle: string; icon: string }> = {
  overview: { title: 'Visão geral', subtitle: 'Casos em estruturação, alternativas, decisões, riscos e integrações do ciclo de modelagem', icon: 'LayoutGrid' },
  alternatives: { title: 'Alternativas', subtitle: 'Desenho, comparação e seleção de configurações técnicas, territoriais e operacionais', icon: 'GitBranch' },
  financial: { title: 'Modelo financeiro', subtitle: 'Capex, Opex, funding, fluxo, custo-benefício e premissas editáveis', icon: 'Calculator' },
  scenarios: { title: 'Cenários', subtitle: 'Sensibilidade, vida útil, estresse, simulação e recomendação explicável', icon: 'Layers' },
  map: { title: 'Mapa', subtitle: 'Localização, cobertura, dependências, riscos e interfaces territoriais dos casos', icon: 'Map' },
  analytics: { title: 'Analytics', subtitle: 'Performance da carteira, qualidade da estruturação, previsões e insights', icon: 'BarChart3' },
  agents: { title: 'Agentes', subtitle: 'Orquestração técnica, financeira, territorial, riscos e preparação da decisão', icon: 'Bot' },
  reports: { title: 'Relatórios', subtitle: 'Estudos comparativos, modelos, baseline, mapas e pacotes de decisão', icon: 'FileText' },
  admin: { title: 'Administração', subtitle: 'Regras, alçadas, perfis, integrações e governança do produto', icon: 'Settings' },
};

const TOOLTIP_STYLE = { background: '#0B2235', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 11, color: '#EDF1F4', padding: '8px 10px' };
const ALT_COLORS: Record<string, string> = { 'CEN-A': '#0FA39D', 'CEN-B': '#1584D1', 'CEN-C': '#E5A11A', 'CEN-D': '#7C5CBF' };
const STAGE_TONE: Record<string, 'normal' | 'analise' | 'atencao' | 'decisao'> = {
  'Em modelagem': 'analise', Comparação: 'analise', 'Aguardando decisão': 'decisao', Aprovado: 'normal', 'Em revisão': 'atencao',
};

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

function SectionHeader({ section, liveRunning, onStartLive }: { section: EstruturaSection; liveRunning: boolean; onStartLive: () => void }) {
  const meta = SECTION_META[section];
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-[#7C5CBF]/30 bg-[#7C5CBF]/12 text-[#B6A3E3]"><Icon name={meta.icon} size={17} /></div>
        <div><h1 className="font-display text-[19px] font-semibold text-neutral-50">{meta.title}</h1><p className="text-[12px] text-neutral-500 mt-0.5">{meta.subtitle}</p></div>
      </div>
      <button onClick={onStartLive} disabled={liveRunning} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#18B7D6]/35 bg-[#18B7D6]/12 px-3 py-2 text-[12px] font-medium text-[#78DCEC] transition hover:bg-[#18B7D6]/20 disabled:opacity-55">
        <Icon name={liveRunning ? 'Loader2' : 'Play'} size={14} className={liveRunning ? 'animate-spin' : ''} />{liveRunning ? 'Ciclo de agentes em execução' : 'Executar ciclo ao vivo'}
      </button>
    </div>
  );
}

function ProductLink({ icon, label, onClick, tone = 'purple' }: { icon: string; label: string; onClick: () => void; tone?: 'purple' | 'blue' | 'teal' | 'neutral' }) {
  const tones = { purple: 'border-[#7C5CBF]/25 bg-[#7C5CBF]/10 text-[#C2B4E8]', blue: 'border-[#1584D1]/25 bg-[#1584D1]/10 text-[#75B9E5]', teal: 'border-[#0FA39D]/25 bg-[#0FA39D]/10 text-[#75D0CB]', neutral: 'border-white/10 bg-white/[0.03] text-neutral-300' };
  return <button onClick={onClick} className={cls('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] transition hover:brightness-125', tones[tone])}><Icon name={icon} size={12} />{label}<Icon name="ArrowRight" size={11} /></button>;
}

function AgentRow({ agent, onRun }: { agent: StructureAgentRuntime; onRun: () => void }) {
  const statusTone = agent.status === 'done' ? 'normal' : agent.status === 'alert' ? 'atencao' : agent.status === 'waiting' ? 'decisao' : agent.status === 'running' ? 'automatizado' : 'pendente';
  return (
    <div className="rounded-lg border border-white/9 bg-white/[0.025] p-3">
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#18B7D6]/12 border border-[#18B7D6]/25 flex items-center justify-center text-[#6FD8EC] shrink-0"><Icon name={agent.icon} size={15} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[12.5px] font-medium text-neutral-100">{agent.name}</div><div className="text-[10.5px] text-neutral-500 mt-0.5">{agent.entity} · confiança {agent.confidence}%</div></div><StatusChip status={statusTone} size="sm" /></div>
          <div className="text-[11.5px] text-neutral-300 mt-2">{agent.step}</div>
          <div className="mt-2"><ProgressBar value={agent.progress / 100} tone={agent.status === 'alert' ? 'amber' : agent.status === 'done' ? 'teal' : 'cyan'} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[10.5px]"><div className="text-neutral-500">Recomendação: <span className="text-neutral-300">{agent.recommendation}</span></div><div className="text-neutral-500">Gate: <span className="text-neutral-300">{agent.awaiting}</span></div></div>
        </div>
        <button onClick={onRun} className="rounded-md border border-white/10 bg-white/[0.04] p-1.5 text-neutral-400 hover:text-neutral-100"><Icon name="Play" size={12} /></button>
      </div>
    </div>
  );
}

function CaseSelector({ cases, selectedId, onSelect }: { cases: StructureCase[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <select value={selectedId} onChange={(e) => onSelect(e.target.value)} className="rounded-md border border-white/10 bg-[#0E2A40] px-3 py-2 text-[11.5px] text-neutral-200 outline-none">
      {cases.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.nome}</option>)}
    </select>
  );
}

function AlternativeSheet({ alternative, onClose, onOpenAsset, linkedAssetId }: { alternative: Alternative | null; onClose: () => void; onOpenAsset: (id: string) => void; linkedAssetId?: string }) {
  return (
    <Sheet open={!!alternative} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-2xl overflow-y-auto nexo-scroll">
        {alternative && <>
          <SheetHeader><SheetTitle className="font-display text-neutral-50 pr-7">{alternative.nome}</SheetTitle><SheetDescription className="text-neutral-400">Dossiê de alternativa · {alternative.id}</SheetDescription></SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2"><Pill tone={alternative.recommended ? 'cyan' : 'neutral'}>{alternative.status}</Pill><Pill tone="blue">Score {alternative.score}</Pill><Pill>{alternative.prazoMeses} meses</Pill></div>
            <p className="text-[12.5px] text-neutral-300 leading-relaxed">{alternative.descricao}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[['Capex', fmtCompactBRL(alternative.capex)], ['Opex anual', fmtCompactBRL(alternative.opexAno)], ['Beneficiários', fmtCompactNum(alternative.beneficiarios)], ['Vida útil', `${alternative.vidaUtilAnos} anos`], ['Tecnologia', alternative.tecnologia], ['Localização', alternative.localizacao]].map(([label, value]) => <div key={label} className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[10px] text-neutral-500">{label}</div><div className="mt-0.5 text-[11.5px] text-neutral-200">{value}</div></div>)}
            </div>
            <Panel title="Indicadores" dense><div className="space-y-2">{Object.entries(alternative.indicators).map(([key, value]) => <div key={key}><div className="mb-1 flex justify-between text-[10.5px]"><span className="capitalize text-neutral-400">{key.replace(/([A-Z])/g, ' $1')}</span><span className="tnum text-neutral-200">{value}</span></div><ProgressBar value={Math.min(1, value / (key === 'custoBeneficiario' ? 1800 : 100))} tone={key === 'custoBeneficiario' ? 'amber' : 'teal'} /></div>)}</div></Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Panel title="Premissas" dense><ul className="space-y-1.5 text-[11.5px] text-neutral-300">{alternative.premissas.map((x) => <li key={x} className="flex gap-2"><Icon name="CheckCircle2" size={12} className="mt-0.5 text-[#0FA39D] shrink-0" />{x}</li>)}</ul></Panel>
              <Panel title="Riscos e restrições" dense><ul className="space-y-1.5 text-[11.5px] text-neutral-300">{[...alternative.riscos, ...alternative.restricoes].map((x) => <li key={x} className="flex gap-2"><Icon name="AlertTriangle" size={12} className="mt-0.5 text-[#E5A11A] shrink-0" />{x}</li>)}</ul></Panel>
            </div>
            <Panel title="Dependências críticas" dense><div className="flex flex-wrap gap-1.5">{alternative.dependencies.map((x) => <Pill key={x}>{x}</Pill>)}</div></Panel>
            {linkedAssetId && <button onClick={() => onOpenAsset(linkedAssetId)} className="w-full rounded-lg border border-[#1584D1]/30 bg-[#1584D1]/10 px-3 py-2.5 text-[12px] text-[#75B9E5] hover:bg-[#1584D1]/18">Abrir ativo relacionado no Ativo 360</button>}
          </div>
        </>}
      </SheetContent>
    </Sheet>
  );
}

function NewAlternativeSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (alternative: Alternative) => void }) {
  const [form, setForm] = useState({ nome: 'D — Telemedicina móvel + polos de apoio', tecnologia: 'Unidades móveis e polos regionais', capex: '59000000', opex: '3600000', prazo: '16', cobertura: '88', resiliencia: '72' });
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-xl overflow-y-auto nexo-scroll">
        <SheetHeader><SheetTitle className="text-neutral-50">Nova alternativa</SheetTitle><SheetDescription className="text-neutral-400">Cenário conceitual com validação posterior por agentes</SheetDescription></SheetHeader>
        <div className="mt-5 space-y-3">
          {Object.entries(form).map(([key, value]) => <label key={key} className="block text-[11px] text-neutral-400"><span className="capitalize">{key}</span><input value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-neutral-100 outline-none focus:border-[#7C5CBF]/60" /></label>)}
          <button onClick={() => { onCreate({ id: 'CEN-D', caseId: 'STR-2026-0041', nome: form.nome, descricao: 'Alternativa criada no mockup para comparação dinâmica.', localizacao: 'Cobertura móvel em 9 rotas', tecnologia: form.tecnologia, capacidade: '9 rotas · 58 mil habitantes', prazoMeses: Number(form.prazo), capex: Number(form.capex), opexAno: Number(form.opex), fundingMix: [{ name: 'Recursos próprios', value: 85 }, { name: 'Contrapartida', value: 15 }], tarifaOuCusteio: 'SUS + custeio municipal', beneficiarios: 58_000, vidaUtilAnos: 15, premissas: ['Rotas navegáveis durante 10 meses', 'Operação compartilhada'], riscos: ['Maior Opex logístico'], restricoes: ['Autorização sanitária móvel'], dependencies: ['Central regional', 'Conectividade'], indicators: { custoBeneficiario: Math.round(Number(form.capex) / 58_000), cobertura: Number(form.cobertura), resiliencia: Number(form.resiliencia), acessibilidade: 90, complexidade: 68, impacto: 84, bancabilidade: 78 }, score: 76.4, recommended: false, status: 'Rascunho' }); onClose(); }} className="w-full rounded-lg bg-[#7C5CBF] px-3 py-2.5 text-[12px] font-medium text-white hover:brightness-110">Criar alternativa e executar validações</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function EstruturaView({ section, onOpenAsset, onNavigateProduct, events, onPushEvent }: EstruturaViewProps) {
  const [selectedCaseId, setSelectedCaseId] = useState(STRUCTURE_CASES[0].id);
  const [alternatives, setAlternatives] = useState<Alternative[]>(ALTERNATIVES);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState('CEN-A');
  const [alternativeSheet, setAlternativeSheet] = useState<Alternative | null>(null);
  const [newAlternativeOpen, setNewAlternativeOpen] = useState(false);
  const [agents, setAgents] = useState<StructureAgentRuntime[]>(STRUCTURE_AGENTS.map((a) => ({ ...a })));
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStep, setLiveStep] = useState(0);
  const [assumptions, setAssumptions] = useState<FinancialAssumption[]>(FINANCIAL_ASSUMPTIONS.map((x) => ({ ...x })));
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResult, setSimulationResult] = useState({ p50: 84.2, p90Cost: 72.8, onTime: 78, recommendation: 'Alternativa A mantém melhor relação entre cobertura, impacto e custo.' });
  const [approved, setApproved] = useState(false);
  const [reportProgress, setReportProgress] = useState<Record<string, number>>({});
  const [rules, setRules] = useState(STRUCTURE_ADMIN_RULES.map((x) => ({ ...x, enabled: true })));
  const liveTimerRef = useRef<number | null>(null);
  const simulationTimerRef = useRef<number | null>(null);

  useEffect(() => () => { if (liveTimerRef.current) window.clearInterval(liveTimerRef.current); if (simulationTimerRef.current) window.clearInterval(simulationTimerRef.current); }, []);

  const selectedCase = STRUCTURE_CASES.find((x) => x.id === selectedCaseId) ?? STRUCTURE_CASES[0];
  const caseAlternatives = useMemo(() => {
    const exact = alternatives.filter((x) => x.caseId === selectedCase.id);
    if (exact.length) return exact;
    const templates = alternatives.filter((x) => x.caseId === 'STR-2026-0041').slice(0, 3);
    const names = ['A — Solução distribuída', 'B — Solução centralizada', 'C — Modelo híbrido'];
    return templates.map((template, index) => {
      const factor = [0.9, 1.18, 1.03][index];
      const capex = Math.round(selectedCase.valorReferencia * factor);
      return {
        ...template,
        id: `CEN-${String.fromCharCode(65 + index)}`,
        caseId: selectedCase.id,
        nome: names[index],
        descricao: `${names[index]} desenhada para ${selectedCase.nome}, com premissas técnicas e territoriais específicas do setor de ${selectedCase.setor.toLowerCase()}.`,
        localizacao: `${selectedCase.city}/${selectedCase.uf} e área de influência regional`,
        tecnologia: index === 0 ? 'Solução distribuída e modular' : index === 1 ? 'Infraestrutura centralizada de maior capacidade' : 'Combinação de componentes distribuídos e centrais',
        capacidade: `${fmtCompactNum(selectedCase.beneficiarios)} beneficiários`,
        capex,
        opexAno: Math.round(capex * [0.048, 0.032, 0.039][index]),
        beneficiarios: selectedCase.beneficiarios,
        indicators: {
          ...template.indicators,
          custoBeneficiario: Math.round(capex / selectedCase.beneficiarios),
          cobertura: [91, 74, 86][index],
          resiliencia: [78, 91, 85][index],
          impacto: [90, 76, 86][index],
          bancabilidade: [84, 82, 87][index],
        },
        score: [selectedCase.score, selectedCase.score - 11.2, selectedCase.score - 4.4][index],
        recommended: index === 0,
        status: index === 0 ? 'Recomendada' as const : 'Validada' as const,
      };
    });
  }, [alternatives, selectedCase]);
  const selectedAlternative = caseAlternatives.find((x) => x.id === selectedAlternativeId) ?? caseAlternatives[0] ?? alternatives[0];
  const recommended = caseAlternatives.find((x) => x.recommended) ?? caseAlternatives[0];

  const derived = useMemo(() => {
    const get = (id: string) => assumptions.find((x) => x.id === id)?.value ?? 0;
    const capexAdjusted = selectedAlternative.capex * (1 + get('contingency') / 100) * (1 + Math.max(0, get('inflation') - 4) / 100 * 0.5);
    const annualBenefit = selectedAlternative.beneficiarios * (410 + get('benefitGrowth') * 12);
    const pvFactor = Math.max(6, 12 - (get('discount') - 6) * 0.6);
    const npv = annualBenefit * pvFactor - capexAdjusted - selectedAlternative.opexAno * 7.5;
    const benefitCost = Math.max(0.7, (annualBenefit * pvFactor) / (capexAdjusted + selectedAlternative.opexAno * 7.5));
    const affordability = Math.max(40, Math.min(98, 100 - capexAdjusted / 2_100_000));
    return { capexAdjusted, annualBenefit, npv, benefitCost, affordability };
  }, [assumptions, selectedAlternative]);

  const radarData = useMemo(() => [
    { dimension: 'Cobertura', ...Object.fromEntries(caseAlternatives.map((a) => [a.id, a.indicators.cobertura])) },
    { dimension: 'Resiliência', ...Object.fromEntries(caseAlternatives.map((a) => [a.id, a.indicators.resiliencia])) },
    { dimension: 'Acessibilidade', ...Object.fromEntries(caseAlternatives.map((a) => [a.id, a.indicators.acessibilidade])) },
    { dimension: 'Impacto', ...Object.fromEntries(caseAlternatives.map((a) => [a.id, a.indicators.impacto])) },
    { dimension: 'Bancabilidade', ...Object.fromEntries(caseAlternatives.map((a) => [a.id, a.indicators.bancabilidade])) },
    { dimension: 'Simplicidade', ...Object.fromEntries(caseAlternatives.map((a) => [a.id, 100 - a.indicators.complexidade])) },
  ], [caseAlternatives]);

  function updateAgent(id: string, patch: Partial<StructureAgentRuntime>) { setAgents((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a)); }

  function runLiveCycle() {
    if (liveRunning) return;
    setLiveRunning(true); setLiveStep(0); setApproved(false); setAgents(STRUCTURE_AGENTS.map((a) => ({ ...a, status: 'idle', progress: 0 })));
    let index = 0;
    liveTimerRef.current = window.setInterval(() => {
      const step = STRUCTURE_LIVE_STEPS[index];
      updateAgent(step.agentId, { progress: step.progress, status: step.status, step: step.step, lastRun: nowStr() });
      onPushEvent(step.text, step.type);
      setLiveStep(index + 1);
      index += 1;
      if (index >= STRUCTURE_LIVE_STEPS.length) { if (liveTimerRef.current) window.clearInterval(liveTimerRef.current); setLiveRunning(false); }
    }, 820);
  }

  function runSingleAgent(id: string) {
    updateAgent(id, { status: 'running', progress: 12, step: 'Coletando dados e validando premissas...' });
    onPushEvent(`${agents.find((x) => x.id === id)?.name ?? 'Agente'} iniciado para ${selectedCase.id}.`, 'agent');
    window.setTimeout(() => updateAgent(id, { progress: 58, step: 'Executando modelos e verificando inconsistências...' }), 700);
    window.setTimeout(() => { updateAgent(id, { progress: 100, status: id === 'AG-EST-04' ? 'alert' : 'done', step: id === 'AG-EST-04' ? 'Análise concluída com duas lacunas territoriais.' : 'Análise concluída e recomendação atualizada.', lastRun: nowStr() }); onPushEvent(`Execução concluída: ${agents.find((x) => x.id === id)?.name}.`, id === 'AG-EST-04' ? 'warning' : 'success'); }, 1500);
  }

  function runSimulation() {
    if (simulationRunning) return;
    setSimulationRunning(true); setSimulationProgress(3);
    let progress = 3;
    simulationTimerRef.current = window.setInterval(() => {
      progress = Math.min(100, progress + Math.floor(Math.random() * 13 + 8));
      setSimulationProgress(progress);
      if (progress > 25 && progress < 40) onPushEvent('Simulador executando 5.000 combinações de Capex, prazo, cobertura e risco.', 'agent');
      if (progress >= 100) {
        if (simulationTimerRef.current) window.clearInterval(simulationTimerRef.current);
        const contingency = assumptions.find((x) => x.id === 'contingency')?.value ?? 9;
        setSimulationResult({ p50: Math.round((82 + contingency * 0.18) * 10) / 10, p90Cost: Math.round(derived.capexAdjusted * 1.08 / 1_000_000 * 10) / 10, onTime: Math.max(58, 88 - contingency), recommendation: contingency >= 8 ? 'Alternativa A permanece recomendada; reposicionar P-07/P-09 e converter manutenção naval em condicionante.' : 'Aumentar contingência antes da decisão; dispersão de custo acima da tolerância.' });
        setSimulationRunning(false); onPushEvent('Simulação concluída: recomendação e intervalos atualizados.', 'success');
      }
    }, 260);
  }

  function approveRecommendation() {
    setApproved(true);
    updateAgent('AG-EST-06', { status: 'done', progress: 100, step: 'Alternativa homologada; pacote transferido ao Nexo Contrata.', awaiting: 'Nenhuma ação' });
    onPushEvent(`Alternativa ${recommended.id} homologada para ${selectedCase.id}; baseline enviada ao Nexo Contrata.`, 'success');
  }

  function generateReport(id: string, name: string) {
    if (reportProgress[id] && reportProgress[id] < 100) return;
    setReportProgress((p) => ({ ...p, [id]: 8 }));
    let progress = 8;
    const timer = window.setInterval(() => {
      progress = Math.min(100, progress + 18);
      setReportProgress((p) => ({ ...p, [id]: progress }));
      if (progress >= 100) { window.clearInterval(timer); onPushEvent(`Relatório gerado: ${name}.`, 'success'); }
    }, 280);
  }

  const mapPoints = STRUCTURE_CASES.map((x) => ({ id: x.id, name: x.nome, lat: x.lat, lon: x.lon, color: x.stage === 'Aguardando decisão' ? '#7C5CBF' : x.stage === 'Aprovado' ? '#0FA39D' : x.stage === 'Em revisão' ? '#E5A11A' : '#1584D1', sublabel: `${x.city} · ${x.uf} · ${fmtCompactBRL(x.valorReferencia)}` }));
  const caseStatusData = Object.entries(STRUCTURE_CASES.reduce<Record<string, number>>((acc, item) => { acc[item.stage] = (acc[item.stage] ?? 0) + 1; return acc; }, {})).map(([name, value], index) => ({ name, value, fill: ['#1584D1', '#7C5CBF', '#E5A11A', '#0FA39D', '#9AACB8'][index] }));

  return (
    <div className="p-5 space-y-4 max-w-[1600px] mx-auto nexo-fade-in">
      <SectionHeader section={section} liveRunning={liveRunning} onStartLive={runLiveCycle} />

      <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
        <div className="flex items-center gap-2 min-w-0"><span className="text-[10.5px] uppercase tracking-wide text-neutral-500">Caso ativo</span><CaseSelector cases={STRUCTURE_CASES} selectedId={selectedCaseId} onSelect={(id) => { setSelectedCaseId(id); setSelectedAlternativeId('CEN-A'); }} /></div>
        <div className="flex flex-wrap gap-1.5"><ProductLink icon="Briefcase" label="Origem no Nexo Carteira" onClick={() => onNavigateProduct('carteira')} tone="blue" /><ProductLink icon="DollarSign" label="Funding no Nexo Capital" onClick={() => onNavigateProduct('capital')} tone="teal" /><ProductLink icon="ClipboardCheck" label="Encaminhar ao Nexo Contrata" onClick={() => onNavigateProduct('contrata')} /><ProductLink icon="Database" label="Dados e linhagem" onClick={() => onNavigateProduct('data')} tone="neutral" /></div>
      </div>

      {section === 'overview' && <>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Casos ativos" value="18" delta="+3 no mês" icon="Layers" />
          <KpiCard label="Valor estruturado" value="R$ 2,8 bi" delta="+R$ 420 mi" icon="DollarSign" />
          <KpiCard label="Alternativas avaliadas" value="47" delta="2,6 por caso" icon="GitBranch" />
          <KpiCard label="Tempo médio" value="32 dias" delta="-17 dias" icon="Clock" />
          <KpiCard label="Precisão Capex" value="91%" delta="+6 p.p." icon="Target" />
          <KpiCard label="Decisões pendentes" value="4" delta="R$ 697 mi" deltaTone="amber" icon="User" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-4">
          <Panel title={selectedCase.nome} subtitle={`${selectedCase.id} · ${selectedCase.setor} · ${selectedCase.city}/${selectedCase.uf}`} actions={<StatusChip status={STAGE_TONE[selectedCase.stage]} size="sm" />}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-4">
              <div>
                <p className="text-[12.5px] text-neutral-300 leading-relaxed">{selectedCase.problema}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">{[['Referência', fmtCompactBRL(selectedCase.valorReferencia)], ['Beneficiários', fmtCompactNum(selectedCase.beneficiarios)], ['Score', selectedCase.score.toFixed(1)], ['Confiança', `${selectedCase.confidence}%`]].map(([label, value]) => <div key={label} className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[10px] text-neutral-500">{label}</div><div className="text-[13px] text-neutral-100 font-medium tnum mt-0.5">{value}</div></div>)}</div>
                <div className="mt-3 rounded-lg border border-[#7C5CBF]/25 bg-[#7C5CBF]/8 p-3"><div className="text-[10.5px] uppercase tracking-wide text-[#B6A3E3]">Próxima decisão</div><div className="text-[12px] text-neutral-200 mt-1">{selectedCase.proximaDecisao}</div><div className="text-[10.5px] text-neutral-500 mt-1">Responsável: {selectedCase.responsavel} · prazo {selectedCase.prazoAlvo}</div></div>
              </div>
              <div className="space-y-2">
                {caseAlternatives.map((alt) => <button key={alt.id} onClick={() => { setSelectedAlternativeId(alt.id); setAlternativeSheet(alt); }} className={cls('w-full rounded-lg border p-3 text-left transition', alt.recommended ? 'border-[#0FA39D]/35 bg-[#0FA39D]/8' : selectedAlternativeId === alt.id ? 'border-[#7C5CBF]/45 bg-[#7C5CBF]/8' : 'border-white/9 bg-white/[0.02] hover:bg-white/[0.045]')}><div className="flex items-center justify-between gap-2"><span className="text-[12px] font-medium text-neutral-100">{alt.nome}</span><span className="text-[13px] font-semibold tnum" style={{ color: ALT_COLORS[alt.id] ?? '#9AACB8' }}>{alt.score}</span></div><div className="mt-1.5 grid grid-cols-3 gap-2 text-[10.5px] text-neutral-500"><span>{fmtCompactBRL(alt.capex)}</span><span>{alt.prazoMeses} meses</span><span>{alt.indicators.cobertura}% cobertura</span></div></button>)}
              </div>
            </div>
          </Panel>

          <Panel title="Linha de estruturação" subtitle="Do encaminhamento à baseline">
            <div className="space-y-3">{[
              ['Carteira priorizada', 100, 'normal'], ['Alternativas desenhadas', 100, 'normal'], ['Modelos integrados', 92, 'analise'], ['Riscos e dependências', 78, 'atencao'], ['Recomendação', 96, 'decisao'], ['Baseline para Contrata', approved ? 100 : 24, approved ? 'normal' : 'pendente'],
            ].map(([label, progress, status]) => <div key={String(label)}><div className="flex items-center justify-between mb-1"><span className="text-[11.5px] text-neutral-300">{label}</span><StatusChip status={status as 'normal' | 'analise' | 'atencao' | 'decisao' | 'pendente'} size="sm" /></div><ProgressBar value={Number(progress) / 100} tone={status === 'normal' ? 'teal' : status === 'atencao' ? 'amber' : status === 'decisao' ? 'cyan' : 'blue'} /></div>)}</div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Comparação executiva" subtitle="Dimensões normalizadas"><RadarComparison data={radarData} keys={caseAlternatives.map((a) => ({ key: a.id, label: a.id.replace('CEN-', ''), color: ALT_COLORS[a.id] ?? '#9AACB8' }))} /></Panel>
          <Panel title="Decisões e recomendações" subtitle="Ações críticas do caso">
            <div className="space-y-2">
              <div className="rounded-lg border border-[#E5A11A]/25 bg-[#E5A11A]/8 p-3"><div className="flex items-center gap-2 text-[11.5px] text-[#F0B94A]"><Icon name="AlertTriangle" size={13} />Risco operacional residual</div><div className="mt-1 text-[11.5px] text-neutral-300">Manutenção naval precisa ser formalizada como condicionante contratual.</div></div>
              <div className="rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/8 p-3"><div className="flex items-center gap-2 text-[11.5px] text-[#6FD8EC]"><Icon name="MapPinned" size={13} />Otimização territorial</div><div className="mt-1 text-[11.5px] text-neutral-300">Reposicionar P-07 e P-09 eleva cobertura estimada para 95%.</div></div>
              <button onClick={approveRecommendation} disabled={approved} className="w-full rounded-lg bg-[#7C5CBF] px-3 py-2.5 text-[12px] font-medium text-white hover:brightness-110 disabled:opacity-55"><Icon name={approved ? 'CheckCircle2' : 'ThumbsUp'} size={13} className="inline mr-1.5" />{approved ? 'Alternativa homologada e transferida' : 'Homologar alternativa recomendada'}</button>
            </div>
          </Panel>
          <Panel title="Eventos da estruturação" subtitle={`Ciclo ao vivo · ${liveStep}/${STRUCTURE_LIVE_STEPS.length}`}><EventFeed events={events.slice(-12)} dense maxHeight={260} /></Panel>
        </div>
      </>}

      {section === 'alternatives' && <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div className="text-[12px] text-neutral-400">{caseAlternatives.length} alternativas vinculadas a {selectedCase.id}</div><button onClick={() => setNewAlternativeOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C5CBF] px-3 py-2 text-[12px] font-medium text-white hover:brightness-110"><Icon name="Plus" size={13} />Nova alternativa</button></div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-4">
          <Panel title="Comparador de alternativas" subtitle="Selecione uma configuração para abrir o dossiê">
            <div className="overflow-x-auto nexo-scroll"><table className="w-full text-left text-[11.5px]"><thead><tr className="border-b border-white/8 text-[10px] uppercase tracking-wide text-neutral-500">{['Alternativa', 'Capex', 'Opex/ano', 'Prazo', 'Cobertura', 'Resiliência', 'Score', 'Status'].map((x) => <th key={x} className="px-2 py-2 font-medium">{x}</th>)}</tr></thead><tbody>{caseAlternatives.map((a) => <tr key={a.id} onClick={() => { setSelectedAlternativeId(a.id); setAlternativeSheet(a); }} className="border-b border-white/[0.055] hover:bg-white/[0.035] cursor-pointer"><td className="px-2 py-2.5"><div className="font-medium text-neutral-200">{a.nome}</div><div className="text-[10px] text-neutral-500 mt-0.5">{a.tecnologia}</div></td><td className="px-2 py-2.5 tnum text-neutral-300">{fmtCompactBRL(a.capex)}</td><td className="px-2 py-2.5 tnum text-neutral-300">{fmtCompactBRL(a.opexAno)}</td><td className="px-2 py-2.5 tnum text-neutral-300">{a.prazoMeses}m</td><td className="px-2 py-2.5 tnum text-neutral-300">{a.indicators.cobertura}%</td><td className="px-2 py-2.5 tnum text-neutral-300">{a.indicators.resiliencia}%</td><td className="px-2 py-2.5 font-semibold tnum" style={{ color: ALT_COLORS[a.id] ?? '#9AACB8' }}>{a.score}</td><td className="px-2 py-2.5"><Pill tone={a.recommended ? 'cyan' : 'neutral'}>{a.status}</Pill></td></tr>)}</tbody></table></div>
          </Panel>
          <Panel title="Radar técnico-territorial" subtitle="Quanto mais externo, melhor"><RadarComparison data={radarData} keys={caseAlternatives.map((a) => ({ key: a.id, label: a.id.replace('CEN-', ''), color: ALT_COLORS[a.id] ?? '#9AACB8' }))} /></Panel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{caseAlternatives.map((a) => <Panel key={a.id} title={a.nome} subtitle={a.descricao} actions={a.recommended ? <Pill tone="cyan">Recomendada</Pill> : undefined}><div className="space-y-2"><div className="grid grid-cols-2 gap-2 text-[11px]"><div className="rounded-md bg-white/[0.035] p-2"><span className="text-neutral-500">Capex</span><div className="text-neutral-100 tnum">{fmtCompactBRL(a.capex)}</div></div><div className="rounded-md bg-white/[0.035] p-2"><span className="text-neutral-500">Custo/benef.</span><div className="text-neutral-100 tnum">{fmtBRL(a.indicators.custoBeneficiario)}</div></div></div><div className="text-[10.5px] text-neutral-500">Dependências: {a.dependencies.join('; ')}</div><button onClick={() => setAlternativeSheet(a)} className="w-full rounded-md border border-white/10 bg-white/[0.035] px-2 py-1.5 text-[11.5px] text-neutral-300 hover:bg-white/[0.06]">Abrir dossiê completo</button></div></Panel>)}</div>
      </>}

      {section === 'financial' && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><KpiCard label="Capex ajustado" value={fmtCompactBRL(derived.capexAdjusted)} icon="Calculator" /><KpiCard label="Opex anual" value={fmtCompactBRL(selectedAlternative.opexAno)} icon="Activity" /><KpiCard label="VPL socioeconômico" value={fmtCompactBRL(derived.npv)} delta={derived.npv > 0 ? 'positivo' : 'revisar'} deltaTone={derived.npv > 0 ? 'teal' : 'red'} icon="TrendingUp" /><KpiCard label="Benefício/custo" value={derived.benefitCost.toFixed(2).replace('.', ',')} hint="mínimo 1,0" icon="Target" /><KpiCard label="Acessibilidade" value={`${Math.round(derived.affordability)}%`} icon="Users" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-[.75fr_1.25fr] gap-4">
          <Panel title="Premissas editáveis" subtitle="Recalcula os indicadores em tempo real">
            <div className="space-y-4">{assumptions.map((item) => <div key={item.id}><div className="flex justify-between text-[11.5px] mb-1.5"><span className="text-neutral-400">{item.label}</span><span className="text-neutral-100 tnum">{item.value.toFixed(item.step < 1 ? 1 : 0).replace('.', ',')} {item.suffix}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={item.value} onChange={(e) => setAssumptions((prev) => prev.map((x) => x.id === item.id ? { ...x, value: Number(e.target.value) } : x))} className="w-full accent-[#7C5CBF]" /></div>)}</div>
            <button onClick={() => setAssumptions(FINANCIAL_ASSUMPTIONS.map((x) => ({ ...x })))} className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-200"><Icon name="RotateCcw" size={12} />Restaurar baseline</button>
          </Panel>
          <Panel title="Fluxo econômico projetado" subtitle="R$ milhões · valores sintéticos">
            <ResponsiveContainer width="100%" height={300}><ComposedChart data={CASHFLOW_BASE}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="year" tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Bar dataKey="capex" name="Capex" fill="#D14A55" radius={[3,3,0,0]} /><Bar dataKey="opex" name="Opex" fill="#E5A11A" radius={[3,3,0,0]} /><Line type="monotone" dataKey="benefit" name="Benefício" stroke="#0FA39D" strokeWidth={2.3} dot={{ r: 2 }} /></ComposedChart></ResponsiveContainer>
          </Panel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Funding mix" subtitle={selectedAlternative.tarifaOuCusteio}><DonutChart data={selectedAlternative.fundingMix.map((x, i) => ({ ...x, fill: ['#087C78', '#1584D1', '#7C5CBF', '#E5A11A'][i] }))} /></Panel>
          <Panel title="Capex × Opex" subtitle="Comparação entre alternativas"><ResponsiveContainer width="100%" height={230}><BarChart data={caseAlternatives.map((a) => ({ name: a.id.replace('CEN-', ''), capex: a.capex / 1_000_000, opex: a.opexAno / 1_000_000 }))}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Bar dataKey="capex" name="Capex" fill="#7C5CBF" /><Bar dataKey="opex" name="Opex" fill="#18B7D6" /></BarChart></ResponsiveContainer></Panel>
          <Panel title="Controles de bancabilidade" subtitle="Gates antes do Contrata"><div className="space-y-3">{[['Funding aderente', 0.94, 'teal'], ['Reserva de contingência', assumptions.find((x) => x.id === 'contingency')!.value / 12, 'amber'], ['Capacidade de custeio', derived.affordability / 100, 'blue'], ['Plano de operação', 0.81, 'cyan'], ['Evidências previstas', 0.88, 'teal']].map(([label, value, tone]) => <div key={String(label)}><div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400">{label}</span><span className="text-neutral-200 tnum">{Math.round(Number(value) * 100)}%</span></div><ProgressBar value={Number(value)} tone={tone as 'teal' | 'amber' | 'blue' | 'cyan'} /></div>)}</div></Panel>
        </div>
      </>}

      {section === 'scenarios' && <>
        <div className="grid grid-cols-1 xl:grid-cols-[.7fr_1.3fr] gap-4">
          <Panel title="Simulador de cenários" subtitle="Estresse de custo, prazo, cobertura e risco">
            <div className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex items-center justify-between"><div><div className="text-[12px] font-medium text-neutral-100">Monte Carlo simplificado</div><div className="text-[10.5px] text-neutral-500 mt-0.5">5.000 combinações sintéticas</div></div><Pill tone="cyan">Agente assistido</Pill></div><div className="mt-3"><ProgressBar value={simulationProgress / 100} tone="cyan" height={8} /></div><div className="mt-1 text-right text-[10.5px] text-neutral-500 tnum">{simulationProgress}%</div><button onClick={runSimulation} disabled={simulationRunning} className="mt-2 w-full rounded-md bg-[#7C5CBF] px-3 py-2 text-[12px] text-white disabled:opacity-55"><Icon name={simulationRunning ? 'Loader2' : 'Play'} size={13} className={cls('inline mr-1.5', simulationRunning && 'animate-spin')} />{simulationRunning ? 'Executando cenários...' : 'Executar simulação'}</button></div>
            <div className="mt-3 grid grid-cols-3 gap-2">{[['P50 score', simulationResult.p50.toFixed(1)], ['P90 custo', `R$ ${simulationResult.p90Cost.toFixed(1).replace('.', ',')} mi`], ['No prazo', `${simulationResult.onTime}%`]].map(([label, value]) => <div key={label} className="rounded-md bg-white/[0.035] p-2 text-center"><div className="text-[9.5px] text-neutral-500">{label}</div><div className="mt-0.5 text-[13px] font-semibold text-neutral-100 tnum">{value}</div></div>)}</div>
            <div className="mt-3 rounded-lg border border-[#18B7D6]/25 bg-[#18B7D6]/7 p-3 text-[11.5px] text-neutral-300">{simulationResult.recommendation}</div>
          </Panel>
          <Panel title="Tornado de sensibilidade" subtitle="Impacto sobre VPL socioeconômico (%)">
            <div className="space-y-3 pt-2">{SENSITIVITY.map((item) => <div key={item.variable} className="grid grid-cols-[150px_1fr] items-center gap-3"><span className="text-[10.5px] text-neutral-400 text-right">{item.variable}</span><div className="grid grid-cols-2 gap-0 items-center"><div className="h-4 flex justify-end"><div className="h-full bg-[#D14A55]/75 rounded-l" style={{ width: `${Math.abs(item.downside) * 4.2}%` }} /></div><div className="h-4"><div className="h-full bg-[#0FA39D]/75 rounded-r" style={{ width: `${item.upside * 4.2}%` }} /></div></div></div>)}</div>
            <div className="flex justify-between text-[10px] text-neutral-500 mt-4"><span>Impacto negativo</span><span>Impacto positivo</span></div>
          </Panel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Vida útil e manutenção" subtitle="Integridade e custo anual projetado"><ResponsiveContainer width="100%" height={270}><ComposedChart data={LIFE_CYCLE}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="year" tickFormatter={(x) => `Ano ${x}`} tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis yAxisId="left" tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Area yAxisId="left" type="monotone" dataKey="integrity" name="Integridade (%)" stroke="#1584D1" fill="#1584D1" fillOpacity={.16} /><Line yAxisId="right" type="monotone" dataKey="maintenance" name="Manutenção (R$ mi)" stroke="#E5A11A" strokeWidth={2.2} /></ComposedChart></ResponsiveContainer></Panel>
          <Panel title="Riscos do cenário recomendado" subtitle="Probabilidade × impacto"><RiskMatrixChart data={[{ name: 'Nível do rio', prob: 4, impact: 4, value: 16, fill: '#D14A55' }, { name: 'Manutenção naval', prob: 3, impact: 4, value: 12, fill: '#E5A11A' }, { name: 'Conectividade', prob: 3, impact: 3, value: 9, fill: '#E5A11A' }, { name: 'Licenciamento', prob: 2, impact: 3, value: 6, fill: '#1584D1' }, { name: 'Custeio', prob: 2, impact: 4, value: 8, fill: '#E5A11A' }]} /></Panel>
        </div>
      </>}

      {section === 'map' && <>
        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-4">
          <Panel title="Mapa da carteira de estruturação" subtitle="ArcGIS em produção · camadas sintéticas no mockup" actions={<div className="flex gap-1"><Pill tone="cyan">Living Atlas</Pill><Pill>IBGE</Pill><Pill>Riscos</Pill></div>}><GeoDotMap points={mapPoints} height={470} selectedId={selectedCase.id} onSelectPoint={(id) => setSelectedCaseId(id)} /></Panel>
          <div className="space-y-4">
            <Panel title="Contexto territorial" subtitle={selectedCase.nome}><div className="space-y-2.5 text-[11.5px]"><div className="grid grid-cols-2 gap-2">{[['Território', `${selectedCase.city}/${selectedCase.uf}`], ['Região', selectedCase.region], ['Beneficiários', fmtCompactNum(selectedCase.beneficiarios)], ['Valor', fmtCompactBRL(selectedCase.valorReferencia)]].map(([l, v]) => <div key={l} className="rounded-md bg-white/[0.035] p-2"><div className="text-[9.5px] text-neutral-500">{l}</div><div className="text-neutral-200 mt-0.5">{v}</div></div>)}</div><div className="rounded-md border border-[#18B7D6]/20 bg-[#18B7D6]/7 p-2.5"><div className="text-[#6FD8EC] text-[10.5px]">Insight territorial</div><div className="text-neutral-300 mt-1">Otimização de dois pontos aumenta a área coberta e reduz deslocamentos médios em 17%.</div></div><div className="text-neutral-500">Camadas ativas: população, hidrografia, cobertura do solo, equipamentos SUS, risco de inundação e acessibilidade.</div></div></Panel>
            <Panel title="Dependências de rede"><div className="space-y-2">{['Base logística regional', 'Telemedicina e conectividade', 'Fornecimento de energia', 'Contrato de manutenção', 'Rede de referência hospitalar'].map((x, i) => <div key={x} className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.025] px-2.5 py-2"><span className="text-[11.5px] text-neutral-300">{x}</span><StatusChip status={i === 3 ? 'atencao' : i === 1 ? 'analise' : 'normal'} size="sm" /></div>)}</div></Panel>
          </div>
        </div>
        <Panel title="Casos e localização" subtitle="Clique para atualizar o contexto"><div className="overflow-x-auto"><table className="w-full text-[11.5px]"><tbody>{STRUCTURE_CASES.map((x) => <tr key={x.id} onClick={() => setSelectedCaseId(x.id)} className="border-b border-white/[0.055] hover:bg-white/[0.035] cursor-pointer"><td className="py-2.5 px-2 text-neutral-200 font-medium">{x.nome}</td><td className="py-2.5 px-2 text-neutral-400">{x.city}/{x.uf}</td><td className="py-2.5 px-2 text-neutral-400">{x.setor}</td><td className="py-2.5 px-2 tnum text-neutral-300">{fmtCompactBRL(x.valorReferencia)}</td><td className="py-2.5 px-2"><StatusChip status={STAGE_TONE[x.stage]} size="sm" /></td><td className="py-2.5 px-2 text-right"><Icon name="ArrowRight" size={12} className="inline text-neutral-500" /></td></tr>)}</tbody></table></div></Panel>
      </>}

      {section === 'analytics' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Conversão para Contrata" value="68%" delta="+9 p.p." icon="ArrowUpRight" /><KpiCard label="Retrabalho" value="11%" delta="-7 p.p." icon="RotateCcw" /><KpiCard label="Precisão de prazo" value="87%" delta="+5 p.p." icon="CalendarClock" /><KpiCard label="Valor otimizado" value="R$ 184 mi" delta="economia potencial" icon="TrendingDown" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Status da carteira"><DonutChart data={caseStatusData} /></Panel>
          <Panel title="Casos e decisões" subtitle="Evolução mensal"><ResponsiveContainer width="100%" height={250}><LineChart data={PORTFOLIO_HISTORY}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Line type="monotone" dataKey="cases" name="Casos" stroke="#7C5CBF" strokeWidth={2.2} /><Line type="monotone" dataKey="decisions" name="Decisões" stroke="#0FA39D" strokeWidth={2.2} /></LineChart></ResponsiveContainer></Panel>
          <Panel title="Tempo médio" subtitle="Dias até decisão"><ResponsiveContainer width="100%" height={250}><AreaChart data={PORTFOLIO_HISTORY}><defs><linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#18B7D6" stopOpacity={.3}/><stop offset="95%" stopColor="#18B7D6" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#9AACB8', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Area type="monotone" dataKey="avgDays" name="Dias" stroke="#18B7D6" fill="url(#timeGrad)" /></AreaChart></ResponsiveContainer></Panel>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Panel title="Insights explicáveis" subtitle="Analytics + agentes"><div className="space-y-2.5">{[
            ['Custo e prazo', 'Alternativas modulares reduziram em média 21% o prazo de implantação, com Opex 13% maior.', '93%', 'R$ 112 mi'],
            ['Qualidade territorial', 'Casos com área de influência validada antes do modelo financeiro tiveram 34% menos retrabalho.', '91%', '17 dias'],
            ['Funding', 'A integração antecipada com Nexo Capital reduziu reenquadramentos em 26%.', '88%', 'R$ 420 mi'],
            ['Riscos', 'Manutenção e operador são as dependências mais subestimadas nos projetos de infraestrutura social.', '90%', '6 casos'],
          ].map(([title, text, confidence, impact]) => <div key={title} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex justify-between gap-3"><div className="text-[11.5px] font-medium text-neutral-100">{title}</div><Pill tone="cyan">conf. {confidence}</Pill></div><div className="text-[11.5px] text-neutral-300 mt-1.5">{text}</div><div className="text-[10.5px] text-neutral-500 mt-1">Impacto: {impact}</div></div>)}</div></Panel>
          <Panel title="Maturidade por dimensão" subtitle="Média da carteira"><SingleBarChart data={[{ name: 'Técnica', value: 86 }, { name: 'Financeira', value: 78 }, { name: 'Territorial', value: 82 }, { name: 'Institucional', value: 69 }, { name: 'Operacional', value: 64 }, { name: 'Impacto', value: 81 }]} xKey="name" yKey="value" color="#7C5CBF" /></Panel>
        </div>
      </>}

      {section === 'agents' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><KpiCard label="Agentes ativos" value={String(agents.filter((x) => x.status === 'running').length)} icon="Bot" /><KpiCard label="Análises concluídas" value={String(agents.filter((x) => x.status === 'done').length)} icon="CheckCircle2" /><KpiCard label="Gates humanos" value={String(agents.filter((x) => x.status === 'waiting').length)} delta="obrigatórios" deltaTone="amber" icon="User" /><KpiCard label="Confiança média" value={`${Math.round(agents.reduce((s, x) => s + x.confidence, 0) / agents.length)}%`} icon="Target" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_.75fr] gap-4">
          <Panel title="Cockpit de agentes" subtitle="Execuções rastreáveis e supervisionadas"><div className="space-y-2.5">{agents.map((agent) => <AgentRow key={agent.id} agent={agent} onRun={() => runSingleAgent(agent.id)} />)}</div></Panel>
          <div className="space-y-4"><Panel title="Sequência de orquestração" subtitle={`Etapa ${liveStep} de ${STRUCTURE_LIVE_STEPS.length}`}><div className="space-y-2">{STRUCTURE_LIVE_STEPS.map((step, index) => <div key={`${step.agentId}-${index}`} className={cls('flex items-start gap-2 rounded-md border p-2', index < liveStep ? 'border-[#0FA39D]/20 bg-[#0FA39D]/6' : index === liveStep && liveRunning ? 'border-[#18B7D6]/30 bg-[#18B7D6]/7' : 'border-white/7 bg-white/[0.015]')}><Icon name={index < liveStep ? 'CheckCircle2' : index === liveStep && liveRunning ? 'Loader2' : 'Circle'} size={12} className={cls('mt-0.5 shrink-0', index < liveStep ? 'text-[#0FA39D]' : index === liveStep && liveRunning ? 'text-[#18B7D6] animate-spin' : 'text-neutral-600')} /><span className="text-[10.5px] text-neutral-400">{step.text}</span></div>)}</div></Panel><Panel title="Guardrails" subtitle="Decisões reservadas a pessoas"><div className="space-y-2 text-[11.5px] text-neutral-300">{['Seleção final da alternativa', 'Alteração de funding ou garantias', 'Aceite de risco residual elevado', 'Homologação da baseline', 'Encaminhamento formal ao Contrata'].map((x) => <div key={x} className="flex items-center gap-2"><Icon name="Lock" size={12} className="text-[#7C5CBF]" />{x}</div>)}</div></Panel></div>
        </div>
      </>}

      {section === 'reports' && <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{STRUCTURE_REPORTS.map((report) => { const progress = reportProgress[report.id] ?? 0; return <Panel key={report.id} title={report.name} subtitle={`${report.id} · ${report.cadence}`} actions={<Pill>{report.format}</Pill>}><p className="text-[11.5px] text-neutral-300 min-h-[34px]">{report.description}</p><div className="mt-2 text-[10.5px] text-neutral-500">Proprietário: {report.owner} · última geração: {report.last}</div>{progress > 0 && progress < 100 && <div className="mt-3"><ProgressBar value={progress / 100} tone="cyan" /><div className="text-right text-[10px] text-neutral-500 mt-1">{progress}%</div></div>}<div className="mt-3 flex gap-2"><button onClick={() => generateReport(report.id, report.name)} className="flex-1 rounded-md border border-[#7C5CBF]/30 bg-[#7C5CBF]/10 px-2 py-2 text-[11.5px] text-[#C2B4E8] hover:bg-[#7C5CBF]/18"><Icon name={progress > 0 && progress < 100 ? 'Loader2' : 'FileText'} size={12} className={cls('inline mr-1', progress > 0 && progress < 100 && 'animate-spin')} />{progress === 100 ? 'Regenerar' : progress > 0 ? 'Gerando...' : 'Gerar relatório'}</button>{progress === 100 && <button onClick={() => downloadText(`${report.id}.csv`, `relatorio;${report.name}\ncaso;${selectedCase.id}\nalternativa;${recommended.id}\nscore;${recommended.score}\n`)} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-neutral-300"><Icon name="Download" size={13} /></button>}</div></Panel>; })}</div>
        <Panel title="Pacote de decisão" subtitle="Consolidação para comitê e Nexo Contrata"><div className="grid grid-cols-1 md:grid-cols-4 gap-2">{['Resumo executivo', 'Comparação de alternativas', 'Modelo financeiro', 'Mapa e cobertura', 'Riscos e condicionantes', 'Pareceres dos agentes', 'Plano de evidências', 'Baseline estruturada'].map((x, i) => <div key={x} className="rounded-md border border-white/8 bg-white/[0.025] p-2.5"><div className="flex items-center gap-2"><Icon name={i < 6 ? 'CheckCircle2' : 'Clock'} size={12} className={i < 6 ? 'text-[#0FA39D]' : 'text-[#E5A11A]'} /><span className="text-[11px] text-neutral-300">{x}</span></div></div>)}</div></Panel>
      </>}

      {section === 'admin' && <>
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_.85fr] gap-4">
          <Panel title="Regras corporativas" subtitle="Parâmetros e gates do processo"><div className="space-y-2.5">{rules.map((rule) => <div key={rule.id} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex items-start justify-between gap-3"><div><div className="text-[11.5px] font-medium text-neutral-100">{rule.name}</div><div className="text-[10.5px] text-neutral-500 mt-1">{rule.description}</div><div className="text-[10.5px] text-[#B6A3E3] mt-1">Parâmetro: {rule.value}</div></div><button onClick={() => setRules((prev) => prev.map((x) => x.id === rule.id ? { ...x, enabled: !x.enabled } : x))} className={cls('relative w-9 h-5 rounded-full transition shrink-0', rule.enabled ? 'bg-[#0FA39D]' : 'bg-neutral-700')}><span className={cls('absolute top-0.5 h-4 w-4 rounded-full bg-white transition', rule.enabled ? 'left-[18px]' : 'left-0.5')} /></button></div></div>)}</div></Panel>
          <Panel title="Integrações do produto" subtitle="Interfaces preservam sistemas de registro"><div className="space-y-2">{INTEGRATION_TOUCHPOINTS.map((item) => <div key={item.system} className="rounded-lg border border-white/9 bg-white/[0.025] p-3"><div className="flex items-center justify-between gap-2"><div className="text-[11.5px] font-medium text-neutral-100">{item.system}</div><StatusChip status={item.status} size="sm" /></div><div className="text-[10.5px] text-neutral-500 mt-1">{item.direction} · {item.latency}</div><div className="text-[11px] text-neutral-300 mt-1">{item.object}</div></div>)}</div></Panel>
        </div>
        <Panel title="Matriz de perfis e alçadas" subtitle="Acesso por responsabilidade e decisão"><div className="overflow-x-auto nexo-scroll"><table className="w-full text-[11px]"><thead><tr className="border-b border-white/8 text-[9.5px] uppercase tracking-wide text-neutral-500">{['Perfil', 'Alternativas', 'Financeiro', 'Recomendação', 'Alçada'].map((x) => <th key={x} className="text-left px-2 py-2 font-medium">{x}</th>)}</tr></thead><tbody>{STRUCTURE_ROLE_MATRIX.map((row) => <tr key={row.role} className="border-b border-white/[0.055]"><td className="px-2 py-2.5 text-neutral-200 font-medium">{row.role}</td><td className="px-2 py-2.5 text-neutral-400">{row.alternatives}</td><td className="px-2 py-2.5 text-neutral-400">{row.finance}</td><td className="px-2 py-2.5 text-neutral-400">{row.recommendation}</td><td className="px-2 py-2.5 text-neutral-300">{row.approval}</td></tr>)}</tbody></table></div></Panel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Panel title="Ambiente"><div className="space-y-2 text-[11.5px]">{[['Modo', 'Demonstração'], ['Versão', 'Nexo Estrutura 3.0'], ['Dados', 'Sintéticos'], ['Última publicação', '21/07/2026 19:20']].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/[0.055] pb-1.5"><span className="text-neutral-500">{a}</span><span className="text-neutral-300">{b}</span></div>)}</div></Panel><Panel title="Auditoria"><div className="space-y-2 text-[11px] text-neutral-400"><div>19:14 · Premissa de contingência alterada para 9%.</div><div>19:08 · Agente territorial identificou dois pontos subótimos.</div><div>18:51 · Modelo C aprovado para comparação.</div><div>18:33 · Funding sincronizado com Nexo Capital.</div></div></Panel><Panel title="Governança de IA"><div className="space-y-2 text-[11px] text-neutral-400"><div className="flex gap-2"><Icon name="ShieldCheck" size={12} className="text-[#0FA39D]" />Fontes e modelos registrados.</div><div className="flex gap-2"><Icon name="User" size={12} className="text-[#7C5CBF]" />Gate humano obrigatório.</div><div className="flex gap-2"><Icon name="FileSearch" size={12} className="text-[#18B7D6]" />Recomendação explicável e auditável.</div><div className="flex gap-2"><Icon name="Lock" size={12} className="text-[#E5A11A]" />Sem decisão financeira autônoma.</div></div></Panel></div>
      </>}

      <AlternativeSheet alternative={alternativeSheet} onClose={() => setAlternativeSheet(null)} onOpenAsset={onOpenAsset} linkedAssetId={selectedCase.linkedAssetId} />
      <NewAlternativeSheet open={newAlternativeOpen} onClose={() => setNewAlternativeOpen(false)} onCreate={(alternative) => { setAlternatives((prev) => [...prev.filter((x) => x.id !== alternative.id), alternative]); setSelectedAlternativeId(alternative.id); onPushEvent(`Nova alternativa ${alternative.id} criada e enviada aos agentes de validação.`, 'agent'); }} />
    </div>
  );
}
