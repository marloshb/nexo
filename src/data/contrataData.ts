// Dados sintéticos — Nexo Contrata. Registros fictícios para demonstração funcional.

import type { ProductKey } from '@/data/navConfig';

export type ContrataSection = 'overview' | 'queue' | 'risks' | 'committee' | 'workflows' | 'analytics' | 'agents' | 'reports' | 'admin';
export type ContrataDecision = 'aprovar' | 'aprovar_condicionantes' | 'diligenciar' | 'reenquadrar' | 'reprovar' | 'escalar' | 'vistoria' | 'nova_modelagem';
export type AnalysisStatus = 'ok' | 'atencao' | 'critico' | 'pendente';
export type AgentStatus = 'idle' | 'running' | 'waiting' | 'done' | 'alert';

export interface DossieSection {
  id: string;
  label: string;
  status: AnalysisStatus;
  nota: string;
  responsavel: string;
  source: string;
  confidence: number;
  updated: string;
}

export interface QueueItem {
  id: string;
  linkedAssetId?: string;
  structureCaseId: string;
  opportunityId: string;
  operacao: string;
  programa: string;
  setor: string;
  proponente: string;
  funding: string;
  valor: number;
  city: string;
  uf: string;
  etapa: string;
  alcada: string;
  prazoDias: number;
  slaPct: number;
  priority: 'P0' | 'P1' | 'P2';
  criticidade: 'normal' | 'atencao' | 'critico';
  elegibilidadePct: number;
  riskScore: number;
  readiness: number;
  documentsPct: number;
  sections: DossieSection[];
  condicionantes: string[];
  missingDocuments: string[];
  parecer: string;
  decisaoRecomendada: ContrataDecision;
  responsible: string;
  committeeDate: string;
  updated: string;
}

export interface RiskRecord {
  id: string;
  operationId: string;
  operacao: string;
  category: string;
  probability: number;
  impact: number;
  exposure: number;
  status: 'Monitorado' | 'Mitigação' | 'Escalado' | 'Aceito';
  description: string;
  mitigation: string;
  owner: string;
  agent: string;
  due: string;
}

export interface WorkflowCard {
  id: string;
  operationId: string;
  title: string;
  stage: string;
  owner: string;
  due: string;
  priority: 'P0' | 'P1' | 'P2';
  agent: string;
  automation: number;
  waiting: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  vote: 'Aprovar' | 'Aprovar com condicionantes' | 'Diligenciar' | 'Reprovar' | 'Pendente';
  present: boolean;
}

export interface ContrataAgentRuntime {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  entity: string;
  step: string;
  progress: number;
  confidence: number;
  sources: string[];
  recommendation: string;
  impact: string;
  lastRun: string;
  awaiting: string;
  human: string;
}

export const CONTRATA_DECISION_LABEL: Record<ContrataDecision, string> = {
  aprovar: 'Aprovar', aprovar_condicionantes: 'Aprovar com condicionantes', diligenciar: 'Diligenciar',
  reenquadrar: 'Reenquadrar', reprovar: 'Reprovar', escalar: 'Escalar para comitê',
  vistoria: 'Solicitar vistoria', nova_modelagem: 'Solicitar nova modelagem',
};

function sections(values: Array<[string, string, AnalysisStatus, string, string, number]>): DossieSection[] {
  return values.map(([id, label, status, nota, source, confidence]) => ({ id, label, status, nota, source, confidence, responsavel: status === 'ok' ? 'Agente + validação humana' : 'Analista especializado', updated: '21/07/2026 14:20' }));
}

export const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'CTR-2026-0031', linkedAssetId: 'NEXO-ASSET-BR-MG-3106200-MOB-000341', structureCaseId: 'STR-2026-0048', opportunityId: 'OPP-2026-0174',
    operacao: 'Corredor BRT Serra Azul', programa: 'Mobilidade Urbana Sustentável', setor: 'Mobilidade', proponente: 'Região Metropolitana de Belo Horizonte', funding: 'BIRD / Banco Mundial', valor: 355_000_000,
    city: 'Belo Horizonte', uf: 'MG', etapa: 'Condicionantes ambientais', alcada: 'Comitê Regional', prazoDias: 5, slaPct: 82, priority: 'P0', criticidade: 'atencao', elegibilidadePct: 82, riskScore: 68, readiness: 88, documentsPct: 93,
    sections: sections([
      ['op', 'Dados da operação', 'ok', 'Baseline recebida do Nexo Estrutura e identificadores reconciliados.', 'Nexo Estrutura', 98],
      ['prop', 'Proponente', 'ok', 'Capacidade institucional e histórico de execução adequados.', 'Cadastro corporativo', 94],
      ['prog', 'Programa', 'ok', 'Enquadramento programático confirmado.', 'Nexo Capital', 99],
      ['fund', 'Funding', 'ok', 'Elegível à linha de mobilidade urbana do BIRD.', 'Nexo Capital', 97],
      ['gar', 'Garantias', 'ok', 'Contragarantia FPM validada.', 'Sistemas de crédito', 92],
      ['eng', 'Engenharia', 'ok', 'Projeto executivo e custo-base validados.', 'Nexo Estrutura / SINAPI', 95],
      ['terr', 'Território', 'ok', 'Sem sobreposição com áreas restritas.', 'ArcGIS / Living Atlas', 91],
      ['env', 'Meio ambiente', 'atencao', 'Licença de instalação em análise; duas condicionantes abertas.', 'Órgão ambiental', 88],
      ['social', 'Aspectos sociais', 'ok', 'Plano de comunicação e reassentamento aprovados.', 'Princípios do Equador', 90],
      ['clima', 'Risco climático', 'ok', 'Baixa exposição residual após medidas de drenagem.', 'Nexo Estrutura', 89],
      ['cred', 'Crédito', 'ok', 'Capacidade de pagamento e limites atendidos.', 'Motor de crédito', 96],
      ['cond', 'Condicionantes', 'atencao', 'Duas condicionantes ambientais precisam ser vinculadas ao contrato.', 'Nexo Contrata', 98],
    ]),
    condicionantes: ['Plano de manejo de fauna aprovado em até 30 dias', 'Comprovação da compensação ambiental antes do primeiro desembolso'], missingDocuments: ['Ato final da licença de instalação'],
    parecer: 'Operação tecnicamente e financeiramente elegível. A pendência ambiental é mitigável por condicionantes contratuais e não impede a assinatura.', decisaoRecomendada: 'aprovar_condicionantes', responsible: 'Renata Azevedo — Crédito Governo', committeeDate: '22/07/2026 10:00', updated: 'há 4 min',
  },
  {
    id: 'CTR-2026-0034', linkedAssetId: 'NEXO-ASSET-BR-AM-1303403-SAU-000214', structureCaseId: 'STR-2026-0041', opportunityId: 'OPP-2026-0190',
    operacao: 'UBS Fluviais Baixo Amazonas', programa: 'Infraestrutura Social Ribeirinha', setor: 'Saúde', proponente: 'Secretaria Estadual de Saúde do Amazonas', funding: 'Recursos Próprios CAIXA', valor: 71_000_000,
    city: 'Parintins', uf: 'AM', etapa: 'Análise fundiária', alcada: 'Analista sênior', prazoDias: 12, slaPct: 48, priority: 'P1', criticidade: 'normal', elegibilidadePct: 91, riskScore: 34, readiness: 92, documentsPct: 96,
    sections: sections([
      ['op', 'Dados da operação', 'ok', 'Dossiê completo.', 'Nexo Estrutura', 99], ['prop', 'Proponente', 'ok', 'Histórico de execução regular.', 'Cadastro corporativo', 94], ['prog', 'Programa', 'ok', 'Aderente.', 'Nexo Capital', 99], ['fund', 'Funding', 'ok', 'Envelope disponível.', 'Nexo Capital', 97], ['gar', 'Garantias', 'ok', 'Não aplicável.', 'Motor de crédito', 99], ['eng', 'Engenharia', 'ok', 'Alternativa modular selecionada.', 'Nexo Estrutura', 96], ['terr', 'Território', 'atencao', 'Regularização fundiária em 2 dos 12 pontos.', 'ArcGIS / Cartórios', 85], ['env', 'Meio ambiente', 'ok', 'Licenciamento simplificado aplicável.', 'Órgão ambiental', 93], ['social', 'Aspectos sociais', 'ok', 'Consulta ribeirinha concluída.', 'Pesquisa de campo', 91], ['clima', 'Risco climático', 'ok', 'Módulos flutuantes reduzem exposição.', 'Nexo Estrutura', 92], ['cred', 'Crédito', 'ok', 'Não aplicável.', 'Motor de crédito', 99], ['cond', 'Condicionantes', 'atencao', 'Pendência fundiária controlada.', 'Nexo Contrata', 93],
    ]),
    condicionantes: ['Concluir regularização fundiária em dois pontos antes da implantação local'], missingDocuments: [], parecer: 'Elegibilidade elevada. A regularização pendente pode ser tratada por condição precedente específica sem afetar os demais dez pontos.', decisaoRecomendada: 'aprovar_condicionantes', responsible: 'Paulo Mendonça — Infraestrutura Social', committeeDate: '23/07/2026 14:00', updated: 'há 12 min',
  },
  {
    id: 'CTR-2026-0037', linkedAssetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000442', structureCaseId: 'STR-2026-0052', opportunityId: 'OPP-2026-0162',
    operacao: 'Expansão Complexo Eólico Costa Branca', programa: 'Energias Renováveis e Transição Justa', setor: 'Energia', proponente: 'Consórcio Costa Branca Energia', funding: 'Green Bond 2034', valor: 290_000_000,
    city: 'Mossoró', uf: 'RN', etapa: 'Parecer de crédito', alcada: 'Comitê de Crédito', prazoDias: 3, slaPct: 74, priority: 'P0', criticidade: 'normal', elegibilidadePct: 96, riskScore: 22, readiness: 95, documentsPct: 100,
    sections: sections([
      ['op', 'Dados da operação', 'ok', 'Completo.', 'Nexo Estrutura', 99], ['prop', 'Proponente', 'ok', 'Operador com ativo saudável.', 'Nexo Ativos', 96], ['prog', 'Programa', 'ok', 'Aderente.', 'Nexo Capital', 99], ['fund', 'Funding', 'ok', 'Elegível à taxonomia e ao Green Bond.', 'Nexo Capital', 98], ['gar', 'Garantias', 'ok', 'Recebíveis da primeira fase.', 'Motor de crédito', 94], ['eng', 'Engenharia', 'ok', 'Expansão de parque existente.', 'Nexo Estrutura', 97], ['terr', 'Território', 'ok', 'Área contígua já licenciada.', 'ArcGIS', 94], ['env', 'Meio ambiente', 'ok', 'Aditivo de licença protocolado.', 'Princípios do Equador', 92], ['social', 'Aspectos sociais', 'ok', 'Programa social vigente.', 'MRV socioambiental', 91], ['clima', 'Risco climático', 'ok', 'Exposição baixa.', 'Nexo Estrutura', 90], ['cred', 'Crédito', 'ok', 'Fluxo suporta nova dívida.', 'Motor de crédito', 96], ['cond', 'Condicionantes', 'ok', 'Sem pendências críticas.', 'Nexo Contrata', 99],
    ]),
    condicionantes: [], missingDocuments: [], parecer: 'Operação de baixo risco, aderente ao funding sustentável e apoiada por desempenho comprovado da primeira fase.', decisaoRecomendada: 'aprovar', responsible: 'Luciana Prado — Project Finance', committeeDate: '21/07/2026 16:30', updated: 'agora',
  },
  {
    id: 'CTR-2026-0039', linkedAssetId: 'NEXO-ASSET-BR-BA-2927408-AGU-000377', structureCaseId: 'STR-2026-0044', opportunityId: 'OPP-2026-0183',
    operacao: 'Sistema Adutor Chapada Norte', programa: 'Segurança Hídrica do Semiárido', setor: 'Saneamento', proponente: 'Governo do Estado da Bahia', funding: 'BID Infraestrutura Resiliente', valor: 340_000_000,
    city: 'Salvador', uf: 'BA', etapa: 'Análise ambiental', alcada: 'Comitê Regional', prazoDias: 21, slaPct: 61, priority: 'P1', criticidade: 'critico', elegibilidadePct: 68, riskScore: 84, readiness: 72, documentsPct: 76,
    sections: sections([
      ['op', 'Dados da operação', 'ok', 'Completo.', 'Nexo Estrutura', 98], ['prop', 'Proponente', 'ok', 'Capacidade adequada.', 'Cadastro corporativo', 93], ['prog', 'Programa', 'ok', 'Aderente.', 'Nexo Capital', 99], ['fund', 'Funding', 'atencao', 'Concentração elevada da linha BID na UF.', 'Nexo Capital', 90], ['gar', 'Garantias', 'ok', 'Contragarantia em análise final.', 'Motor de crédito', 91], ['eng', 'Engenharia', 'atencao', 'Traçado alternativo ainda em avaliação.', 'Nexo Estrutura', 86], ['terr', 'Território', 'atencao', 'Sobreposição parcial com APA.', 'ArcGIS / ICMBio', 94], ['env', 'Meio ambiente', 'critico', 'EIA incompleto.', 'Princípios do Equador', 97], ['social', 'Aspectos sociais', 'ok', 'Consulta pública realizada.', 'MRV social', 89], ['clima', 'Risco climático', 'ok', 'Projeto reduz risco de seca.', 'Nexo Estrutura', 90], ['cred', 'Crédito', 'ok', 'Capacidade estadual suficiente.', 'Motor de crédito', 94], ['cond', 'Condicionantes', 'critico', 'Três condicionantes críticas.', 'Nexo Contrata', 98],
    ]),
    condicionantes: ['Concluir EIA/RIMA', 'Definir traçado final', 'Obter anuência do órgão gestor da APA'], missingDocuments: ['EIA/RIMA completo', 'Anuência da APA', 'Memorial do traçado final'], parecer: 'A operação não deve seguir para decisão enquanto as lacunas ambientais e locacionais permanecerem abertas.', decisaoRecomendada: 'diligenciar', responsible: 'Marcelo Brito — Risco Socioambiental', committeeDate: 'A definir', updated: 'há 7 min',
  },
  {
    id: 'CTR-2026-0042', linkedAssetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', structureCaseId: 'STR-2026-0057', opportunityId: 'OPP-2026-0201',
    operacao: 'Residencial Horizonte Azul — fase 2', programa: 'Habitação Urbana Integrada', setor: 'Habitação', proponente: 'Município do Recife', funding: 'FGTS Habitação', valor: 212_000_000,
    city: 'Recife', uf: 'PE', etapa: 'Consolidação de pareceres', alcada: 'Comitê Habitação', prazoDias: 8, slaPct: 88, priority: 'P0', criticidade: 'atencao', elegibilidadePct: 79, riskScore: 63, readiness: 83, documentsPct: 90,
    sections: sections([
      ['op', 'Dados da operação', 'ok', 'Completo.', 'SIOPI', 98], ['prop', 'Proponente', 'ok', 'Regular.', 'Cadastro corporativo', 94], ['prog', 'Programa', 'ok', 'Aderente.', 'Nexo Capital', 99], ['fund', 'Funding', 'ok', 'Envelope FGTS disponível.', 'Nexo Capital', 96], ['gar', 'Garantias', 'ok', 'Estrutura padrão.', 'SIOPI', 96], ['eng', 'Engenharia', 'ok', 'Projeto aprovado.', 'SIOPI / SINAPI', 94], ['terr', 'Território', 'atencao', 'Acesso viário complementar não contratado.', 'ArcGIS', 92], ['env', 'Meio ambiente', 'ok', 'Licenças válidas.', 'Órgão ambiental', 95], ['social', 'Aspectos sociais', 'atencao', 'Plano de mobilidade local pendente.', 'Princípios do Equador', 87], ['clima', 'Risco climático', 'ok', 'Cota de implantação adequada.', 'Nexo Estrutura', 90], ['cred', 'Crédito', 'ok', 'Estrutura financeira aprovada.', 'SIOPI', 96], ['cond', 'Condicionantes', 'atencao', 'Funcionalidade urbana depende do acesso.', 'Nexo Contrata', 95],
    ]),
    condicionantes: ['Contratar acesso viário antes de 40% de execução', 'Apresentar plano de transporte coletivo'], missingDocuments: ['Plano operacional de transporte'], parecer: 'A operação é elegível, mas a funcionalidade urbana requer condicionantes vinculantes de acesso e transporte.', decisaoRecomendada: 'aprovar_condicionantes', responsible: 'Carla Nunes — Habitação', committeeDate: '22/07/2026 15:00', updated: 'há 18 min',
  },
];

export const CONTRATA_RISKS: RiskRecord[] = [
  { id: 'RSK-101', operationId: 'CTR-2026-0039', operacao: 'Sistema Adutor Chapada Norte', category: 'Socioambiental', probability: 5, impact: 5, exposure: 340_000_000, status: 'Escalado', description: 'EIA/RIMA incompleto e sobreposição com APA.', mitigation: 'Concluir estudo, revisar traçado e obter anuência.', owner: 'Marcelo Brito', agent: 'Agente Socioambiental e Climático', due: '31/07/2026' },
  { id: 'RSK-102', operationId: 'CTR-2026-0031', operacao: 'Corredor BRT Serra Azul', category: 'Ambiental', probability: 3, impact: 4, exposure: 58_000_000, status: 'Mitigação', description: 'Duas condicionantes da licença ainda abertas.', mitigation: 'Vincular condições precedentes e evidências.', owner: 'Renata Azevedo', agent: 'Agente de Condicionantes', due: '20/08/2026' },
  { id: 'RSK-103', operationId: 'CTR-2026-0042', operacao: 'Residencial Horizonte Azul — fase 2', category: 'Funcionalidade', probability: 4, impact: 4, exposure: 46_000_000, status: 'Mitigação', description: 'Acesso viário e transporte podem comprometer ocupação.', mitigation: 'Condicionar execução ao cronograma de acessos.', owner: 'Carla Nunes', agent: 'Agente Territorial', due: '15/08/2026' },
  { id: 'RSK-104', operationId: 'CTR-2026-0034', operacao: 'UBS Fluviais Baixo Amazonas', category: 'Fundiário', probability: 2, impact: 3, exposure: 12_000_000, status: 'Monitorado', description: 'Dois pontos sem regularização final.', mitigation: 'Segregar implantação até regularização.', owner: 'Paulo Mendonça', agent: 'Agente Fundiário', due: '10/09/2026' },
  { id: 'RSK-105', operationId: 'CTR-2026-0037', operacao: 'Expansão Complexo Eólico Costa Branca', category: 'Crédito', probability: 1, impact: 4, exposure: 29_000_000, status: 'Aceito', description: 'Concentração setorial moderada.', mitigation: 'Monitorar DSCR e recebíveis.', owner: 'Luciana Prado', agent: 'Agente de Crédito', due: 'Trimestral' },
];

export const WORKFLOW_COLUMNS = ['Entrada', 'Triagem automática', 'Análise especializada', 'Diligência', 'Decisão humana', 'Formalização'] as const;
export const CONTRATA_WORKFLOWS: WorkflowCard[] = [
  { id: 'WF-201', operationId: 'CTR-2026-0042', title: 'Validar plano de transporte', stage: 'Entrada', owner: 'Carla Nunes', due: 'Hoje 17:00', priority: 'P0', agent: 'Agente Documental', automation: 35, waiting: 'Documento do município' },
  { id: 'WF-202', operationId: 'CTR-2026-0034', title: 'Reconciliar matrículas dos pontos 7 e 9', stage: 'Triagem automática', owner: 'Paulo Mendonça', due: 'Amanhã 10:00', priority: 'P1', agent: 'Agente Fundiário', automation: 82, waiting: 'Consulta cartorial' },
  { id: 'WF-203', operationId: 'CTR-2026-0039', title: 'Analisar alternativa de traçado', stage: 'Análise especializada', owner: 'Marcelo Brito', due: '26/07', priority: 'P0', agent: 'Agente Territorial', automation: 64, waiting: 'Parecer ambiental' },
  { id: 'WF-204', operationId: 'CTR-2026-0031', title: 'Emitir diligência de licença', stage: 'Diligência', owner: 'Renata Azevedo', due: 'Hoje 15:30', priority: 'P1', agent: 'Agente de Despachos', automation: 91, waiting: 'Revisão humana' },
  { id: 'WF-205', operationId: 'CTR-2026-0037', title: 'Deliberar operação Green Bond', stage: 'Decisão humana', owner: 'Comitê de Crédito', due: 'Hoje 16:30', priority: 'P0', agent: 'Orquestrador', automation: 76, waiting: 'Voto do comitê' },
  { id: 'WF-206', operationId: 'CTR-2026-0028', title: 'Gerar baseline contratual', stage: 'Formalização', owner: 'Backoffice de Contratação', due: 'Hoje 18:00', priority: 'P1', agent: 'Agente de Baseline', automation: 94, waiting: 'Assinatura digital' },
];

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  { id: 'M1', name: 'Helena Martins', role: 'Presidente do Comitê', vote: 'Pendente', present: true },
  { id: 'M2', name: 'Ricardo Alves', role: 'Riscos', vote: 'Pendente', present: true },
  { id: 'M3', name: 'Fernanda Costa', role: 'Negócios de Governo', vote: 'Pendente', present: true },
  { id: 'M4', name: 'Bruno Sampaio', role: 'Jurídico', vote: 'Pendente', present: true },
  { id: 'M5', name: 'Marina Teixeira', role: 'Sustentabilidade', vote: 'Pendente', present: false },
];

export const CONTRATA_AGENTS: ContrataAgentRuntime[] = [
  { id: 'orq', name: 'Orquestrador de Contratação', icon: 'Workflow', status: 'running', entity: 'Fila corporativa · 5 operações', step: 'Distribuindo análises e reconciliando dependências', progress: 68, confidence: 96, sources: ['Nexo Estrutura', 'Nexo Capital', 'Motor de Crédito'], recommendation: 'Priorizar Costa Branca e BRT Serra Azul para decisão hoje.', impact: 'R$ 645 mi em pauta', lastRun: 'agora', awaiting: 'Conclusão dos agentes especializados', human: 'Gestor da carteira' },
  { id: 'elig', name: 'Agente de Elegibilidade', icon: 'ListChecks', status: 'running', entity: 'Corredor BRT Serra Azul', step: 'Validando 47 regras programáticas e financeiras', progress: 78, confidence: 94, sources: ['Programa BIRD', 'Nexo Capital', 'Dossiê'], recommendation: 'Aprovar com duas condicionantes ambientais.', impact: '82% elegível', lastRun: 'há 8 s', awaiting: 'Validação do especialista ambiental', human: 'Renata Azevedo' },
  { id: 'doc', name: 'Agente Documental e Inconsistências', icon: 'FileSearch', status: 'alert', entity: 'Sistema Adutor Chapada Norte', step: 'Três documentos críticos ausentes ou incompletos', progress: 100, confidence: 98, sources: ['GED', 'Assinaturas ICP', 'Transferegov'], recommendation: 'Emitir diligência consolidada e suspender o SLA decisório.', impact: '3 lacunas críticas', lastRun: 'há 22 s', awaiting: 'Revisão da minuta', human: 'Marcelo Brito' },
  { id: 'risk', name: 'Agente de Risco Integrado', icon: 'ShieldAlert', status: 'running', entity: 'Carteira Contrata', step: 'Atualizando matriz de risco e exposição financeira', progress: 51, confidence: 91, sources: ['Risco crédito', 'ArcGIS', 'Princípios do Equador'], recommendation: 'Escalar risco socioambiental da Adutora Chapada Norte.', impact: 'R$ 340 mi expostos', lastRun: 'há 5 s', awaiting: 'Parecer socioambiental', human: 'Diretoria de Riscos' },
  { id: 'dispatch', name: 'Agente de Despachos e Diligências', icon: 'Send', status: 'waiting', entity: 'BRT Serra Azul', step: 'Minuta preparada a partir dos modelos oficiais', progress: 92, confidence: 95, sources: ['Modelos oficiais', 'Parecer consolidado', 'Condicionantes'], recommendation: 'Enviar solicitação do ato final da licença.', impact: '−4 dias de retrabalho', lastRun: 'há 1 min', awaiting: 'Aprovação humana para envio', human: 'Renata Azevedo' },
  { id: 'baseline', name: 'Agente de Baseline Contratual', icon: 'PackageCheck', status: 'idle', entity: 'Costa Branca · CTR-2026-0037', step: 'Aguardando decisão do comitê', progress: 0, confidence: 97, sources: ['Nexo Estrutura', 'Nexo Capital', 'Pareceres'], recommendation: 'Gerar baseline imediatamente após aprovação.', impact: 'Prazo estimado: 4 min', lastRun: 'aguardando', awaiting: 'Decisão humana', human: 'Comitê de Crédito' },
];

export const ANALYTICS_TREND = [
  { mes: 'Fev', entradas: 22, aprovadas: 14, diligencias: 6, tempo: 23 }, { mes: 'Mar', entradas: 28, aprovadas: 19, diligencias: 7, tempo: 21 }, { mes: 'Abr', entradas: 31, aprovadas: 23, diligencias: 5, tempo: 19 }, { mes: 'Mai', entradas: 34, aprovadas: 26, diligencias: 6, tempo: 18 }, { mes: 'Jun', entradas: 39, aprovadas: 31, diligencias: 5, tempo: 16 }, { mes: 'Jul', entradas: 42, aprovadas: 34, diligencias: 6, tempo: 14 },
];

export const BOTTLENECKS = [
  { name: 'Licenciamento ambiental', days: 27, volume: 680_000_000, share: 31 }, { name: 'Regularização fundiária', days: 22, volume: 410_000_000, share: 24 }, { name: 'Garantias e contragarantias', days: 15, volume: 290_000_000, share: 18 }, { name: 'Projeto executivo', days: 12, volume: 185_000_000, share: 14 }, { name: 'Documentação fiscal', days: 8, volume: 96_000_000, share: 8 },
];

export const CONTRATA_REPORTS = [
  { id: 'REP-C01', name: 'Carteira Executiva de Contratações', cadence: 'Semanal', audience: 'Presidência e VPs', format: 'PDF + XLSX' },
  { id: 'REP-C02', name: 'Riscos, Condicionantes e Exposição', cadence: 'Diário', audience: 'Riscos e Governo', format: 'PDF' },
  { id: 'REP-C03', name: 'Agenda do Comitê de Crédito', cadence: 'Sob demanda', audience: 'Comitê', format: 'Pacote executivo' },
  { id: 'REP-C04', name: 'SLA e Produtividade da Esteira', cadence: 'Mensal', audience: 'Operações', format: 'XLSX + dashboard' },
  { id: 'REP-C05', name: 'Baseline e Condições Precedentes', cadence: 'Por operação', audience: 'Entrega e Jurídico', format: 'PDF assinado' },
];

export const CONTRATA_ADMIN_RULES = [
  { id: 'R1', name: 'Gate humano obrigatório', description: 'Aprovação, reprovação, suspensão e alteração contratual exigem decisão humana.', category: 'Governança', critical: true },
  { id: 'R2', name: 'Escalonamento por valor', description: 'Operações acima de R$ 250 milhões seguem para Comitê de Crédito.', category: 'Alçadas', critical: true },
  { id: 'R3', name: 'Bloqueio socioambiental', description: 'Risco socioambiental crítico impede contratação até mitigação.', category: 'Riscos', critical: true },
  { id: 'R4', name: 'Validação territorial obrigatória', description: 'Operações de infraestrutura exigem geometria e análise ArcGIS.', category: 'Dados', critical: false },
  { id: 'R5', name: 'Diligência consolidada', description: 'O sistema agrupa pendências para evitar solicitações fragmentadas.', category: 'Produtividade', critical: false },
  { id: 'R6', name: 'Baseline automática', description: 'Decisão aprovada gera baseline e plano de evidências.', category: 'Automação', critical: false },
];

export const CONTRATA_INTEGRATIONS: Array<{ name: string; product: ProductKey | 'externo'; object: string; direction: string; status: string }> = [
  { name: 'Nexo Estrutura', product: 'estrutura', object: 'Alternativa homologada, baseline técnica e cenários', direction: 'Entrada', status: 'Operacional' },
  { name: 'Nexo Capital', product: 'capital', object: 'Funding, elegibilidade, covenants e envelopes', direction: 'Bidirecional', status: 'Operacional' },
  { name: 'Nexo Carteira', product: 'carteira', object: 'Oportunidade, prioridade e contexto territorial', direction: 'Entrada', status: 'Operacional' },
  { name: 'Nexo Entrega', product: 'entrega', object: 'Baseline contratual, condições precedentes e plano de evidências', direction: 'Saída', status: 'Operacional' },
  { name: 'Nexo Evidência', product: 'evidencia', object: 'Vistorias, evidências e cadeia de custódia', direction: 'Bidirecional', status: 'Operacional' },
  { name: 'SIOPI / Crédito / GED', product: 'externo', object: 'Propostas, pareceres, documentos e decisões oficiais', direction: 'Bidirecional', status: 'Sincronizado' },
];
