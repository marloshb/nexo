import {
  ResponsiveContainer, FunnelChart, Funnel, LabelList, ComposedChart, Line, Area,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell,
  Treemap, BarChart, Bar, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie,
} from 'recharts';
import { FUNNEL_DATA, SCURVE_DATA, RISK_MATRIX_DATA, TREEMAP_SOURCE, BAR_PROGRAM_DATA } from '@/data/mockData';

const TT_STYLE = {
  background: '#0B2235', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  fontSize: 12, color: '#EDF1F4', padding: '8px 10px',
};

export function FunnelCapitalResultado() {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <FunnelChart>
        <Tooltip contentStyle={TT_STYLE} formatter={(v: any) => [`R$ ${Number(v).toLocaleString('pt-BR')} mi`, '']} />
        <Funnel dataKey="value" data={FUNNEL_DATA} isAnimationActive>
          <LabelList position="right" dataKey="name" stroke="none" fill="#9AACB8" fontSize={11} />
          <LabelList position="left" dataKey="value" stroke="none" fill="#F5F7F9" fontSize={11}
            formatter={(v: any) => `R$ ${Number(v).toLocaleString('pt-BR')} mi`} />
          {FUNNEL_DATA.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

export function FunnelGeneric({ data, unit = '' }: { data: Array<{ name: string; value: number; fill: string }>; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <FunnelChart>
        <Tooltip contentStyle={TT_STYLE} formatter={(v: any) => [`${Number(v).toLocaleString('pt-BR')}${unit}`, '']} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList position="right" dataKey="name" stroke="none" fill="#9AACB8" fontSize={11} />
          <LabelList position="left" dataKey="value" stroke="none" fill="#F5F7F9" fontSize={11} formatter={(v: any) => `${v}${unit}`} />
          {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

export function SCurveChart({ data = SCURVE_DATA }: { data?: typeof SCURVE_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} />
        <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TT_STYLE} formatter={(v: any) => `${Math.round((Number(v) || 0) * 100)}%`} />
        <Area type="monotone" dataKey="planejado" stroke="#394B59" fill="#394B59" fillOpacity={0.18} strokeWidth={1.5} strokeDasharray="4 3" />
        <Line type="monotone" dataKey="realizado" stroke="#18B7D6" strokeWidth={2.5} dot={{ r: 3, fill: '#18B7D6' }} connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function TimeSeriesChart({
  data, xKey, aKey, bKey, aLabel, bLabel,
}: { data: any[]; xKey: string; aKey: string; bKey: string; aLabel: string; bLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} />
        <YAxis tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={TT_STYLE} formatter={(v: any) => Number(v).toLocaleString('pt-BR')} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#9AACB8' }} />
        <Area type="monotone" dataKey={aKey} name={aLabel} stroke="#394B59" fill="#394B59" fillOpacity={0.18} strokeWidth={1.5} strokeDasharray="4 3" />
        <Line type="monotone" dataKey={bKey} name={bLabel} stroke="#0FA39D" strokeWidth={2.5} dot={{ r: 3, fill: '#0FA39D' }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const RISK_COLOR = (p: number, i: number) => {
  const score = p * i;
  if (score >= 16) return '#D14A55';
  if (score >= 9) return '#E5A11A';
  return '#0FA39D';
};

export function RiskMatrixChart({
  onSelect, data = RISK_MATRIX_DATA, xKey = 'probabilidade', yKey = 'impacto', xLabel = 'Probabilidade', yLabel = 'Impacto',
}: {
  onSelect?: (name: string) => void; data?: any[]; xKey?: string; yKey?: string; xLabel?: string; yLabel?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
        <XAxis type="number" dataKey={xKey} name={xLabel} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]}
          tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false}
          label={{ value: xLabel, position: 'insideBottom', offset: -4, fill: '#9AACB8', fontSize: 11 }} />
        <YAxis type="number" dataKey={yKey} name={yLabel} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]}
          tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={false} tickLine={false}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#9AACB8', fontSize: 11 }} />
        <ZAxis range={[110, 110]} />
        <Tooltip
          contentStyle={TT_STYLE}
          cursor={{ strokeDasharray: '3 3' }}
          content={({ payload }) => {
            if (!payload || !payload.length) return null;
            const p = payload[0].payload;
            return (
              <div style={TT_STYLE}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                <div>{p.categoria ?? ''} {p.categoria ? '·' : ''} {xLabel[0]}{p[xKey]} × {yLabel[0]}{p[yKey]}</div>
              </div>
            );
          }}
        />
        <Scatter data={data} onClick={(d: any) => onSelect?.(d.name)} cursor="pointer">
          {data.map((d, i) => <Cell key={i} fill={RISK_COLOR(d[xKey], d[yKey])} fillOpacity={0.85} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function TreemapSource({ data = TREEMAP_SOURCE }: { data?: Array<{ name: string; value: number }> }) {
  const COLORS = ['#005CA9', '#0B6FC2', '#1584D1', '#18B7D6', '#0FA39D', '#087C78', '#7C5CBF', '#E5A11A'];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <Treemap
        data={data}
        dataKey="value"
        nameKey="name"
        stroke="#071521"
        content={({ x, y, width, height, index, name, value }: any) => (
          <g>
            <rect x={x} y={y} width={width} height={height} fill={COLORS[index % COLORS.length]} fillOpacity={0.82} stroke="#071521" strokeWidth={2} />
            {width > 60 && height > 30 && (
              <text x={x + 8} y={y + 18} fill="#F5F7F9" fontSize={11} fontWeight={600}>{name}</text>
            )}
            {width > 60 && height > 44 && (
              <text x={x + 8} y={y + 34} fill="#DDE3E8" fontSize={10.5}>R$ {value?.toLocaleString('pt-BR')} mi</text>
            )}
          </g>
        )}
      />
    </ResponsiveContainer>
  );
}

export function BarProgramChart({
  data = BAR_PROGRAM_DATA, xKey = 'programa', aKey = 'planejado', bKey = 'realizado', aLabel = 'Planejado', bLabel = 'Realizado', unit = '',
}: {
  data?: any[]; xKey?: string; aKey?: string; bKey?: string; aLabel?: string; bLabel?: string; unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: '#9AACB8', fontSize: 10.5 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} interval={0} angle={-12} textAnchor="end" height={46} />
        <YAxis tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TT_STYLE} formatter={(v: any) => `${v}${unit}`} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#9AACB8' }} />
        <Bar dataKey={aKey} name={aLabel} fill="#394B59" radius={[3, 3, 0, 0]} />
        <Bar dataKey={bKey} name={bLabel} fill="#1584D1" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SingleBarChart({ data, xKey, yKey, color = '#1584D1' }: { data: any[]; xKey: string; yKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: '#9AACB8', fontSize: 10.5 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} interval={0} angle={-10} textAnchor="end" height={44} />
        <YAxis tick={{ fill: '#9AACB8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TT_STYLE} />
        <Bar dataKey={yKey} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RadarComparison({ data, keys }: { data: any[]; keys: Array<{ key: string; label: string; color: string }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="dimensao" tick={{ fill: '#9AACB8', fontSize: 10.5 }} />
        <PolarRadiusAxis tick={{ fill: '#9AACB8', fontSize: 9 }} angle={30} domain={[0, 100]} />
        <Tooltip contentStyle={TT_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#9AACB8' }} />
        {keys.map((k) => (
          <Radar key={k.key} name={k.label} dataKey={k.key} stroke={k.color} fill={k.color} fillOpacity={0.18} strokeWidth={2} />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data }: { data: Array<{ name: string; value: number; fill: string }> }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Tooltip contentStyle={TT_STYLE} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.88} stroke="#071521" strokeWidth={1} />)}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 11, color: '#9AACB8' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
