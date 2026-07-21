import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import { FUNDING_SOURCES, COVENANTS, PROGRAM_ENVELOPES, type FundingSource } from '@/data/capitalData';
import { ASSETS } from '@/data/mockData';
import { fmtCompactBRL, fmtDate, cls } from '@/lib/tokens';
import { Panel, KpiCard, StatusChip, Pill, ProgressBar, EmptyHint } from '@/components/shared/Primitives';
import { TreemapSource, BarProgramChart } from '@/components/shared/Charts';
import { BrazilMap } from '@/components/shared/BrazilMap';

const TABS = ['Painel de funding', 'Fontes de capital', 'Programas e envelopes', 'Covenants', 'Nova fonte de capital'] as const;
const FLOW_STEPS = ['Cadastrar', 'Validar condições', 'Classificar', 'Criar envelopes', 'Simular alocação', 'Submeter aprovação'];

function FundingPassport({ source, onClose }: { source: FundingSource | null; onClose: () => void }) {
  const relatedAssets = source ? ASSETS.filter((a) => a.fundingSource.toLowerCase().includes(source.instituicao.toLowerCase().split(' ')[0].toLowerCase())) : [];
  return (
    <Sheet open={!!source} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-lg overflow-y-auto nexo-scroll">
        {source && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-neutral-50 pr-6">{source.nome}</SheetTitle>
              <SheetDescription className="text-neutral-400">Passaporte do capital · {source.id}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2"><StatusChip status={source.status} size="sm" /><Pill tone="blue">{source.tipoInstrumento}</Pill></div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Identificação</div>
                <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
                  <div><span className="text-neutral-500">Instituição</span><div className="text-neutral-200">{source.instituicao}</div></div>
                  <div><span className="text-neutral-500">Moeda</span><div className="text-neutral-200">{source.moeda}</div></div>
                  <div><span className="text-neutral-500">Valor</span><div className="text-neutral-200 tnum">{fmtCompactBRL(source.valor)}</div></div>
                  <div><span className="text-neutral-500">Vigência</span><div className="text-neutral-200 tnum">{fmtDate(source.vigenciaInicio)} – {fmtDate(source.vigenciaFim)}</div></div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Condições financeiras</div>
                <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
                  <div><span className="text-neutral-500">Custo</span><div className="text-neutral-200">{source.custo}</div></div>
                  <div><span className="text-neutral-500">Indexador</span><div className="text-neutral-200">{source.indexador}</div></div>
                  <div><span className="text-neutral-500">Prazo</span><div className="text-neutral-200 tnum">{source.prazoAnos} anos</div></div>
                  <div><span className="text-neutral-500">Carência</span><div className="text-neutral-200 tnum">{source.carenciaAnos} anos</div></div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Destinação</div>
                <div className="flex flex-wrap gap-1.5 mb-2">{source.programasElegiveis.map((p) => <Pill key={p}>{p}</Pill>)}</div>
                <div className="text-[12px] text-neutral-400">Setores: {source.setores.join(', ')} · {source.territorios.join(', ')}</div>
                <div className="text-[12px] text-neutral-400 mt-1">Público beneficiário: {source.publicoBeneficiario}</div>
                {source.atividadesExcluidas.length > 0 && (
                  <div className="mt-1.5 text-[11.5px] text-[#D14A55]">Excluídas: {source.atividadesExcluidas.join('; ')}</div>
                )}
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Sustentabilidade</div>
                <div className="text-[12.5px] text-neutral-300">{source.taxonomia}</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">{source.categoriasVerdesSociais.map((c) => <Pill key={c} tone="cyan">{c}</Pill>)}</div>
                <div className="text-[11.5px] text-neutral-400 mt-1.5">Meta: {source.metasSustentaveis}</div>
                <div className="text-[11px] text-neutral-500 mt-1">Frequência de reporte: {source.frequenciaReporte}</div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Governança</div>
                <div className="text-[12.5px] text-neutral-300">{source.unidadeResponsavel}</div>
                <div className="text-[11.5px] text-neutral-400 mt-1">Alçada: {source.alcadas}</div>
                <div className="text-[11px] text-neutral-500 mt-1">Revisão: {source.periodicidadeRevisao}</div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex justify-between text-[12px] mb-1.5"><span className="text-neutral-400">Utilizado</span><span className="text-neutral-200 tnum">{fmtCompactBRL(source.valorUtilizado)} de {fmtCompactBRL(source.valorAlocado)}</span></div>
                <ProgressBar value={source.valorUtilizado / source.valorAlocado} tone={source.status === 'critico' ? 'red' : source.status === 'atencao' ? 'amber' : 'teal'} />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Rastreabilidade até ativos</div>
                {relatedAssets.length > 0 ? (
                  <div className="space-y-1">
                    {relatedAssets.map((a) => <div key={a.id} className="text-[12px] text-neutral-300 flex items-center gap-1.5"><Icon name="ArrowRight" size={11} className="text-neutral-600" />{a.name}</div>)}
                  </div>
                ) : <div className="text-[11.5px] text-neutral-500">Nenhum ativo direto identificado nesta versão do mockup.</div>}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CapitalView() {
  const [tab, setTab] = useState<typeof TABS[number]>('Painel de funding');
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(null);
  const [flowStep, setFlowStep] = useState(0);
  const [form, setForm] = useState({ nome: '', instituicao: '', valor: '', custo: '', setor: 'Saneamento' });
  const [submitted, setSubmitted] = useState(false);

  const custoMedioPonderado = 6.4; // ilustrativo — ponderação por indexador/moeda simplificada para o mockup

  const treemapData = FUNDING_SOURCES.map((f) => ({ name: f.instituicao, value: Math.round(f.valor / 1_000_000) }));
  const envelopeBarData = PROGRAM_ENVELOPES.map((p) => ({ programa: p.programa.replace('Programa ', '').replace('Nacional de ', ''), envelope: p.envelope, alocado: p.alocado }));

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Capital</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Funding, captação, programas e alocação</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Painel de funding' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Capital captado" value={fmtCompactBRL(FUNDING_SOURCES.reduce((s, f) => s + f.valor, 0))} icon="Landmark" />
            <KpiCard label="Custo médio ponderado" value={`${custoMedioPonderado.toFixed(1)}% a.a.`} icon="Calculator" />
            <KpiCard label="Programas ativos" value={String(PROGRAM_ENVELOPES.length)} icon="Layers" />
            <KpiCard label="Covenants monitorados" value={String(COVENANTS.length)} icon="FileWarning" delta={`${COVENANTS.filter((c) => c.status === 'critico').length} críticos`} deltaTone="red" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Capital disponível por fonte" subtitle="Treemap — R$ milhões"><TreemapSource data={treemapData} /></Panel>
            <Panel title="Utilização por programa" subtitle="Envelope × alocado — R$ milhões"><BarProgramChart data={envelopeBarData} aKey="envelope" bKey="alocado" aLabel="Envelope" bLabel="Alocado" /></Panel>
          </div>
          <Panel title="Alocação territorial" subtitle="Ativos financiados por região">
            <BrazilMap assets={ASSETS} height={300} colorBy="region" />
          </Panel>
        </>
      )}

      {tab === 'Fontes de capital' && (
        <Panel title="Fontes de capital" subtitle={`${FUNDING_SOURCES.length} fontes cadastradas`}>
          <div className="overflow-x-auto nexo-scroll -mx-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-neutral-500 text-[10.5px] uppercase tracking-wide border-b border-white/8">
                  <th className="font-medium px-4 py-2">Fonte</th><th className="font-medium px-2 py-2">Instrumento</th>
                  <th className="font-medium px-2 py-2">Valor</th><th className="font-medium px-2 py-2">Custo</th>
                  <th className="font-medium px-2 py-2 w-28">Utilização</th><th className="font-medium px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {FUNDING_SOURCES.map((f) => (
                  <tr key={f.id} onClick={() => setSelectedSource(f)} className="border-b border-white/[0.05] hover:bg-white/[0.04] cursor-pointer">
                    <td className="px-4 py-2.5"><div className="text-neutral-200">{f.instituicao}</div><div className="text-[10px] text-neutral-500 truncate max-w-[220px]">{f.nome}</div></td>
                    <td className="px-2 py-2.5 text-neutral-400">{f.tipoInstrumento}</td>
                    <td className="px-2 py-2.5 text-neutral-300 tnum whitespace-nowrap">{fmtCompactBRL(f.valor)}</td>
                    <td className="px-2 py-2.5 text-neutral-400 whitespace-nowrap">{f.custo}</td>
                    <td className="px-2 py-2.5"><ProgressBar value={f.valorUtilizado / f.valorAlocado} tone={f.status === 'critico' ? 'red' : f.status === 'atencao' ? 'amber' : 'teal'} /></td>
                    <td className="px-4 py-2.5"><StatusChip status={f.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'Programas e envelopes' && (
        <Panel title="Programas e envelopes">
          <div className="space-y-2.5">
            {PROGRAM_ENVELOPES.map((p) => (
              <div key={p.programa} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-neutral-200">{p.programa}</span>
                  <span className="text-[11px] text-neutral-500 tnum">R$ {p.alocado.toLocaleString('pt-BR')} mi de R$ {p.envelope.toLocaleString('pt-BR')} mi</span>
                </div>
                <ProgressBar value={p.alocado / p.envelope} tone="blue" />
                <div className="text-[10.5px] text-neutral-500 mt-1">{p.territorio}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === 'Covenants' && (
        <Panel title="Covenants e compromissos" subtitle="Ordenados por proximidade de verificação">
          <div className="space-y-2">
            {COVENANTS.slice().sort((a, b) => a.proximaVerificacao.localeCompare(b.proximaVerificacao)).map((c) => {
              const src = FUNDING_SOURCES.find((f) => f.id === c.fonteId);
              return (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 gap-3">
                  <div className="min-w-0">
                    <div className="text-[12.5px] text-neutral-200 truncate">{c.descricao}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{src?.instituicao} · próxima verificação {fmtDate(c.proximaVerificacao)}</div>
                  </div>
                  <StatusChip status={c.status} size="sm" />
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {tab === 'Nova fonte de capital' && (
        <Panel title="Cadastrar nova fonte de capital" subtitle="Fluxo: cadastrar → validar → classificar → criar envelopes → simular alocação → submeter aprovação">
          <div className="flex items-center mb-5 overflow-x-auto nexo-scroll">
            {FLOW_STEPS.map((s, i) => (
              <div key={s} className="flex items-center shrink-0">
                <div className={cls('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium', i <= flowStep ? 'bg-[#1584D1]/20 text-[#5FB4E8]' : 'bg-white/[0.04] text-neutral-500')}>
                  <span className={cls('w-4 h-4 rounded-full flex items-center justify-center text-[9px]', i <= flowStep ? 'bg-[#1584D1] text-white' : 'bg-white/10')}>{i + 1}</span>
                  {s}
                </div>
                {i < FLOW_STEPS.length - 1 && <div className={cls('h-px w-5', i < flowStep ? 'bg-[#1584D1]/60' : 'bg-white/10')} />}
              </div>
            ))}
          </div>

          {!submitted ? (
            <div className="max-w-2xl space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-2">Identificação</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input placeholder="Nome do funding" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[12.5px] text-neutral-200 outline-none focus:border-[#1584D1] placeholder:text-neutral-500" />
                  <input placeholder="Instituição provedora" value={form.instituicao} onChange={(e) => setForm({ ...form, instituicao: e.target.value })} className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[12.5px] text-neutral-200 outline-none focus:border-[#1584D1] placeholder:text-neutral-500" />
                  <input placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[12.5px] text-neutral-200 outline-none focus:border-[#1584D1] placeholder:text-neutral-500" />
                  <input placeholder="Custo (ex.: IPCA + 6%)" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[12.5px] text-neutral-200 outline-none focus:border-[#1584D1] placeholder:text-neutral-500" />
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-2">Destinação — setor prioritário</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Saneamento', 'Habitação', 'Drenagem', 'Energia', 'Mobilidade', 'Saúde', 'Educação'].map((s) => (
                    <button key={s} onClick={() => setForm({ ...form, setor: s })} className={cls('rounded-full px-2.5 py-1 text-[11px] border', form.setor === s ? 'bg-[#1584D1]/20 border-[#1584D1]/50 text-[#5FB4E8]' : 'border-white/12 text-neutral-400')}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={flowStep >= FLOW_STEPS.length - 1}
                  onClick={() => setFlowStep((s) => Math.min(s + 1, FLOW_STEPS.length - 1))}
                  className="rounded-lg bg-[#1584D1] px-3.5 py-2 text-[12.5px] font-medium text-white disabled:opacity-40"
                >
                  Avançar etapa
                </button>
                {flowStep === FLOW_STEPS.length - 1 && (
                  <button onClick={() => setSubmitted(true)} className="rounded-lg bg-[#0FA39D] px-3.5 py-2 text-[12.5px] font-medium text-white flex items-center gap-1.5">
                    <Icon name="Send" size={13} /> Submeter aprovação
                  </button>
                )}
              </div>
              {flowStep === 4 && (
                <EmptyHint icon="Sparkles">
                  Simulação de alocação: com base no setor {form.setor}, o Nexo Capital sugere destinar 60% ao envelope regional de maior déficit e 40% para reforço de covenants em risco.
                </EmptyHint>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-4 max-w-xl flex items-start gap-3">
              <Icon name="CheckCircle2" size={18} className="text-[#0FA39D] mt-0.5 shrink-0" />
              <div>
                <div className="text-[13px] font-medium text-neutral-100">Fonte submetida para aprovação</div>
                <p className="text-[12px] text-neutral-400 mt-1">
                  "{form.nome || 'Novo funding'}" ({form.instituicao || 'instituição não informada'}) segue para alçada de Diretoria Executiva.
                  Após aprovação, ficará disponível para originação no Nexo Carteira.
                </p>
              </div>
            </div>
          )}
        </Panel>
      )}

      <FundingPassport source={selectedSource} onClose={() => setSelectedSource(null)} />
    </div>
  );
}
