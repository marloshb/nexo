import { useState } from 'react';
import { BR_STATES, BR_VIEWBOX, project } from '@/data/brazilMap';
import { STATUS_META, REGION_COLOR, type StatusKey } from '@/lib/tokens';
import type { Asset } from '@/data/mockData';
import { Icon } from '@/lib/icons';

interface BrazilMapProps {
  assets: Asset[];
  selectedId?: string | null;
  onSelectAsset?: (id: string) => void;
  selectedUF?: string | null;
  onSelectUF?: (uf: string | null) => void;
  height?: number;
  colorBy?: 'region' | 'status';
  showLegend?: boolean;
}

export function BrazilMap({
  assets, selectedId, onSelectAsset, selectedUF, onSelectUF, height = 360, colorBy = 'region', showLegend = true,
}: BrazilMapProps) {
  const [hoverAsset, setHoverAsset] = useState<Asset | null>(null);
  const [hoverUF, setHoverUF] = useState<string | null>(null);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={BR_VIEWBOX} className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="nexo-map-glow" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#123353" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#071521" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="640" height="620" fill="url(#nexo-map-glow)" />

        {BR_STATES.map((s) => {
          const isSelected = selectedUF === s.sigla;
          const isHover = hoverUF === s.sigla;
          const base = colorBy === 'region' ? REGION_COLOR[s.region] ?? '#394B59' : '#123353';
          return (
            <path
              key={s.sigla}
              d={s.d}
              fill={base}
              fillOpacity={isSelected ? 0.55 : isHover ? 0.4 : 0.22}
              stroke={isSelected ? '#3FCBE3' : '#0B2235'}
              strokeWidth={isSelected ? 1.6 : 0.8}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoverUF(s.sigla)}
              onMouseLeave={() => setHoverUF(null)}
              onClick={() => onSelectUF?.(selectedUF === s.sigla ? null : s.sigla)}
            />
          );
        })}

        {assets.map((a) => {
          const [x, y] = project(a.lat, a.lon);
          const meta = STATUS_META[a.status as StatusKey];
          const isSelected = selectedId === a.id;
          const dimmed = selectedUF && selectedUF !== a.uf;
          return (
            <g
              key={a.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              opacity={dimmed ? 0.25 : 1}
              onMouseEnter={() => setHoverAsset(a)}
              onMouseLeave={() => setHoverAsset(null)}
              onClick={() => onSelectAsset?.(a.id)}
            >
              {(isSelected || a.status === 'critico') && (
                <circle r={9} fill={meta.color} opacity={0.35} className="nexo-pulse-ring" />
              )}
              <circle r={isSelected ? 7.5 : 5.5} fill={meta.color} stroke="#071521" strokeWidth={1.5} />
              {isSelected && <circle r={11} fill="none" stroke={meta.color} strokeWidth={1.2} opacity={0.8} />}
            </g>
          );
        })}
      </svg>

      {hoverAsset && (
        <div
          className="absolute z-10 pointer-events-none rounded-lg border border-white/15 bg-[#0B2235] px-3 py-2 text-[11.5px] shadow-xl nexo-fade-in"
          style={{
            left: `${(project(hoverAsset.lat, hoverAsset.lon)[0] / 640) * 100}%`,
            top: `${(project(hoverAsset.lat, hoverAsset.lon)[1] / 620) * 100}%`,
            transform: 'translate(12px, -50%)',
            maxWidth: 220,
          }}
        >
          <div className="font-medium text-neutral-100 truncate">{hoverAsset.name}</div>
          <div className="text-neutral-400">{hoverAsset.city} · {hoverAsset.uf}</div>
        </div>
      )}

      {showLegend && (
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md bg-[#071521]/70 backdrop-blur-sm px-2.5 py-1.5 text-[10.5px] text-neutral-400">
          {colorBy === 'region'
            ? Object.entries(REGION_COLOR).map(([name, color]) => (
                <span key={name} className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color, opacity: 0.6 }} />{name}
                </span>
              ))
            : Object.entries(STATUS_META).slice(0, 5).map(([k, m]) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: m.color }} />{m.label}
                </span>
              ))}
        </div>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-[#071521]/70 backdrop-blur-sm px-2 py-1 text-[10px] text-neutral-500">
        <Icon name="MapPinned" size={11} />
        <span>Camada sintética · integração de produção via ArcGIS Maps SDK 5.1</span>
      </div>
    </div>
  );
}

export interface GeoDotPoint { id: string; name: string; lat: number; lon: number; color: string; sublabel?: string; }

export function GeoDotMap({
  points, height = 320, onSelectPoint, selectedId,
}: { points: GeoDotPoint[]; height?: number; onSelectPoint?: (id: string) => void; selectedId?: string | null }) {
  const [hover, setHover] = useState<GeoDotPoint | null>(null);
  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={BR_VIEWBOX} className="w-full h-full" style={{ overflow: 'visible' }}>
        {BR_STATES.map((s) => (
          <path key={s.sigla} d={s.d} fill="#123353" fillOpacity={0.22} stroke="#0B2235" strokeWidth={0.8} />
        ))}
        {points.map((p) => {
          const [x, y] = project(p.lat, p.lon);
          const isSelected = selectedId === p.id;
          return (
            <g key={p.id} transform={`translate(${x}, ${y})`} className="cursor-pointer" onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)} onClick={() => onSelectPoint?.(p.id)}>
              {isSelected && <circle r={9} fill={p.color} opacity={0.35} className="nexo-pulse-ring" />}
              <circle r={isSelected ? 7 : 5} fill={p.color} stroke="#071521" strokeWidth={1.4} />
            </g>
          );
        })}
      </svg>
      {hover && (
        <div
          className="absolute z-10 pointer-events-none rounded-lg border border-white/15 bg-[#0B2235] px-3 py-2 text-[11.5px] shadow-xl nexo-fade-in"
          style={{ left: `${(project(hover.lat, hover.lon)[0] / 640) * 100}%`, top: `${(project(hover.lat, hover.lon)[1] / 620) * 100}%`, transform: 'translate(12px, -50%)', maxWidth: 220 }}
        >
          <div className="font-medium text-neutral-100 truncate">{hover.name}</div>
          {hover.sublabel && <div className="text-neutral-400">{hover.sublabel}</div>}
        </div>
      )}
    </div>
  );
}
