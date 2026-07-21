import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import { INTEGRATIONS, CATALOG_ENTITIES, type Integration } from '@/data/integrationsData';
import { cls } from '@/lib/tokens';
import { Panel, KpiCard, ProgressBar } from '@/components/shared/Primitives';
import { SingleBarChart } from '@/components/shared/Charts';

const TABS = ['Catálogo', 'Integrações', 'Qualidade', 'Monitoramento'] as const;
const STATUS_META: Record<Integration['status'], { label: string; color: string }> = {
  ativa: { label: 'Ativa', color: '#0FA39D' }, falha: { label: 'Falha', color: '#D14A55' }, degradada: { label: 'Degradada', color: '#E5A11A' },
};
const CATEGORY_ICON: Record<Integration['categoria'], string> = {
  'Governo Federal': 'Building', 'Referenciais Técnicos': 'Calculator', 'Dados Territoriais': 'Map',
  'Clima e Ambiente': 'Wind', 'Sistemas Internos': 'Database', Sensores: 'Radio',
};

function ConnectorDetail({ integration, onClose }: { integration: Integration | null; onClose: () => void }) {
  return (
    <Sheet open={!!integration} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-lg overflow-y-auto nexo-scroll">
        {integration && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-neutral-50 pr-6">{integration.origem}</SheetTitle>
              <SheetDescription className="text-neutral-400">{integration.categoria} · {integration.metodo}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: STATUS_META[integration.status].color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_META[integration.status].color }} />{STATUS_META[integration.status].label}
                </span>
              </div>
              {integration.erro && (
                <div className="rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/8 p-2.5 text-[11.5px] text-[#D14A55]">{integration.erro}</div>
              )}
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <div><span className="text-neutral-500 text-[11px]">Origem</span><div className="text-neutral-200">{integration.origem}</div></div>
                <div><span className="text-neutral-500 text-[11px]">Destino</span><div className="text-neutral-200">Nexo Data — catálogo corporativo</div></div>
                <div><span className="text-neutral-500 text-[11px]">Objetos</span><div className="text-neutral-200">{integration.objetos}</div></div>
                <div><span className="text-neutral-500 text-[11px]">Frequência</span><div className="text-neutral-200">{integration.frequencia}</div></div>
                <div><span className="text-neutral-500 text-[11px]">Autenticação</span><div className="text-neutral-200">{integration.autenticacao}</div></div>
                <div><span className="text-neutral-500 text-[11px]">Latência</span><div className="text-neutral-200 tnum">{integration.latenciaMs} ms</div></div>
                <div><span className="text-neutral-500 text-[11px]">Última execução</span><div className="text-neutral-200">{integration.ultimaExecucao}</div></div>
                <div><span className="text-neutral-500 text-[11px]">Próxima execução</span><div className="text-neutral-200">{integration.proximaExecucao}</div></div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Campos (amostra)</div>
                <div className="flex flex-wrap gap-1.5">{integration.campos.map((c) => <span key={c} className="font-mono-id text-[10.5px] rounded bg-white/[0.05] border border-white/10 px-1.5 py-0.5 text-neutral-300">{c}</span>)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Transformação</div>
                <div className="text-[12.5px] text-neutral-300">{integration.transformacao}</div>
              </div>
              <div className="text-[11px] text-neutral-500">Volume (24h): {integration.volume24h}</div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function DataView() {
  const [tab, setTab] = useState<typeof TABS[number]>('Integrações');
  const [selected, setSelected] = useState<Integration | null>(null);

  const ativas = INTEGRATIONS.filter((i) => i.status === 'ativa').length;
  const falhas = INTEGRATIONS.filter((i) => i.status === 'falha').length;
  const grouped = Array.from(new Set(INTEGRATIONS.map((i) => i.categoria))).map((cat) => ({ cat, items: INTEGRATIONS.filter((i) => i.categoria === cat) }));

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Data</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Dados, integrações, qualidade e governança</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 overflow-x-auto nexo-scroll">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap', tab === t ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Integrações ativas" value={String(ativas)} icon="Plug" />
        <KpiCard label="Integrações com falha" value={String(falhas)} icon="AlertOctagon" deltaTone="red" />
        <KpiCard label="Qualidade média" value={`${Math.round(CATALOG_ENTITIES.reduce((s, e) => s + e.qualidade, 0) / CATALOG_ENTITIES.length)}%`} icon="BadgeCheck" />
        <KpiCard label="Volume (24h)" value="1,2 mi" icon="Database" hint="registros processados" />
      </div>

      {tab === 'Catálogo' && (
        <Panel title="Catálogo de dados" subtitle="Entidades centrais do modelo conceitual">
          <div className="space-y-2.5">
            {CATALOG_ENTITIES.map((e) => (
              <div key={e.entidade} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-neutral-200">{e.entidade}</span>
                  <span className="text-[11px] text-neutral-500 tnum">{e.qualidade}% qualidade</span>
                </div>
                <ProgressBar value={e.qualidade / 100} tone={e.qualidade > 95 ? 'teal' : e.qualidade > 85 ? 'blue' : 'amber'} />
                <div className="text-[10.5px] text-neutral-500 mt-1.5">{e.origemPrincipal} · {e.registros}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === 'Integrações' && (
        <div className="space-y-4">
          {grouped.map(({ cat, items }) => (
            <Panel key={cat} title={cat} subtitle={`${items.length} conector(es)`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {items.map((i) => (
                  <button key={i.id} onClick={() => setSelected(i)} className="text-left rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-[12px] text-neutral-200"><Icon name={CATEGORY_ICON[i.categoria]} size={13} className="text-neutral-500" />{i.origem}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] text-neutral-500">{i.frequencia}</span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: STATUS_META[i.status].color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[i.status].color }} />{STATUS_META[i.status].label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {tab === 'Qualidade' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Qualidade por entidade"><SingleBarChart data={CATALOG_ENTITIES.map((e) => ({ nome: e.entidade, qualidade: e.qualidade }))} xKey="nome" yKey="qualidade" color="#0FA39D" /></Panel>
          <Panel title="Indicadores de qualidade">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="Registros rejeitados (24h)" value="1.240" icon="AlertTriangle" />
              <KpiCard label="Duplicidades detectadas" value="86" icon="FileWarning" />
              <KpiCard label="Fontes desatualizadas" value="1" icon="Clock" />
              <KpiCard label="Agentes afetados" value="0" icon="Bot" />
            </div>
          </Panel>
        </div>
      )}

      {tab === 'Monitoramento' && (
        <Panel title="Execuções recentes">
          <div className="space-y-1.5">
            {INTEGRATIONS.slice().sort((a, _b) => (a.status === 'falha' ? -1 : 1)).map((i) => (
              <div key={i.id} className="flex items-center justify-between text-[12px] border-b border-white/[0.05] py-2 last:border-0">
                <span className="text-neutral-300">{i.origem}</span>
                <span className="text-neutral-500">{i.ultimaExecucao}</span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: STATUS_META[i.status].color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[i.status].color }} />{STATUS_META[i.status].label}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <ConnectorDetail integration={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
