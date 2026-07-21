// Design tokens — CAIXA Nexo institutional palette (hex, for charts/map/svg where exact control is needed)
export const T = {
  navy950: '#071521',
  navy900: '#0B2235',
  navy850: '#0E2A40',
  navy800: '#123353',
  navy700: '#194270',
  blue700: '#005CA9',
  blue600: '#0B6FC2',
  blue500: '#1584D1',
  cyan500: '#18B7D6',
  cyan400: '#3FCBE3',
  teal600: '#087C78',
  teal500: '#0FA39D',
  amber500: '#E5A11A',
  amber400: '#F0B94A',
  red600: '#B63B45',
  red500: '#D14A55',
  redDark: '#7A1E28',
  purple500: '#7C5CBF',
  neutral50: '#F5F7F9',
  neutral100: '#EDF1F4',
  neutral200: '#DDE3E8',
  neutral400: '#9AACB8',
  neutral700: '#394B59',
  neutral900: '#1B2733',
} as const;

export type StatusKey =
  | 'normal' | 'analise' | 'pendente' | 'atencao' | 'critico'
  | 'bloqueado' | 'automatizado' | 'decisao';

export const STATUS_META: Record<StatusKey, { label: string; color: string; bg: string }> = {
  normal:       { label: 'Normal',                          color: T.teal500,  bg: 'rgba(15,163,157,0.14)' },
  analise:      { label: 'Em análise',                      color: T.blue500,  bg: 'rgba(21,132,209,0.14)' },
  pendente:     { label: 'Pendente',                        color: T.neutral400, bg: 'rgba(154,172,184,0.14)' },
  atencao:      { label: 'Atenção',                         color: T.amber500, bg: 'rgba(229,161,26,0.16)' },
  critico:      { label: 'Crítico',                         color: T.red500,   bg: 'rgba(209,74,85,0.16)' },
  bloqueado:    { label: 'Bloqueado',                       color: T.redDark,  bg: 'rgba(122,30,40,0.22)' },
  automatizado: { label: 'Automatizado',                    color: T.cyan500,  bg: 'rgba(24,183,214,0.16)' },
  decisao:      { label: 'Aguardando decisão humana',       color: T.purple500, bg: 'rgba(124,92,191,0.16)' },
};

export const REGION_COLOR: Record<string, string> = {
  'Norte': T.teal500,
  'Nordeste': T.amber500,
  'Centro-Oeste': T.purple500,
  'Sudeste': T.blue500,
  'Sul': T.cyan500,
};

// ---- formatting helpers ----
export const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export const fmtCompactBRL = (v: number) => {
  const sign = v < 0 ? '-' : '';
  v = Math.abs(v);
  if (v >= 1e9) return `${sign}R$ ${(v / 1e9).toFixed(1).replace('.', ',')} bi`;
  if (v >= 1e6) return `${sign}R$ ${(v / 1e6).toFixed(0)} mi`;
  if (v >= 1e3) return `${sign}R$ ${(v / 1e3).toFixed(0)} mil`;
  return fmtBRL(v);
};

export const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(v);
export const fmtCompactNum = (v: number) => {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace('.', ',')} mi`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)} mil`;
  return fmtNum(v);
};
export const fmtPct = (v: number, decimals = 0) => `${(v * 100).toFixed(decimals).replace('.', ',')}%`;
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
export const fmtDateShort = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso));

export function nowStr(): string {
  const d = new Date();
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}
