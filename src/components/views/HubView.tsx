import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { NAV_PRODUCTS, type ProductKey } from '@/data/navConfig';
import { CURRENT_USER, ASSETS, INITIAL_EVENTS, HERO_ASSET_ID } from '@/data/mockData';
import { BrazilMap } from '@/components/shared/BrazilMap';
import { Panel, Pill } from '@/components/shared/Primitives';
import { EventFeed } from '@/components/shared/EventFeed';
import { cls } from '@/lib/tokens';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const PRODUCT_STATS: Record<string, { items: number; alerts: number; updated: string }> = {
  control: { items: 8, alerts: 3, updated: 'há 2 min' },
  capital: { items: 32, alerts: 1, updated: 'há 1 h' },
  carteira: { items: 186, alerts: 4, updated: 'há 40 min' },
  estrutura: { items: 11, alerts: 0, updated: 'há 3 h' },
  contrata: { items: 19, alerts: 6, updated: 'há 12 min' },
  entrega: { items: 8, alerts: 2, updated: 'há 4 min' },
  evidencia: { items: 6, alerts: 1, updated: 'há 4 min' },
  ativos: { items: 8, alerts: 1, updated: 'há 20 min' },
  impacto: { items: 212, alerts: 0, updated: 'há 6 h' },
  agents: { items: 12, alerts: 3, updated: 'agora' },
  data: { items: 17, alerts: 1, updated: 'há 5 min' },
};

export function HubView({ onOpenProduct, onOpenAsset }: { onOpenProduct: (p: ProductKey) => void; onOpenAsset: (id: string) => void }) {
  const [view, setView] = useState<'minha' | 'corporativa'>('corporativa');
  const dateRef = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="p-5 space-y-5 max-w-[1500px] mx-auto nexo-fade-in">
      {/* Linha 1 — Contexto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-[21px] font-semibold text-neutral-50">{greeting()}, {CURRENT_USER.name.split(' ')[0]}</h1>
          <p className="text-[12.5px] text-neutral-400 mt-0.5 capitalize">{CURRENT_USER.role} · {CURRENT_USER.unit} · {dateRef}</p>
        </div>
        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 shrink-0">
          {(['minha', 'corporativa'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cls('px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors', view === v ? 'bg-[#1584D1] text-white' : 'text-neutral-400')}
            >
              {v === 'minha' ? 'Minha visão' : 'Visão corporativa'}
            </button>
          ))}
        </div>
      </div>

      {/* Linha 2 — Indicadores pessoais */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Tarefas vencidas', value: 3, icon: 'AlertTriangle', tone: '#D14A55' },
          { label: 'Decisões aguardando ação', value: 5, icon: 'User', tone: '#7C5CBF' },
          { label: 'Alertas críticos', value: 4, icon: 'AlertOctagon', tone: '#D14A55' },
          { label: 'Agentes concluídos (24h)', value: 38, icon: 'Bot', tone: '#18B7D6' },
          { label: 'Integrações com falha', value: 1, icon: 'Plug', tone: '#E5A11A' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3 flex flex-col gap-1">
            <Icon name={k.icon} size={15} style={{ color: k.tone }} />
            <span className="font-display text-[20px] font-semibold text-neutral-50 tnum">{k.value}</span>
            <span className="text-[10.5px] text-neutral-500 leading-tight">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Linha 3 — Produtos */}
      <div>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-2.5">Produtos</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {NAV_PRODUCTS.map((p) => {
            const stats = PRODUCT_STATS[p.key];
            return (
              <button
                key={p.key}
                onClick={() => onOpenProduct(p.key)}
                className="text-left rounded-xl border border-white/10 bg-[#0E2A40]/60 p-4 hover:border-[#1584D1]/50 hover:bg-[#0E2A40] transition-all flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${p.color}20` }}>
                    <Icon name={p.iconKey} size={17} style={{ color: p.color }} />
                  </span>
                  {!p.builtV1 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-neutral-500 h-fit">V2</span>}
                </div>
                <div>
                  <div className="font-display text-[14px] font-semibold text-neutral-100">{p.name}</div>
                  <div className="text-[11.5px] text-neutral-500 mt-0.5 leading-snug line-clamp-2">{p.tagline}</div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/8">
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-400">
                    <span className="tnum">{stats.items} itens</span>
                    {stats.alerts > 0 && <span className="text-[#E5A11A] tnum">{stats.alerts} alertas</span>}
                  </div>
                  <span className="text-[10.5px] text-neutral-600">{stats.updated}</span>
                </div>
                <div className="flex items-center gap-1 text-[11.5px] font-medium text-[#5FB4E8] opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir produto <Icon name="ArrowRight" size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Linha 4 — Atividades recentes */}
        <div className="lg:col-span-2">
          <Panel title="Atividades recentes" subtitle="Eventos do barramento corporativo">
            <EventFeed events={INITIAL_EVENTS} maxHeight={300} />
          </Panel>
        </div>

        {/* Linha 5 — Mapa resumido */}
        <div className="lg:col-span-3">
          <Panel title="Mapa nacional" subtitle="Ativos, alertas e concentração financeira" actions={<Pill tone="cyan">{ASSETS.length} ativos</Pill>}>
            <BrazilMap assets={ASSETS} height={300} onSelectAsset={onOpenAsset} selectedId={HERO_ASSET_ID} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
