// Dados sintéticos — Nexo Estrutura. Registros fictícios para demonstração funcional.

export type EstruturaSection = 'overview' | 'alternatives' | 'financial' | 'scenarios' | 'map' | 'analytics' | 'agents' | 'reports' | 'admin';
export type StructureStage = 'Em modelagem' | 'Comparação' | 'Aguardando decisão' | 'Aprovado' | 'Em revisão';
export type AgentStatus = 'idle' | 'running' | 'waiting' | 'done' | 'alert';

export interface StructureCase {
  id: string;
  opportunityId: string;
  linkedAssetId?: string;
  nome: string;
  setor: string;
  proponente: string;
  uf: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  problema: string;
  valorReferencia: number;
  beneficiarios: number;
  stage: StructureStage;
  score: number;
  confidence: number;
  prazoAlvo: string;
  responsavel: string;
  proximaDecisao: string;
  programa: string;
  funding: string;
  updated: string;
}

export interface Alternative {
  id: string;
  caseId: string;
  nome: string;
  descricao: string;
  localizacao: string;
  tecnologia: string;
  capacidade: string;
  prazoMeses: number;
  capex: number;
  opexAno: number;
  fundingMix: Array<{ name: string; value: number }>;
  tarifaOuCusteio: string;
  beneficiarios: number;
  vidaUtilAnos: number;
  premissas: string[];
  riscos: string[];
  restricoes: string[];
  dependencies: string[];
  indicators: {
    custoBeneficiario: number;
    cobertura: number;
    resiliencia: number;
    acessibilidade: number;
    complexidade: number;
    impacto: number;
    bancabilidade: number;
  };
  score: number;
  recommended: boolean;
  status: 'Rascunho' | 'Validada' | 'Recomendada' | 'Revisão';
}

export interface FinancialAssumption {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
}

export interface StructureAgentRuntime {
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

export const STRUCTURE_CASES: StructureCase[] = [
  {
    id: 'STR-2026-0041', opportunityId: 'OPP-2026-0190', linkedAssetId: 'NEXO-ASSET-BR-AM-1303403-SAU-000214',
    nome: 'UBS Fluviais Baixo Amazonas', setor: 'Saúde', proponente: 'Secretaria Estadual de Saúde do Amazonas',
    uf: 'AM', city: 'Parintins', region: 'Norte', lat: -2.63, lon: -56.74,
    problema: 'Cobertura insuficiente de atenção básica em comunidades ribeirinhas e alto tempo de deslocamento.',
    valorReferencia: 71_000_000, beneficiarios: 58_000, stage: 'Aguardando decisão', score: 84.2, confidence: 94,
    prazoAlvo: '30/09/2026', responsavel: 'Marina Lopes — Estruturação Social', proximaDecisao: 'Homologar alternativa A e abrir análise no Nexo Contrata',
    programa: 'Infraestrutura Social Ribeirinha', funding: 'Recursos Próprios CAIXA', updated: 'Há 7 min',
  },
  {
    id: 'STR-2026-0046', opportunityId: 'OPP-2026-0142', linkedAssetId: 'NEXO-ASSET-BR-BA-2927408-HID-000188',
    nome: 'Sistema Adutor Chapada Norte', setor: 'Recursos Hídricos', proponente: 'Governo do Estado da Bahia',
    uf: 'BA', city: 'Seabra', region: 'Nordeste', lat: -12.42, lon: -41.77,
    problema: 'Insegurança hídrica em 12 municípios e elevada perda de produção em períodos de seca.',
    valorReferencia: 340_000_000, beneficiarios: 186_000, stage: 'Comparação', score: 81.8, confidence: 91,
    prazoAlvo: '15/10/2026', responsavel: 'Rafael Prado — Infraestrutura Hídrica', proximaDecisao: 'Validar traçado otimizado e matriz energética',
    programa: 'Segurança Hídrica do Semiárido', funding: 'BID + contrapartida estadual', updated: 'Há 18 min',
  },
  {
    id: 'STR-2026-0050', opportunityId: 'OPP-2026-0179', linkedAssetId: 'NEXO-ASSET-BR-PE-2611101-ENE-000078',
    nome: 'Complexo Solar Vale do Sol', setor: 'Energia', proponente: 'Consórcio Vale Solar',
    uf: 'PE', city: 'Petrolina', region: 'Nordeste', lat: -9.39, lon: -40.51,
    problema: 'Necessidade de ampliar geração renovável e reduzir exposição tarifária de equipamentos públicos.',
    valorReferencia: 410_000_000, beneficiarios: 210_000, stage: 'Em modelagem', score: 88.6, confidence: 96,
    prazoAlvo: '05/11/2026', responsavel: 'Carla Nunes — Energia e Clima', proximaDecisao: 'Comparar PPA, autoprodução e concessão',
    programa: 'Energias Renováveis e Transição Justa', funding: 'Green Bond + capital privado', updated: 'Há 24 min',
  },
  {
    id: 'STR-2026-0054', opportunityId: 'OPP-2026-0171', linkedAssetId: 'NEXO-ASSET-BR-PA-1500800-DRE-000198',
    nome: 'Parque Linear Igarapé Azul', setor: 'Drenagem', proponente: 'Prefeitura de Ananindeua',
    uf: 'PA', city: 'Ananindeua', region: 'Norte', lat: -1.37, lon: -48.37,
    problema: 'Alagamento recorrente, ocupação de fundo de vale e necessidade de reassentamento de famílias.',
    valorReferencia: 122_000_000, beneficiarios: 41_000, stage: 'Em revisão', score: 79.4, confidence: 90,
    prazoAlvo: '28/10/2026', responsavel: 'Fernanda Ribeiro — Adaptação Urbana', proximaDecisao: 'Revisar solução baseada na natureza e plano social',
    programa: 'Adaptação Climática Urbana', funding: 'BID + OGU', updated: 'Há 41 min',
  },
  {
    id: 'STR-2026-0058', opportunityId: 'OPP-2026-0163', linkedAssetId: 'NEXO-ASSET-BR-PI-2208007-EDU-000063',
    nome: 'Rede Escolar Sertão', setor: 'Educação', proponente: 'Governo do Estado do Piauí',
    uf: 'PI', city: 'Picos', region: 'Nordeste', lat: -7.08, lon: -41.47,
    problema: 'Déficit de vagas e baixa conectividade entre polos de educação técnica.',
    valorReferencia: 96_000_000, beneficiarios: 12_400, stage: 'Aprovado', score: 78.9, confidence: 92,
    prazoAlvo: '12/09/2026', responsavel: 'Lucas Medeiros — Infraestrutura Social', proximaDecisao: 'Transferir baseline ao Nexo Contrata',
    programa: 'Educação Profissionalizante', funding: 'Recursos Próprios CAIXA', updated: 'Ontem, 17:20',
  },
];

export const ALTERNATIVES: Alternative[] = [
  {
    id: 'CEN-A', caseId: 'STR-2026-0041', nome: 'A — Módulos fluviais pré-fabricados',
    descricao: 'Doze unidades modulares flutuantes, telemedicina integrada e apoio logístico regional.',
    localizacao: '12 pontos ao longo do Baixo Amazonas', tecnologia: 'Módulo flutuante pré-fabricado + telemedicina',
    capacidade: '12 unidades · 58 mil habitantes', prazoMeses: 18, capex: 64_000_000, opexAno: 3_100_000,
    fundingMix: [{ name: 'Recursos próprios', value: 72 }, { name: 'Fundo socioambiental', value: 18 }, { name: 'Contrapartida', value: 10 }],
    tarifaOuCusteio: 'Custeio municipal + SUS', beneficiarios: 58_000, vidaUtilAnos: 20,
    premissas: ['Nível do rio operacional em 10 meses do ano', 'Manutenção fluvial trimestral disponível', 'Cobertura 4G/5G nos polos regionais'],
    riscos: ['Variação sazonal do nível do rio', 'Logística de suprimento médico', 'Dependência de operador especializado'],
    restricoes: ['Licenciamento ambiental simplificado', 'Homologação sanitária dos módulos'],
    dependencies: ['Base logística Parintins', 'Conectividade satelital de contingência', 'Contrato de manutenção naval'],
    indicators: { custoBeneficiario: 1103, cobertura: 92, resiliencia: 74, acessibilidade: 88, complexidade: 62, impacto: 91, bancabilidade: 86 },
    score: 84.2, recommended: true, status: 'Recomendada',
  },
  {
    id: 'CEN-B', caseId: 'STR-2026-0041', nome: 'B — Unidades fixas de alvenaria',
    descricao: 'Oito unidades fixas em sedes distritais, com acesso terrestre e estrutura convencional.',
    localizacao: '8 sedes distritais', tecnologia: 'Construção civil convencional', capacidade: '8 unidades · 58 mil habitantes',
    prazoMeses: 30, capex: 89_000_000, opexAno: 2_400_000,
    fundingMix: [{ name: 'Recursos próprios', value: 80 }, { name: 'Contrapartida', value: 20 }], tarifaOuCusteio: 'Custeio municipal + SUS',
    beneficiarios: 58_000, vidaUtilAnos: 35,
    premissas: ['Acesso terrestre viável em seis distritos', 'Terrenos regularizados em 75% dos pontos'],
    riscos: ['Baixa acessibilidade da população dispersa', 'Regularização fundiária em dois distritos'],
    restricoes: ['Licenciamento convencional', 'Obras dependentes do período seco'], dependencies: ['Obras viárias complementares', 'Energia de média tensão'],
    indicators: { custoBeneficiario: 1534, cobertura: 71, resiliencia: 90, acessibilidade: 58, complexidade: 79, impacto: 72, bancabilidade: 79 },
    score: 69.1, recommended: false, status: 'Validada',
  },
  {
    id: 'CEN-C', caseId: 'STR-2026-0041', nome: 'C — Modelo híbrido',
    descricao: 'Seis módulos fluviais e quatro unidades fixas nos polos de maior densidade populacional.',
    localizacao: '6 pontos fluviais + 4 polos fixos', tecnologia: 'Módulo flutuante + alvenaria', capacidade: '10 unidades · 58 mil habitantes',
    prazoMeses: 22, capex: 76_000_000, opexAno: 2_850_000,
    fundingMix: [{ name: 'Recursos próprios', value: 70 }, { name: 'Fundo socioambiental', value: 15 }, { name: 'Contrapartida', value: 15 }],
    tarifaOuCusteio: 'Custeio municipal + SUS', beneficiarios: 58_000, vidaUtilAnos: 28,
    premissas: ['Densidade populacional permite concentração parcial', 'Modelo de operação integrado disponível'],
    riscos: ['Complexidade operacional de dois modelos', 'Duplicidade de cadeias de manutenção'],
    restricoes: ['Licenciamento misto'], dependencies: ['Central de telemedicina', 'Operação logística compartilhada'],
    indicators: { custoBeneficiario: 1310, cobertura: 85, resiliencia: 83, acessibilidade: 76, complexidade: 85, impacto: 85, bancabilidade: 83 },
    score: 78.3, recommended: false, status: 'Validada',
  },
];

export const FINANCIAL_ASSUMPTIONS: FinancialAssumption[] = [
  { id: 'discount', label: 'Taxa de desconto', value: 8.5, min: 4, max: 14, step: 0.1, suffix: '% a.a.' },
  { id: 'inflation', label: 'Inflação de obras', value: 5.1, min: 2, max: 12, step: 0.1, suffix: '% a.a.' },
  { id: 'contingency', label: 'Contingência de Capex', value: 9, min: 0, max: 25, step: 1, suffix: '%' },
  { id: 'opexGrowth', label: 'Crescimento do Opex', value: 4.2, min: 0, max: 10, step: 0.1, suffix: '% a.a.' },
  { id: 'benefitGrowth', label: 'Crescimento do benefício', value: 2.3, min: 0, max: 8, step: 0.1, suffix: '% a.a.' },
];

export const CASHFLOW_BASE = [
  { year: '2026', capex: -10, opex: 0, benefit: 0 }, { year: '2027', capex: -34, opex: -1, benefit: 5 },
  { year: '2028', capex: -20, opex: -3, benefit: 18 }, { year: '2029', capex: 0, opex: -3.1, benefit: 24 },
  { year: '2030', capex: 0, opex: -3.2, benefit: 27 }, { year: '2031', capex: 0, opex: -3.4, benefit: 29 },
  { year: '2032', capex: 0, opex: -3.5, benefit: 31 }, { year: '2033', capex: 0, opex: -3.7, benefit: 32 },
];

export const SENSITIVITY = [
  { variable: 'Custo do módulo fluvial', downside: -14.2, upside: 11.8 },
  { variable: 'Tempo de licenciamento', downside: -10.7, upside: 7.4 },
  { variable: 'Custo de manutenção', downside: -8.8, upside: 6.1 },
  { variable: 'Cobertura assistencial', downside: -7.1, upside: 9.3 },
  { variable: 'Câmbio de insumos', downside: -5.4, upside: 4.8 },
];

export const LIFE_CYCLE = [
  { year: 0, integrity: 100, maintenance: 0 }, { year: 5, integrity: 94, maintenance: 2.8 },
  { year: 10, integrity: 85, maintenance: 4.2 }, { year: 15, integrity: 74, maintenance: 5.7 },
  { year: 20, integrity: 60, maintenance: 7.8 }, { year: 25, integrity: 45, maintenance: 10.4 },
  { year: 30, integrity: 30, maintenance: 13.6 },
];

export const PORTFOLIO_HISTORY = [
  { month: 'Fev', cases: 8, decisions: 3, avgDays: 49 }, { month: 'Mar', cases: 10, decisions: 4, avgDays: 46 },
  { month: 'Abr', cases: 13, decisions: 6, avgDays: 43 }, { month: 'Mai', cases: 12, decisions: 7, avgDays: 39 },
  { month: 'Jun', cases: 16, decisions: 9, avgDays: 36 }, { month: 'Jul', cases: 18, decisions: 11, avgDays: 32 },
];

export const STRUCTURE_AGENTS: StructureAgentRuntime[] = [
  { id: 'AG-EST-01', name: 'Agente Orquestrador de Estruturação', icon: 'Workflow', status: 'idle', entity: 'STR-2026-0041', step: 'Pronto para coordenar modelos técnicos, financeiros e territoriais.', progress: 0, confidence: 97, sources: ['Nexo Carteira', 'Nexo Capital', 'Nexo Data'], recommendation: 'Executar ciclo integrado antes da decisão.', impact: '3 alternativas coordenadas', lastRun: 'Hoje, 06:50', awaiting: 'Nova execução', human: 'Gestor de Estruturação' },
  { id: 'AG-EST-02', name: 'Agente de Alternativas Técnicas', icon: 'GitBranch', status: 'idle', entity: 'UBS Fluviais', step: 'Compara tecnologias, capacidades, prazos e dependências.', progress: 0, confidence: 93, sources: ['Projetos referenciais', 'BIM conceitual', 'Catálogo técnico'], recommendation: 'Manter alternativa híbrida como contingência.', impact: '3 cenários comparáveis', lastRun: 'Há 37 min', awaiting: 'Premissas operacionais', human: 'Engenharia' },
  { id: 'AG-EST-03', name: 'Agente Financeiro e Funding', icon: 'Calculator', status: 'waiting', entity: 'CEN-A', step: 'Modelo financeiro atualizado; aguarda validação da contingência.', progress: 92, confidence: 95, sources: ['Nexo Capital', 'Curvas de mercado', 'Capex/Opex'], recommendation: 'Adotar contingência de 9% e reserva de liquidez de seis meses.', impact: 'R$ 5,8 mi protegidos', lastRun: 'Há 12 min', awaiting: 'Aprovação humana', human: 'Estruturação Financeira' },
  { id: 'AG-EST-04', name: 'Agente Territorial e de Cobertura', icon: 'MapPinned', status: 'alert', entity: '12 comunidades ribeirinhas', step: 'Dois pontos apresentam cobertura assistencial abaixo do limiar.', progress: 78, confidence: 91, sources: ['ArcGIS', 'IBGE', 'SUS', 'Living Atlas'], recommendation: 'Reposicionar os pontos P-07 e P-09 em 8 km e 11 km.', impact: '+4,6 mil beneficiários', lastRun: 'Há 9 min', awaiting: 'Validação GIS', human: 'Especialista Territorial' },
  { id: 'AG-EST-05', name: 'Agente de Riscos e Dependências', icon: 'ShieldAlert', status: 'idle', entity: 'CEN-A', step: 'Avalia dependências, riscos climáticos, regulatórios e operacionais.', progress: 0, confidence: 92, sources: ['CEMADEN', 'Licenciamento', 'Nexo Contrata'], recommendation: 'Criar covenant operacional para manutenção naval.', impact: '3 riscos críticos tratados', lastRun: 'Ontem, 22:04', awaiting: 'Nova execução', human: 'Riscos de Projeto' },
  { id: 'AG-EST-06', name: 'Agente de Recomendação e Despacho', icon: 'Send', status: 'waiting', entity: 'STR-2026-0041', step: 'Minuta de decisão e baseline preparadas.', progress: 96, confidence: 96, sources: ['Comparador', 'Pareceres', 'Regras de alçada'], recommendation: 'Homologar CEN-A com quatro condicionantes.', impact: 'Caso pronto para Contrata', lastRun: 'Há 5 min', awaiting: 'Decisão do comitê', human: 'Comitê de Estruturação' },
];

export const STRUCTURE_LIVE_STEPS = [
  { agentId: 'AG-EST-01', progress: 18, status: 'running' as const, step: 'Carregando baseline, funding e restrições do caso...', text: 'Orquestrador iniciou o ciclo integrado de estruturação.', type: 'agent' as const },
  { agentId: 'AG-EST-02', progress: 42, status: 'running' as const, step: 'Comparando tecnologias, capacidades e prazos...', text: 'Alternativas técnicas: 18 configurações examinadas; 3 mantidas.', type: 'info' as const },
  { agentId: 'AG-EST-04', progress: 58, status: 'running' as const, step: 'Executando análise de cobertura e acessibilidade fluvial...', text: 'Análise territorial detectou lacuna de cobertura em dois pontos.', type: 'warning' as const },
  { agentId: 'AG-EST-03', progress: 68, status: 'running' as const, step: 'Recalculando Capex, Opex, funding e contingência...', text: 'Modelo financeiro recalculado com contingência de 9%.', type: 'agent' as const },
  { agentId: 'AG-EST-05', progress: 74, status: 'running' as const, step: 'Cruzando riscos climáticos, operacionais e regulatórios...', text: 'Risco operacional elevado: manutenção naval deve virar condicionante.', type: 'warning' as const },
  { agentId: 'AG-EST-04', progress: 100, status: 'done' as const, step: 'Cobertura otimizada com reposicionamento de P-07 e P-09.', text: 'Cobertura estimada aumentou de 92% para 95%.', type: 'success' as const },
  { agentId: 'AG-EST-03', progress: 100, status: 'done' as const, step: 'Indicadores financeiros consolidados.', text: 'VPL socioeconômico atualizado para R$ 117 milhões.', type: 'success' as const },
  { agentId: 'AG-EST-06', progress: 100, status: 'waiting' as const, step: 'Recomendação e minuta aguardando decisão humana.', text: 'Recomendação pronta: homologar CEN-A com quatro condicionantes.', type: 'success' as const },
  { agentId: 'AG-EST-01', progress: 100, status: 'done' as const, step: 'Ciclo concluído e rastreado.', text: 'Ciclo de estruturação concluído; baseline pronta para o Nexo Contrata.', type: 'success' as const },
];

export const STRUCTURE_REPORTS = [
  { id: 'RPT-EST-01', name: 'Estudo Comparativo de Alternativas', description: 'Comparação técnica, financeira, territorial, riscos e justificativa da recomendação.', cadence: 'Por decisão', owner: 'Estruturação', format: 'PDF + XLSX', last: '20/07/2026' },
  { id: 'RPT-EST-02', name: 'Modelo Financeiro e Funding', description: 'Capex, Opex, funding mix, fluxo, sensibilidades e limites.', cadence: 'Sob demanda', owner: 'Estruturação Financeira', format: 'XLSX + PDF', last: '20/07/2026' },
  { id: 'RPT-EST-03', name: 'Mapa de Cobertura e Dependências', description: 'Área de influência, beneficiários, conexões, riscos e dependências territoriais.', cadence: 'Por revisão', owner: 'Inteligência Territorial', format: 'PDF + GeoJSON', last: '19/07/2026' },
  { id: 'RPT-EST-04', name: 'Baseline para Contratação', description: 'Alternativa homologada, premissas, condicionantes, indicadores e plano de evidências.', cadence: 'Por aprovação', owner: 'Comitê de Estruturação', format: 'PDF + JSON', last: '18/07/2026' },
  { id: 'RPT-EST-05', name: 'Performance da Carteira de Estruturação', description: 'Tempo médio, decisões, retrabalho, precisão das estimativas e ganhos dos agentes.', cadence: 'Mensal', owner: 'Nexo Control', format: 'Dashboard + PDF', last: '01/07/2026' },
];

export const STRUCTURE_ADMIN_RULES = [
  { id: 'RULE-EST-01', name: 'Mínimo de alternativas', description: 'Casos acima do limiar devem comparar pelo menos três alternativas tecnicamente distintas.', value: '3 alternativas', status: 'ativa' },
  { id: 'RULE-EST-02', name: 'Geometria e área de influência', description: 'Nenhuma alternativa pode ser homologada sem localização, área de influência e dependências.', value: 'Obrigatório', status: 'ativa' },
  { id: 'RULE-EST-03', name: 'Contingência de Capex', description: 'Projetos conceituais devem aplicar contingência mínima antes de avançar.', value: '8%', status: 'ativa' },
  { id: 'RULE-EST-04', name: 'Gate humano da recomendação', description: 'Agentes podem recomendar, mas a seleção da alternativa exige decisão colegiada.', value: 'Sempre', status: 'ativa' },
  { id: 'RULE-EST-05', name: 'Revisão de premissas', description: 'Premissas financeiras e territoriais expiram e devem ser revalidadas.', value: '90 dias', status: 'ativa' },
  { id: 'RULE-EST-06', name: 'Transferência de baseline', description: 'Aprovação gera pacote estruturado para o Nexo Contrata e plano de evidências.', value: 'Automática após homologação', status: 'ativa' },
];

export const STRUCTURE_ROLE_MATRIX = [
  { role: 'Analista de Estruturação', alternatives: 'Criar/editar', finance: 'Simular', recommendation: 'Propor', approval: 'Sem alçada final' },
  { role: 'Especialista de Engenharia', alternatives: 'Parecer técnico', finance: 'Consultar', recommendation: 'Parecer', approval: 'Sem alçada financeira' },
  { role: 'Estruturação Financeira', alternatives: 'Consultar', finance: 'Editar/aprovar', recommendation: 'Parecer', approval: 'Até R$ 100 mi' },
  { role: 'Gestor de Estruturação', alternatives: 'Aprovar baseline', finance: 'Aprovar', recommendation: 'Recomendar', approval: 'Até R$ 250 mi' },
  { role: 'Comitê de Estruturação', alternatives: 'Homologar', finance: 'Homologar', recommendation: 'Decidir', approval: 'Acima de R$ 250 mi' },
  { role: 'Auditoria', alternatives: 'Leitura', finance: 'Leitura', recommendation: 'Leitura', approval: 'Sem alçada' },
];

export const INTEGRATION_TOUCHPOINTS = [
  { system: 'Nexo Carteira', direction: 'Entrada', object: 'Oportunidade priorizada, score, documentos e área de influência', status: 'normal' as const, latency: '18 s' },
  { system: 'Nexo Capital', direction: 'Bidirecional', object: 'Fontes, envelopes, condições financeiras e covenants', status: 'normal' as const, latency: '24 s' },
  { system: 'Nexo Contrata', direction: 'Saída', object: 'Baseline, parecer, riscos, condicionantes e plano de evidências', status: 'normal' as const, latency: '31 s' },
  { system: 'Nexo Data', direction: 'Bidirecional', object: 'Catálogo, qualidade, geosserviços, referências e linhagem', status: 'normal' as const, latency: '12 s' },
  { system: 'SINAPI / referências', direction: 'Entrada', object: 'Custos, índices, composições e atualização regional', status: 'atencao' as const, latency: 'Carga mensal' },
  { system: 'ArcGIS / Living Atlas', direction: 'Entrada', object: 'Mapas, cobertura, acessibilidade, risco e contexto territorial', status: 'normal' as const, latency: '7 s' },
];
