import { useMemo, useState, useRef, useEffect } from 'react';
import { Icon } from '@/lib/icons';
import { ASSETS, CURRENT_USER, type Asset } from '@/data/mockData';
import { NAV_PRODUCTS, type ProductKey } from '@/data/navConfig';
import { StatusChip } from '@/components/shared/Primitives';
import { cls } from '@/lib/tokens';

const PRODUCT_NAMES: Record<string, string> = { hub: 'Nexo Hub', ativo360: 'Ativo 360' };
NAV_PRODUCTS.forEach((p) => (PRODUCT_NAMES[p.key] = p.name));

export function TopBar({
  product, onNavigateHub, onToggleSidebar, onOpenAsk, onSelectAsset, alertCount = 4, taskCount = 7,
}: {
  product: ProductKey;
  onNavigateHub: () => void;
  onToggleSidebar: () => void;
  onOpenAsk: () => void;
  onSelectAsset: (id: string) => void;
  alertCount?: number;
  taskCount?: number;
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo<Asset[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ASSETS.filter((a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.uf.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-14 shrink-0 border-b border-white/10 bg-[#071521] flex items-center gap-3 px-3.5 z-30 relative">
      <button onClick={onToggleSidebar} className="p-1.5 rounded-md hover:bg-white/8 text-neutral-400 shrink-0" title="Recolher/expandir menu">
        <Icon name="Menu" size={17} />
      </button>

      <button onClick={onNavigateHub} className="flex items-center gap-2 shrink-0 group">
        <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[#1584D1] to-[#087C78] flex items-center justify-center font-display font-bold text-[13px] text-white">N</span>
        <span className="font-display font-semibold text-[14px] text-neutral-100 tracking-tight hidden md:inline">CAIXA Nexo</span>
      </button>

      <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block" />
      <span className="font-display text-[13.5px] font-medium text-neutral-300 shrink-0 hidden sm:inline truncate max-w-[160px]">
        {PRODUCT_NAMES[product] ?? 'Nexo Hub'}
      </span>

      <div ref={boxRef} className="relative flex-1 max-w-md ml-1">
        <div className={cls('flex items-center gap-2 rounded-lg border px-3 h-9 transition-colors', focused ? 'border-[#1584D1] bg-white/[0.06]' : 'border-white/10 bg-white/[0.03]')}>
          <Icon name="Search" size={14} className="text-neutral-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Buscar ativo, projeto, contrato, território…"
            className="bg-transparent outline-none text-[12.5px] text-neutral-200 placeholder:text-neutral-500 w-full"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-neutral-300 shrink-0"><Icon name="X" size={13} /></button>
          )}
        </div>
        {focused && results.length > 0 && (
          <div className="absolute top-11 left-0 right-0 rounded-lg border border-white/10 bg-[#0B2235] shadow-2xl overflow-hidden nexo-fade-in z-40">
            {results.map((a) => (
              <button
                key={a.id}
                onClick={() => { onSelectAsset(a.id); setQuery(''); setFocused(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-white/[0.06] flex items-center justify-between gap-2 border-b border-white/[0.05] last:border-0"
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] text-neutral-200 truncate">{a.name}</div>
                  <div className="text-[10.5px] text-neutral-500 font-mono-id truncate">{a.id}</div>
                </div>
                <StatusChip status={a.status} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-[10.5px] text-neutral-500 mr-2 px-2 py-1 rounded-md bg-white/[0.03] border border-white/8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0FA39D] nexo-pulse-ring" />
          <span>Sincronizado há 4s</span>
        </div>

        <button onClick={onOpenAsk} className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#18B7D6]/40 bg-[#18B7D6]/10 px-3 h-9 text-[12.5px] font-medium text-[#6FD8EC] hover:bg-[#18B7D6]/18 transition-colors">
          <Icon name="Sparkles" size={13} /> Perguntar ao Nexo
        </button>
        <button onClick={onOpenAsk} className="sm:hidden p-2 rounded-md text-[#6FD8EC]"><Icon name="Sparkles" size={17} /></button>

        <div className="relative">
          <button onClick={() => setAlertsOpen((v) => !v)} className="relative p-2 rounded-md hover:bg-white/8 text-neutral-400">
            <Icon name="Bell" size={17} />
            {alertCount > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#D14A55] text-[8.5px] font-bold text-white flex items-center justify-center">{alertCount}</span>}
          </button>
          {alertsOpen && (
            <div className="absolute right-0 top-11 w-72 rounded-lg border border-white/10 bg-[#0B2235] shadow-2xl p-1 nexo-fade-in z-40">
              {[
                { t: 'Divergência espacial — Vale Verde', s: 'critico' as const },
                { t: 'Exposição climática — Rio Norte', s: 'critico' as const },
                { t: 'Acesso viário pendente — Horizonte Azul', s: 'atencao' as const },
                { t: 'Falha de integração — Compras.gov', s: 'atencao' as const },
              ].map((a, i) => (
                <div key={i} className="px-2.5 py-2 rounded-md hover:bg-white/[0.05] flex items-center justify-between gap-2">
                  <span className="text-[12px] text-neutral-300">{a.t}</span>
                  <StatusChip status={a.s} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="relative p-2 rounded-md hover:bg-white/8 text-neutral-400">
          <Icon name="CheckSquare" size={17} />
          {taskCount > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#E5A11A] text-[8.5px] font-bold text-[#071521] flex items-center justify-center">{taskCount}</span>}
        </button>

        <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 pl-1 pr-2">
          <div className="w-7 h-7 rounded-full bg-[#123353] border border-white/15 flex items-center justify-center text-[11px] font-semibold text-neutral-200">{CURRENT_USER.initials}</div>
          <div className="hidden xl:block leading-tight">
            <div className="text-[12px] font-medium text-neutral-200">{CURRENT_USER.name}</div>
            <div className="text-[10.5px] text-neutral-500">{CURRENT_USER.unit}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
