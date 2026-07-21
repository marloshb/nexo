import type { ProductKey } from '@/data/navConfig';
import type { StatusKey } from '@/lib/tokens';

export type ControlSection =
  | 'overview'
  | 'situation'
  | 'map'
  | 'agenda'
  | 'simulator'
  | 'analytics'
  | 'agents'
  | 'reports'
  | 'integrations'
  | 'admin';

export interface CriticalAgendaItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  title: string;
  assetId: string;
  asset: string;
  owner: string;
  due: string;
  slaHours: number;
  elapsedHours: number;
  status: StatusKey;
  source: ProductKey;
  target: ProductKey;
  agent: string;
  recommendation: string;
  financialExposure: number;
}

export const CRITICAL_AGENDA: CriticalAgendaItem[] = [
  {
    id: 'AG-2026-0198', priority: 'P0', title: 'Decidir desembolso parcial da Medição nº 6',
    assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', asset: 'Sistema Integrado de Esgotamento Vale Verde',
    owner: 'Ana Beatriz Souza', due: 'Hoje, 11:30', slaHours: 6, elapsedHours: 4.7, status: 'decisao',
    source: 'entrega', target: 'evidencia', agent: 'Agente de Medição e Desembolso',
    recommendation: 'Liberar R$ 15,7 mi e manter R$ 2,65 mi retidos até correção dos trechos T-14 e T-22.',
    financialExposure: 18_350_000,
  },
  {
    id: 'AG-2026-0199', priority: 'P0', title: 'Reprogramar proteção hidráulica após alerta climático',
    assetId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', asset: 'Programa de Macrodrenagem Rio Norte',
    owner: 'Fernanda Ribeiro', due: 'Hoje, 14:00', slaHours: 12, elapsedHours: 8.2, status: 'critico',
    source: 'estrutura', target: 'entrega', agent: 'Agente de Risco Territorial e Climático',
    recommendation: 'Reforçar dois componentes e antecipar R$ 31,4 mi do lote 3 para reduzir risco de transbordamento.',
    financialExposure: 74_000_000,
  },
  {
    id: 'AG-2026-0200', priority: 'P1', title: 'Superar pendência de acesso viário para comissionamento',
    assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', asset: 'Residencial Horizonte Azul',
    owner: 'Carlos Eduardo Lima', due: 'Amanhã, 10:00', slaHours: 48, elapsedHours: 31, status: 'atencao',
    source: 'ativos', target: 'contrata', agent: 'Agente de Comissionamento',
    recommendation: 'Emitir prontidão parcial e abrir condicionante vinculante para acesso e transporte.',
    financialExposure: 23_500_000,
  },
  {
    id: 'AG-2026-0201', priority: 'P1', title: 'Restabelecer sincronização com Compras.gov',
    assetId: 'NEXO-ASSET-BR-MG-3106200-MOB-000341', asset: 'Corredor BRT Serra Azul',
    owner: 'Nexo Data · Integrações', due: 'Hoje, 12:00', slaHours: 4, elapsedHours: 2.4, status: 'bloqueado',
    source: 'data', target: 'contrata', agent: 'Agente Orquestrador do Ciclo de Vida',
    recommendation: 'Executar carga incremental pelo cache e reprocessar a validação de fornecedores.',
    financialExposure: 9_800_000,
  },
  {
    id: 'AG-2026-0202', priority: 'P2', title: 'Validar meta de beneficiários da Adutora Sertão Vivo',
    assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', asset: 'Adutora Sertão Vivo',
    owner: 'Juliana Prado', due: '25/07, 17:00', slaHours: 96, elapsedHours: 21, status: 'analise',
    source: 'impacto', target: 'capital', agent: 'Agente de Impacto e MRV',
    recommendation: 'Aceitar 296 mil beneficiários comprovados e registrar plano para alcançar 310 mil.',
    financialExposure: 0,
  },
];

export const CONTROL_WORKFLOWS = [
  { stage: 'Novos', count: 7, color: '#9AACB8', items: ['Medição nº 6 — Vale Verde', 'Alerta CEMADEN — Rio Norte'] },
  { stage: 'Triagem automática', count: 4, color: '#18B7D6', items: ['Covenant Green Bond', 'Fornecedor BRT Serra Azul'] },
  { stage: 'Análise especializada', count: 9, color: '#1584D1', items: ['Divergência geométrica', 'Reprogramação hidráulica'] },
  { stage: 'Decisão humana', count: 3, color: '#7C5CBF', items: ['Desembolso parcial', 'Prontidão operacional'] },
  { stage: 'Execução da decisão', count: 5, color: '#E5A11A', items: ['Vistoria T-14/T-22', 'Diligência de acesso'] },
  { stage: 'Concluídos hoje', count: 18, color: '#0FA39D', items: ['MRV Adutora Sertão Vivo', 'Alocação envelope FGTS'] },
];

export const CONTROL_FORECAST = [
  { mes: 'Jul', contratado: 420, desembolso: 310, previsao: 310 },
  { mes: 'Ago', contratado: 480, desembolso: 0, previsao: 355 },
  { mes: 'Set', contratado: 510, desembolso: 0, previsao: 402 },
  { mes: 'Out', contratado: 560, desembolso: 0, previsao: 438 },
  { mes: 'Nov', contratado: 610, desembolso: 0, previsao: 471 },
  { mes: 'Dez', contratado: 690, desembolso: 0, previsao: 526 },
];

export const CONTROL_CAUSAL_INSIGHTS = [
  { id: 'INS-01', title: 'Regularização fundiária explica 31% do atraso pré-contratação', confidence: 0.91, value: 'R$ 184 mi', target: 'contrata' as ProductKey, tone: 'amber' },
  { id: 'INS-02', title: 'Divergências geográficas concentram 44% das vistorias extraordinárias', confidence: 0.88, value: '27 ativos', target: 'evidencia' as ProductKey, tone: 'red' },
  { id: 'INS-03', title: 'Ativos com telemetria reduzem indisponibilidade não planejada em 18%', confidence: 0.86, value: 'R$ 38 mi evitados', target: 'ativos' as ProductKey, tone: 'teal' },
  { id: 'INS-04', title: 'Carteiras com assistência técnica contratam 2,3× mais rápido', confidence: 0.84, value: '−74 dias', target: 'carteira' as ProductKey, tone: 'blue' },
];

export interface ControlAgentRuntime {
  id: string;
  name: string;
  icon: string;
  entity: string;
  module: ProductKey;
  status: 'idle' | 'running' | 'waiting' | 'done' | 'alert';
  progress: number;
  step: string;
  confidence?: number;
  lastRun: string;
  impact: string;
}

export const CONTROL_AGENT_RUNTIME: ControlAgentRuntime[] = [
  { id: 'orq', name: 'Orquestrador do Ciclo de Vida', icon: 'Workflow', entity: 'Carteira corporativa', module: 'agents', status: 'running', progress: 68, step: 'Distribuindo 9 ocorrências para agentes especializados', lastRun: 'agora', impact: '9 workflows coordenados' },
  { id: 'desembolso', name: 'Agente de Medição e Desembolso', icon: 'Banknote', entity: 'Vale Verde · Medição 06', module: 'entrega', status: 'waiting', progress: 92, step: 'Parecer concluído; aguardando decisão humana', confidence: 0.93, lastRun: 'há 18 s', impact: 'R$ 15,7 mi recomendados' },
  { id: 'clima', name: 'Agente de Risco Territorial e Climático', icon: 'Wind', entity: 'Rio Norte · 14 ativos', module: 'estrutura', status: 'alert', progress: 100, step: '2 ativos com risco elevado após evento simulado', confidence: 0.89, lastRun: 'há 1 min', impact: 'R$ 74 mi expostos' },
  { id: 'fraude', name: 'Agente de Inconsistências e Fraude', icon: 'ShieldAlert', entity: 'Medições e evidências', module: 'evidencia', status: 'running', progress: 43, step: 'Comparando 1.284 evidências e 96 geometrias', lastRun: 'há 4 s', impact: '3 anomalias em validação' },
  { id: 'saude', name: 'Agente de Saúde do Ativo', icon: 'HeartPulse', entity: '486 ativos em operação', module: 'ativos', status: 'running', progress: 76, step: 'Atualizando previsão de falha dos componentes críticos', lastRun: 'stream contínuo', impact: 'R$ 38 mi em perdas evitáveis' },
  { id: 'impacto', name: 'Agente de Impacto e MRV', icon: 'Target', entity: 'Adutora Sertão Vivo', module: 'impacto', status: 'done', progress: 100, step: '296 mil beneficiários validados', confidence: 0.95, lastRun: 'há 12 min', impact: '95,5% da meta comprovada' },
];

export const CONTROL_LIVE_STEPS = [
  { delay: 700, agentId: 'orq', progress: 76, status: 'running' as const, step: 'Priorizando ocorrências por exposição financeira e SLA', event: 'Orquestrador priorizou 3 ocorrências P0 para tratamento imediato', type: 'agent' as const },
  { delay: 900, agentId: 'fraude', progress: 58, status: 'running' as const, step: 'Hash e geolocalização validados em 1.042 evidências', event: 'Agente de Fraude validou metadados e descartou 2 duplicidades', type: 'success' as const },
  { delay: 1050, agentId: 'saude', progress: 84, status: 'running' as const, step: 'Tendência de vibração anômala identificada em WTG-14', event: 'Agente de Saúde detectou tendência de falha em componente WTG-14', type: 'warning' as const },
  { delay: 850, agentId: 'fraude', progress: 77, status: 'alert' as const, step: 'Divergência espacial confirmada nos trechos T-14 e T-22', event: 'Divergência espacial confirmada; vistoria direcionada mantida', type: 'warning' as const },
  { delay: 1000, agentId: 'orq', progress: 92, status: 'running' as const, step: 'Abrindo workflow para decisão de desembolso parcial', event: 'Workflow DEC-2026-0084 aberto para alçada da VP Governo', type: 'info' as const },
  { delay: 900, agentId: 'desembolso', progress: 100, status: 'waiting' as const, step: 'Parecer atualizado: liberar R$ 15,7 mi e reter R$ 2,65 mi', event: 'Parecer de desembolso atualizado e encaminhado para decisão humana', type: 'agent' as const },
  { delay: 850, agentId: 'saude', progress: 100, status: 'done' as const, step: 'Ordem preditiva OS-4474 preparada para validação', event: 'Agente de Saúde concluiu ciclo sem indisponibilidade crítica', type: 'success' as const },
  { delay: 950, agentId: 'orq', progress: 100, status: 'done' as const, step: 'Ciclo concluído: 3 workflows criados, 2 alertas e 1 decisão pendente', event: 'Ciclo de orquestração concluído com 93% de automação assistida', type: 'success' as const },
];

export const CONTROL_REPORTS = [
  { id: 'REP-01', name: 'Carteira Executiva', description: 'Capital, contratos, execução, ativos e resultados por VP e programa.', icon: 'Briefcase', frequency: 'Diário', last: 'Hoje, 07:00', module: 'control' as ProductKey },
  { id: 'REP-02', name: 'Previsão de Desembolso', description: 'Forecast de 12 meses, frustração provável e exposição por funding.', icon: 'TrendingUp', frequency: 'Semanal', last: '18/07, 18:00', module: 'capital' as ProductKey },
  { id: 'REP-03', name: 'Ativos e Obras Críticas', description: 'Riscos, gargalos, SLA, responsáveis e próximas ações.', icon: 'AlertOctagon', frequency: 'Tempo real', last: 'agora', module: 'entrega' as ProductKey },
  { id: 'REP-04', name: 'Evidências e Vistorias', description: 'Confiança, inconsistências, cobertura territorial e produtividade.', icon: 'ClipboardCheck', frequency: 'Diário', last: 'Hoje, 06:30', module: 'evidencia' as ProductKey },
  { id: 'REP-05', name: 'Saúde dos Ativos', description: 'Disponibilidade, manutenção, falhas e reinvestimento recomendado.', icon: 'HeartPulse', frequency: 'Contínuo', last: 'há 2 min', module: 'ativos' as ProductKey },
  { id: 'REP-06', name: 'Impacto e Beneficiários', description: 'Metas, resultados comprovados, taxonomias e prestação de contas.', icon: 'Target', frequency: 'Mensal', last: '01/07, 09:00', module: 'impacto' as ProductKey },
];

export const CONTROL_ADMIN_RULES = [
  { id: 'RULE-01', name: 'Gate humano para desembolso', description: 'Nenhum desembolso é executado sem decisão humana registrada.', enabled: true, critical: true },
  { id: 'RULE-02', name: 'Vistoria por divergência espacial', description: 'Aciona vistoria quando desvio > 25 m e exposição > R$ 1 mi.', enabled: true, critical: true },
  { id: 'RULE-03', name: 'Escalonamento de SLA P0', description: 'Escala à diretoria quando 80% do SLA é consumido.', enabled: true, critical: false },
  { id: 'RULE-04', name: 'Aprovação automática de baixo risco', description: 'Permite triagem automática para itens com confiança ≥ 97%.', enabled: false, critical: false },
  { id: 'RULE-05', name: 'Alerta de fonte desatualizada', description: 'Suspende análise quando fonte crítica excede janela de atualização.', enabled: true, critical: true },
];

export const CONTROL_ROLE_MATRIX = [
  { role: 'Presidência / Conselho Diretor', view: true, simulate: true, decide: true, administer: false },
  { role: 'VP Governo / Agente Operador', view: true, simulate: true, decide: true, administer: false },
  { role: 'Gestor de carteira', view: true, simulate: true, decide: false, administer: false },
  { role: 'Analista técnico / risco', view: true, simulate: false, decide: false, administer: false },
  { role: 'Administrador da plataforma', view: true, simulate: true, decide: false, administer: true },
];
