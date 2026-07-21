// Dados sintéticos — Nexo Impacto. Todos os nomes, valores e identificadores são fictícios.

export type ImpactoSection = 'overview' | 'indicators' | 'beneficiaries' | 'map' | 'reports' | 'admin';
export type IndicatorStatus = 'validado' | 'divergente' | 'pendente' | 'em_validacao';
export type ImpactDimension = 'Social' | 'Ambiental' | 'Econômica' | 'Climática' | 'Territorial';
export type ResultLevel = 'Insumo' | 'Atividade' | 'Produto' | 'Serviço' | 'Resultado' | 'Impacto';

export interface Indicator {
  id: string;
  nome: string;
  descricao: string;
  unidade: string;
  formula: string;
  dimensao: ImpactDimension;
  nivelCadeia: ResultLevel;
  ativoId: string;
  ativo: string;
  baseline: number;
  meta: number;
  realizado: number;
  territorio: string;
  periodicidade: string;
  fonte: string;
  metodo: string;
  responsavel: string;
  tolerancia: string;
  status: IndicatorStatus;
  confidence: number;
  evidenceCount: number;
  lastUpdate: string;
  framework: string[];
  trend: 'up' | 'down' | 'stable';
  materiality: 'alta' | 'média' | 'baixa';
  verification: 'automática' | 'amostral' | 'terceiro' | 'humana';
}

export interface BeneficiarySegment {
  name: string;
  previsto: number;
  comprovado: number;
  share: number;
  confidence: number;
  color: string;
}

export interface AssetImpactSummary {
  assetId: string;
  asset: string;
  uf: string;
  setor: string;
  valor: number;
  beneficiariosPrevistos: number;
  beneficiariosComprovados: number;
  impactoScore: number;
  confidence: number;
  social: number;
  ambiental: number;
  economica: number;
  climatica: number;
  territorial: number;
  status: 'normal' | 'atencao' | 'critico' | 'pendente';
  keyOutcome: string;
  nextAction: string;
}

export interface ImpactAgentRuntime {
  id: string;
  name: string;
  function: string;
  entity: string;
  status: 'idle' | 'running' | 'waiting' | 'done' | 'alert';
  progress: number;
  stage: string;
  confidence: number;
  impact: string;
  recommendation: string;
  sources: string[];
  humanOwner: string;
}

export interface ImpactReport {
  id: string;
  title: string;
  audience: string;
  period: string;
  framework: string;
  status: 'pronto' | 'em_revisao' | 'agendado' | 'rascunho';
  indicators: number;
  assets: number;
  lastGenerated: string;
  format: 'PDF' | 'XLSX' | 'Dashboard' | 'API';
}

export interface ImpactIntegration {
  id: string;
  name: string;
  direction: string;
  objects: string;
  method: string;
  frequency: string;
  latency: string;
  status: 'operational' | 'attention' | 'error';
  lastSync: string;
  agents: string[];
}

export interface ImpactRule {
  id: string;
  name: string;
  description: string;
  value: string;
  enabled: boolean;
  scope: string;
}

export const RESULT_CHAIN: ResultLevel[] = ['Insumo', 'Atividade', 'Produto', 'Serviço', 'Resultado', 'Impacto'];

export const INDICATORS: Indicator[] = [
  {
    id: 'IND-001', nome: 'Beneficiários com água segura', descricao: 'População com acesso contínuo a água tratada e pressão mínima de serviço.',
    unidade: 'pessoas', formula: 'Domicílios conectados × habitantes/domicílio, ajustado por continuidade', dimensao: 'Social', nivelCadeia: 'Resultado',
    ativoId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', ativo: 'Adutora Sertão Vivo', baseline: 0, meta: 310_000, realizado: 296_000, territorio: 'Iguatu e região — CE',
    periodicidade: 'Trimestral', fonte: 'Pesquisa domiciliar + telemetria de vazão', metodo: 'Amostragem estatística e validação cruzada',
    responsavel: 'Juliana Prado', tolerancia: '±3%', status: 'validado', confidence: 0.96, evidenceCount: 184, lastUpdate: '2026-07-18',
    framework: ['ODS 6', 'Taxonomia Social CAIXA', 'BID'], trend: 'up', materiality: 'alta', verification: 'amostral',
  },
  {
    id: 'IND-002', nome: 'Empregos gerados na operação', descricao: 'Postos de trabalho diretos e indiretos mantidos pela operação do ativo.',
    unidade: 'empregos', formula: 'Folha do operador + fornecedores diretos, sem dupla contagem', dimensao: 'Econômica', nivelCadeia: 'Resultado',
    ativoId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', baseline: 0, meta: 1_200, realizado: 1_340, territorio: 'Litoral Norte — RN',
    periodicidade: 'Anual', fonte: 'RAIS + declaração do operador', metodo: 'Conciliação com cadastro do operador', responsavel: 'Tiago Almeida',
    tolerancia: '±5%', status: 'validado', confidence: 0.93, evidenceCount: 37, lastUpdate: '2026-07-15', framework: ['ODS 8', 'Green Bond Framework'],
    trend: 'up', materiality: 'média', verification: 'terceiro',
  },
  {
    id: 'IND-003', nome: 'Domicílios atendidos por esgotamento', descricao: 'Domicílios com ligação ativa, operante e conectada ao sistema de tratamento.',
    unidade: 'domicílios', formula: 'Ligações ativas validadas × fator de operacionalidade', dimensao: 'Social', nivelCadeia: 'Serviço',
    ativoId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', ativo: 'Sistema Integrado de Esgotamento Vale Verde', baseline: 0, meta: 58_000, realizado: 0, territorio: 'São José dos Campos — SP',
    periodicidade: 'Mensal', fonte: 'Cadastro técnico da concessionária', metodo: 'Contagem direta com auditoria amostral', responsavel: 'Ana Beatriz Souza',
    tolerancia: '±2%', status: 'pendente', confidence: 0.42, evidenceCount: 28, lastUpdate: '2026-07-20', framework: ['ODS 6', 'FGTS Saneamento'],
    trend: 'stable', materiality: 'alta', verification: 'automática',
  },
  {
    id: 'IND-004', nome: 'Matrículas em cursos técnicos', descricao: 'Alunos matriculados e com frequência mínima nos cursos ofertados.',
    unidade: 'matrículas', formula: 'Matrículas ativas com frequência ≥ 75%', dimensao: 'Social', nivelCadeia: 'Serviço',
    ativoId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', ativo: 'Escola Técnica Cerrado', baseline: 0, meta: 2_400, realizado: 1_150, territorio: 'Goiânia — GO',
    periodicidade: 'Semestral', fonte: 'Sistema acadêmico', metodo: 'Extração direta com deduplicação', responsavel: 'Bruno Castro', tolerancia: '±1%',
    status: 'em_validacao', confidence: 0.82, evidenceCount: 14, lastUpdate: '2026-07-16', framework: ['ODS 4', 'Taxonomia Social CAIXA'], trend: 'up', materiality: 'média', verification: 'automática',
  },
  {
    id: 'IND-005', nome: 'Emissões evitadas', descricao: 'Emissões de CO₂e evitadas pela geração eólica frente à matriz marginal.',
    unidade: 'tCO₂e/ano', formula: 'Energia líquida gerada × fator de emissão marginal do SIN', dimensao: 'Climática', nivelCadeia: 'Impacto',
    ativoId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', baseline: 0, meta: 410_000, realizado: 447_000, territorio: 'Litoral Norte — RN',
    periodicidade: 'Anual', fonte: 'ONS + SCADA do operador', metodo: 'Metodologia MDL adaptada', responsavel: 'Tiago Almeida', tolerancia: '±8%',
    status: 'validado', confidence: 0.97, evidenceCount: 365, lastUpdate: '2026-07-20', framework: ['Green Bond', 'ODS 7', 'Taxonomia Sustentável Brasileira'], trend: 'up', materiality: 'alta', verification: 'automática',
  },
  {
    id: 'IND-006', nome: 'População com exposição a inundação reduzida', descricao: 'População que migra de classes de risco alto/muito alto para risco moderado ou baixo.',
    unidade: 'pessoas', formula: 'População na mancha de risco pré − população na mancha pós-intervenção', dimensao: 'Climática', nivelCadeia: 'Impacto',
    ativoId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', ativo: 'Programa de Macrodrenagem Rio Norte', baseline: 340_000, meta: 238_000, realizado: 0, territorio: 'RM Belém — PA',
    periodicidade: 'Anual', fonte: 'Modelo hidrológico + IBGE + CEMADEN', metodo: 'Comparação de cenários e validação pós-evento', responsavel: 'Fernanda Ribeiro',
    tolerancia: '±10%', status: 'pendente', confidence: 0.38, evidenceCount: 12, lastUpdate: '2026-07-20', framework: ['ODS 11', 'BID', 'Adaptação Climática'], trend: 'stable', materiality: 'alta', verification: 'humana',
  },
  {
    id: 'IND-007', nome: 'Unidades habitacionais funcionalmente entregues', descricao: 'Unidades concluídas, habitáveis e conectadas a transporte e serviços urbanos.',
    unidade: 'unidades', formula: 'Habite-se válido × checklist de funcionalidade urbana', dimensao: 'Territorial', nivelCadeia: 'Resultado',
    ativoId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', ativo: 'Residencial Horizonte Azul', baseline: 0, meta: 1_240, realizado: 0, territorio: 'Recife — PE',
    periodicidade: 'Mensal', fonte: 'Cadastro da construtora + vistoria + rede de transporte', metodo: 'Validação física e territorial', responsavel: 'Carlos Eduardo Lima',
    tolerancia: '±1%', status: 'divergente', confidence: 0.68, evidenceCount: 91, lastUpdate: '2026-07-19', framework: ['ODS 11', 'Selo Casa Azul'], trend: 'down', materiality: 'alta', verification: 'humana',
  },
  {
    id: 'IND-008', nome: 'Disponibilidade operacional dos ativos', descricao: 'Percentual do tempo em que o ativo permanece apto a prestar o serviço.',
    unidade: '%', formula: 'Horas disponíveis / horas calendário', dimensao: 'Econômica', nivelCadeia: 'Serviço',
    ativoId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', ativo: 'Complexo Eólico Costa Branca', baseline: 0.92, meta: 0.97, realizado: 0.965, territorio: 'Litoral Norte — RN',
    periodicidade: 'Mensal', fonte: 'SCADA + CMMS', metodo: 'Cálculo automático por ativo', responsavel: 'Nexo Ativos', tolerancia: '±0,5 p.p.',
    status: 'validado', confidence: 0.99, evidenceCount: 7_884, lastUpdate: '2026-07-21', framework: ['Asset Management', 'Green Bond'], trend: 'stable', materiality: 'alta', verification: 'automática',
  },
  {
    id: 'IND-009', nome: 'Redução do custo de deslocamento', descricao: 'Economia média mensal de tempo e tarifa para usuários atendidos pelo corredor.',
    unidade: 'R$/usuário.mês', formula: 'Custo generalizado antes − custo generalizado depois', dimensao: 'Econômica', nivelCadeia: 'Impacto',
    ativoId: 'NEXO-ASSET-BR-MG-3106200-MOB-000341', ativo: 'Corredor BRT Serra Azul', baseline: 0, meta: 148, realizado: 0, territorio: 'RMBH — MG',
    periodicidade: 'Semestral', fonte: 'Pesquisa origem-destino + bilhetagem', metodo: 'Modelo de acessibilidade', responsavel: 'Rodrigo Nakamura', tolerancia: '±7%',
    status: 'pendente', confidence: 0.31, evidenceCount: 4, lastUpdate: '2026-07-14', framework: ['ODS 11', 'BIRD'], trend: 'stable', materiality: 'média', verification: 'amostral',
  },
];

export const ASSET_IMPACT: AssetImpactSummary[] = [
  { assetId: 'NEXO-ASSET-BR-CE-2307304-AGU-000077', asset: 'Adutora Sertão Vivo', uf: 'CE', setor: 'Recursos Hídricos', valor: 298_000_000, beneficiariosPrevistos: 310_000, beneficiariosComprovados: 296_000, impactoScore: 92, confidence: 0.96, social: 96, ambiental: 78, economica: 83, climatica: 88, territorial: 91, status: 'normal', keyOutcome: '95,5% da população-alvo com serviço comprovado.', nextAction: 'Renovar amostra domiciliar no 4º trimestre.' },
  { assetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', asset: 'Complexo Eólico Costa Branca', uf: 'RN', setor: 'Energia', valor: 740_000_000, beneficiariosPrevistos: 890_000, beneficiariosComprovados: 890_000, impactoScore: 94, confidence: 0.97, social: 79, ambiental: 97, economica: 91, climatica: 98, territorial: 82, status: 'normal', keyOutcome: '447 mil tCO₂e evitadas e 1.340 empregos.', nextAction: 'Emitir relatório anual do Green Bond.' },
  { assetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', asset: 'Escola Técnica Cerrado', uf: 'GO', setor: 'Educação', valor: 42_000_000, beneficiariosPrevistos: 2_400, beneficiariosComprovados: 1_150, impactoScore: 71, confidence: 0.82, social: 84, ambiental: 52, economica: 76, climatica: 47, territorial: 80, status: 'atencao', keyOutcome: '48% da meta de matrículas comprovada no primeiro ciclo.', nextAction: 'Validar frequência e permanência dos estudantes.' },
  { assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', asset: 'Residencial Horizonte Azul', uf: 'PE', setor: 'Habitação', valor: 186_000_000, beneficiariosPrevistos: 4_960, beneficiariosComprovados: 0, impactoScore: 46, confidence: 0.68, social: 61, ambiental: 66, economica: 54, climatica: 58, territorial: 29, status: 'critico', keyOutcome: 'Obra avançada, mas funcionalidade urbana ainda não comprovada.', nextAction: 'Resolver acesso viário e transporte antes do reconhecimento.' },
  { assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', asset: 'Sistema Integrado de Esgotamento Vale Verde', uf: 'SP', setor: 'Saneamento', valor: 480_000_000, beneficiariosPrevistos: 210_000, beneficiariosComprovados: 0, impactoScore: 39, confidence: 0.42, social: 63, ambiental: 72, economica: 41, climatica: 55, territorial: 69, status: 'critico', keyOutcome: 'Impacto ainda não reconhecível durante a execução.', nextAction: 'Concluir medição e plano de comissionamento.' },
  { assetId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', asset: 'Programa de Macrodrenagem Rio Norte', uf: 'PA', setor: 'Drenagem', valor: 612_000_000, beneficiariosPrevistos: 340_000, beneficiariosComprovados: 0, impactoScore: 44, confidence: 0.38, social: 58, ambiental: 76, economica: 49, climatica: 64, territorial: 71, status: 'atencao', keyOutcome: 'Benefício climático projetado, ainda sem validação pós-evento.', nextAction: 'Atualizar modelo hidrológico após reprogramação.' },
];

export const BENEFICIARY_SEGMENTS: BeneficiarySegment[] = [
  { name: 'Famílias de baixa renda', previsto: 462_000, comprovado: 386_500, share: 0.36, confidence: 0.92, color: '#1584D1' },
  { name: 'População rural', previsto: 320_000, comprovado: 296_000, share: 0.28, confidence: 0.96, color: '#0FA39D' },
  { name: 'Mulheres responsáveis pelo domicílio', previsto: 188_000, comprovado: 153_800, share: 0.17, confidence: 0.89, color: '#7C5CBF' },
  { name: 'Crianças e adolescentes', previsto: 142_000, comprovado: 111_300, share: 0.12, confidence: 0.86, color: '#E5A11A' },
  { name: 'Pessoas idosas ou com deficiência', previsto: 81_000, comprovado: 64_900, share: 0.07, confidence: 0.84, color: '#18B7D6' },
];

export const BENEFICIARY_TERRITORIES = [
  { territorio: 'Nordeste', previsto: 1_210_000, comprovado: 1_186_000, cobertura: 0.98 },
  { territorio: 'Centro-Oeste', previsto: 72_000, comprovado: 46_150, cobertura: 0.64 },
  { territorio: 'Sudeste', previsto: 690_000, comprovado: 0, cobertura: 0 },
  { territorio: 'Norte', previsto: 398_000, comprovado: 0, cobertura: 0 },
];

export const IMPACT_TIME_SERIES = [
  { ano: '2022', previsto: 320_000, comprovado: 180_000 },
  { ano: '2023', previsto: 810_000, comprovado: 640_000 },
  { ano: '2024', previsto: 1_450_000, comprovado: 1_190_000 },
  { ano: '2025', previsto: 2_260_000, comprovado: 1_870_000 },
  { ano: '2026', previsto: 3_850_000, comprovado: 2_390_000 },
];

export const IMPACT_DIMENSION_DISTRIBUTION = [
  { name: 'Social', value: 38, fill: '#1584D1' },
  { name: 'Climática', value: 24, fill: '#0FA39D' },
  { name: 'Econômica', value: 17, fill: '#E5A11A' },
  { name: 'Territorial', value: 13, fill: '#7C5CBF' },
  { name: 'Ambiental', value: 8, fill: '#18B7D6' },
];

export const IMPACT_VALUE_SERIES = [
  { periodo: '1T25', esperado: 62, verificado: 54 },
  { periodo: '2T25', esperado: 67, verificado: 59 },
  { periodo: '3T25', esperado: 72, verificado: 65 },
  { periodo: '4T25', esperado: 77, verificado: 70 },
  { periodo: '1T26', esperado: 81, verificado: 74 },
  { periodo: '2T26', esperado: 84, verificado: 78 },
];

export const FRAMEWORK_COVERAGE = [
  { framework: 'ODS', previsto: 100, realizado: 96 },
  { framework: 'Taxonomia BR', previsto: 100, realizado: 82 },
  { framework: 'Green Bond', previsto: 100, realizado: 94 },
  { framework: 'BID/BIRD', previsto: 100, realizado: 88 },
  { framework: 'CAIXA Social', previsto: 100, realizado: 79 },
];

export const IMPACT_AGENTS: ImpactAgentRuntime[] = [
  { id: 'orchestrator', name: 'Orquestrador de Impacto', function: 'Coordena validação, atribuição, evidências e reporte.', entity: 'Carteira corporativa', status: 'idle', progress: 0, stage: 'Aguardando gatilho', confidence: 0.94, impact: 'R$ 3,2 bi rastreados', recommendation: 'Executar ciclo mensal de consolidação.', sources: ['Nexo Capital', 'Nexo Ativos', 'Nexo Evidência'], humanOwner: 'VP Sustentabilidade' },
  { id: 'indicator', name: 'Agente de Indicadores e Fórmulas', function: 'Valida fórmulas, baseline, metas, periodicidade e materialidade.', entity: '9 indicadores', status: 'idle', progress: 0, stage: 'Pronto para validação', confidence: 0.95, impact: '3 indicadores pendentes', recommendation: 'Revisar o indicador habitacional antes do reporte.', sources: ['Catálogo de Indicadores', 'Frameworks', 'Nexo Data'], humanOwner: 'Gerência de MRV' },
  { id: 'beneficiary', name: 'Agente de Beneficiários', function: 'Deduplica, segmenta e verifica cobertura e elegibilidade.', entity: '1,19 mi registros', status: 'idle', progress: 0, stage: 'Aguardando reconciliação', confidence: 0.91, impact: '4,8% duplicidade potencial', recommendation: 'Aplicar resolução de identidade nos programas sociais.', sources: ['Cadastros operacionais', 'IBGE', 'Pesquisas'], humanOwner: 'Cidadania' },
  { id: 'attribution', name: 'Agente de Atribuição e Adicionalidade', function: 'Separa contribuição do ativo de efeitos externos e evita dupla contagem.', entity: '6 ativos materiais', status: 'idle', progress: 0, stage: 'Pronto para modelagem', confidence: 0.86, impact: 'R$ 420 mi com atribuição parcial', recommendation: 'Aplicar fator de contribuição no programa de drenagem.', sources: ['Modelos territoriais', 'Contrafactuais', 'Avaliações'], humanOwner: 'Economia e Avaliação' },
  { id: 'evidence', name: 'Agente de Evidências de Resultado', function: 'Cruza indicadores com evidências físicas, operacionais e territoriais.', entity: '8.619 evidências', status: 'idle', progress: 0, stage: 'Aguardando ingestão', confidence: 0.97, impact: '91% evidências confiáveis', recommendation: 'Solicitar evidência complementar para funcionalidade habitacional.', sources: ['Nexo Evidência', 'SCADA', 'Living Atlas'], humanOwner: 'Controle de Evidências' },
  { id: 'report', name: 'Agente de Relatórios e Divulgação', function: 'Monta narrativas, tabelas, anexos e reconcilia frameworks.', entity: '4 relatórios prioritários', status: 'waiting', progress: 78, stage: 'Aguardando revisão humana', confidence: 0.93, impact: 'Green Bond 2026', recommendation: 'Aprovar notas metodológicas antes da emissão.', sources: ['Indicadores validados', 'Passaporte do Capital', 'Frameworks'], humanOwner: 'Relações com Investidores' },
];

export const IMPACT_LIVE_STEPS = [
  { agentId: 'orchestrator', text: 'Ciclo mensal iniciado: 9 indicadores e 6 ativos materiais carregados.' },
  { agentId: 'indicator', text: 'Fórmulas, metas e periodicidade confrontadas com os frameworks vigentes.' },
  { agentId: 'beneficiary', text: '1,19 milhão de registros conciliados; 4,8% de duplicidades potenciais isoladas.' },
  { agentId: 'evidence', text: '8.619 evidências ligadas aos indicadores; 27 exceções requerem revisão.' },
  { agentId: 'attribution', text: 'Fatores de atribuição recalculados para drenagem e energia renovável.' },
  { agentId: 'indicator', text: 'Indicador de funcionalidade habitacional mantido como divergente.' },
  { agentId: 'report', text: 'Relatório Green Bond 2026 recomposto com indicadores validados.' },
  { agentId: 'orchestrator', text: 'Gate humano preparado: aprovar publicação de 7 indicadores e reter 2.' },
];

export const IMPACT_REPORTS: ImpactReport[] = [
  { id: 'REP-IMP-01', title: 'Demonstração de Valor da Carteira', audience: 'Conselho Diretor', period: '2T 2026', framework: 'CAIXA Nexo', status: 'pronto', indicators: 9, assets: 6, lastGenerated: '20/07/2026 18:20', format: 'PDF' },
  { id: 'REP-IMP-02', title: 'Relatório de Alocação e Impacto Green Bond', audience: 'Investidores', period: '2026', framework: 'Green Bond Framework', status: 'em_revisao', indicators: 5, assets: 2, lastGenerated: '21/07/2026 07:42', format: 'PDF' },
  { id: 'REP-IMP-03', title: 'Prestação de Contas BID — Macrodrenagem', audience: 'BID / Ministério', period: '1S 2026', framework: 'BID', status: 'agendado', indicators: 4, assets: 1, lastGenerated: 'Agendado para 31/07', format: 'XLSX' },
  { id: 'REP-IMP-04', title: 'Painel Público de Resultados', audience: 'Sociedade', period: 'Atualização mensal', framework: 'Transparência', status: 'pronto', indicators: 7, assets: 4, lastGenerated: '20/07/2026 22:10', format: 'Dashboard' },
  { id: 'REP-IMP-05', title: 'Relatório de Beneficiários e Inclusão', audience: 'VP Sustentabilidade', period: '2T 2026', framework: 'Taxonomia Social CAIXA', status: 'rascunho', indicators: 4, assets: 4, lastGenerated: 'Rascunho', format: 'PDF' },
];

export const IMPACT_INTEGRATIONS: ImpactIntegration[] = [
  { id: 'INT-IMP-01', name: 'Nexo Capital', direction: 'Entrada', objects: 'Funding, categorias, metas e covenants', method: 'API interna', frequency: 'Evento', latency: '0,8 s', status: 'operational', lastSync: 'há 2 min', agents: ['Orquestrador', 'Relatórios'] },
  { id: 'INT-IMP-02', name: 'Nexo Ativos', direction: 'Entrada', objects: 'Serviço, saúde, disponibilidade e operação', method: 'Event stream', frequency: 'Tempo real', latency: '1,2 s', status: 'operational', lastSync: 'agora', agents: ['Indicadores', 'Evidências'] },
  { id: 'INT-IMP-03', name: 'Nexo Evidência', direction: 'Entrada/Saída', objects: 'Evidências, confiança e cadeia de custódia', method: 'API interna', frequency: 'Evento', latency: '1,5 s', status: 'operational', lastSync: 'há 1 min', agents: ['Evidências', 'Beneficiários'] },
  { id: 'INT-IMP-04', name: 'IBGE e dados sociais', direction: 'Entrada', objects: 'População, domicílios e vulnerabilidade', method: 'API pública', frequency: 'Mensal', latency: '3,4 s', status: 'attention', lastSync: 'há 9 h', agents: ['Beneficiários', 'Atribuição'] },
  { id: 'INT-IMP-05', name: 'ArcGIS / Living Atlas', direction: 'Entrada', objects: 'Cobertura, áreas de influência e riscos', method: 'Feature/Imagery Services', frequency: 'Diária', latency: '2,0 s', status: 'operational', lastSync: 'há 35 min', agents: ['Evidências', 'Atribuição'] },
  { id: 'INT-IMP-06', name: 'Portal de Transparência', direction: 'Saída', objects: 'Indicadores aprovados e painéis públicos', method: 'API de publicação', frequency: 'Mensal', latency: '—', status: 'attention', lastSync: 'aguardando gate', agents: ['Relatórios'] },
];

export const IMPACT_RULES: ImpactRule[] = [
  { id: 'REG-IMP-01', name: 'Confiança mínima para publicação', description: 'Indicadores com confiança inferior ao limite permanecem internos.', value: '85%', enabled: true, scope: 'Todos os relatórios externos' },
  { id: 'REG-IMP-02', name: 'Gate humano obrigatório', description: 'Publicação, atribuição e alteração metodológica exigem aprovação humana.', value: 'Ativo', enabled: true, scope: 'Decisões materiais' },
  { id: 'REG-IMP-03', name: 'Tolerância à dupla contagem', description: 'Beneficiários duplicados entre programas devem ser resolvidos antes do consolidado.', value: '≤ 2%', enabled: true, scope: 'Beneficiários' },
  { id: 'REG-IMP-04', name: 'Atualização de baseline', description: 'Baseline deve ser revista após mudança relevante de escopo ou território.', value: 'Evento material', enabled: true, scope: 'Indicadores de resultado' },
  { id: 'REG-IMP-05', name: 'Evidência georreferenciada', description: 'Indicadores territoriais exigem geometria e data de referência.', value: 'Obrigatória', enabled: true, scope: 'Territorial e climático' },
  { id: 'REG-IMP-06', name: 'Fator de atribuição', description: 'Impactos com múltiplos financiadores usam participação econômica ou causal.', value: 'Método híbrido', enabled: true, scope: 'Impacto agregado' },
];

export const IMPACT_FRAMEWORKS = [
  { name: 'Taxonomia Sustentável Brasileira', version: '2026.1', coverage: 82, indicators: 7, status: 'Ativo' },
  { name: 'Framework de Finanças Sustentáveis CAIXA', version: '2026', coverage: 94, indicators: 8, status: 'Ativo' },
  { name: 'ODS', version: 'Agenda 2030', coverage: 96, indicators: 9, status: 'Ativo' },
  { name: 'BID / BIRD Results Framework', version: '2025', coverage: 88, indicators: 5, status: 'Ativo' },
  { name: 'Princípios do Equador', version: 'EP4', coverage: 76, indicators: 4, status: 'Referência' },
];

export const IMPACT_AUDIT = [
  { t: '21/07/2026 08:44', user: 'Agente de Indicadores', action: 'Fórmula validada', detail: 'IND-005 conciliado com geração líquida e fator SIN.' },
  { t: '21/07/2026 08:32', user: 'Marina Queiroz', action: 'Revisão humana', detail: 'Indicador habitacional mantido como divergente.' },
  { t: '20/07/2026 22:10', user: 'Agente de Relatórios', action: 'Painel publicado', detail: '7 indicadores aprovados enviados ao painel público.' },
  { t: '20/07/2026 18:20', user: 'Nexo Impacto', action: 'Pacote gerado', detail: 'Demonstração de Valor da Carteira — 2T 2026.' },
];
