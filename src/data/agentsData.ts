import { REALISTIC_AGENT_EXECUTIONS, REALISTIC_AGENT_CASES, REALISTIC_AGENT_EXCEPTIONS, REALISTIC_AGENT_LOGS } from '@/data/realisticPortfolioData';
import type { ProductKey } from '@/data/navConfig';

export type AgentsSection = 'cockpit' | 'queue' | 'cases' | 'exceptions' | 'logs' | 'authorities';
export type AgentRuntimeStatus = 'scheduled' | 'running' | 'collecting' | 'analyzing' | 'waiting_system' | 'waiting_human' | 'completed' | 'completed_alert' | 'failed' | 'canceled';
export type AgentPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type LogLevel = 'debug' | 'info' | 'success' | 'warning' | 'error' | 'decision';
export type ExceptionSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface AgentDefinition {
  id: string;
  name: string;
  shortName: string;
  function: string;
  module: ProductKey;
  owner: string;
  autonomy: 'assistido' | 'supervisionado' | 'automatizado';
  riskClass: 'baixo' | 'moderado' | 'alto';
  slaMinutes: number;
  enabled: boolean;
  triggers: string[];
  sources: string[];
  outputs: string[];
  humanGates: string[];
}

export interface ExecutionStep {
  label: string;
  detail: string;
  status: 'done' | 'active' | 'pending' | 'alert';
  timestamp?: string;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  caseId: string;
  entity: string;
  module: ProductKey;
  status: AgentRuntimeStatus;
  priority: AgentPriority;
  progress: number;
  startedAt: string;
  duration: string;
  currentStep: string;
  confidence: number | null;
  recommendation: string;
  awaiting: string;
  humanOwner: string;
  correlationId: string;
  estimatedImpact: string;
  steps: ExecutionStep[];
}

export interface AgentCase {
  id: string;
  title: string;
  subtitle: string;
  module: ProductKey;
  assetId?: string;
  status: 'active' | 'waiting' | 'resolved' | 'critical';
  priority: AgentPriority;
  value: number;
  owner: string;
  startedAt: string;
  orchestration: number;
  agentIds: string[];
  outcome: string;
  nextDecision: string;
}

export interface AgentException {
  id: string;
  executionId: string;
  caseId: string;
  severity: ExceptionSeverity;
  type: string;
  title: string;
  description: string;
  impact: string;
  detectedAt: string;
  sla: string;
  owner: string;
  status: 'open' | 'assigned' | 'waiting' | 'resolved';
  recommendation: string;
  source: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  agentId: string;
  executionId: string;
  correlationId: string;
  event: string;
  message: string;
  durationMs?: number;
  details?: string;
}

export interface AuthorityRule {
  id: string;
  action: string;
  scope: string;
  maxAutomaticAmount: number;
  minConfidence: number;
  requiredRole: string;
  mandatoryHuman: boolean;
  twoPersonRule: boolean;
  enabled: boolean;
  rationale: string;
  affectedAgents: string[];
}

export interface AgentIntegration {
  product: ProductKey;
  object: string;
  direction: 'entrada' | 'saida' | 'bidirecional';
  status: 'operational' | 'attention' | 'error';
  latency: string;
  events24h: number;
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'orchestrator', name: 'Orquestrador do Ciclo de Vida', shortName: 'Orquestrador', function: 'Interpreta eventos, compõe planos de execução e coordena agentes especializados.', module: 'agents', owner: 'Centro de Automação e IA', autonomy: 'supervisionado', riskClass: 'alto', slaMinutes: 2, enabled: true,
    triggers: ['Novo evento crítico', 'Mudança de estágio', 'SLA ameaçado'], sources: ['Barramento de eventos', 'Regras corporativas', 'Estado dos workflows'], outputs: ['Plano de execução', 'Agentes acionados', 'Escalonamento'], humanGates: ['Alteração de alçada', 'Suspensão de processo'],
  },
  {
    id: 'funding', name: 'Agente de Funding e Covenants', shortName: 'Funding', function: 'Verifica aderência da operação às condições das fontes de capital.', module: 'capital', owner: 'VP Finanças e Controladoria', autonomy: 'automatizado', riskClass: 'moderado', slaMinutes: 5, enabled: true,
    triggers: ['Nova alocação', 'Mudança de envelope', 'Fechamento mensal'], sources: ['Nexo Capital', 'Contratos de funding', 'Frameworks sustentáveis'], outputs: ['Elegibilidade', 'Alerta de covenant', 'Recomendação de reenquadramento'], humanGates: ['Alteração de destinação', 'Waiver de covenant'],
  },
  {
    id: 'portfolio', name: 'Agente de Priorização de Carteira', shortName: 'Priorização', function: 'Classifica oportunidades por impacto, prontidão, risco e capacidade de execução.', module: 'carteira', owner: 'VP Governo', autonomy: 'supervisionado', riskClass: 'moderado', slaMinutes: 10, enabled: true,
    triggers: ['Nova oportunidade', 'Revisão de carteira', 'Mudança de funding'], sources: ['Nexo Carteira', 'Dados territoriais', 'Nexo Capital'], outputs: ['Ranking', 'Score explicável', 'Despacho de encaminhamento'], humanGates: ['Homologação da prioridade P0/P1'],
  },
  {
    id: 'structure', name: 'Agente de Alternativas e Estruturação', shortName: 'Estruturação', function: 'Compara alternativas técnicas, financeiras e territoriais e recomenda a baseline.', module: 'estrutura', owner: 'Diretoria de Estruturação', autonomy: 'supervisionado', riskClass: 'alto', slaMinutes: 30, enabled: true,
    triggers: ['Oportunidade homologada', 'Premissa alterada', 'Cenário de estresse'], sources: ['Nexo Estrutura', 'SINAPI', 'ArcGIS', 'Nexo Capital'], outputs: ['Comparador', 'Modelo financeiro', 'Baseline recomendada'], humanGates: ['Escolha da alternativa', 'Aprovação da baseline'],
  },
  {
    id: 'eligibility', name: 'Agente de Elegibilidade e Dossiê', shortName: 'Elegibilidade', function: 'Executa checklists regulatórios e consolida pendências para contratação.', module: 'contrata', owner: 'VP Governo / Riscos', autonomy: 'automatizado', riskClass: 'alto', slaMinutes: 15, enabled: true,
    triggers: ['Dossiê recebido', 'Documento atualizado', 'Resposta à diligência'], sources: ['Nexo Contrata', 'Nexo Estrutura', 'Sistemas de crédito'], outputs: ['Percentual de elegibilidade', 'Diligência', 'Parecer preliminar'], humanGates: ['Aprovação ou reprovação', 'Decisão de comitê'],
  },
  {
    id: 'risk', name: 'Agente de Risco Integrado', shortName: 'Risco Integrado', function: 'Consolida risco de crédito, execução, territorial, climático e socioambiental.', module: 'contrata', owner: 'VP Riscos', autonomy: 'supervisionado', riskClass: 'alto', slaMinutes: 12, enabled: true,
    triggers: ['Nova análise', 'Alerta territorial', 'Mudança de contraparte'], sources: ['Nexo Contrata', 'ArcGIS', 'Bases climáticas', 'Risco corporativo'], outputs: ['Matriz de risco', 'Mitigações', 'Risco residual'], humanGates: ['Aceite de risco alto', 'Override de modelo'],
  },
  {
    id: 'measurement', name: 'Agente de Medição e Desembolso', shortName: 'Medição', function: 'Valida medições e calcula o valor liberável conforme evidências e condicionantes.', module: 'entrega', owner: 'VP Governo / Operações', autonomy: 'supervisionado', riskClass: 'alto', slaMinutes: 20, enabled: true,
    triggers: ['Medição recebida', 'Laudo concluído', 'Condição precedente atendida'], sources: ['Nexo Entrega', 'Nexo Evidência', 'Baseline contratual', 'Funding'], outputs: ['Percentual validado', 'Valor liberável', 'Despacho preliminar'], humanGates: ['Liberação financeira', 'Retenção ou suspensão'],
  },
  {
    id: 'fraud', name: 'Agente de Inconsistências e Fraude', shortName: 'Fraude', function: 'Detecta duplicidades, manipulações, incoerências espaciais e padrões anômalos.', module: 'evidencia', owner: 'Controles Internos e Integridade', autonomy: 'automatizado', riskClass: 'alto', slaMinutes: 5, enabled: true,
    triggers: ['Nova evidência', 'Medição recebida', 'Anomalia estatística'], sources: ['Nexo Evidência', 'Metadados EXIF', 'ArcGIS', 'Histórico de medições'], outputs: ['Ocorrência', 'Score de risco', 'Ordem de vistoria recomendada'], humanGates: ['Encaminhamento disciplinar', 'Bloqueio definitivo'],
  },
  {
    id: 'inspection', name: 'Agente de Vistoria', shortName: 'Vistoria', function: 'Prioriza inspeções, monta checklists, otimiza rotas e consolida laudos.', module: 'evidencia', owner: 'Rede de Engenharia', autonomy: 'supervisionado', riskClass: 'moderado', slaMinutes: 30, enabled: true,
    triggers: ['Ordem criada', 'Equipe disponível', 'Evidência divergente'], sources: ['Nexo Evidência', 'ArcGIS', 'Agenda de equipes'], outputs: ['Roteiro', 'Checklist', 'Laudo preliminar'], humanGates: ['Assinatura do laudo'],
  },
  {
    id: 'asset_health', name: 'Agente de Saúde e Manutenção Preditiva', shortName: 'Saúde do Ativo', function: 'Analisa telemetria, histórico de falhas e manutenção para prever degradação.', module: 'ativos', owner: 'Gestão de Ativos', autonomy: 'automatizado', riskClass: 'moderado', slaMinutes: 3, enabled: true,
    triggers: ['Leitura de sensor', 'Ordem vencida', 'Mudança de tendência'], sources: ['Nexo Ativos', 'SCADA/IoT', 'CMMS'], outputs: ['Índice de saúde', 'Previsão de falha', 'Ordem preditiva'], humanGates: ['Parada programada de ativo crítico'],
  },
  {
    id: 'impact', name: 'Agente de Impacto e MRV', shortName: 'Impacto', function: 'Valida indicadores, beneficiários, atribuição e evidências de resultados.', module: 'impacto', owner: 'VP Sustentabilidade e Cidadania', autonomy: 'supervisionado', riskClass: 'moderado', slaMinutes: 20, enabled: true,
    triggers: ['Indicador atualizado', 'Fechamento de período', 'Relatório solicitado'], sources: ['Nexo Impacto', 'Nexo Ativos', 'Nexo Evidência', 'IBGE'], outputs: ['Indicador validado', 'Confiança', 'Relatório de impacto'], humanGates: ['Publicação externa', 'Alteração metodológica'],
  },
  {
    id: 'dispatch', name: 'Agente de Despachos e Diligências', shortName: 'Despachos', function: 'Produz minutas formais com modelos aprovados e dados do processo.', module: 'agents', owner: 'Governança de Processos', autonomy: 'supervisionado', riskClass: 'moderado', slaMinutes: 4, enabled: true,
    triggers: ['Pendência detectada', 'Decisão preparada', 'SLA ameaçado'], sources: ['Modelos oficiais', 'Dados do caso', 'Trilha de auditoria'], outputs: ['Diligência', 'Despacho', 'Resumo para comitê'], humanGates: ['Envio externo', 'Comunicação sancionatória'],
  },
];

const steps = (labels: string[], activeIndex: number, alertIndex = -1): ExecutionStep[] => labels.map((label, index) => ({
  label,
  detail: index < activeIndex ? 'Etapa concluída e registrada na trilha de auditoria.' : index === activeIndex ? 'Processamento em curso com atualização incremental.' : 'Aguardando conclusão das etapas anteriores.',
  status: index === alertIndex ? 'alert' : index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending',
  timestamp: index <= activeIndex ? `19:${String(42 + index).padStart(2, '0')}:${String(4 + index * 3).padStart(2, '0')}` : undefined,
}));

export const INITIAL_EXECUTIONS: AgentExecution[] = [
  { id: 'EXE-240721-001', agentId: 'orchestrator', caseId: 'CAS-001', entity: 'Medição nº 6 — Vale Verde', module: 'agents', status: 'running', priority: 'P0', progress: 68, startedAt: '19:42:04', duration: '03m 18s', currentStep: 'Coordenando vistoria e recálculo do desembolso', confidence: 0.94, recommendation: 'Manter liberação parcial e aguardar laudo dos trechos T-14 e T-22.', awaiting: 'Laudo de campo', humanOwner: 'Ana Beatriz Souza', correlationId: 'corr-vv-m6-20260721', estimatedImpact: 'R$ 18,4 mi', steps: steps(['Evento recebido', 'Plano de execução', 'Fraude e geometria', 'Vistoria', 'Recálculo', 'Gate humano'], 3, 2) },
  { id: 'EXE-240721-002', agentId: 'fraud', caseId: 'CAS-001', entity: 'Evidências da Medição nº 6', module: 'evidencia', status: 'completed_alert', priority: 'P0', progress: 100, startedAt: '19:42:06', duration: '13s', currentStep: 'Concluído com anomalia', confidence: 0.91, recommendation: 'Confirmar em campo os desvios geométricos de T-14 e T-22.', awaiting: 'Vistoria', humanOwner: 'Equipe GEREG Sudeste', correlationId: 'corr-vv-m6-20260721', estimatedImpact: 'R$ 2,65 mi retidos', steps: steps(['Metadados', 'Duplicidades', 'Comparação espacial', 'Score de risco', 'Ordem de vistoria'], 4, 2) },
  { id: 'EXE-240721-003', agentId: 'inspection', caseId: 'CAS-001', entity: 'OV-2026-0871', module: 'evidencia', status: 'collecting', priority: 'P0', progress: 61, startedAt: '19:42:23', duration: '02m 59s', currentStep: 'Equipe coletando evidências no trecho T-22', confidence: 0.89, recommendation: 'Concluir 3 leituras GNSS e registrar conexão hidráulica do trecho.', awaiting: 'Coleta em campo', humanOwner: 'Equipe GEREG Sudeste', correlationId: 'corr-vv-m6-20260721', estimatedImpact: '38 km de roteiro', steps: steps(['Prioridade', 'Equipe', 'Rota', 'Coleta T-14', 'Coleta T-17', 'Coleta T-22', 'Laudo'], 5, 3) },
  { id: 'EXE-240721-004', agentId: 'measurement', caseId: 'CAS-001', entity: 'Desembolso da Medição nº 6', module: 'entrega', status: 'waiting_system', priority: 'P0', progress: 74, startedAt: '19:42:19', duration: '03m 03s', currentStep: 'Aguardando laudo para recalcular valor liberável', confidence: 0.85, recommendation: 'Liberar R$ 15,7 mi e reter R$ 2,65 mi até validação final.', awaiting: 'Nexo Evidência', humanOwner: 'Gerência de Operações', correlationId: 'corr-vv-m6-20260721', estimatedImpact: 'R$ 15,7 mi liberáveis', steps: steps(['Baseline', 'Itens medidos', 'Evidências', 'Condicionantes', 'Valor liberável', 'Despacho'], 4, 2) },
  { id: 'EXE-240721-005', agentId: 'eligibility', caseId: 'CAS-002', entity: 'Residencial Horizonte Azul', module: 'contrata', status: 'waiting_human', priority: 'P1', progress: 100, startedAt: '14:03:10', duration: '11m 02s', currentStep: 'Parecer pronto para decisão humana', confidence: 0.88, recommendation: 'Não reconhecer prontidão plena até conclusão do acesso viário.', awaiting: 'Comitê de contratação', humanOwner: 'Marlos Batista', correlationId: 'corr-rha-prontidao', estimatedImpact: '1.240 unidades', steps: steps(['Checklist', 'Documentos', 'Risco territorial', 'Comissionamento', 'Parecer', 'Gate humano'], 5, 3) },
  { id: 'EXE-240721-006', agentId: 'asset_health', caseId: 'CAS-003', entity: 'Complexo Eólico Costa Branca', module: 'ativos', status: 'analyzing', priority: 'P1', progress: 72, startedAt: '19:39:20', duration: '05m 02s', currentStep: 'Calculando probabilidade de falha da WTG-14', confidence: 0.93, recommendation: 'Programar substituição preditiva em até 45 dias.', awaiting: 'Janela de manutenção', humanOwner: 'Tiago Almeida', correlationId: 'corr-cecb-wtg14', estimatedImpact: 'R$ 4,8 mi evitáveis', steps: steps(['Telemetria', 'Tendência', 'Histórico de OS', 'Modelo de falha', 'Janela ótima', 'Ordem preditiva'], 3, 1) },
  { id: 'EXE-240721-007', agentId: 'risk', caseId: 'CAS-004', entity: 'Macrodrenagem Rio Norte', module: 'contrata', status: 'completed_alert', priority: 'P1', progress: 100, startedAt: '19:10:22', duration: '03m 08s', currentStep: 'Concluído com exposição elevada', confidence: 0.92, recommendation: 'Reprogramar componentes C-06 e C-11 para a nova cota de alerta.', awaiting: 'Engenharia regional', humanOwner: 'Fernanda Ribeiro', correlationId: 'corr-rn-clima', estimatedImpact: 'R$ 63 mi expostos', steps: steps(['Alerta CEMADEN', 'Ativos expostos', 'Cotas', 'Cenário', 'Mitigação', 'Workflow'], 5, 3) },
  { id: 'EXE-240721-008', agentId: 'funding', caseId: 'CAS-005', entity: 'Green Bond 2033', module: 'capital', status: 'completed', priority: 'P2', progress: 100, startedAt: '18:55:00', duration: '46s', currentStep: 'Concluído', confidence: 0.97, recommendation: 'Covenants atendidos; 76% da alocação possui evidência validada.', awaiting: 'Nenhuma', humanOwner: '—', correlationId: 'corr-gb-2033', estimatedImpact: 'R$ 1,2 bi', steps: steps(['Contrato', 'Taxonomia', 'Alocação', 'Evidências', 'Covenants'], 4) },
  { id: 'EXE-240721-009', agentId: 'portfolio', caseId: 'CAS-006', entity: 'Carteira de adaptação urbana', module: 'carteira', status: 'running', priority: 'P2', progress: 54, startedAt: '19:40:11', duration: '04m 11s', currentStep: 'Recalculando ranking após atualização climática', confidence: 0.90, recommendation: 'Elevar 3 projetos de drenagem para prioridade P1.', awaiting: 'Conclusão do cenário', humanOwner: 'Comitê de Carteira', correlationId: 'corr-carteira-clima', estimatedImpact: 'R$ 890 mi', steps: steps(['Demandas', 'Funding', 'Risco climático', 'Execução', 'Ranking', 'Homologação'], 2) },
  { id: 'EXE-240721-010', agentId: 'structure', caseId: 'CAS-007', entity: 'Adutora Sertão Vivo — Fase II', module: 'estrutura', status: 'waiting_human', priority: 'P2', progress: 100, startedAt: '17:12:42', duration: '18m 44s', currentStep: 'Alternativa recomendada aguardando homologação', confidence: 0.91, recommendation: 'Selecionar cenário híbrido com reservação distribuída.', awaiting: 'Comitê técnico', humanOwner: 'Diretoria de Estruturação', correlationId: 'corr-asv-f2', estimatedImpact: '296 mil pessoas', steps: steps(['Alternativas', 'Capex/Opex', 'Cobertura', 'Risco', 'Recomendação', 'Homologação'], 5) },
  { id: 'EXE-240721-011', agentId: 'impact', caseId: 'CAS-008', entity: 'Relatório de Impacto 2T26', module: 'impacto', status: 'completed_alert', priority: 'P2', progress: 100, startedAt: '16:31:00', duration: '06m 12s', currentStep: 'Relatório pronto com 2 indicadores retidos', confidence: 0.89, recommendation: 'Publicar 7 indicadores e reter os indicadores divergentes.', awaiting: 'Aprovação de divulgação', humanOwner: 'VP Sustentabilidade', correlationId: 'corr-impacto-2t26', estimatedImpact: '1,19 mi beneficiários', steps: steps(['Indicadores', 'Beneficiários', 'Evidências', 'Atribuição', 'Relatório', 'Publicação'], 5, 2) },
  { id: 'EXE-240721-012', agentId: 'dispatch', caseId: 'CAS-001', entity: 'Diligência Vale Verde', module: 'agents', status: 'scheduled', priority: 'P1', progress: 0, startedAt: '—', duration: '—', currentStep: 'Aguardando resultado da vistoria', confidence: null, recommendation: 'Gerar minuta após definição dos itens divergentes.', awaiting: 'Gatilho do Orquestrador', humanOwner: 'Ana Beatriz Souza', correlationId: 'corr-vv-m6-20260721', estimatedImpact: 'Prazo de 5 dias úteis', steps: steps(['Gatilho', 'Modelo', 'Dados', 'Minuta', 'Revisão humana', 'Envio'], -1) },
  { id: 'EXE-240721-013', agentId: 'funding', caseId: 'CAS-009', entity: 'Envelope FINISA Infra 2026', module: 'capital', status: 'failed', priority: 'P1', progress: 42, startedAt: '19:33:04', duration: '01m 07s', currentStep: 'Falha ao consultar posição de saldo', confidence: null, recommendation: 'Reprocessar após restabelecimento da integração financeira.', awaiting: 'Sistema Financeiro CAIXA', humanOwner: 'Suporte Nexo Data', correlationId: 'corr-finisa-saldo', estimatedImpact: 'R$ 420 mi', steps: steps(['Contrato', 'Saldo', 'Destinação', 'Covenants'], 1, 1) },
  { id: 'EXE-240721-014', agentId: 'fraud', caseId: 'CAS-010', entity: 'Lote fotográfico CT-0987', module: 'evidencia', status: 'completed', priority: 'P3', progress: 100, startedAt: '18:01:02', duration: '19s', currentStep: 'Concluído sem anomalias', confidence: 0.98, recommendation: 'Evidências aptas para validação automática.', awaiting: 'Nenhuma', humanOwner: '—', correlationId: 'corr-ct0987-fotos', estimatedImpact: '84 evidências', steps: steps(['Hash', 'EXIF', 'Duplicidade', 'Geografia', 'Resultado'], 4) },
];
INITIAL_EXECUTIONS.push(...REALISTIC_AGENT_EXECUTIONS);

export const INITIAL_CASES: AgentCase[] = [
  { id: 'CAS-001', title: 'Medição nº 6 — Vale Verde', subtitle: 'Divergência geométrica e decisão de desembolso', module: 'entrega', assetId: 'asset-vale-verde', status: 'critical', priority: 'P0', value: 18_400_000, owner: 'Ana Beatriz Souza', startedAt: '19:42:04', orchestration: 68, agentIds: ['orchestrator', 'fraud', 'inspection', 'measurement', 'dispatch'], outcome: 'R$ 15,7 mi potencialmente liberáveis; R$ 2,65 mi condicionados.', nextDecision: 'Aprovar liberação parcial após laudo final.' },
  { id: 'CAS-002', title: 'Prontidão — Horizonte Azul', subtitle: 'Ativo concluído sem acesso viário funcional', module: 'ativos', assetId: 'asset-horizonte-azul', status: 'waiting', priority: 'P1', value: 392_000_000, owner: 'Marlos Batista', startedAt: '14:03:10', orchestration: 100, agentIds: ['eligibility', 'risk', 'dispatch'], outcome: 'Prontidão operacional não recomendada.', nextDecision: 'Comitê decide sobre aceite condicionado.' },
  { id: 'CAS-003', title: 'Falha preditiva — WTG-14', subtitle: 'Tendência de vibração na caixa multiplicadora', module: 'ativos', assetId: 'asset-costa-branca', status: 'active', priority: 'P1', value: 4_800_000, owner: 'Tiago Almeida', startedAt: '19:39:20', orchestration: 72, agentIds: ['asset_health', 'risk', 'dispatch'], outcome: 'Janela ótima estimada em 45 dias.', nextDecision: 'Autorizar ordem preditiva e reserva de componente.' },
  { id: 'CAS-004', title: 'Exposição climática — Rio Norte', subtitle: 'Cotas de dois componentes abaixo do alerta revisado', module: 'estrutura', assetId: 'asset-rio-norte', status: 'waiting', priority: 'P1', value: 63_000_000, owner: 'Fernanda Ribeiro', startedAt: '19:10:22', orchestration: 100, agentIds: ['risk', 'structure', 'dispatch'], outcome: 'Reforço estrutural recomendado para C-06 e C-11.', nextDecision: 'Aprovar reprogramação técnica.' },
  { id: 'CAS-005', title: 'Covenants — Green Bond 2033', subtitle: 'Fechamento mensal de alocação e impacto', module: 'capital', status: 'resolved', priority: 'P2', value: 1_200_000_000, owner: 'Tesouraria', startedAt: '18:55:00', orchestration: 100, agentIds: ['funding', 'impact'], outcome: 'Covenants atendidos e relatório reconciliado.', nextDecision: 'Nenhuma.' },
  { id: 'CAS-006', title: 'Repriorização climática', subtitle: 'Carteira de adaptação urbana', module: 'carteira', status: 'active', priority: 'P2', value: 890_000_000, owner: 'Comitê de Carteira', startedAt: '19:40:11', orchestration: 54, agentIds: ['portfolio', 'risk', 'funding'], outcome: 'Três projetos podem migrar para P1.', nextDecision: 'Homologar novo ranking.' },
  { id: 'CAS-007', title: 'Estruturação — Sertão Vivo Fase II', subtitle: 'Comparação de alternativas de reservação', module: 'estrutura', assetId: 'asset-sertao-vivo', status: 'waiting', priority: 'P2', value: 620_000_000, owner: 'Diretoria de Estruturação', startedAt: '17:12:42', orchestration: 100, agentIds: ['structure', 'funding', 'risk'], outcome: 'Cenário híbrido apresenta melhor relação custo-resiliência.', nextDecision: 'Homologar baseline.' },
  { id: 'CAS-008', title: 'Relatório de Impacto 2T26', subtitle: 'Conciliação de indicadores e beneficiários', module: 'impacto', status: 'waiting', priority: 'P2', value: 3_200_000_000, owner: 'VP Sustentabilidade', startedAt: '16:31:00', orchestration: 100, agentIds: ['impact', 'fraud', 'dispatch'], outcome: 'Sete indicadores aptos e dois retidos.', nextDecision: 'Aprovar publicação parcial.' },
  { id: 'CAS-009', title: 'Falha de integração FINISA', subtitle: 'Consulta de saldo indisponível', module: 'data', status: 'critical', priority: 'P1', value: 420_000_000, owner: 'Suporte Nexo Data', startedAt: '19:33:04', orchestration: 42, agentIds: ['funding', 'orchestrator'], outcome: 'Execução interrompida sem perda de dados.', nextDecision: 'Reprocessar após restabelecimento.' },
];
INITIAL_CASES.push(...REALISTIC_AGENT_CASES);

export const INITIAL_EXCEPTIONS: AgentException[] = [
  { id: 'EXC-001', executionId: 'EXE-240721-002', caseId: 'CAS-001', severity: 'critical', type: 'Divergência geoespacial', title: 'Trechos executados fora da baseline', description: 'T-14 e T-22 apresentam desvios médios acima da tolerância contratual de 15 m.', impact: 'R$ 2,65 mi condicionados', detectedAt: '19:42:14', sla: '00:42:18', owner: 'Ana Beatriz Souza', status: 'assigned', recommendation: 'Concluir vistoria e manter retenção proporcional.', source: 'ArcGIS + baseline contratual' },
  { id: 'EXC-002', executionId: 'EXE-240721-013', caseId: 'CAS-009', severity: 'high', type: 'Integração indisponível', title: 'Saldo FINISA não retornado', description: 'Timeout após três tentativas na consulta da posição financeira do envelope.', impact: 'R$ 420 mi sem validação', detectedAt: '19:34:11', sla: '01:18:04', owner: 'Suporte Nexo Data', status: 'open', recommendation: 'Acionar fallback de leitura e reprocessar.', source: 'API Sistema Financeiro' },
  { id: 'EXC-003', executionId: 'EXE-240721-006', caseId: 'CAS-003', severity: 'high', type: 'Falha preditiva', title: 'Vibração crescente na WTG-14', description: 'Probabilidade de falha em 90 dias estimada em 46%, acima do limiar de 35%.', impact: 'R$ 4,8 mi evitáveis', detectedAt: '19:41:08', sla: '18:34:20', owner: 'Tiago Almeida', status: 'assigned', recommendation: 'Programar substituição em até 45 dias.', source: 'SCADA/IoT + modelo preditivo' },
  { id: 'EXC-004', executionId: 'EXE-240721-007', caseId: 'CAS-004', severity: 'high', type: 'Risco climático', title: 'Cotas abaixo do alerta revisado', description: 'Componentes C-06 e C-11 ficam expostos no cenário hidrológico atualizado.', impact: 'R$ 63 mi expostos', detectedAt: '19:13:30', sla: '22:04:10', owner: 'Fernanda Ribeiro', status: 'waiting', recommendation: 'Reprogramar cotas e reforçar componentes.', source: 'CEMADEN + modelo de terreno' },
  { id: 'EXC-005', executionId: 'EXE-240721-011', caseId: 'CAS-008', severity: 'medium', type: 'Indicador divergente', title: 'Beneficiários habitacionais não conciliados', description: 'Diferença de 8,4% entre cadastro do programa e ocupação comprovada.', impact: '12,6 mil beneficiários', detectedAt: '16:35:44', sla: '2d 04h', owner: 'Equipe MRV', status: 'assigned', recommendation: 'Reter indicador e executar deduplicação cadastral.', source: 'Nexo Impacto + cadastro social' },
  { id: 'EXC-006', executionId: 'EXE-240721-005', caseId: 'CAS-002', severity: 'medium', type: 'Prontidão operacional', title: 'Acesso viário não concluído', description: 'Empreendimento fisicamente concluído, mas sem conexão viária plenamente funcional.', impact: '1.240 unidades', detectedAt: '14:12:20', sla: '1d 08h', owner: 'Marlos Batista', status: 'waiting', recommendation: 'Não reconhecer prontidão plena.', source: 'Comissionamento + vistoria' },
];
INITIAL_EXCEPTIONS.push(...REALISTIC_AGENT_EXCEPTIONS);

export const INITIAL_LOGS: AgentLog[] = [
  { id: 'LOG-001', timestamp: '19:42:04.103', level: 'info', agentId: 'orchestrator', executionId: 'EXE-240721-001', correlationId: 'corr-vv-m6-20260721', event: 'event.received', message: 'Medição nº 6 recebida do Nexo Entrega.', durationMs: 18 },
  { id: 'LOG-002', timestamp: '19:42:04.221', level: 'debug', agentId: 'orchestrator', executionId: 'EXE-240721-001', correlationId: 'corr-vv-m6-20260721', event: 'plan.created', message: 'Plano com 4 agentes e 2 gates humanos criado.', durationMs: 72 },
  { id: 'LOG-003', timestamp: '19:42:06.014', level: 'info', agentId: 'fraud', executionId: 'EXE-240721-002', correlationId: 'corr-vv-m6-20260721', event: 'analysis.started', message: 'Análise de 28 fotos e 2 geometrias iniciada.' },
  { id: 'LOG-004', timestamp: '19:42:11.442', level: 'success', agentId: 'fraud', executionId: 'EXE-240721-002', correlationId: 'corr-vv-m6-20260721', event: 'evidence.validated', message: '28 evidências tiveram integridade e metadados validados.', durationMs: 5428 },
  { id: 'LOG-005', timestamp: '19:42:14.338', level: 'warning', agentId: 'fraud', executionId: 'EXE-240721-002', correlationId: 'corr-vv-m6-20260721', event: 'spatial.anomaly', message: 'Desvio geométrico detectado em T-14, T-17 e T-22.', details: 'tolerance=15m; meanDeviation=47m' },
  { id: 'LOG-006', timestamp: '19:42:19.004', level: 'info', agentId: 'measurement', executionId: 'EXE-240721-004', correlationId: 'corr-vv-m6-20260721', event: 'disbursement.calculated', message: 'Valor liberável preliminar calculado em R$ 15,7 milhões.', durationMs: 482 },
  { id: 'LOG-007', timestamp: '19:42:23.092', level: 'success', agentId: 'inspection', executionId: 'EXE-240721-003', correlationId: 'corr-vv-m6-20260721', event: 'inspection.created', message: 'Ordem OV-2026-0871 criada e atribuída.' },
  { id: 'LOG-008', timestamp: '19:42:26.881', level: 'decision', agentId: 'orchestrator', executionId: 'EXE-240721-001', correlationId: 'corr-vv-m6-20260721', event: 'human.gate.created', message: 'Gate de desembolso parcial preparado para a Gerência de Operações.' },
  { id: 'LOG-009', timestamp: '19:41:08.207', level: 'warning', agentId: 'asset_health', executionId: 'EXE-240721-006', correlationId: 'corr-cecb-wtg14', event: 'failure.threshold', message: 'Probabilidade de falha da WTG-14 ultrapassou 35%.' },
  { id: 'LOG-010', timestamp: '19:34:11.720', level: 'error', agentId: 'funding', executionId: 'EXE-240721-013', correlationId: 'corr-finisa-saldo', event: 'integration.timeout', message: 'Timeout na consulta do saldo FINISA após 3 tentativas.', details: 'HTTP 504; retryPolicy=exhausted' },
  { id: 'LOG-011', timestamp: '19:13:30.432', level: 'warning', agentId: 'risk', executionId: 'EXE-240721-007', correlationId: 'corr-rn-clima', event: 'climate.exposure', message: 'Dois componentes abaixo da cota de alerta revisada.' },
  { id: 'LOG-012', timestamp: '18:55:46.014', level: 'success', agentId: 'funding', executionId: 'EXE-240721-008', correlationId: 'corr-gb-2033', event: 'covenant.validated', message: 'Covenants do Green Bond 2033 atendidos.' },
];
INITIAL_LOGS.push(...REALISTIC_AGENT_LOGS);

export const INITIAL_AUTHORITY_RULES: AuthorityRule[] = [
  { id: 'ALC-001', action: 'Validar evidência de baixo risco', scope: 'Evidências documentais e fotográficas', maxAutomaticAmount: 0, minConfidence: 0.90, requiredRole: 'Analista de Evidências', mandatoryHuman: false, twoPersonRule: false, enabled: true, rationale: 'Automação permitida quando integridade, geografia e duplicidade estão dentro dos limiares.', affectedAgents: ['fraud', 'inspection'] },
  { id: 'ALC-002', action: 'Criar ordem de vistoria', scope: 'Anomalias geoespaciais ou documentais', maxAutomaticAmount: 50_000_000, minConfidence: 0.80, requiredRole: 'Engenharia Regional', mandatoryHuman: false, twoPersonRule: false, enabled: true, rationale: 'A criação da ordem não implica decisão financeira e pode ser automatizada.', affectedAgents: ['fraud', 'inspection', 'orchestrator'] },
  { id: 'ALC-003', action: 'Emitir diligência interna', scope: 'Pendências documentais não sancionatórias', maxAutomaticAmount: 20_000_000, minConfidence: 0.88, requiredRole: 'Gestor do Processo', mandatoryHuman: true, twoPersonRule: false, enabled: true, rationale: 'A minuta é automática, mas o envio exige revisão e assinatura humana.', affectedAgents: ['eligibility', 'dispatch'] },
  { id: 'ALC-004', action: 'Recomendar desembolso', scope: 'Medições e liberações', maxAutomaticAmount: 100_000_000, minConfidence: 0.85, requiredRole: 'Gerente de Operações', mandatoryHuman: true, twoPersonRule: false, enabled: true, rationale: 'Agente pode calcular e recomendar, mas não efetiva liberação financeira.', affectedAgents: ['measurement', 'orchestrator'] },
  { id: 'ALC-005', action: 'Efetivar desembolso', scope: 'Qualquer operação financeira', maxAutomaticAmount: 0, minConfidence: 1, requiredRole: 'Alçada Financeira Competente', mandatoryHuman: true, twoPersonRule: true, enabled: true, rationale: 'Ação financeira irreversível exige segregação de funções e dupla aprovação.', affectedAgents: ['measurement'] },
  { id: 'ALC-006', action: 'Reprovar operação', scope: 'Crédito, contratação e elegibilidade', maxAutomaticAmount: 0, minConfidence: 1, requiredRole: 'Comitê de Contratação', mandatoryHuman: true, twoPersonRule: true, enabled: true, rationale: 'Agentes apenas recomendam; a decisão negativa permanece humana.', affectedAgents: ['eligibility', 'risk', 'structure'] },
  { id: 'ALC-007', action: 'Publicar indicador externo', scope: 'Relatórios e painéis públicos', maxAutomaticAmount: 0, minConfidence: 0.92, requiredRole: 'Gestor de Sustentabilidade', mandatoryHuman: true, twoPersonRule: false, enabled: true, rationale: 'Divulgação externa exige validação de materialidade e responsabilidade institucional.', affectedAgents: ['impact', 'dispatch'] },
  { id: 'ALC-008', action: 'Criar ordem de manutenção preditiva', scope: 'Ativos operacionais não críticos', maxAutomaticAmount: 2_000_000, minConfidence: 0.88, requiredRole: 'Gestor de Ativos', mandatoryHuman: false, twoPersonRule: false, enabled: true, rationale: 'Ordens dentro do orçamento e sem parada operacional podem ser abertas automaticamente.', affectedAgents: ['asset_health'] },
];

export const AGENT_INTEGRATIONS: AgentIntegration[] = [
  { product: 'capital', object: 'Funding, envelopes e covenants', direction: 'bidirecional', status: 'operational', latency: '1,2 s', events24h: 1842 },
  { product: 'carteira', object: 'Oportunidades, scores e prioridades', direction: 'bidirecional', status: 'operational', latency: '820 ms', events24h: 3654 },
  { product: 'estrutura', object: 'Alternativas, cenários e baseline', direction: 'bidirecional', status: 'operational', latency: '1,8 s', events24h: 1248 },
  { product: 'contrata', object: 'Dossiês, riscos, diligências e decisões', direction: 'bidirecional', status: 'operational', latency: '940 ms', events24h: 4720 },
  { product: 'entrega', object: 'Cronogramas, medições e desembolsos', direction: 'bidirecional', status: 'operational', latency: '710 ms', events24h: 8934 },
  { product: 'evidencia', object: 'Evidências, vistorias e cadeia de custódia', direction: 'bidirecional', status: 'operational', latency: '460 ms', events24h: 14882 },
  { product: 'ativos', object: 'Telemetria, saúde e manutenção', direction: 'entrada', status: 'attention', latency: '2,4 s', events24h: 84216 },
  { product: 'impacto', object: 'Indicadores, beneficiários e relatórios', direction: 'bidirecional', status: 'operational', latency: '1,4 s', events24h: 2186 },
  { product: 'data', object: 'Catálogo, linhagem, qualidade e APIs', direction: 'bidirecional', status: 'attention', latency: '3,1 s', events24h: 256430 },
];

export const AGENT_THROUGHPUT = [
  { hora: '08h', iniciadas: 86, concluidas: 78 }, { hora: '10h', iniciadas: 124, concluidas: 119 },
  { hora: '12h', iniciadas: 112, concluidas: 106 }, { hora: '14h', iniciadas: 154, concluidas: 146 },
  { hora: '16h', iniciadas: 138, concluidas: 132 }, { hora: '18h', iniciadas: 172, concluidas: 160 },
  { hora: '20h', iniciadas: 164, concluidas: 151 },
];

export const AGENT_DURATION_BY_TYPE = [
  { agente: 'Funding', segundos: 46 }, { agente: 'Fraude', segundos: 13 }, { agente: 'Elegibilidade', segundos: 662 },
  { agente: 'Risco', segundos: 188 }, { agente: 'Medição', segundos: 183 }, { agente: 'Impacto', segundos: 372 },
  { agente: 'Estruturação', segundos: 1124 },
];

export const AGENT_LIVE_STEPS = [
  { agentId: 'orchestrator', executionId: 'EXE-240721-001', text: 'Orquestrador recebeu 3 novas leituras GNSS da vistoria Vale Verde.', level: 'info' as LogLevel, event: 'stream.received' },
  { agentId: 'inspection', executionId: 'EXE-240721-003', text: 'Agente de Vistoria validou a posição da equipe no trecho T-22.', level: 'success' as LogLevel, event: 'inspection.position.validated' },
  { agentId: 'fraud', executionId: 'EXE-240721-002', text: 'Comparação espacial confirmou desvio de 41 m no trecho T-22.', level: 'warning' as LogLevel, event: 'spatial.anomaly.confirmed' },
  { agentId: 'measurement', executionId: 'EXE-240721-004', text: 'Valor liberável recalculado para R$ 15,7 milhões.', level: 'success' as LogLevel, event: 'disbursement.recalculated' },
  { agentId: 'dispatch', executionId: 'EXE-240721-012', text: 'Minuta de diligência criada com dois itens divergentes.', level: 'info' as LogLevel, event: 'dispatch.draft.created' },
  { agentId: 'orchestrator', executionId: 'EXE-240721-001', text: 'Gate humano de desembolso parcial preparado.', level: 'decision' as LogLevel, event: 'human.gate.ready' },
];
