import { REALISTIC_DELIVERY_PORTFOLIO, REALISTIC_MEASUREMENTS, REALISTIC_DISBURSEMENTS } from '@/data/realisticPortfolioData';
import type { StatusKey } from '@/lib/tokens';

export type EntregaSection =
  | 'overview'
  | 'schedule'
  | 'map'
  | 'measurements'
  | 'disbursements'
  | 'workflows'
  | 'analytics'
  | 'agents'
  | 'reports'
  | 'integrations';

export interface DeliveryPortfolioItem {
  assetId: string;
  shortName: string;
  contract: string;
  city: string;
  uf: string;
  sector: string;
  value: number;
  physical: number;
  financial: number;
  forecast: string;
  delayWeeks: number;
  contingencyUsed: number;
  openIssues: number;
  criticalIssues: number;
  status: StatusKey;
  nextMilestone: string;
  owner: string;
}

export const DELIVERY_PORTFOLIO: DeliveryPortfolioItem[] = [
  {
    assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', shortName: 'Vale Verde', contract: 'CT-2025-SAN-0142', city: 'São José dos Campos', uf: 'SP', sector: 'Saneamento',
    value: 480_000_000, physical: 0.64, financial: 0.59, forecast: 'Mar/2027', delayWeeks: 6, contingencyUsed: 0.31,
    openIssues: 3, criticalIssues: 1, status: 'critico', nextMilestone: 'Vistoria OV-2026-0871', owner: 'Ana Beatriz Souza',
  },
  {
    assetId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', shortName: 'Rio Norte', contract: 'PGM-2024-DRE-0098', city: 'Belém e região', uf: 'PA', sector: 'Drenagem',
    value: 612_000_000, physical: 0.42, financial: 0.38, forecast: 'Out/2027', delayWeeks: 9, contingencyUsed: 0.44,
    openIssues: 7, criticalIssues: 2, status: 'critico', nextMilestone: 'Reprogramação climática', owner: 'Fernanda Ribeiro',
  },
  {
    assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', shortName: 'Horizonte Azul', contract: 'CT-2024-HAB-0871', city: 'Recife', uf: 'PE', sector: 'Habitação',
    value: 186_000_000, physical: 0.87, financial: 0.83, forecast: 'Nov/2026', delayWeeks: 4, contingencyUsed: 0.22,
    openIssues: 4, criticalIssues: 0, status: 'atencao', nextMilestone: 'Acesso viário', owner: 'Carlos Eduardo Lima',
  },
  {
    assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', shortName: 'Sertão Vivo', contract: 'CT-2022-AGU-0033', city: 'Iguatu', uf: 'CE', sector: 'Recursos Hídricos',
    value: 298_000_000, physical: 1, financial: 1, forecast: 'Concluído', delayWeeks: 0, contingencyUsed: 0.18,
    openIssues: 0, criticalIssues: 0, status: 'normal', nextMilestone: 'Encerramento final', owner: 'Juliana Prado',
  },
  {
    assetId: 'NEXO-ASSET-BR-MG-3106200-MOB-000341', shortName: 'BRT Serra Azul', contract: 'CT-2026-MOB-0031', city: 'Belo Horizonte', uf: 'MG', sector: 'Mobilidade',
    value: 355_000_000, physical: 0.05, financial: 0.06, forecast: 'Dez/2028', delayWeeks: 0, contingencyUsed: 0.02,
    openIssues: 2, criticalIssues: 0, status: 'analise', nextMilestone: 'Ordem de serviço', owner: 'Rodrigo Nakamura',
  },
];
DELIVERY_PORTFOLIO.push(...REALISTIC_DELIVERY_PORTFOLIO);

export interface ScheduleMilestone {
  id: string;
  assetId: string;
  name: string;
  category: 'Engenharia' | 'Obra' | 'Licença' | 'Desembolso' | 'Comissionamento';
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  critical: boolean;
  status: StatusKey;
  dependency?: string;
  owner: string;
}

export const SCHEDULE_MILESTONES: ScheduleMilestone[] = [
  { id: 'MS-01', assetId: DELIVERY_PORTFOLIO[0].assetId, name: 'Projeto executivo e compatibilização', category: 'Engenharia', plannedStart: '2025-07-15', plannedEnd: '2025-09-30', actualStart: '2025-07-18', actualEnd: '2025-10-12', progress: 1, critical: false, status: 'normal', owner: 'Consórcio Vale Verde' },
  { id: 'MS-02', assetId: DELIVERY_PORTFOLIO[0].assetId, name: 'Interceptor Norte — Lote 1', category: 'Obra', plannedStart: '2025-10-01', plannedEnd: '2026-05-31', actualStart: '2025-10-14', progress: 0.82, critical: true, status: 'atencao', dependency: 'MS-01', owner: 'Engenharia Alfa' },
  { id: 'MS-03', assetId: DELIVERY_PORTFOLIO[0].assetId, name: 'Rede coletora — Lote 2', category: 'Obra', plannedStart: '2026-01-10', plannedEnd: '2026-10-30', actualStart: '2026-01-22', progress: 0.61, critical: true, status: 'critico', dependency: 'MS-01', owner: 'Consórcio Saneamento Verde' },
  { id: 'MS-04', assetId: DELIVERY_PORTFOLIO[0].assetId, name: 'Estações elevatórias EE-01 a EE-04', category: 'Obra', plannedStart: '2026-03-01', plannedEnd: '2026-11-30', actualStart: '2026-03-18', progress: 0.48, critical: true, status: 'atencao', dependency: 'MS-02', owner: 'Hidro Sistemas' },
  { id: 'MS-05', assetId: DELIVERY_PORTFOLIO[0].assetId, name: 'Licença de operação', category: 'Licença', plannedStart: '2026-11-01', plannedEnd: '2027-01-31', progress: 0.12, critical: true, status: 'analise', dependency: 'MS-03', owner: 'Município / CETESB' },
  { id: 'MS-06', assetId: DELIVERY_PORTFOLIO[0].assetId, name: 'Comissionamento integrado', category: 'Comissionamento', plannedStart: '2027-01-15', plannedEnd: '2027-03-20', progress: 0, critical: true, status: 'pendente', dependency: 'MS-05', owner: 'Operador municipal' },
  { id: 'MS-07', assetId: DELIVERY_PORTFOLIO[1].assetId, name: 'Canal principal — Trecho A', category: 'Obra', plannedStart: '2025-03-01', plannedEnd: '2026-06-30', actualStart: '2025-03-18', progress: 0.58, critical: true, status: 'critico', owner: 'Consórcio Rio Norte' },
  { id: 'MS-08', assetId: DELIVERY_PORTFOLIO[1].assetId, name: 'Reservatórios de amortecimento', category: 'Obra', plannedStart: '2025-08-01', plannedEnd: '2027-02-28', actualStart: '2025-09-04', progress: 0.34, critical: true, status: 'atencao', owner: 'Drenagem Pará' },
  { id: 'MS-09', assetId: DELIVERY_PORTFOLIO[2].assetId, name: 'Infraestrutura interna', category: 'Obra', plannedStart: '2024-05-01', plannedEnd: '2026-07-30', actualStart: '2024-05-10', progress: 0.87, critical: false, status: 'normal', owner: 'Construtora Horizonte' },
  { id: 'MS-10', assetId: DELIVERY_PORTFOLIO[2].assetId, name: 'Acesso viário e transporte', category: 'Comissionamento', plannedStart: '2025-11-01', plannedEnd: '2026-08-31', actualStart: '2026-01-12', progress: 0.52, critical: true, status: 'atencao', owner: 'Município do Recife' },
];

export interface MeasurementRecord {
  id: string;
  number: number;
  assetId: string;
  contract: string;
  period: string;
  submittedAt: string;
  requested: number;
  validated: number;
  retained: number;
  evidenceCount: number;
  confidence: number;
  physicalClaimed: number;
  physicalVerified: number;
  status: 'validada' | 'em_analise' | 'divergente' | 'aguardando_vistoria' | 'paga';
  risk: StatusKey;
  owner: string;
  agent: string;
  issue?: string;
}

export const DELIVERY_MEASUREMENTS: MeasurementRecord[] = [
  { id: 'MED-VALE-006', number: 6, assetId: DELIVERY_PORTFOLIO[0].assetId, contract: 'CT-2025-SAN-0142', period: '01/06 a 30/06/2026', submittedAt: '20/07/2026 19:42', requested: 18_350_000, validated: 15_700_000, retained: 2_650_000, evidenceCount: 28, confidence: 0.93, physicalClaimed: 0.67, physicalVerified: 0.64, status: 'aguardando_vistoria', risk: 'critico', owner: 'Ana Beatriz Souza', agent: 'Medição e Desembolso', issue: 'Divergência espacial em T-14, T-17 e T-22.' },
  { id: 'MED-RION-011', number: 11, assetId: DELIVERY_PORTFOLIO[1].assetId, contract: 'CT-2025-DRE-0202', period: '01/06 a 30/06/2026', submittedAt: '18/07/2026 14:10', requested: 31_900_000, validated: 24_600_000, retained: 7_300_000, evidenceCount: 64, confidence: 0.82, physicalClaimed: 0.46, physicalVerified: 0.42, status: 'divergente', risk: 'critico', owner: 'Fernanda Ribeiro', agent: 'Risco Climático', issue: 'Reprogramação necessária após evento de precipitação extrema.' },
  { id: 'MED-HORI-018', number: 18, assetId: DELIVERY_PORTFOLIO[2].assetId, contract: 'CT-2024-HAB-0871', period: '01/06 a 30/06/2026', submittedAt: '16/07/2026 10:32', requested: 9_420_000, validated: 9_420_000, retained: 0, evidenceCount: 42, confidence: 0.97, physicalClaimed: 0.87, physicalVerified: 0.87, status: 'validada', risk: 'normal', owner: 'Carlos Eduardo Lima', agent: 'Medição e Desembolso' },
  { id: 'MED-BRT-001', number: 1, assetId: DELIVERY_PORTFOLIO[4].assetId, contract: 'CT-2026-MOB-0031', period: 'Mobilização inicial', submittedAt: '19/07/2026 08:05', requested: 12_800_000, validated: 10_900_000, retained: 1_900_000, evidenceCount: 19, confidence: 0.89, physicalClaimed: 0.06, physicalVerified: 0.05, status: 'em_analise', risk: 'atencao', owner: 'Rodrigo Nakamura', agent: 'Engenharia e Custos', issue: 'Equipamentos mobilizados parcialmente.' },
  { id: 'MED-SERT-024', number: 24, assetId: DELIVERY_PORTFOLIO[3].assetId, contract: 'CT-2022-AGU-0033', period: 'Medição final', submittedAt: '10/06/2024 16:20', requested: 4_120_000, validated: 4_120_000, retained: 0, evidenceCount: 75, confidence: 0.99, physicalClaimed: 1, physicalVerified: 1, status: 'paga', risk: 'normal', owner: 'Juliana Prado', agent: 'Medição e Desembolso' },
];
DELIVERY_MEASUREMENTS.push(...REALISTIC_MEASUREMENTS);

export interface DisbursementRecord {
  id: string;
  measurementId: string;
  assetId: string;
  requested: number;
  recommended: number;
  paid: number;
  dueDate: string;
  funding: string;
  envelopeBalance: number;
  conditions: number;
  conditionsMet: number;
  status: 'pronto' | 'decisao' | 'retido' | 'processando' | 'pago';
  humanGate: string;
}

export const DISBURSEMENTS: DisbursementRecord[] = [
  { id: 'DES-2026-0781', measurementId: 'MED-VALE-006', assetId: DELIVERY_PORTFOLIO[0].assetId, requested: 18_350_000, recommended: 15_700_000, paid: 0, dueDate: '25/07/2026', funding: 'FGTS Saneamento', envelopeBalance: 96_400_000, conditions: 8, conditionsMet: 7, status: 'decisao', humanGate: 'Gerente Nacional de Governo' },
  { id: 'DES-2026-0774', measurementId: 'MED-RION-011', assetId: DELIVERY_PORTFOLIO[1].assetId, requested: 31_900_000, recommended: 24_600_000, paid: 0, dueDate: '29/07/2026', funding: 'BID + OGU', envelopeBalance: 212_000_000, conditions: 11, conditionsMet: 8, status: 'retido', humanGate: 'Comitê do Programa' },
  { id: 'DES-2026-0762', measurementId: 'MED-HORI-018', assetId: DELIVERY_PORTFOLIO[2].assetId, requested: 9_420_000, recommended: 9_420_000, paid: 0, dueDate: '23/07/2026', funding: 'FGTS Habitação', envelopeBalance: 31_800_000, conditions: 6, conditionsMet: 6, status: 'pronto', humanGate: 'Gerência Regional' },
  { id: 'DES-2026-0758', measurementId: 'MED-BRT-001', assetId: DELIVERY_PORTFOLIO[4].assetId, requested: 12_800_000, recommended: 10_900_000, paid: 0, dueDate: '02/08/2026', funding: 'BIRD + Município', envelopeBalance: 330_000_000, conditions: 9, conditionsMet: 7, status: 'processando', humanGate: 'Gerência de Mobilidade' },
  { id: 'DES-2024-0311', measurementId: 'MED-SERT-024', assetId: DELIVERY_PORTFOLIO[3].assetId, requested: 4_120_000, recommended: 4_120_000, paid: 4_120_000, dueDate: '20/06/2024', funding: 'OGU Segurança Hídrica', envelopeBalance: 0, conditions: 7, conditionsMet: 7, status: 'pago', humanGate: 'Concluído' },
];
DISBURSEMENTS.push(...REALISTIC_DISBURSEMENTS);

export interface DeliveryWorkflowCard {
  id: string;
  assetId: string;
  title: string;
  type: 'Medição' | 'Desembolso' | 'Ocorrência' | 'Reprogramação' | 'Vistoria';
  stage: 'Recebido' | 'Validação automática' | 'Análise técnica' | 'Vistoria' | 'Decisão humana' | 'Concluído';
  priority: 'P0' | 'P1' | 'P2';
  owner: string;
  due: string;
  progress: number;
  agent: string;
  blocker: string;
  automation: number;
}

export const DELIVERY_WORKFLOWS: DeliveryWorkflowCard[] = [
  { id: 'WF-0781', assetId: DELIVERY_PORTFOLIO[0].assetId, title: 'Medição nº 6 — Vale Verde', type: 'Medição', stage: 'Vistoria', priority: 'P0', owner: 'Ana Beatriz Souza', due: 'Hoje 18:00', progress: 72, agent: 'Agente de Vistoria', blocker: 'Laudo OV-2026-0871', automation: 78 },
  { id: 'WF-0782', assetId: DELIVERY_PORTFOLIO[0].assetId, title: 'Desembolso parcial — Vale Verde', type: 'Desembolso', stage: 'Decisão humana', priority: 'P0', owner: 'Gerência Nacional', due: '25/07', progress: 88, agent: 'Medição e Desembolso', blocker: 'Gate de decisão', automation: 84 },
  { id: 'WF-0755', assetId: DELIVERY_PORTFOLIO[1].assetId, title: 'Reprogramação climática — Rio Norte', type: 'Reprogramação', stage: 'Análise técnica', priority: 'P0', owner: 'Fernanda Ribeiro', due: '26/07', progress: 49, agent: 'Risco Territorial', blocker: 'Novo dimensionamento hidráulico', automation: 61 },
  { id: 'WF-0762', assetId: DELIVERY_PORTFOLIO[2].assetId, title: 'Medição nº 18 — Horizonte Azul', type: 'Medição', stage: 'Concluído', priority: 'P2', owner: 'Carlos Eduardo Lima', due: 'Concluído', progress: 100, agent: 'Medição e Desembolso', blocker: '—', automation: 93 },
  { id: 'WF-0749', assetId: DELIVERY_PORTFOLIO[4].assetId, title: 'Mobilização BRT Serra Azul', type: 'Ocorrência', stage: 'Validação automática', priority: 'P1', owner: 'Rodrigo Nakamura', due: '29/07', progress: 32, agent: 'Engenharia e Custos', blocker: 'Comprovação de equipamentos', automation: 69 },
  { id: 'WF-0733', assetId: DELIVERY_PORTFOLIO[1].assetId, title: 'Vistoria de reservatório R-03', type: 'Vistoria', stage: 'Recebido', priority: 'P1', owner: 'Equipe Norte', due: '30/07', progress: 8, agent: 'Agente de Vistoria', blocker: 'Designação de equipe', automation: 55 },
];

export const WORKFLOW_STAGES: DeliveryWorkflowCard['stage'][] = ['Recebido', 'Validação automática', 'Análise técnica', 'Vistoria', 'Decisão humana', 'Concluído'];

export interface DeliveryAgentRuntime {
  id: string;
  name: string;
  icon: string;
  entity: string;
  status: 'idle' | 'running' | 'done' | 'alert' | 'waiting';
  progress: number;
  step: string;
  confidence: number;
  impact: string;
  recommendation: string;
  sources: string[];
  human: string;
}

export const DELIVERY_AGENTS: DeliveryAgentRuntime[] = [
  { id: 'orq', name: 'Orquestrador de Entrega', icon: 'Workflow', entity: 'Carteira de execução', status: 'idle', progress: 0, step: 'Pronto para processar novos eventos.', confidence: 96, impact: '5 workflows coordenados', recommendation: 'Priorizar Vale Verde e Rio Norte.', sources: ['Contratos', 'Medições', 'Eventos', 'SLAs'], human: 'Centro de Comando' },
  { id: 'schedule', name: 'Agente de Cronograma', icon: 'CalendarClock', entity: 'Vale Verde', status: 'done', progress: 100, step: 'Caminho crítico recalculado.', confidence: 92, impact: '+6 semanas previstas', recommendation: 'Reordenar EE-03 e rede do Lote 2.', sources: ['Baseline', 'Diário de obra', 'Produtividade'], human: 'Engenharia' },
  { id: 'measure', name: 'Agente de Medição e Desembolso', icon: 'Ruler', entity: 'Medição nº 6', status: 'waiting', progress: 88, step: 'Valor liberável calculado; aguardando decisão.', confidence: 93, impact: 'R$ 15,7 mi liberáveis', recommendation: 'Aprovar parcialmente e reter R$ 2,65 mi.', sources: ['Medição', 'Contrato', 'Evidências', 'Funding'], human: 'Gerência Nacional' },
  { id: 'fraud', name: 'Agente de Inconsistências e Fraude', icon: 'ShieldAlert', entity: 'Vale Verde', status: 'alert', progress: 100, step: 'Divergência geográfica confirmada.', confidence: 94, impact: '3 trechos / R$ 2,65 mi', recommendation: 'Vistoria direcionada em T-14 e T-22.', sources: ['Fotos', 'GPS', 'Geometria aprovada'], human: 'Auditoria técnica' },
  { id: 'inspection', name: 'Agente de Vistoria', icon: 'ClipboardCheck', entity: 'OV-2026-0871', status: 'running', progress: 62, step: 'Equipe em campo no trecho T-17.', confidence: 91, impact: '38 km de rota otimizada', recommendation: 'Concluir coleta em T-22.', sources: ['Roteiro', 'Field data', 'Checklists'], human: 'Equipe GEREG Sudeste' },
  { id: 'forecast', name: 'Agente de Previsão de Desembolso', icon: 'Banknote', entity: 'Carteira 90 dias', status: 'running', progress: 48, step: 'Simulando restrições e reprogramações.', confidence: 89, impact: 'R$ 276 mi previstos', recommendation: 'Reservar buffer de R$ 41 mi.', sources: ['Funding', 'Cronogramas', 'Medições'], human: 'Finanças' },
  { id: 'dispatch', name: 'Agente de Despachos e Diligências', icon: 'FileText', entity: 'Fila de exceções', status: 'idle', progress: 0, step: 'Aguardando gatilho.', confidence: 95, impact: '12 modelos oficiais', recommendation: '—', sources: ['Modelos oficiais', 'Regras de alçada'], human: 'Analista responsável' },
];

export const DELIVERY_LIVE_STEPS = [
  { agent: 'orq', text: 'Orquestrador recebeu nova medição e priorizou 4 análises.', type: 'agent' as const },
  { agent: 'schedule', text: 'Cronograma de Vale Verde recalculado: conclusão estimada em mar/2027.', type: 'warning' as const },
  { agent: 'fraud', text: 'Cruzamento espacial confirmou desvio em T-14 e T-22.', type: 'critical' as const },
  { agent: 'inspection', text: 'Equipe de vistoria iniciou coleta georreferenciada no trecho T-17.', type: 'agent' as const },
  { agent: 'measure', text: 'Valor liberável recalculado para R$ 15,7 milhões.', type: 'success' as const },
  { agent: 'forecast', text: 'Previsão de desembolso de 90 dias atualizada para R$ 276 milhões.', type: 'info' as const },
  { agent: 'dispatch', text: 'Despacho de desembolso parcial preparado para revisão humana.', type: 'agent' as const },
];

export const DELIVERY_ANALYTICS_TREND = [
  { mes: 'Fev', previsto: 182, realizado: 168 },
  { mes: 'Mar', previsto: 205, realizado: 197 },
  { mes: 'Abr', previsto: 219, realizado: 203 },
  { mes: 'Mai', previsto: 241, realizado: 226 },
  { mes: 'Jun', previsto: 268, realizado: 239 },
  { mes: 'Jul', previsto: 286, realizado: 251 },
  { mes: 'Ago', previsto: 304, realizado: 276 },
];

export const PHYSICAL_FINANCIAL_GAP = [
  { projeto: 'Vale Verde', fisico: 64, financeiro: 59 },
  { projeto: 'Rio Norte', fisico: 42, financeiro: 38 },
  { projeto: 'Horizonte', fisico: 87, financeiro: 83 },
  { projeto: 'BRT Serra', fisico: 5, financeiro: 6 },
  { projeto: 'Sertão Vivo', fisico: 100, financeiro: 100 },
];

export const DELIVERY_BOTTLENECKS = [
  { name: 'Projeto / reprogramação', value: 7, fill: '#D14A55' },
  { name: 'Licenças e condicionantes', value: 5, fill: '#E5A11A' },
  { name: 'Evidências insuficientes', value: 4, fill: '#1584D1' },
  { name: 'Decisão humana', value: 3, fill: '#7C5CBF' },
  { name: 'Funding / saldo', value: 1, fill: '#0FA39D' },
];

export interface DeliveryReport {
  id: string;
  title: string;
  description: string;
  frequency: string;
  format: string;
  lastGenerated: string;
  audience: string;
}

export const DELIVERY_REPORTS: DeliveryReport[] = [
  { id: 'rep-exec', title: 'Carteira Executiva de Execução', description: 'Avanço físico-financeiro, criticidade, previsão e decisões.', frequency: 'Semanal', format: 'PDF + XLSX', lastGenerated: '20/07/2026 08:00', audience: 'Presidência e VPs' },
  { id: 'rep-med', title: 'Medições, Evidências e Liberações', description: 'Medições recebidas, valor validado, retenções e confiança.', frequency: 'Diário', format: 'PDF + CSV', lastGenerated: '20/07/2026 19:45', audience: 'VP Governo / Engenharia' },
  { id: 'rep-disb', title: 'Previsão de Desembolso 90 dias', description: 'Fluxo previsto, cenários, funding e buffers necessários.', frequency: 'Semanal', format: 'XLSX', lastGenerated: '19/07/2026 18:00', audience: 'Finanças e Agente Operador' },
  { id: 'rep-risk', title: 'Obras e Ativos Críticos', description: 'Gargalos, risco de paralisação, exposição e ações de mitigação.', frequency: 'Quinzenal', format: 'PDF', lastGenerated: '15/07/2026 09:30', audience: 'Comitê Executivo' },
  { id: 'rep-work', title: 'SLA e Performance dos Workflows', description: 'Tempo de ciclo, automação, exceções e produtividade.', frequency: 'Mensal', format: 'Dashboard + CSV', lastGenerated: '01/07/2026 07:00', audience: 'Operações e Tecnologia' },
];

export interface DeliveryIntegration {
  id: string;
  name: string;
  direction: string;
  objects: string;
  method: string;
  frequency: string;
  latency: string;
  status: 'online' | 'degraded' | 'offline';
  lastSync: string;
  owner: string;
  agents: string[];
}

export const DELIVERY_INTEGRATIONS: DeliveryIntegration[] = [
  { id: 'contrata', name: 'Nexo Contrata', direction: 'Entrada', objects: 'Baseline, condições precedentes, plano de evidências', method: 'API interna', frequency: 'Evento', latency: '0,8 s', status: 'online', lastSync: 'Agora', owner: 'Arquitetura Nexo', agents: ['Orquestrador', 'Medição'] },
  { id: 'transferegov', name: 'Transferegov', direction: 'Bidirecional', objects: 'Instrumentos, execução, liberações e prestação', method: 'API / carga', frequency: '15 min', latency: '4,2 s', status: 'online', lastSync: 'há 2 min', owner: 'VP Governo', agents: ['Medição', 'Despachos'] },
  { id: 'obrasgov', name: 'Obrasgov / CIPI', direction: 'Bidirecional', objects: 'Projetos, geometrias, situação e execução física', method: 'REST / GeoJSON', frequency: '30 min', latency: '6,8 s', status: 'degraded', lastSync: 'há 18 min', owner: 'Nexo Data', agents: ['Cronograma', 'Fraude'] },
  { id: 'sinapi', name: 'SINAPI', direction: 'Entrada', objects: 'Insumos, composições e índices', method: 'Arquivos / serviço', frequency: 'Mensal', latency: '—', status: 'online', lastSync: '01/07/2026', owner: 'Engenharia de Custos', agents: ['Medição'] },
  { id: 'financeiro', name: 'Sistema Financeiro CAIXA', direction: 'Bidirecional', objects: 'Saldo, programação, ordem e liquidação', method: 'API interna / mensageria', frequency: 'Tempo real', latency: '0,4 s', status: 'online', lastSync: 'Agora', owner: 'VP Finanças', agents: ['Previsão', 'Medição'] },
  { id: 'evidencia', name: 'Nexo Evidência', direction: 'Bidirecional', objects: 'Fotos, vistorias, laudos e confiança', method: 'API interna / eventos', frequency: 'Tempo real', latency: '0,6 s', status: 'online', lastSync: 'Agora', owner: 'Nexo Evidência', agents: ['Fraude', 'Vistoria'] },
  { id: 'field', name: 'Coleta de Campo / ArcGIS', direction: 'Entrada', objects: 'GPS, fotos, checklists, trilhas e geometrias', method: 'Feature service / stream', frequency: 'Tempo real', latency: '1,7 s', status: 'online', lastSync: 'há 12 s', owner: 'Equipe de Campo', agents: ['Vistoria', 'Fraude'] },
];
