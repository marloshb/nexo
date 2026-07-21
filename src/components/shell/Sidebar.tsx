import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { NAV_PRODUCTS, SIDEBAR_CONFIG, type ProductKey } from '@/data/navConfig';
import { cls } from '@/lib/tokens';

export function Sidebar({
  product, collapsed, onNavigate,
}: {
  product: ProductKey; collapsed: boolean; onNavigate: (p: ProductKey) => void;
}) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const items = SIDEBAR_CONFIG[product] ?? [];
  const current = NAV_PRODUCTS.find((p) => p.key === product);

  return (
    <aside className={cls('shrink-0 border-r border-white/10 bg-[#0B2235]/70 flex flex-col transition-all duration-200 relative', collapsed ? 'w-[60px]' : 'w-[230px]')}>
      <div className="p-2.5 border-b border-white/8">
        <button
          onClick={() => setSwitcherOpen((v) => !v)}
          className={cls('w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-white/[0.06] transition-colors', collapsed && 'justify-center')}
        >
          <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${current?.color ?? '#1584D1'}22` }}>
            <Icon name={current?.iconKey ?? 'Gauge'} size={13} style={{ color: current?.color ?? '#1584D1' }} />
          </span>
          {!collapsed && (
            <>
              <span className="text-[12.5px] font-medium text-neutral-200 truncate flex-1 text-left">{current?.name ?? 'Nexo Hub'}</span>
              <Icon name="ChevronsUpDown" size={13} className="text-neutral-500 shrink-0" />
            </>
          )}
        </button>

        {switcherOpen && (
          <div className="absolute left-2 right-2 top-14 rounded-lg border border-white/10 bg-[#0E2A40] shadow-2xl p-1 z-40 max-h-[70vh] overflow-y-auto nexo-scroll nexo-fade-in">
            <button
              onClick={() => { onNavigate('hub'); setSwitcherOpen(false); }}
              className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-white/[0.06] text-left"
            >
              <Icon name="LayoutGrid" size={14} className="text-neutral-400" />
              <span className="text-[12px] text-neutral-300">Nexo Hub</span>
            </button>
            <div className="h-px bg-white/8 my-1" />
            {NAV_PRODUCTS.map((p) => (
              <button
                key={p.key}
                onClick={() => { onNavigate(p.key); setSwitcherOpen(false); }}
                className={cls('w-full flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-white/[0.06] text-left', p.key === product && 'bg-white/[0.06]')}
              >
                <Icon name={p.iconKey} size={14} style={{ color: p.color }} />
                <span className="text-[12px] text-neutral-300 flex-1 truncate">{p.name}</span>
                {!p.builtV1 && <span className="text-[9px] px-1 py-0.5 rounded bg-white/8 text-neutral-500">V2</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto nexo-scroll py-2 px-2 space-y-0.5">
        {items.length === 0 && !collapsed && (
          <div className="text-[11px] text-neutral-500 px-2.5 py-2">Selecione um produto no Hub.</div>
        )}
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(i)}
            className={cls(
              'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
              i === activeItem ? 'bg-[#1584D1]/15 text-[#5FB4E8]' : 'text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.iconKey} size={16} className="shrink-0" />
            {!collapsed && <span className="text-[12.5px] font-medium truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-white/8">
          <div className="rounded-lg border border-dashed border-white/12 px-2.5 py-2 text-[10.5px] text-neutral-500 leading-snug">
            Ambiente: <span className="text-[#F0B94A] font-medium">Demonstração</span>
          </div>
        </div>
      )}
    </aside>
  );
}
