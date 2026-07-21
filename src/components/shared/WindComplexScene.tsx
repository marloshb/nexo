import { useState } from 'react';
import { FAILURE_PREDICTIONS } from '@/data/ativosV3Data';

interface TurbineProps { x: number; status: 'normal' | 'atencao' | 'critico'; label: string; onClick: () => void; selected: boolean; }

const STATUS_COLOR = { normal: '#0FA39D', atencao: '#E5A11A', critico: '#D14A55' } as const;

function Turbine({ x, status, label, onClick, selected }: TurbineProps) {
  const color = STATUS_COLOR[status];
  return (
    <g transform={`translate(${x}, 0)`} className="cursor-pointer" onClick={onClick}>
      <ellipse cx={0} cy={230} rx={22} ry={6} fill="#000" opacity={0.25} />
      <polygon points="-4,230 4,230 2,60 -2,60" fill="url(#towerGrad)" stroke="#0B2235" strokeWidth={0.6} />
      <rect x={-13} y={48} width={26} height={13} rx={3} fill="#DDE3E8" stroke="#0B2235" strokeWidth={0.6} />
      <g transform="translate(0,54)">
        <g style={{ transformOrigin: '0px 0px', animation: status === 'normal' ? 'nexo-spin 7s linear infinite' : undefined }}>
          <rect x={-2} y={-58} width={4} height={40} rx={2} fill="#F5F7F9" transform="rotate(0)" />
          <rect x={-2} y={-58} width={4} height={40} rx={2} fill="#F5F7F9" transform="rotate(120)" />
          <rect x={-2} y={-58} width={4} height={40} rx={2} fill="#F5F7F9" transform="rotate(240)" />
        </g>
        <circle r={4.5} fill="#9AACB8" />
      </g>
      {(selected || status !== 'normal') && (
        <circle cx={0} cy={54} r={9} fill={color} opacity={0.28} className={status !== 'normal' ? 'nexo-pulse-ring' : ''} />
      )}
      <circle cx={0} cy={54} r={4} fill={color} stroke="#071521" strokeWidth={1} />
      <text x={0} y={248} textAnchor="middle" fontSize={9.5} fill={selected ? '#F5F7F9' : '#6B7F8C'} fontWeight={selected ? 700 : 400}>{label}</text>
    </g>
  );
}

const TURBINE_NUMBERS = [2, 5, 8, 11, 14, 17, 19, 22, 25, 28, 31, 34];
const TURBINES = TURBINE_NUMBERS.map((num) => {
  const label = `WTG-${String(num).padStart(2, '0')}`;
  const flagged = FAILURE_PREDICTIONS.find((f) => f.componente.includes(label));
  const status: 'normal' | 'atencao' | 'critico' = flagged ? flagged.criticidade : 'normal';
  return { label, status };
});

export function WindComplexScene({ onSelectComponent }: { onSelectComponent?: (label: string) => void }) {
  const [selected, setSelected] = useState<string | null>('WTG-14');

  return (
    <div className="w-full overflow-x-auto nexo-scroll">
      <svg viewBox="0 0 900 270" width="100%" style={{ minWidth: 780 }} className="select-none">
        <defs>
          <linearGradient id="towerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8FA3AF" /><stop offset="50%" stopColor="#DDE3E8" /><stop offset="100%" stopColor="#8FA3AF" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123353" stopOpacity={0.5} /><stop offset="100%" stopColor="#071521" stopOpacity={0} />
          </linearGradient>
          <style>{'@keyframes nexo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
        </defs>
        <rect x={0} y={200} width={900} height={70} fill="url(#groundGrad)" />
        <line x1={20} y1={230} x2={880} y2={230} stroke="#1B2733" strokeWidth={1} />
        {TURBINES.map((t, i) => (
          <Turbine
            key={t.label}
            x={50 + i * 72}
            status={t.status}
            label={t.label}
            selected={selected === t.label}
            onClick={() => { setSelected(t.label); onSelectComponent?.(t.label); }}
          />
        ))}
      </svg>
    </div>
  );
}
