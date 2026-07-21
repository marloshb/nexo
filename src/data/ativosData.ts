import { ASSETS } from '@/data/mockData';
import { CLIMATE_RISK, FAILURE_PREDICTIONS, HEALTH_DIMENSIONS, REINVESTMENT_PLAN, SENSORS, WORK_ORDERS } from '@/data/ativosV3Data';

export type AtivosSection = 'overview' | 'portfolio' | 'map' | 'health' | 'maintenance' | 'analytics' | 'agents' | 'reports' | 'integrations';
export type AssetLifecycleStatus = 'commissioning' | 'operational' | 'degraded' | 'maintenance' | 'restricted';
export type AssetAgentStatus = 'idle' | 'running' | 'waiting' | 'done' | 'alert';

export interface AssetOperationalRecord {
  assetId: string;
  availability: number;
  utilization: number;
  serviceQuality: number;
  operatingCostIndex: number;
  resilience: number;
  incidents30d: number;
  openOrders: number;
  plannedMaintenanceCompliance: number;
  remainingLife: number;
  status: AssetLifecycleStatus;
  operator: string;
  telemetry: string;
}

export const ASSET_OPERATION: AssetOperationalRecord[] = [
  { assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', availability: 0.982, utilization: 0.84, serviceQuality: 0.94, operatingCostIndex: 0.88, resilience: 0.79, incidents30d: 1, openOrders: 1, plannedMaintenanceCompliance: 0.93, remainingLife: 0.86, status: 'operational', operator: 'CAGECE / Unidade Sertão Central', telemetry: 'SCADA + 14 sensores IoT' },
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', availability: 0.953, utilization: 0.88, serviceQuality: 0.92, operatingCostIndex: 0.85, resilience: 0.91, incidents30d: 3, openOrders: 3, plannedMaintenanceCompliance: 0.74, remainingLife: 0.78, status: 'maintenance', operator: 'Costa Branca Operações S.A.', telemetry: 'SCADA + 312 sensores' },
  { assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', availability: 0.991, utilization: 0.48, serviceQuality: 0.95, operatingCostIndex: 0.93, resilience: 0.90, incidents30d: 0, openOrders: 0, plannedMaintenanceCompliance: 0.96, remainingLife: 0.97, status: 'commissioning', operator: 'Secretaria Estadual de Educação', telemetry: 'BMS + medição de energia' },
  { assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', availability: 0.00, utilization: 0.00, serviceQuality: 0.00, operatingCostIndex: 0.00, resilience: 0.72, incidents30d: 0, openOrders: 2, plannedMaintenanceCompliance: 0.00, remainingLife: 1.00, status: 'restricted', operator: 'Município de Recife / Concessionárias', telemetry: 'Aguardando ativação' },
];

export interface CommissioningItem {
  id: string;
  assetId: string;
  component: string;
  test: string;
  result: 'approved' | 'pending' | 'failed';
  responsible: string;
  date: string;
  evidence: string;
  blocker?: string;
}

export const COMMISSIONING_ITEMS: CommissioningItem[] = [
  { id: 'COM-001', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', component: 'Rede elétrica interna', test: 'Ensaio de isolamento e carga', result: 'approved', responsible: 'Carlos Eduardo Lima', date: '2026-07-02', evidence: 'EV-COM-001' },
  { id: 'COM-002', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', component: 'Sistema hidráulico', test: 'Pressurização e estanqueidade', result: 'approved', responsible: 'Carlos Eduardo Lima', date: '2026-07-03', evidence: 'EV-COM-002' },
  { id: 'COM-003', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', component: 'Documentação as built', test: 'Conferência de versão e assinatura', result: 'approved', responsible: 'Agente de Comissionamento', date: '2026-07-05', evidence: 'DOC-ASB-118' },
  { id: 'COM-004', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', component: 'Licenças', test: 'Habite-se e licenças de operação', result: 'approved', responsible: 'Carlos Eduardo Lima', date: '2026-07-08', evidence: 'LIC-REC-0421' },
  { id: 'COM-005', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', component: 'Acesso viário', test: 'Vistoria funcional e segurança de acesso', result: 'failed', responsible: 'Engenharia Regional Nordeste', date: '2026-07-14', evidence: 'OV-2026-0912', blocker: 'Pavimentação de acesso incompleta em 680 m.' },
  { id: 'COM-006', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', component: 'Transporte público', test: 'Homologação da linha e ponto acessível', result: 'pending', responsible: 'Município de Recife', date: '2026-07-15', evidence: 'PEND-MOB-021', blocker: 'Linha municipal ainda não homologada.' },
  { id: 'COM-007', assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', component: 'Sistemas prediais', test: 'Teste integrado de operação', result: 'approved', responsible: 'Bruno Castro', date: '2026-07-10', evidence: 'EV-COM-029' },
  { id: 'COM-008', assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', component: 'Operador e custeio', test: 'Equipe, orçamento e plano de manutenção', result: 'approved', responsible: 'SEDUC-GO', date: '2026-07-12', evidence: 'DOC-OPS-933' },
];

export const COMMISSIONING_FLOW = [
  'Conclusão física', 'Validar as built', 'Verificar testes', 'Verificar licenças', 'Verificar operador', 'Verificar custeio', 'Verificar manutenção', 'Registrar pendências', 'Emitir prontidão operacional', 'Iniciar monitoramento',
];

export const OPERATION_SERIES = [
  { month: 'Fev', planned: 962, actual: 958 }, { month: 'Mar', planned: 965, actual: 961 }, { month: 'Abr', planned: 967, actual: 956 },
  { month: 'Mai', planned: 970, actual: 963 }, { month: 'Jun', planned: 973, actual: 968 }, { month: 'Jul', planned: 975, actual: 971 },
];

export const MAINTENANCE_SERIES = [
  { month: 'Fev', planned: 18, actual: 17 }, { month: 'Mar', planned: 21, actual: 19 }, { month: 'Abr', planned: 22, actual: 20 },
  { month: 'Mai', planned: 24, actual: 21 }, { month: 'Jun', planned: 25, actual: 22 }, { month: 'Jul', planned: 28, actual: 23 },
];

export const HEALTH_DISTRIBUTION = [
  { name: 'Saudável', value: 2, fill: '#0FA39D' },
  { name: 'Atenção', value: 1, fill: '#E5A11A' },
  { name: 'Comissionamento', value: 2, fill: '#1584D1' },
  { name: 'Crítico / restrito', value: 1, fill: '#D14A55' },
];

export const ASSET_SECTOR_VALUE = ASSETS.map((a) => ({ name: a.sector, value: Math.round(a.value / 1_000_000) }));

export const HEALTH_TREND = [
  { month: 'Fev', planned: 91, actual: 88 }, { month: 'Mar', planned: 91, actual: 89 }, { month: 'Abr', planned: 92, actual: 89 },
  { month: 'Mai', planned: 92, actual: 90 }, { month: 'Jun', planned: 93, actual: 91 }, { month: 'Jul', planned: 93, actual: 91 },
];

export interface AssetAgentRuntime {
  id: string;
  name: string;
  function: string;
  status: AssetAgentStatus;
  progress: number;
  stage: string;
  entity: string;
  confidence: number;
  sources: string[];
  recommendation: string;
  impact: string;
  humanOwner: string;
}

export const ASSET_AGENTS: AssetAgentRuntime[] = [
  { id: 'orchestrator', name: 'Orquestrador do Ciclo Operacional', function: 'Coordena comissionamento, saúde, manutenção, resiliência e reinvestimento.', status: 'idle', progress: 0, stage: 'Aguardando evento', entity: 'Portfólio Nexo Ativos', confidence: 0.98, sources: ['Ativo 360', 'Nexo Entrega', 'Nexo Evidência', 'Telemetria'], recommendation: 'Iniciar ciclo sobre ativos com alertas e pendências operacionais.', impact: 'R$ 84,2 mi protegidos', humanOwner: 'Gerência Nacional de Ativos' },
  { id: 'commissioning', name: 'Agente de Comissionamento', function: 'Valida testes, licenças, operador, custeio, as built e plano de manutenção.', status: 'waiting', progress: 74, stage: 'Aguardando acesso viário', entity: 'Residencial Horizonte Azul', confidence: 0.96, sources: ['Nexo Evidência', 'As built', 'Licenças', 'Checklist'], recommendation: 'Não emitir prontidão plena até conclusão do acesso e homologação do transporte.', impact: '4.960 beneficiários', humanOwner: 'Carlos Eduardo Lima' },
  { id: 'health', name: 'Agente de Saúde do Ativo', function: 'Calcula índice de saúde e identifica degradação por componente.', status: 'alert', progress: 83, stage: 'Analisando vibração WTG-14', entity: 'Complexo Eólico Costa Branca', confidence: 0.94, sources: ['SCADA', 'Sensores IoT', 'Ordens de serviço', 'BIM'], recommendation: 'Substituir caixa multiplicadora em janela de 45 dias.', impact: 'R$ 12,8 mi de indisponibilidade evitada', humanOwner: 'Tiago Almeida' },
  { id: 'maintenance', name: 'Agente de Manutenção Preditiva', function: 'Prioriza ordens e estima probabilidade de falha e custo evitado.', status: 'running', progress: 46, stage: 'Recalculando janela ótima', entity: '3 componentes críticos', confidence: 0.91, sources: ['Histórico de falhas', 'Sensores', 'Ordens de serviço', 'Custos'], recommendation: 'Agrupar WTG-14 e WTG-22 na mesma parada programada.', impact: 'Economia estimada R$ 1,9 mi', humanOwner: 'Tiago Almeida' },
  { id: 'resilience', name: 'Agente de Resiliência Climática', function: 'Cruza ativos e componentes com ameaças e cenários climáticos.', status: 'done', progress: 100, stage: 'Cenário 2040 concluído', entity: 'Adutora Sertão Vivo', confidence: 0.89, sources: ['Living Atlas', 'CEMADEN', 'ANA', 'Modelos climáticos'], recommendation: 'Antecipar reservatório estratégico e reforço do trecho km 38–46.', impact: '296 mil usuários protegidos', humanOwner: 'Juliana Prado' },
  { id: 'reinvestment', name: 'Agente de Reinvestimento', function: 'Estima vida útil, backlog, custo total e melhor janela de renovação.', status: 'idle', progress: 0, stage: 'Aguardando atualização financeira', entity: 'Portfólio operacional', confidence: 0.88, sources: ['Nexo Capital', 'Saúde do ativo', 'Opex', 'Curva de vida útil'], recommendation: 'Reservar R$ 94,2 mi entre 2031 e 2036.', impact: 'Backlog futuro antecipado', humanOwner: 'VP Governo / VP Capital' },
];

export const ASSET_LIVE_STEPS = [
  { agentId: 'orchestrator', text: 'Evento operacional recebido: vibração da WTG-14 ultrapassou o limiar dinâmico.' },
  { agentId: 'health', text: 'Agente de Saúde consultou 90 dias de telemetria e histórico de falhas.' },
  { agentId: 'maintenance', text: 'Modelo preditivo recalculou probabilidade de falha em 90 dias para 46%.' },
  { agentId: 'maintenance', text: 'Janela de parada conjunta WTG-14/WTG-22 identificada para 4 de setembro.' },
  { agentId: 'resilience', text: 'Risco climático e previsão de ventos verificados para a janela de intervenção.' },
  { agentId: 'orchestrator', text: 'Ordem OS-4471 priorizada e materiais reservados no fluxo simulado.' },
  { agentId: 'health', text: 'Índice de saúde projetado após intervenção: 87 → 92.' },
  { agentId: 'reinvestment', text: 'Plano de reinvestimento atualizado com custo evitado de R$ 12,8 milhões.' },
  { agentId: 'orchestrator', text: 'Gate humano preparado para aprovação da parada programada.' },
];

export interface AssetReport {
  id: string;
  title: string;
  description: string;
  format: string;
  frequency: string;
  scope: string;
}

export const ASSET_REPORTS: AssetReport[] = [
  { id: 'REP-AT-01', title: 'Portfólio Executivo de Ativos', description: 'Valor, etapa, operador, saúde, criticidade e próximos marcos.', format: 'PDF + XLSX', frequency: 'Mensal', scope: 'Corporativo' },
  { id: 'REP-AT-02', title: 'Comissionamento e Prontidão Operacional', description: 'Testes, licenças, pendências e certificados emitidos.', format: 'PDF', frequency: 'Sob demanda', scope: 'Ativos em transição' },
  { id: 'REP-AT-03', title: 'Saúde, Falhas e Disponibilidade', description: 'Índices, tendências, alertas e previsão de falhas.', format: 'PDF + CSV', frequency: 'Semanal', scope: 'Operação' },
  { id: 'REP-AT-04', title: 'Manutenção e Backlog', description: 'Ordens, custos, SLA, conformidade preventiva e backlog.', format: 'XLSX', frequency: 'Quinzenal', scope: 'Manutenção' },
  { id: 'REP-AT-05', title: 'Resiliência e Continuidade', description: 'Ameaças, componentes expostos, mitigação e risco residual.', format: 'PDF + mapa', frequency: 'Trimestral', scope: 'Risco climático' },
  { id: 'REP-AT-06', title: 'Plano de Reinvestimento', description: 'Vida útil, Capex futuro, prioridades e fontes potenciais.', format: 'PDF + XLSX', frequency: 'Anual', scope: 'Capital' },
];

export interface AssetIntegration {
  id: string;
  name: string;
  direction: 'entrada' | 'saida' | 'bidirecional';
  objects: string;
  method: string;
  cadence: string;
  status: 'operational' | 'attention' | 'error';
  latency: string;
  lastSync: string;
  agents: string[];
}

export const ASSET_INTEGRATIONS: AssetIntegration[] = [
  { id: 'INT-AT-01', name: 'Nexo Entrega', direction: 'entrada', objects: 'Conclusão física, baseline, medições e pendências', method: 'API interna', cadence: 'Evento', status: 'operational', latency: '1,2 s', lastSync: 'há 18 s', agents: ['Comissionamento', 'Orquestrador'] },
  { id: 'INT-AT-02', name: 'Nexo Evidência', direction: 'bidirecional', objects: 'As built, testes, laudos, cadeia de custódia', method: 'API + objetos', cadence: 'Evento', status: 'operational', latency: '1,8 s', lastSync: 'há 24 s', agents: ['Comissionamento', 'Saúde'] },
  { id: 'INT-AT-03', name: 'SCADA / IoT', direction: 'entrada', objects: 'Telemetria, alarmes e condição operacional', method: 'MQTT / WebSocket', cadence: 'Tempo real', status: 'operational', latency: '280 ms', lastSync: 'agora', agents: ['Saúde', 'Manutenção'] },
  { id: 'INT-AT-04', name: 'Sistema de Manutenção', direction: 'bidirecional', objects: 'Ordens, materiais, equipes e custos', method: 'REST', cadence: '5 min', status: 'attention', latency: '6,4 s', lastSync: 'há 7 min', agents: ['Manutenção', 'Reinvestimento'] },
  { id: 'INT-AT-05', name: 'ArcGIS / Living Atlas', direction: 'entrada', objects: 'Ativos, redes, riscos, cobertura e imagens', method: 'Feature/Map Services', cadence: 'Diária + evento', status: 'operational', latency: '2,1 s', lastSync: 'há 12 min', agents: ['Resiliência', 'Orquestrador'] },
  { id: 'INT-AT-06', name: 'Nexo Capital', direction: 'bidirecional', objects: 'Funding, Capex, Opex e plano de reinvestimento', method: 'API interna', cadence: 'Diária', status: 'operational', latency: '1,6 s', lastSync: 'há 31 min', agents: ['Reinvestimento'] },
  { id: 'INT-AT-07', name: 'Nexo Impacto', direction: 'saida', objects: 'Disponibilidade, serviço, beneficiários e performance', method: 'API interna', cadence: 'Mensal', status: 'operational', latency: '2,9 s', lastSync: 'hoje 07:00', agents: ['Saúde', 'Orquestrador'] },
];

export const ASSET_ANALYTICS_INSIGHTS = [
  { title: 'Manutenção agrupada reduz indisponibilidade', text: 'A combinação das intervenções WTG-14 e WTG-22 reduz a parada estimada em 19 horas e evita R$ 1,9 mi.', confidence: 0.91, tone: 'teal' },
  { title: 'Prontidão não equivale à conclusão física', text: 'O Residencial Horizonte Azul possui 87% de avanço, mas segue sem prontidão por duas dependências externas.', confidence: 0.96, tone: 'amber' },
  { title: 'Resiliência hídrica exige investimento antecipado', text: 'O trecho km 38–46 da Adutora Sertão Vivo concentra 63% do risco residual projetado para 2040.', confidence: 0.89, tone: 'red' },
  { title: 'Ativo educacional subutilizado', text: 'A Escola Técnica Cerrado opera com 48% da capacidade projetada; Nexo Impacto deve avaliar barreiras de acesso e matrícula.', confidence: 0.87, tone: 'blue' },
];

export { CLIMATE_RISK, FAILURE_PREDICTIONS, HEALTH_DIMENSIONS, REINVESTMENT_PLAN, SENSORS, WORK_ORDERS };
