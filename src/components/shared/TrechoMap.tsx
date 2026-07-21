import { TRECHO_WAYPOINTS } from '@/data/ativosV3Data';
import { MEDICAO_VALE_VERDE_FULL } from '@/data/mockData';

const W = 380, H = 260, PAD = 34;
const lats = TRECHO_WAYPOINTS.map((p) => p.lat);
const lons = TRECHO_WAYPOINTS.map((p) => p.lon);
const latMin = Math.min(...lats), latMax = Math.max(...lats);
const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
const scale = Math.min((W - 2 * PAD) / (lonMax - lonMin), (H - 2 * PAD) / (latMax - latMin));

function project(lat: number, lon: number): [number, number] {
  const x = (lon - lonMin) * scale + PAD;
  const y = H - ((lat - latMin) * scale + PAD);
  return [x, y];
}

const DIVERGENT: Record<string, boolean> = { 'T-14': true, 'T-17': false, 'T-22': true };

export function TrechoMap({ crewWaypointIndex, active }: { crewWaypointIndex: number; active: boolean }) {
  const crew = TRECHO_WAYPOINTS[Math.min(crewWaypointIndex, TRECHO_WAYPOINTS.length - 1)];
  const [crewX, crewY] = project(crew.lat, crew.lon);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: 'radial-gradient(ellipse at 50% 40%, #123353 0%, #071521 75%)', borderRadius: 10 }}>
        {/* linha conectando os trechos, representando a rede coletora */}
        <polyline
          points={TRECHO_WAYPOINTS.map((p) => project(p.lat, p.lon).join(',')).join(' ')}
          fill="none" stroke="#394B59" strokeWidth={2.5} strokeDasharray="1 6" strokeLinecap="round"
        />
        {TRECHO_WAYPOINTS.map((p) => {
          const [x, y] = project(p.lat, p.lon);
          const isDivergent = DIVERGENT[p.id];
          const color = p.id === 'BASE' ? '#9AACB8' : isDivergent ? '#D14A55' : '#0FA39D';
          return (
            <g key={p.id}>
              {isDivergent && <circle cx={x} cy={y} r={11} fill={color} opacity={0.25} className="nexo-pulse-ring" />}
              <circle cx={x} cy={y} r={p.id === 'BASE' ? 5 : 6.5} fill={color} stroke="#071521" strokeWidth={1.5} />
              <text x={x} y={y - 12} textAnchor="middle" fontSize={10.5} fill="#DDE3E8" fontWeight={600}>{p.id === 'BASE' ? 'Canteiro' : p.id}</text>
            </g>
          );
        })}
        {/* marcador da equipe de vistoria — se move entre waypoints, ao estilo StreamLayer */}
        <g style={{ transition: 'transform 1.6s ease-in-out' }} transform={`translate(${crewX}, ${crewY})`}>
          <circle r={9} fill="#18B7D6" opacity={0.3} className={active ? 'nexo-pulse-ring' : ''} />
          <circle r={5.5} fill="#18B7D6" stroke="#071521" strokeWidth={1.5} />
          <text x={0} y={20} textAnchor="middle" fontSize={9.5} fill="#6FD8EC" fontWeight={600}>Equipe</text>
        </g>
      </svg>
      <div className="flex items-center justify-between mt-1.5 text-[10.5px] text-neutral-500">
        <span>Medição {MEDICAO_VALE_VERDE_FULL.contrato}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#18B7D6]" />Posição simulada em tempo real</span>
      </div>
    </div>
  );
}
