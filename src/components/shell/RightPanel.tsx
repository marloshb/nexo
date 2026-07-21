import { useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { AGENTS, ASSETS, type EventItem } from '@/data/mockData';
import { Pill } from '@/components/shared/Primitives';
import type { ProductKey } from '@/data/navConfig';

type ContextItem = {
  id: string;
  title: string;
  detail: string;
  assetId?: string;
  product?: ProductKey;
  severity?: 'alta' | 'media' | 'baixa';
};

type RightPanelProps = {
  onClose: () => void;
  product: ProductKey;
  onNavigate: (product: ProductKey) => void;
  onOpenAsset: (assetId: string) => void;
  onOpenAsk: () => void;
  onPushEvent: (text: string, type: EventItem['type']) => void;
};

const PRODUCT_LABELS: Partial<Record<ProductKey, string>> = {
  hub: 'Visão integrada', control: 'Controle corporativo', capital: 'Capital e funding', carteira: 'Carteira e originação',
  estrutura: 'Estruturação', contrata: 'Contratação', entrega: 'Execução e desembolso', evidencia: 'Evidências',
  ativos: 'Ativos e operação', impacto: 'Impacto e resultados', agents: 'Agentes', data: 'Dados e governança', ativo360: 'Ativo 360',
};

const RISKS: ContextItem[] = [
  { id: 'risk-vale', title: 'Divergência geométrica — Vale Verde', detail: '3 trechos executados não coincidem com a geometria contratual. R$ 2,65 mi permanecem retidos.', assetId: ASSETS[0]?.id, product: 'evidencia', severity: 'alta' },
  { id: 'risk-rio', title: 'Exposição climática — Rio Norte', detail: 'Alerta hidrológico afeta 2 ativos e pode exigir reprogramação de cronograma.', assetId: ASSETS[2]?.id, product: 'ativos', severity: 'alta' },
  { id: 'risk-horizonte', title: 'Acesso viário — Horizonte Azul', detail: 'Prontidão operacional bloqueada por pendência de acesso e transporte público.', assetId: ASSETS[1]?.id, product: 'entrega', severity: 'media' },
];

const DOCUMENTS = [
  { id: 'doc-1', name: 'Boletim de medição nº 6.pdf', type: 'Medição', status: 'Assinado', assetId: ASSETS[0]?.id, content: 'Boletim de Medição nº 6\nContrato: CT-2025-SAN-0142\nValor medido: R$ 18.350.000\nValor liberável: R$ 15.700.000\nRetenção preventiva: R$ 2.650.000\nSituação: em análise técnica e geoespacial.' },
  { id: 'doc-2', name: 'Baseline contratual CT-2025-SAN-0142.pdf', type: 'Contrato', status: 'Vigente', assetId: ASSETS[0]?.id, content: 'Baseline Contratual\nObjeto: Sistema Integrado de Esgotamento Vale Verde\nValor global: R$ 480.000.000\nInício: 01/09/2025\nMarco atual: execução física\nCondicionantes: ambientais, territoriais e de evidência.' },
  { id: 'doc-3', name: 'Laudo de vistoria OV-2026-0871.pdf', type: 'Vistoria', status: 'Em elaboração', assetId: ASSETS[0]?.id, content: 'Laudo de Vistoria OV-2026-0871\nObjeto: validação dos trechos T-18, T-21 e T-22\nEquipe: Eng. Paulo R. Menezes\nStatus: coleta sincronizada; validação técnica pendente\nEvidências: GNSS, fotografias, vídeo e croqui de campo.' },
];

const PEOPLE = [
  { name: 'Ana Beatriz Souza', role: 'Gestora regional', area: 'GEREG Sudeste', email: 'ana.souza@nexo.demo' },
  { name: 'Fernanda Ribeiro', role: 'Especialista de riscos', area: 'GEREG Norte', email: 'fernanda.ribeiro@nexo.demo' },
  { name: 'Eng. Paulo R. Menezes', role: 'Responsável pela vistoria', area: 'Rede técnica credenciada', email: 'paulo.menezes@nexo.demo' },
];

const INITIAL_MILESTONES = [
  { id: 'm1', label: 'Laudo de vistoria OV-2026-0871', due: '2 dias', done: false, product: 'evidencia' as ProductKey },
  { id: 'm2', label: 'Comitê de reprogramação — Rio Norte', due: '5 dias', done: false, product: 'contrata' as ProductKey },
  { id: 'm3', label: 'Certificado de prontidão — Horizonte Azul', due: '12 dias', done: false, product: 'ativos' as ProductKey },
];

export function RightPanel({ onClose, product, onNavigate, onOpenAsset, onOpenAsk, onPushEvent }: RightPanelProps) {
  const [selected, setSelected] = useState<{ kind: 'risk' | 'document' | 'person' | 'action'; data: any } | null>(null);
  const [milestones, setMilestones] = useState(INITIAL_MILESTONES);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const alerts = useMemo(() => AGENTS.filter((a) => a.status === 'concluido_alerta' || a.status === 'aguardando_humano').slice(0, 3), []);

  function exportContext() {
    const payload = {
      generatedAt: new Date().toISOString(),
      context: PRODUCT_LABELS[product] ?? product,
      risks: RISKS,
      documents: DOCUMENTS.map(({ content, ...doc }) => doc),
      milestones,
      agents: alerts.map((a) => ({ id: a.id, name: a.name, status: a.status, recommendation: a.recommendation })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nexo-contexto-${product}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    onPushEvent(`Painel de contexto exportado — ${PRODUCT_LABELS[product] ?? product}`, 'success');
  }

  function downloadDocument(doc: typeof DOCUMENTS[number]) {
    const url = URL.createObjectURL(new Blob([doc.content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = doc.name.replace('.pdf', '.txt');
    anchor.click();
    URL.revokeObjectURL(url);
    onPushEvent(`Documento exportado: ${doc.name}`, 'success');
  }

  function runQuickAction(action: string) {
    if (action === 'Exportar dados') return exportContext();
    if (action === 'Gerar relatório') {
      setSelected({ kind: 'action', data: { title: 'Relatório executivo', detail: 'Relatório preparado com riscos, recomendações, documentos e próximos marcos do contexto atual.', primary: 'Baixar relatório' } });
      onPushEvent(`Relatório executivo preparado — ${PRODUCT_LABELS[product] ?? product}`, 'success');
      return;
    }
    if (action === 'Nova vistoria') {
      setSelected({ kind: 'action', data: { title: 'Nova vistoria', detail: 'Ordem OV-2026-0934 criada em rascunho para validação territorial e documental.', primary: 'Abrir Evidências' } });
      onPushEvent('Nova ordem de vistoria OV-2026-0934 criada em rascunho', 'info');
      return;
    }
    setSelected({ kind: 'action', data: { title: 'Emitir despacho', detail: 'Minuta de despacho criada com recomendação de diligência e retenção preventiva.', primary: 'Revisar no Nexo Contrata' } });
    onPushEvent('Minuta de despacho preparada e encaminhada para revisão humana', 'warning');
  }

  function confirmAction() {
    if (!selected || selected.kind !== 'action') return;
    setBusyAction(selected.data.title);
    window.setTimeout(() => {
      setBusyAction(null);
      if (selected.data.title === 'Nova vistoria') onNavigate('evidencia');
      else if (selected.data.title === 'Emitir despacho') onNavigate('contrata');
      else exportContext();
      setSelected(null);
    }, 650);
  }

  return (
    <>
      <aside className="w-[280px] shrink-0 border-l border-white/10 bg-[#0B2235]/70 flex flex-col">
        <div className="h-11 shrink-0 flex items-center justify-between px-3.5 border-b border-white/8">
          <div>
            <span className="text-[11px] uppercase tracking-wide font-semibold text-neutral-400">Painel de contexto</span>
            <div className="text-[9.5px] text-[#18B7D6] mt-0.5">{PRODUCT_LABELS[product] ?? product}</div>
          </div>
          <button onClick={onClose} aria-label="Fechar painel de contexto" className="p-1 rounded hover:bg-white/8 text-neutral-500"><Icon name="PanelRightClose" size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto nexo-scroll p-3 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400"><Icon name="Sparkles" size={12} className="text-[#18B7D6]" /> Recomendações da IA</div>
              <button onClick={onOpenAsk} className="text-[9.5px] text-[#18B7D6] hover:text-white">Perguntar</button>
            </div>
            <div className="space-y-2">
              {alerts.map((a) => (
                <button key={a.id} onClick={() => { onNavigate('agents'); onPushEvent(`Recomendação aberta no Nexo Agents: ${a.name}`, 'info'); }} className="w-full text-left rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:border-[#18B7D6]/40 hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center justify-between gap-2"><div className="text-[11px] text-neutral-500 mb-1 truncate">{a.name}</div><Icon name="ArrowUpRight" size={11} className="text-neutral-600 shrink-0" /></div>
                  <div className="text-[12px] text-neutral-200 leading-snug line-clamp-3">{a.recommendation}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2"><Icon name="ShieldAlert" size={12} className="text-[#E5A11A]" /> Riscos identificados</div>
            <div className="space-y-1.5">
              {RISKS.map((risk) => (
                <button key={risk.id} onClick={() => setSelected({ kind: 'risk', data: risk })} className="w-full flex items-center gap-2 text-left text-[12px] text-neutral-300 rounded-md p-1.5 -mx-1.5 hover:bg-white/[0.05]">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${risk.severity === 'alta' ? 'bg-[#D14A55]' : 'bg-[#E5A11A]'}`} />
                  <span className="flex-1">{risk.title}</span><Icon name="ChevronRight" size={11} className="text-neutral-600" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2"><Icon name="FileText" size={12} /> Documentos relacionados</div>
            <div className="space-y-1">
              {DOCUMENTS.map((doc) => (
                <button key={doc.id} onClick={() => setSelected({ kind: 'document', data: doc })} className="w-full flex items-center gap-2 text-[11.5px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] rounded py-1.5 px-1 -mx-1 truncate">
                  <Icon name="FileCheck" size={12} className="shrink-0" /><span className="truncate flex-1 text-left">{doc.name}</span><Icon name="Eye" size={11} className="shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2"><Icon name="Users" size={12} /> Responsáveis</div>
            <div className="flex flex-wrap gap-1.5">
              {PEOPLE.map((person) => <button key={person.email} onClick={() => setSelected({ kind: 'person', data: person })}><Pill>{person.name}</Pill></button>)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2"><Icon name="CalendarClock" size={12} /> Próximos marcos</div>
            <div className="space-y-1.5 text-[12px] text-neutral-300">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-2 rounded-md hover:bg-white/[0.04] p-1 -mx-1">
                  <button onClick={() => { setMilestones((items) => items.map((item) => item.id === milestone.id ? { ...item, done: !item.done } : item)); onPushEvent(`${milestone.done ? 'Marco reaberto' : 'Marco concluído'}: ${milestone.label}`, milestone.done ? 'warning' : 'success'); }} className="mt-0.5">
                    <Icon name={milestone.done ? 'CheckCircle2' : 'Circle'} size={13} className={milestone.done ? 'text-[#37C893]' : 'text-neutral-600'} />
                  </button>
                  <button onClick={() => onNavigate(milestone.product)} className={`flex-1 text-left leading-tight ${milestone.done ? 'line-through text-neutral-600' : ''}`}>{milestone.label}</button>
                  <span className="text-neutral-500 tnum shrink-0">{milestone.done ? 'feito' : milestone.due}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">Ações rápidas</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[{ icon: 'ClipboardCheck', label: 'Nova vistoria' }, { icon: 'FileText', label: 'Gerar relatório' }, { icon: 'Send', label: 'Emitir despacho' }, { icon: 'Download', label: 'Exportar dados' }].map((action) => (
                <button key={action.label} onClick={() => runQuickAction(action.label)} className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] py-2.5 hover:bg-white/[0.07] hover:border-[#18B7D6]/30 transition-colors">
                  <Icon name={action.icon} size={15} className="text-neutral-400" /><span className="text-[10.5px] text-neutral-400 text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-xl border border-white/12 bg-[#0B2235] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-semibold text-white">{selected.kind === 'risk' ? selected.data.title : selected.kind === 'document' ? selected.data.name : selected.data.name ?? selected.data.title}</div>
              <button onClick={() => setSelected(null)} className="rounded p-1 text-neutral-500 hover:bg-white/10 hover:text-white"><Icon name="X" size={15} /></button>
            </div>
            <div className="p-4 space-y-3 text-[12px] text-neutral-300">
              {selected.kind === 'risk' && <><Pill>{selected.data.severity === 'alta' ? 'Risco alto' : 'Risco médio'}</Pill><p className="leading-relaxed">{selected.data.detail}</p><div className="rounded-lg bg-white/[0.04] p-3 text-neutral-400">Ação recomendada: abrir o Ativo 360, revisar evidências relacionadas e registrar decisão humana.</div></>}
              {selected.kind === 'document' && <><div className="flex gap-2"><Pill>{selected.data.type}</Pill><Pill>{selected.data.status}</Pill></div><pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-[#071521] p-3 font-sans leading-relaxed text-neutral-300">{selected.data.content}</pre></>}
              {selected.kind === 'person' && <><div><span className="text-neutral-500">Função</span><div>{selected.data.role}</div></div><div><span className="text-neutral-500">Área</span><div>{selected.data.area}</div></div><div><span className="text-neutral-500">Contato</span><div>{selected.data.email}</div></div></>}
              {selected.kind === 'action' && <p className="leading-relaxed">{selected.data.detail}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 px-4 py-3">
              <button onClick={() => setSelected(null)} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-neutral-400 hover:bg-white/[0.05]">Fechar</button>
              {selected.kind === 'risk' && <button onClick={() => { if (selected.data.assetId) onOpenAsset(selected.data.assetId); setSelected(null); }} className="rounded-lg bg-[#18B7D6] px-3 py-2 text-[11px] font-semibold text-[#06151F]">Abrir Ativo 360</button>}
              {selected.kind === 'document' && <button onClick={() => downloadDocument(selected.data)} className="rounded-lg bg-[#18B7D6] px-3 py-2 text-[11px] font-semibold text-[#06151F]">Exportar documento</button>}
              {selected.kind === 'person' && <button onClick={() => { onPushEvent(`Mensagem preparada para ${selected.data.name}`, 'info'); setSelected(null); }} className="rounded-lg bg-[#18B7D6] px-3 py-2 text-[11px] font-semibold text-[#06151F]">Preparar mensagem</button>}
              {selected.kind === 'action' && <button onClick={confirmAction} disabled={!!busyAction} className="rounded-lg bg-[#18B7D6] px-3 py-2 text-[11px] font-semibold text-[#06151F] disabled:opacity-60">{busyAction ? 'Processando…' : selected.data.primary}</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
