import React from 'react';
import { STATUS_META, type StatusKey, cls } from '@/lib/tokens';
import { Icon } from '@/lib/icons';

const STATUS_ICON: Record<StatusKey, string> = {
  normal: 'CheckCircle2', analise: 'Clock', pendente: 'Circle', atencao: 'AlertTriangle',
  critico: 'AlertOctagon', bloqueado: 'Lock', automatizado: 'Bot', decisao: 'User',
};

export function StatusChip({ status, size = 'md' }: { status: StatusKey; size?: 'sm' | 'md' }) {
  const s = STATUS_META[status] ?? STATUS_META.pendente;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={cls('inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap', pad)}
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}
    >
      <Icon name={STATUS_ICON[status]} size={size === 'sm' ? 10 : 12} strokeWidth={2.75} />
      {s.label}
    </span>
  );
}

export function Pill({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: 'neutral' | 'blue' | 'cyan'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-white/5 text-neutral-300 border-white/10',
    blue: 'bg-[#1584D1]/15 text-[#5FB4E8] border-[#1584D1]/30',
    cyan: 'bg-[#18B7D6]/15 text-[#6FD8EC] border-[#18B7D6]/30',
  };
  return (
    <span className={cls('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, tone = 'blue', height = 6 }: { value: number; tone?: 'blue' | 'teal' | 'amber' | 'red' | 'cyan'; height?: number }) {
  const colors: Record<string, string> = { blue: '#1584D1', teal: '#0FA39D', amber: '#E5A11A', red: '#D14A55', cyan: '#18B7D6' };
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="w-full rounded-full bg-white/8 overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: colors[tone] }} />
    </div>
  );
}

export function Panel({
  title, subtitle, actions, children, className, dense,
}: {
  title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode;
  children: React.ReactNode; className?: string; dense?: boolean;
}) {
  return (
    <div className={cls('rounded-xl border border-white/10 bg-[#0E2A40]/60 backdrop-blur-sm', className)}>
      {(title || actions) && (
        <div className={cls('flex items-center justify-between gap-3 border-b border-white/8', dense ? 'px-3.5 py-2.5' : 'px-4 py-3.5')}>
          <div className="min-w-0">
            {title && <h3 className="font-display text-[13px] font-semibold tracking-wide text-neutral-100 truncate">{title}</h3>}
            {subtitle && <p className="text-[11.5px] text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={dense ? 'p-3.5' : 'p-4'}>{children}</div>
    </div>
  );
}

export function KpiCard({
  label, value, delta, deltaTone = 'teal', icon, hint,
}: {
  label: string; value: string; delta?: string; deltaTone?: 'teal' | 'red' | 'amber';
  icon?: string; hint?: string;
}) {
  const deltaColor = deltaTone === 'teal' ? '#0FA39D' : deltaTone === 'red' ? '#D14A55' : '#E5A11A';
  return (
    <div className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3.5 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-neutral-400 font-medium truncate">{label}</span>
        {icon && <Icon name={icon} size={14} className="text-neutral-500 shrink-0" />}
      </div>
      <div className="font-display text-[22px] font-semibold text-neutral-50 tnum leading-tight truncate">{value}</div>
      <div className="flex items-center gap-1.5 min-h-[16px]">
        {delta && (
          <span className="text-[11px] font-medium tnum" style={{ color: deltaColor }}>{delta}</span>
        )}
        {hint && <span className="text-[11px] text-neutral-500 truncate">{hint}</span>}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">{children}</div>;
}

export function EmptyHint({ icon = 'Info', children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2.5 text-[12px] text-neutral-400">
      <Icon name={icon} size={14} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}
