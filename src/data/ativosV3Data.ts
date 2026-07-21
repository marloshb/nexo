// Dados sintéticos — Nexo Ativos V3: sensores, manutenção preditiva, resiliência e reinvestimento

export interface HealthDimension { label: string; value: number; }
export const HEALTH_DIMENSIONS: Record<string, HealthDimension[]> = {
  'Adutora Sertão Vivo': [
    { label: 'Disponibilidade', value: 98 }, { label: 'Desempenho', value: 93 }, { label: 'Integridade física', value: 91 },
    { label: 'Manutenção', value: 89 }, { label: 'Segurança', value: 96 }, { label: 'Capacidade utilizada', value: 84 },
    { label: 'Custo operacional', value: 88 }, { label: 'Resiliência climática', value: 79 },
    { label: 'Qualidade do serviço', value: 94 }, { label: 'Vida útil remanescente', value: 86 },
  ],
  'Complexo Eólico Costa Branca': [
    { label: 'Disponibilidade', value: 95 }, { label: 'Desempenho', value: 90 }, { label: 'Integridade física', value: 82 },
    { label: 'Manutenção', value: 74 }, { label: 'Segurança', value: 97 }, { label: 'Capacidade utilizada', value: 88 },
    { label: 'Custo operacional', value: 85 }, { label: 'Resiliência climática', value: 91 },
    { label: 'Qualidade do serviço', value: 92 }, { label: 'Vida útil remanescente', value: 78 },
  ],
  'Escola Técnica Cerrado': [
    { label: 'Disponibilidade', value: 99 }, { label: 'Desempenho', value: 95 }, { label: 'Integridade física', value: 97 },
    { label: 'Manutenção', value: 96 }, { label: 'Segurança', value: 98 }, { label: 'Capacidade utilizada', value: 48 },
    { label: 'Custo operacional', value: 93 }, { label: 'Resiliência climática', value: 90 },
    { label: 'Qualidade do serviço', value: 95 }, { label: 'Vida útil remanescente', value: 97 },
  ],
};

export interface Sensor {
  id: string; assetId: string; ativo: string; componente: string;
  tipo: 'Vibração' | 'Vazão' | 'Temperatura' | 'Pressão' | 'Velocidade do vento';
  unidade: string; base: number; amplitude: number; limiteAlerta: number; historico: number[];
}
export const SENSORS: Sensor[] = [
  { id: 'SEN-001', assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'Aerogerador WTG-14 — caixa multiplicadora', tipo: 'Vibração', unidade: 'mm/s', base: 4.2, amplitude: 1.8, limiteAlerta: 7.0, historico: [3.8, 4.0, 4.3, 4.6, 5.1, 5.4, 5.8, 6.1] },
  { id: 'SEN-002', assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'Aerogerador WTG-22 — pás', tipo: 'Velocidade do vento', unidade: 'm/s', base: 8.5, amplitude: 3.2, limiteAlerta: 25, historico: [7.2, 8.1, 9.4, 8.8, 7.9, 8.6, 9.1, 8.3] },
  { id: 'SEN-003', assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', componente: 'Estação de bombeamento EB-01', tipo: 'Vazão', unidade: 'm³/h', base: 420, amplitude: 30, limiteAlerta: 350, historico: [418, 422, 415, 409, 411, 405, 402, 398] },
  { id: 'SEN-004', assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', componente: 'Trecho crítico km 42', tipo: 'Pressão', unidade: 'mca', base: 62, amplitude: 4, limiteAlerta: 75, historico: [60, 61, 63, 64, 65, 66, 67, 68] },
  { id: 'SEN-005', assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'Aerogerador WTG-08 — gerador', tipo: 'Temperatura', unidade: '°C', base: 68, amplitude: 5, limiteAlerta: 85, historico: [66, 67, 69, 71, 72, 74, 76, 77] },
];

export interface WorkOrder {
  id: string; assetId: string; ativo: string; componente: string; tipo: 'Preventiva' | 'Corretiva' | 'Preditiva';
  status: 'aberta' | 'em_execucao' | 'concluida'; abertura: string; previsao: string; responsavel: string; custo: number;
}
export const WORK_ORDERS: WorkOrder[] = [
  { id: 'OS-4471', assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'WTG-14 — caixa multiplicadora', tipo: 'Preditiva', status: 'aberta', abertura: '2026-07-18', previsao: '2026-09-04', responsavel: 'Tiago Almeida', custo: 340_000 },
  { id: 'OS-4472', assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'WTG-22 — pás', tipo: 'Preditiva', status: 'aberta', abertura: '2026-07-19', previsao: '2026-09-04', responsavel: 'Tiago Almeida', custo: 210_000 },
  { id: 'OS-4473', assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'WTG-08 — gerador', tipo: 'Preditiva', status: 'em_execucao', abertura: '2026-07-10', previsao: '2026-09-04', responsavel: 'Tiago Almeida', custo: 180_000 },
  { id: 'OS-4455', assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', componente: 'Estação de bombeamento EB-01', tipo: 'Preventiva', status: 'concluida', abertura: '2026-06-02', previsao: '2026-06-20', responsavel: 'Juliana Prado', custo: 42_000 },
  { id: 'OS-4460', assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', ativo: 'Escola Técnica Cerrado', componente: 'Sistema de climatização', tipo: 'Corretiva', status: 'concluida', abertura: '2026-07-05', previsao: '2026-07-09', responsavel: 'Bruno Castro', custo: 8_500 },
];

export interface FailurePrediction {
  assetId: string; ativo: string; componente: string; probabilidade30d: number; probabilidade90d: number;
  janela: string; recomendacao: string; criticidade: 'atencao' | 'critico';
}
export const FAILURE_PREDICTIONS: FailurePrediction[] = [
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'WTG-14 — caixa multiplicadora', probabilidade30d: 0.12, probabilidade90d: 0.46, janela: '45 dias', recomendacao: 'Substituição preditiva da caixa multiplicadora antes da falha', criticidade: 'critico' },
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'WTG-22 — pás', probabilidade30d: 0.08, probabilidade90d: 0.31, janela: '45 dias', recomendacao: 'Inspeção estrutural das pás e balanceamento', criticidade: 'atencao' },
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', componente: 'WTG-08 — gerador', probabilidade30d: 0.15, probabilidade90d: 0.52, janela: '30 dias', recomendacao: 'Substituição de rolamentos do gerador em andamento', criticidade: 'critico' },
  { assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', componente: 'Trecho crítico km 42', probabilidade30d: 0.04, probabilidade90d: 0.14, janela: '180 dias', recomendacao: 'Monitoramento contínuo — sem ação imediata necessária', criticidade: 'atencao' },
];

export interface ReinvestmentPlan {
  assetId: string; ativo: string; vidaUtilRemanescente: number; anoRecomendado: number; valorEstimado: number; recomendacao: string;
}
export const REINVESTMENT_PLAN: ReinvestmentPlan[] = [
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', vidaUtilRemanescente: 78, anoRecomendado: 2031, valorEstimado: 62_000_000, recomendacao: 'Repotenciação parcial de 8 aerogeradores mais antigos' },
  { assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', vidaUtilRemanescente: 86, anoRecomendado: 2036, valorEstimado: 28_000_000, recomendacao: 'Reforço estrutural do trecho km 38–46' },
  { assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', ativo: 'Escola Técnica Cerrado', vidaUtilRemanescente: 97, anoRecomendado: 2048, valorEstimado: 4_200_000, recomendacao: 'Sem necessidade de reinvestimento no horizonte de 10 anos' },
];

export interface ClimateRisk {
  assetId: string; ativo: string; ameaca: string; exposicao: 'baixo' | 'medio' | 'alto'; medida: string;
}
export const CLIMATE_RISK: ClimateRisk[] = [
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', ameaca: 'Ventos extremos / ciclones tropicais', exposicao: 'medio', medida: 'Sistema de shutdown automático acima de 25 m/s' },
  { assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', ameaca: 'Seca prolongada / redução de manancial', exposicao: 'alto', medida: 'Reservatório de reserva estratégica de 30 dias' },
  { assetId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', ativo: 'Programa de Macrodrenagem Rio Norte', ameaca: 'Transbordamento por chuva extrema', exposicao: 'alto', medida: 'Reprogramação de 2 componentes em avaliação' },
  { assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', ativo: 'Escola Técnica Cerrado', ameaca: 'Ondas de calor', exposicao: 'baixo', medida: 'Climatização dimensionada com margem de 20%' },
];

// Trajeto sintético da vistoria de campo (Vale Verde) para simulação estilo StreamLayer
export const TRECHO_WAYPOINTS: Array<{ id: string; lat: number; lon: number }> = [
  { id: 'BASE', lat: -23.1896, lon: -45.8841 },
  { id: 'T-14', lat: -23.1710, lon: -45.9020 },
  { id: 'T-17', lat: -23.1800, lon: -45.8950 },
  { id: 'T-22', lat: -23.1920, lon: -45.8740 },
];
