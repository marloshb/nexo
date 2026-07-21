
import type { EventItem } from '@/data/mockData';
import { Icon } from '@/lib/icons';
import { cls } from '@/lib/tokens';

const TYPE_META: Record<EventItem['type'], { color: string; icon: string }> = {
  info: { color: '#9AACB8', icon: 'Circle' },
  success: { color: '#0FA39D', icon: 'CheckCircle2' },
  warning: { color: '#E5A11A', icon: 'AlertTriangle' },
  critical: { color: '#D14A55', icon: 'AlertOctagon' },
  agent: { color: '#18B7D6', icon: 'Bot' },
};

export function EventFeed({ events, dense = false, maxHeight }: { events: EventItem[]; dense?: boolean; maxHeight?: number }) {
  const ordered = [...events].reverse();
  return (
    <div className="overflow-y-auto nexo-scroll" style={{ maxHeight }}>
      <ul className="space-y-0">
        {ordered.map((e, i) => {
          const meta = TYPE_META[e.type];
          return (
            <li key={`${e.t}-${i}`} className={cls('flex items-start gap-2 border-b border-white/[0.06] last:border-0', dense ? 'py-1.5' : 'py-2')}>
              <Icon name={meta.icon} size={dense ? 11 : 13} style={{ color: meta.color }} className="mt-0.5 shrink-0" />
              <span className={cls('font-mono-id text-neutral-500 tnum shrink-0', dense ? 'text-[10px]' : 'text-[11px]')}>{e.t}</span>
              <span className={cls('text-neutral-300 leading-snug', dense ? 'text-[11px]' : 'text-[12px]')}>{e.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FooterTicker({ events }: { events: EventItem[] }) {
  const last = events[events.length - 1];
  if (!last) return null;
  const meta = TYPE_META[last.type];
  return (
    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
      <Icon name={meta.icon} size={12} style={{ color: meta.color }} className="shrink-0" />
      <span className="font-mono-id text-[10.5px] text-neutral-500 tnum shrink-0">{last.t}</span>
      <span className="text-[11.5px] text-neutral-300 truncate">{last.text}</span>
    </div>
  );
}
