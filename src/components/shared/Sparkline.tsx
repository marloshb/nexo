import { useEffect, useRef, useState } from 'react';
import type { Sensor } from '@/data/ativosV3Data';

export function Sparkline({ sensor, width = 220, height = 56 }: { sensor: Sensor; width?: number; height?: number }) {
  const [series, setSeries] = useState<number[]>(sensor.historico);
  const seedRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      seedRef.current += 1;
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        const drift = Math.sin(seedRef.current / 3) * sensor.amplitude * 0.35;
        const noise = (Math.random() - 0.5) * sensor.amplitude * 0.25;
        const next = Math.max(0, last + drift * 0.15 + noise);
        return [...prev.slice(-23), next];
      });
    }, 2400);
    return () => clearInterval(id);
  }, [sensor.amplitude]);

  const max = Math.max(...series, sensor.limiteAlerta) * 1.08;
  const min = Math.min(...series) * 0.9;
  const range = max - min || 1;
  const toX = (i: number) => (i / (series.length - 1)) * width;
  const toY = (v: number) => height - ((v - min) / range) * height;
  const points = series.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const alertY = toY(sensor.limiteAlerta);
  const current = series[series.length - 1];
  const isAlert = current >= sensor.limiteAlerta;

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {alertY >= 0 && alertY <= height && (
          <line x1={0} y1={alertY} x2={width} y2={alertY} stroke="#D14A55" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
        )}
        <polyline points={points} fill="none" stroke={isAlert ? '#D14A55' : '#18B7D6'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={toX(series.length - 1)} cy={toY(current)} r={3} fill={isAlert ? '#D14A55' : '#18B7D6'} />
      </svg>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-[13px] font-display font-semibold tnum ${isAlert ? 'text-[#D14A55]' : 'text-neutral-100'}`}>{current.toFixed(1)} <span className="text-[10px] font-normal text-neutral-500">{sensor.unidade}</span></span>
        {isAlert && <span className="text-[10px] font-medium text-[#D14A55]">acima do limite</span>}
      </div>
    </div>
  );
}
