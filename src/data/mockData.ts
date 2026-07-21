import { REALISTIC_ASSETS } from '@/data/realisticPortfolioData';
import type { StatusKey } from '@/lib/tokens';

// =====================================================================================
// CAIXA NEXO — camada de dados sintéticos (mockup). Todos os nomes, valores, pessoas,
// contratos e identificadores são fictícios e servem apenas para demonstração funcional.
// =====================================================================================

export const CURRENT_USER = {
  name: 'Marlos Batista',
  role: 'Presidência e Alta Administração',
  unit: 'Diretoria Executiva · Nexo Corporativo',
  initials: 'MB',
};

export const STAGE_ORDER = [
  'Captação', 'Programa', 'Originação', 'Estruturação', 'Aprovação',
  'Contratação', 'Execução', 'Comissionamento', 'Operação', 'Impacto',
] as const;
export type Stage = typeof STAGE_ORDER[number];

export interface StageHistoryEntry {
  stage: Stage;
  date: string;
  status: 'concluido' | 'atual' | 'pendente';
  decision?: string;
  responsible?: string;
  docs?: number;
  evidences?: number;
  agents?: string[];
  pendencies?: string[];
}

export interface Asset {
  id: string;
  name: string;
  sector: 'Saneamento' | 'Habitação' | 'Drenagem' | 'Recursos Hídricos' | 'Mobilidade' | 'Energia' | 'Saúde' | 'Educação';
  uf: string;
  region: string;
  city: string;
  lat: number; lon: number;
  program: string;
  fundingSource: string;
  value: number;
  disbursed: number;       // 0..1 share of value disbursed
  physicalProgress: number; // 0..1
  status: StatusKey;
  stage: Stage;
  healthIndex: number | null; // 0..100, null if not yet operating
  beneficiaries: number;
  beneficiariesVerified: number;
  responsible: string;
  lastUpdate: string;
  summary: string;
  contract?: string;
  history?: StageHistoryEntry[];
}

export const ASSETS: Asset[] = [
  {
    id: 'NEXO-ASSET-BR-SP-3549904-SAN-000284',
    name: 'Sistema Integrado de Esgotamento Vale Verde',
    sector: 'Saneamento', uf: 'SP', region: 'Sudeste', city: 'São José dos Campos',
    lat: -23.1896, lon: -45.8841,
    program: 'Programa Nacional de Saneamento Rural e Urbano',
    fundingSource: 'FGTS + Contrapartida Municipal',
    value: 480_000_000, disbursed: 0.59, physicalProgress: 0.64,
    status: 'critico', stage: 'Execução', healthIndex: null,
    beneficiaries: 210_000, beneficiariesVerified: 0,
    responsible: 'Ana Beatriz Souza — GEREG Sudeste',
    lastUpdate: '2026-07-20T19:42:27',
    contract: 'CT-2025-SAN-0142',
    summary: 'Rede coletora e estações elevatórias para universalização do esgotamento sanitário no Setor Norte. Medição nº 6 apontou divergência espacial entre geometria executada e projeto aprovado em 3 trechos.',
    history: [
      { stage: 'Captação', date: '2024-11-04', status: 'concluido', decision: 'Envelope FGTS 2025 aprovado', responsible: 'Nexo Capital', docs: 4, evidences: 0, agents: ['Agente de Funding e Covenants'] },
      { stage: 'Programa', date: '2024-12-02', status: 'concluido', decision: 'Alocado ao Programa Nacional de Saneamento', responsible: 'Nexo Capital', docs: 2 },
      { stage: 'Originação', date: '2025-01-20', status: 'concluido', decision: 'Oportunidade aceita na carteira', responsible: 'Nexo Carteira', docs: 6 },
      { stage: 'Estruturação', date: '2025-03-11', status: 'concluido', decision: 'Alternativa técnica B aprovada (rede separadora)', responsible: 'Nexo Estrutura', docs: 9 },
      { stage: 'Aprovação', date: '2025-05-28', status: 'concluido', decision: 'Aprovado com condicionantes ambientais', responsible: 'Comitê de Crédito', docs: 14, agents: ['Agente de Elegibilidade', 'Agente de Risco Territorial e Climático'] },
      { stage: 'Contratação', date: '2025-07-15', status: 'concluido', decision: 'Baseline contratual emitida — CT-2025-SAN-0142', responsible: 'Nexo Contrata', docs: 11 },
      { stage: 'Execução', date: '2025-09-01', status: 'atual', decision: 'Medição nº 6 em análise — divergência em 3 trechos', responsible: 'Ana Beatriz Souza', docs: 28, evidences: 28, agents: ['Agente de Inconsistências e Fraude', 'Agente de Vistoria'], pendencies: ['Vistoria OV-2026-0871 em campo'] },
      { stage: 'Comissionamento', date: '', status: 'pendente' },
      { stage: 'Operação', date: '', status: 'pendente' },
      { stage: 'Impacto', date: '', status: 'pendente' },
    ],
  },
  {
    id: 'NEXO-ASSET-BR-PE-2611606-HAB-000512',
    name: 'Residencial Horizonte Azul',
    sector: 'Habitação', uf: 'PE', region: 'Nordeste', city: 'Recife',
    lat: -8.0476, lon: -34.8770,
    program: 'Programa Habitacional de Interesse Social',
    fundingSource: 'FGTS + Recursos Próprios CAIXA',
    value: 186_000_000, disbursed: 0.83, physicalProgress: 0.87,
    status: 'atencao', stage: 'Comissionamento', healthIndex: null,
    beneficiaries: 4_960, beneficiariesVerified: 0,
    responsible: 'Carlos Eduardo Lima — GEREG Nordeste',
    lastUpdate: '2026-07-19T16:10:00',
    contract: 'CT-2024-HAB-0871',
    summary: '1.240 unidades habitacionais. Execução física de 87% concluída; risco físico baixo, mas prontidão operacional não concedida por pendência de acesso viário e transporte público ao empreendimento.',
    history: [
      { stage: 'Captação', date: '2023-08-10', status: 'concluido' },
      { stage: 'Programa', date: '2023-09-01', status: 'concluido' },
      { stage: 'Originação', date: '2023-10-14', status: 'concluido' },
      { stage: 'Estruturação', date: '2023-12-20', status: 'concluido' },
      { stage: 'Aprovação', date: '2024-02-18', status: 'concluido' },
      { stage: 'Contratação', date: '2024-04-02', status: 'concluido' },
      { stage: 'Execução', date: '2024-05-01', status: 'concluido', decision: '87% de execução física confirmada' },
      { stage: 'Comissionamento', date: '2026-07-15', status: 'atual', decision: 'Prontidão operacional plena NÃO concedida', responsible: 'Agente de Comissionamento', pendencies: ['Acesso viário e transporte público não concluídos'] },
      { stage: 'Operação', date: '', status: 'pendente' },
      { stage: 'Impacto', date: '', status: 'pendente' },
    ],
  },
  {
    id: 'NEXO-ASSET-BR-PA-1501402-DRE-000198',
    name: 'Programa de Macrodrenagem Rio Norte',
    sector: 'Drenagem', uf: 'PA', region: 'Norte', city: 'Região Metropolitana de Belém',
    lat: -1.4558, lon: -48.4902,
    program: 'Programa de Adaptação Climática Urbana',
    fundingSource: 'BID + Tesouro (OGU)',
    value: 612_000_000, disbursed: 0.38, physicalProgress: 0.42,
    status: 'critico', stage: 'Execução', healthIndex: null,
    beneficiaries: 340_000, beneficiariesVerified: 0,
    responsible: 'Fernanda Ribeiro — GEREG Norte',
    lastUpdate: '2026-07-20T08:30:00',
    contract: '5 contratos ativos',
    summary: 'Programa com 5 contratos, 3 municípios e 14 ativos de macrodrenagem. Evento climático simulado expôs 2 ativos a risco de transbordamento; Agente de Risco Territorial e Climático recomendou reprogramação.',
    history: [
      { stage: 'Captação', date: '2024-02-15', status: 'concluido' },
      { stage: 'Programa', date: '2024-03-10', status: 'concluido' },
      { stage: 'Originação', date: '2024-05-02', status: 'concluido' },
      { stage: 'Estruturação', date: '2024-07-19', status: 'concluido' },
      { stage: 'Aprovação', date: '2024-09-30', status: 'concluido' },
      { stage: 'Contratação', date: '2024-12-11', status: 'concluido' },
      { stage: 'Execução', date: '2025-02-01', status: 'atual', decision: 'Evento climático expôs 2 dos 14 ativos', pendencies: ['Reprogramação técnica em avaliação'] },
      { stage: 'Comissionamento', date: '', status: 'pendente' },
      { stage: 'Operação', date: '', status: 'pendente' },
      { stage: 'Impacto', date: '', status: 'pendente' },
    ],
  },
  {
    id: 'NEXO-ASSET-BR-CE-2307304-AGU-000077',
    name: 'Adutora Sertão Vivo',
    sector: 'Recursos Hídricos', uf: 'CE', region: 'Nordeste', city: 'Iguatu',
    lat: -6.3574, lon: -39.2986,
    program: 'Programa de Segurança Hídrica do Semiárido',
    fundingSource: 'Tesouro (OGU) + Contrapartida Estadual',
    value: 298_000_000, disbursed: 1.0, physicalProgress: 1.0,
    status: 'normal', stage: 'Operação', healthIndex: 91,
    beneficiaries: 310_000, beneficiariesVerified: 296_000,
    responsible: 'Juliana Prado — GEREG Nordeste',
    lastUpdate: '2026-07-18T11:00:00',
    contract: 'CT-2022-AGU-0033',
    summary: 'Adutora de 84 km em operação plena desde 2024. Índice de saúde do ativo em 91 pontos; beneficiários comprovados via pesquisa domiciliar e telemetria de vazão.',
  },
  {
    id: 'NEXO-ASSET-BR-MG-3106200-MOB-000341',
    name: 'Corredor BRT Serra Azul',
    sector: 'Mobilidade', uf: 'MG', region: 'Sudeste', city: 'Região Metropolitana de Belo Horizonte',
    lat: -19.9227, lon: -43.9451,
    program: 'Programa de Mobilidade Urbana Sustentável',
    fundingSource: 'BIRD (Banco Mundial) + Município',
    value: 355_000_000, disbursed: 0.06, physicalProgress: 0.0,
    status: 'analise', stage: 'Contratação', healthIndex: null,
    beneficiaries: 480_000, beneficiariesVerified: 0,
    responsible: 'Rodrigo Nakamura — GEREG Sudeste',
    lastUpdate: '2026-07-14T09:00:00',
    summary: 'Corredor de 18 km em fase final de contratação. Condicionantes de licenciamento ambiental em verificação pelo Nexo Contrata.',
  },
  {
    id: 'NEXO-ASSET-BR-RN-2408102-ENE-000029',
    name: 'Complexo Eólico Costa Branca',
    sector: 'Energia', uf: 'RN', region: 'Nordeste', city: 'Litoral Norte',
    lat: -5.1520, lon: -36.3510,
    program: 'Programa de Energias Renováveis e Transição Justa',
    fundingSource: 'BID + Mercado de Capitais (Green Bond)',
    value: 740_000_000, disbursed: 1.0, physicalProgress: 1.0,
    status: 'normal', stage: 'Operação', healthIndex: 87,
    beneficiaries: 890_000, beneficiariesVerified: 890_000,
    responsible: 'Tiago Almeida — GEREG Nordeste',
    lastUpdate: '2026-07-20T06:00:00',
    contract: 'CT-2021-ENE-0009',
    summary: '58 aerogeradores em operação comercial desde 2023. Agente de Saúde do Ativo recomenda manutenção preditiva em 45 dias para 3 componentes críticos.',
  },
  {
    id: 'NEXO-ASSET-BR-AM-1302603-SAU-000156',
    name: 'UBS Digital Norte',
    sector: 'Saúde', uf: 'AM', region: 'Norte', city: 'Manaus',
    lat: -3.1190, lon: -60.0217,
    program: 'Programa de Infraestrutura Social Ribeirinha',
    fundingSource: 'Tesouro (OGU)',
    value: 64_000_000, disbursed: 0.02, physicalProgress: 0.0,
    status: 'pendente', stage: 'Estruturação', healthIndex: null,
    beneficiaries: 58_000, beneficiariesVerified: 0,
    responsible: 'Patrícia Nunes — GEREG Norte',
    lastUpdate: '2026-07-10T15:20:00',
    summary: 'Rede de 12 unidades básicas de saúde fluviais em modelagem técnica e territorial no Nexo Estrutura.',
  },
  {
    id: 'NEXO-ASSET-BR-GO-5208707-EDU-000063',
    name: 'Escola Técnica Cerrado',
    sector: 'Educação', uf: 'GO', region: 'Centro-Oeste', city: 'Goiânia',
    lat: -16.6799, lon: -49.2550,
    program: 'Programa Nacional de Educação Profissionalizante',
    fundingSource: 'FGTS',
    value: 42_000_000, disbursed: 0.97, physicalProgress: 1.0,
    status: 'normal', stage: 'Comissionamento', healthIndex: 95,
    beneficiaries: 2_400, beneficiariesVerified: 1_150,
    responsible: 'Bruno Castro — GEREG Centro-Oeste',
    lastUpdate: '2026-07-16T13:45:00',
    contract: 'CT-2024-EDU-0210',
    summary: 'Obra concluída e testes finalizados. Certificado de Prontidão Operacional emitido; primeira turma matriculada.',
  },
];
ASSETS.push(...REALISTIC_ASSETS);

export const HERO_ASSET_ID = ASSETS[0].id;

// ---------------------------------------------------------------------------
// Medição nº 6 — Vale Verde
// ---------------------------------------------------------------------------
export interface MedicaoItem {
  item: string; qtd: number; unidade: string; valorUnit: number; status: 'ok' | 'divergente' | 'analise';
}
export const MEDICAO_ITENS: MedicaoItem[] = [
  { item: 'Rede coletora DN200', qtd: 5200, unidade: 'm', valorUnit: 890, status: 'ok' },
  { item: 'Poços de visita', qtd: 74, unidade: 'un', valorUnit: 12_500, status: 'ok' },
  { item: 'Ligações domiciliares — Setor Norte', qtd: 1150, unidade: 'un', valorUnit: 2_100, status: 'divergente' },
  { item: 'Estação elevatória de esgoto EEE-04', qtd: 1, unidade: 'verba', valorUnit: 6_800_000, status: 'ok' },
  { item: 'Recuperação de pavimentação', qtd: 8900, unidade: 'm²', valorUnit: 145, status: 'analise' },
  { item: 'Ligação domiciliar complementar — trechos T-14/T-17/T-22', qtd: 850, unidade: 'un', valorUnit: 2_750, status: 'divergente' },
];
export const MEDICAO_VALE_VERDE = {
  numero: 6,
  contrato: 'CT-2025-SAN-0142',
  periodo: '01/06/2026 – 30/06/2026',
  marco: 'Marco 4 — Rede coletora Setor Norte',
  valorSolicitado: MEDICAO_ITENS.reduce((s, i) => s + i.qtd * i.valorUnit, 0),
  valorRetido: 2_650_000,
  trechosDivergentes: ['T-14', 'T-17', 'T-22'],
  desvioMedio: 47,
  confianca: 0.91,
  evidenciasRecebidas: 28,
  responsavelTecnico: 'Eng. Paulo Ricardo Menezes — CREA-SP 5.512.309',
};
export const MEDICAO_VALE_VERDE_FULL = {
  ...MEDICAO_VALE_VERDE,
  valorLiberavel: MEDICAO_VALE_VERDE.valorSolicitado - MEDICAO_VALE_VERDE.valorRetido,
};

export interface Evidence {
  id: string; tipo: string; trecho: string; descricao: string; capturadoEm: string;
  geo: string; confianca: number; status: 'validada' | 'divergente' | 'pendente';
}
export const EVIDENCIAS_VALE_VERDE: Evidence[] = [
  { id: 'EV-08841', tipo: 'Foto', trecho: 'T-14', descricao: 'Vala aberta — rede coletora DN200', capturadoEm: '2026-06-28T09:12:00', geo: '-23.1710, -45.9020', confianca: 0.94, status: 'validada' },
  { id: 'EV-08842', tipo: 'Foto', trecho: 'T-17', descricao: 'Poço de visita concluído PV-42', capturadoEm: '2026-06-28T09:40:00', geo: '-23.1800, -45.8950', confianca: 0.97, status: 'validada' },
  { id: 'EV-08843', tipo: 'Geometria', trecho: 'T-22', descricao: 'Levantamento topográfico pós-execução (shapefile)', capturadoEm: '2026-06-29T14:05:00', geo: '-23.1920, -45.8740', confianca: 0.68, status: 'divergente' },
  { id: 'EV-08844', tipo: 'Documento', trecho: '—', descricao: 'Boletim de medição nº 6 assinado', capturadoEm: '2026-06-30T11:00:00', geo: '—', confianca: 0.99, status: 'validada' },
  { id: 'EV-08845', tipo: 'Vídeo', trecho: 'T-14', descricao: 'Inspeção com câmera de rede', capturadoEm: '2026-06-28T10:20:00', geo: '-23.1720, -45.9010', confianca: 0.91, status: 'validada' },
  { id: 'EV-08846', tipo: 'Geometria', trecho: 'T-14', descricao: 'Traçado executado vs. projeto aprovado', capturadoEm: '2026-06-29T15:30:00', geo: '-23.1715, -45.9015', confianca: 0.71, status: 'divergente' },
];

// ---------------------------------------------------------------------------
// Agentes de IA
// ---------------------------------------------------------------------------
export type AgentStatus =
  | 'agendado' | 'em_execucao' | 'coletando' | 'analisando' | 'aguardando_sistema'
  | 'aguardando_humano' | 'concluido' | 'concluido_alerta' | 'falhou' | 'cancelado';

export const AGENT_STATUS_META: Record<AgentStatus, { label: string; color: string }> = {
  agendado: { label: 'Agendado', color: '#9AACB8' },
  em_execucao: { label: 'Em execução', color: '#18B7D6' },
  coletando: { label: 'Coletando dados', color: '#18B7D6' },
  analisando: { label: 'Analisando', color: '#1584D1' },
  aguardando_sistema: { label: 'Aguardando sistema', color: '#9AACB8' },
  aguardando_humano: { label: 'Aguardando humano', color: '#7C5CBF' },
  concluido: { label: 'Concluído', color: '#0FA39D' },
  concluido_alerta: { label: 'Concluído com alerta', color: '#E5A11A' },
  falhou: { label: 'Falhou', color: '#D14A55' },
  cancelado: { label: 'Cancelado', color: '#9AACB8' },
};

export interface ExecStep { label: string; detail: string; }
export interface Agent {
  id: string; name: string; function: string; status: AgentStatus;
  entity: string; started: string; duration: string; step: string;
  confidence: number | null; sources: string[]; recommendation: string;
  awaiting: string; human: string; execSteps?: ExecStep[];
}

export const AGENTS: Agent[] = [
  {
    id: 'orquestrador', name: 'Agente Orquestrador do Ciclo de Vida',
    function: 'Coordena os agentes especializados e determina qual processo deve ser acionado.',
    status: 'em_execucao', entity: 'Carteira nacional', started: '19:41:58', duration: 'contínuo',
    step: 'Determinando próximo agente a acionar', confidence: null,
    sources: ['Regras de negócio por programa', 'Eventos do barramento', 'Estado das entidades'],
    recommendation: 'Acionar Agente de Medição e Desembolso para a Medição nº 6 — Vale Verde',
    awaiting: '—', human: '—',
  },
  {
    id: 'funding', name: 'Agente de Funding e Covenants',
    function: 'Verifica aderência às condições da fonte de capital.',
    status: 'concluido', entity: 'FGTS — Envelope Saneamento 2026', started: '08:12:00', duration: '46s',
    step: 'Concluído', confidence: 0.97,
    sources: ['Contrato de repasse FGTS', 'Regras de destinação', 'Posição de caixa do envelope'],
    recommendation: 'Elegível — nenhum risco de covenant identificado no período',
    awaiting: 'Nenhuma', human: '—',
  },
  {
    id: 'elegibilidade', name: 'Agente de Elegibilidade',
    function: 'Executa checklist regulatório e programático.',
    status: 'aguardando_humano', entity: 'Residencial Horizonte Azul', started: '14:03:10', duration: '11 min',
    step: 'Aguardando decisão sobre prontidão operacional', confidence: 0.88,
    sources: ['Checklist do programa habitacional', 'Documentos de acesso viário', 'Vistoria técnica'],
    recommendation: 'Não reconhecer prontidão operacional plena — pendência de acesso viário',
    awaiting: 'Decisão do gestor de carteira', human: 'Marlos Batista',
  },
  {
    id: 'risco_territorial', name: 'Agente de Risco Territorial e Climático',
    function: 'Cruza a localização do ativo com ameaças e vulnerabilidades.',
    status: 'concluido_alerta', entity: 'Programa de Macrodrenagem Rio Norte', started: '19:10:22', duration: '3 min',
    step: 'Concluído com alerta', confidence: 0.92,
    sources: ['CEMADEN — alertas hidrológicos', 'MapBiomas — uso do solo', 'Sensores de nível de água'],
    recommendation: '2 dos 14 ativos expostos a evento climático simulado — recomenda-se reprogramação e reforço de componentes',
    awaiting: 'Aprovação da reprogramação', human: 'Fernanda Ribeiro',
    execSteps: [
      { label: 'Gatilho recebido', detail: 'Alerta hidrológico CEMADEN para a bacia do Rio Norte às 18:52' },
      { label: 'Dados consultados', detail: 'Cadastro dos 14 ativos do programa, cotas de projeto, séries históricas de nível' },
      { label: 'Documentos lidos', detail: 'Estudo de risco climático original, plano de contingência municipal' },
      { label: 'Regras aplicadas', detail: 'Cruzamento de cota do ativo com cota de alerta + distância a corpos hídricos' },
      { label: 'Modelos executados', detail: 'Modelo de exposição a inundação, score de vulnerabilidade por componente' },
      { label: 'Inconsistências encontradas', detail: '2 ativos (comportas C-06 e C-11) com cota abaixo do nível de alerta revisado' },
      { label: 'Recomendação produzida', detail: 'Reprogramação técnica + reforço estrutural dos componentes expostos' },
      { label: 'Workflow acionado', detail: 'Encaminhado ao Nexo Entrega para avaliação de reprogramação' },
      { label: 'Resposta humana', detail: 'Aguardando aprovação da engenharia regional' },
      { label: 'Resultado final', detail: 'Pendente — decisão impacta cronograma de 2 contratos' },
    ],
  },
  {
    id: 'engenharia', name: 'Agente de Engenharia e Custos',
    function: 'Compara orçamento, quantidades e cronograma.',
    status: 'analisando', entity: 'Sistema Integrado de Esgotamento Vale Verde', started: '19:42:30', duration: 'em andamento',
    step: 'Comparando quantitativos com referenciais SINAPI', confidence: null,
    sources: ['SINAPI — composições e preços regionais', 'Planilha orçamentária', 'Medições anteriores (#1–#5)'],
    recommendation: '—', awaiting: 'Conclusão da análise', human: '—',
  },
  {
    id: 'fraude', name: 'Agente de Inconsistências e Fraude',
    function: 'Detecta padrões anômalos em medições e evidências.',
    status: 'concluido_alerta', entity: 'Sistema Integrado de Esgotamento Vale Verde', started: '19:42:06', duration: '13s',
    step: 'Concluído com alerta', confidence: 0.91,
    sources: ['Baseline contratual', 'Geometria executada (shapefile)', 'Histórico de medições #1–#5', 'Metadados EXIF das evidências'],
    recommendation: 'Vistoria física recomendada nos trechos T-14, T-17 e T-22 antes da liberação total do item de ligações domiciliares',
    awaiting: 'Execução da vistoria', human: 'Equipe de vistoria — GEREG Sudeste',
    execSteps: [
      { label: 'Gatilho recebido', detail: 'Medição nº 6 do contrato CT-2025-SAN-0142 recebida às 19:42:04' },
      { label: 'Dados consultados', detail: 'Baseline contratual, projeto executivo aprovado, medições #1 a #5' },
      { label: 'Documentos lidos', detail: '28 evidências fotográficas, 2 arquivos de geometria executada, boletim de medição' },
      { label: 'Regras aplicadas', detail: 'Comparação geométrica com tolerância de 15 m, checagem de duplicidade de imagem e metadados EXIF' },
      { label: 'Modelos executados', detail: 'Comparação espacial vetor-a-vetor, classificador de anomalias em série histórica' },
      { label: 'Inconsistências encontradas', detail: 'Desvio médio de 47 m entre geometria executada e projeto aprovado em T-14, T-17 e T-22' },
      { label: 'Recomendação produzida', detail: 'Vistoria física nos 3 trechos antes da liberação integral do item afetado' },
      { label: 'Workflow acionado', detail: 'Ordem de vistoria OV-2026-0871 gerada e encaminhada ao Agente de Vistoria' },
      { label: 'Resposta humana', detail: 'Aguardando laudo do vistoriador de campo' },
      { label: 'Resultado final', detail: 'Pendente — liberação parcial recomendada: R$ 15,7 milhões de R$ 18,4 milhões solicitados' },
    ],
  },
  {
    id: 'medicao', name: 'Agente de Medição e Desembolso',
    function: 'Prepara a decisão de liberação a partir da medição.',
    status: 'aguardando_sistema', entity: 'Sistema Integrado de Esgotamento Vale Verde', started: '19:42:19', duration: '1 min',
    step: 'Aguardando laudo de vistoria para recalcular valor liberável', confidence: 0.85,
    sources: ['Medição nº 6', 'Contrato CT-2025-SAN-0142', 'Baseline contratual', 'Saldo do funding'],
    recommendation: 'Liberação parcial sugerida: R$ 15,7 milhões de R$ 18,4 milhões solicitados',
    awaiting: 'Laudo de vistoria', human: '—',
    execSteps: [
      { label: 'Gatilho recebido', detail: 'Medição validada automaticamente para itens sem divergência' },
      { label: 'Dados consultados', detail: 'Saldo do envelope FGTS, condicionantes contratuais, cronograma de desembolso' },
      { label: 'Documentos lidos', detail: 'Contrato CT-2025-SAN-0142, baseline, medições anteriores' },
      { label: 'Regras aplicadas', detail: 'Retenção proporcional de itens com trecho divergente' },
      { label: 'Modelos executados', detail: 'Cálculo de valor liberável com retenção condicionada' },
      { label: 'Inconsistências encontradas', detail: 'Herdadas do Agente de Inconsistências e Fraude' },
      { label: 'Recomendação produzida', detail: 'Liberar R$ 15,7 mi; reter R$ 2,65 mi até conclusão da vistoria' },
      { label: 'Workflow acionado', detail: 'Aguardando laudo antes de emitir despacho de desembolso' },
      { label: 'Resposta humana', detail: 'Pendente' },
      { label: 'Resultado final', detail: 'Em andamento' },
    ],
  },
  {
    id: 'vistoria', name: 'Agente de Vistoria',
    function: 'Planeja e apoia inspeções em campo.',
    status: 'em_execucao', entity: 'Ordem OV-2026-0871', started: '19:42:23', duration: 'em andamento',
    step: 'Equipe em deslocamento para o trecho T-14', confidence: null,
    sources: ['Ordem de vistoria', 'Roteiro otimizado', 'Checklist do marco 4'],
    recommendation: '—', awaiting: 'Coleta em campo', human: 'Equipe de vistoria — GEREG Sudeste',
    execSteps: [
      { label: 'Gatilho recebido', detail: 'Recomendação de vistoria do Agente de Inconsistências e Fraude' },
      { label: 'Dados consultados', detail: 'Localização dos 3 trechos, disponibilidade da equipe regional' },
      { label: 'Documentos lidos', detail: 'Checklist do marco 4, projeto executivo aprovado' },
      { label: 'Regras aplicadas', detail: 'Priorização por desvio geométrico e criticidade do ativo' },
      { label: 'Modelos executados', detail: 'Otimização de rota entre os 3 trechos (38 km)' },
      { label: 'Inconsistências encontradas', detail: '—' },
      { label: 'Recomendação produzida', detail: 'Roteiro: T-14 → T-17 → T-22' },
      { label: 'Workflow acionado', detail: 'Ordem de vistoria OV-2026-0871 atribuída' },
      { label: 'Resposta humana', detail: 'Equipe confirmou deslocamento' },
      { label: 'Resultado final', detail: 'Em campo' },
    ],
  },
  {
    id: 'despachos', name: 'Agente de Despachos e Diligências',
    function: 'Gera comunicações formais a partir de modelos aprovados.',
    status: 'agendado', entity: 'Fila corporativa', started: '—', duration: '—',
    step: 'Aguardando gatilho', confidence: null,
    sources: ['Modelos oficiais por programa'], recommendation: '—', awaiting: 'Próximo gatilho', human: '—',
  },
  {
    id: 'comissionamento', name: 'Agente de Comissionamento',
    function: 'Verifica se a conclusão física corresponde à prontidão operacional.',
    status: 'concluido', entity: 'Residencial Horizonte Azul', started: '13:50:00', duration: '4 min',
    step: 'Concluído', confidence: 0.88,
    sources: ['Testes', 'Licenças', 'Cadastro do operador', 'Documentação as built'],
    recommendation: 'Pronto com pendências — bloqueio: acesso viário não concluído',
    awaiting: 'Nenhuma', human: '—',
  },
  {
    id: 'saude', name: 'Agente de Saúde do Ativo',
    function: 'Analisa dados operacionais e prevê degradação.',
    status: 'em_execucao', entity: 'Carteira em operação (6 ativos)', started: '19:00:00', duration: 'contínuo',
    step: 'Recalculando índice de saúde', confidence: null,
    sources: ['Telemetria (sensores de vibração, vazão, pressão e temperatura)', 'Ordens de serviço', 'Histórico de falhas'],
    recommendation: 'Complexo Eólico Costa Branca — manutenção preditiva recomendada em 45 dias para 3 componentes (WTG-08, WTG-14, WTG-22)',
    awaiting: 'Nenhuma', human: '—',
    execSteps: [
      { label: 'Gatilho recebido', detail: 'Ciclo contínuo de recálculo — leituras de telemetria recebidas a cada ~2,4s' },
      { label: 'Dados consultados', detail: 'Sensores de vibração (WTG-14), temperatura (WTG-08) e velocidade do vento (WTG-22)' },
      { label: 'Documentos lidos', detail: 'Histórico de ordens de serviço OS-4471, OS-4472 e OS-4473' },
      { label: 'Regras aplicadas', detail: 'Limiar de alerta por sensor + tendência de degradação nas últimas 24 leituras' },
      { label: 'Modelos executados', detail: 'Modelo de previsão de falha (janela de 30 e 90 dias) por componente' },
      { label: 'Inconsistências encontradas', detail: 'Vibração da caixa multiplicadora WTG-14 em tendência de alta — 46% de probabilidade de falha em 90 dias' },
      { label: 'Recomendação produzida', detail: 'Substituição preditiva da caixa multiplicadora WTG-14 e inspeção das pás de WTG-22' },
      { label: 'Workflow acionado', detail: 'Ordens de serviço preditivas OS-4471 e OS-4472 mantidas abertas no Nexo Ativos' },
      { label: 'Resposta humana', detail: 'Tiago Almeida programou janela de manutenção para os próximos 45 dias' },
      { label: 'Resultado final', detail: 'Índice de saúde do Complexo Eólico Costa Branca mantido em 87 — sem indisponibilidade não planejada' },
    ],
  },
  {
    id: 'impacto', name: 'Agente de Impacto e MRV',
    function: 'Valida indicadores e produz relatórios de resultado.',
    status: 'concluido', entity: 'Adutora Sertão Vivo', started: '09:00:00', duration: '6 min',
    step: 'Concluído', confidence: 0.95,
    sources: ['Baseline e meta', 'Dados observados', 'Evidências de campo'],
    recommendation: 'Indicador validado — 296 mil beneficiários comprovados (meta: 310 mil)',
    awaiting: 'Nenhuma', human: '—',
  },
];

// ---------------------------------------------------------------------------
// Central de eventos (barramento simulado)
// ---------------------------------------------------------------------------
export interface EventItem { t: string; text: string; type: 'info' | 'success' | 'warning' | 'critical' | 'agent'; }
export const INITIAL_EVENTS: EventItem[] = [
  { t: '19:42:04', text: 'Medição nº 6 recebida — Vale Verde', type: 'info' },
  { t: '19:42:06', text: 'Agente de Inconsistências e Fraude iniciado', type: 'agent' },
  { t: '19:42:11', text: '28 evidências validadas automaticamente', type: 'success' },
  { t: '19:42:14', text: 'Divergência espacial identificada — trechos T-14, T-17, T-22', type: 'warning' },
  { t: '19:42:16', text: 'Risco do ativo atualizado para Crítico', type: 'warning' },
  { t: '19:42:19', text: 'Agente de Vistoria acionado', type: 'agent' },
  { t: '19:42:23', text: 'Ordem de vistoria OV-2026-0871 criada', type: 'info' },
  { t: '19:42:27', text: 'Analista responsável notificado — Ana Beatriz Souza', type: 'info' },
];

export const DEMO_SCRIPT: Array<{ text: string; type: EventItem['type']; vistoriaStage?: string }> = [
  { text: 'Equipe de vistoria designada — 2 técnicos, GEREG Sudeste', type: 'info', vistoriaStage: 'designada' },
  { text: 'Roteiro otimizado gerado — 3 trechos, 38 km', type: 'agent' },
  { text: 'Equipe em deslocamento para o trecho T-14', type: 'info', vistoriaStage: 'em_campo' },
  { text: '12 fotos e 3 leituras GPS recebidas do trecho T-14', type: 'success' },
  { text: 'Divergência confirmada em T-14 — desvio de 52 m', type: 'warning' },
  { text: 'Equipe seguiu para o trecho T-17', type: 'info' },
  { text: 'Trecho T-17 dentro da tolerância — sem divergência', type: 'success' },
  { text: 'Equipe seguiu para o trecho T-22', type: 'info' },
  { text: 'Divergência confirmada em T-22 — desvio de 41 m', type: 'warning' },
  { text: 'Coleta finalizada — sincronizando dados', type: 'info', vistoriaStage: 'sincronizada' },
  { text: 'Agente de Vistoria comparou evidências com o contrato', type: 'agent' },
  { text: 'Laudo preliminar emitido — nível de confiança 93%', type: 'success', vistoriaStage: 'validacao' },
  { text: 'Agente de Medição e Desembolso recalculou valor liberável: R$ 15,7 milhões', type: 'agent' },
  { text: 'Parecer atualizado disponível para decisão', type: 'success', vistoriaStage: 'concluida' },
];

export interface AuditEntry { id: number; t: string; user: string; action: string; detail: string; }
export const INITIAL_AUDIT: AuditEntry[] = [
  { id: 1, t: '20/07 19:42', user: 'Sistema · Agente de Inconsistências e Fraude', action: 'Alerta gerado', detail: 'Divergência espacial em 3 trechos — Medição nº 6' },
  { id: 2, t: '20/07 19:42', user: 'Sistema · Agente de Vistoria', action: 'Ordem criada', detail: 'OV-2026-0871 atribuída à equipe GEREG Sudeste' },
  { id: 3, t: '19/07 16:10', user: 'Carlos Eduardo Lima', action: 'Prontidão não concedida', detail: 'Residencial Horizonte Azul — pendência de acesso viário' },
];

// ---------------------------------------------------------------------------
// KPIs e gráficos — Nexo Control
// ---------------------------------------------------------------------------
export const KPI_CONTROL = {
  capitalDisponivel: 2_100_000_000,
  capitalAlocado: 6_800_000_000,
  contratado: 5_100_000_000,
  desembolsado: 3_200_000_000,
  execucaoFisicaMedia: 0.58,
  ativosComissionados: 142,
  ativosEmOperacao: 486,
  ativosCriticos: 9,
  beneficiariosPrevistos: 3_850_000,
  beneficiariosComprovados: 2_390_000,
  impactoVerificado: 0.71,
};

export const FUNNEL_DATA = [
  { name: 'Capital alocado', value: 6800, fill: '#005CA9' },
  { name: 'Contratado', value: 5100, fill: '#0B6FC2' },
  { name: 'Desembolsado', value: 3200, fill: '#1584D1' },
  { name: 'Ativos comissionados', value: 1450, fill: '#18B7D6' },
  { name: 'Resultado comprovado', value: 980, fill: '#0FA39D' },
];

export const SCURVE_DATA = [
  { mes: 'Jan', planejado: 0.08, realizado: 0.07 },
  { mes: 'Fev', planejado: 0.16, realizado: 0.15 },
  { mes: 'Mar', planejado: 0.25, realizado: 0.22 },
  { mes: 'Abr', planejado: 0.35, realizado: 0.31 },
  { mes: 'Mai', planejado: 0.46, realizado: 0.40 },
  { mes: 'Jun', planejado: 0.56, realizado: 0.48 },
  { mes: 'Jul', planejado: 0.66, realizado: 0.64 },
  { mes: 'Ago', planejado: 0.75, realizado: null },
  { mes: 'Set', planejado: 0.84, realizado: null },
  { mes: 'Out', planejado: 0.92, realizado: null },
  { mes: 'Nov', planejado: 0.98, realizado: null },
  { mes: 'Dez', planejado: 1.0, realizado: null },
];

export const RISK_MATRIX_DATA = [
  { name: 'Vale Verde — divergência geométrica', probabilidade: 4, impacto: 4, categoria: 'Execução' },
  { name: 'Rio Norte — exposição climática', probabilidade: 3, impacto: 5, categoria: 'Climático' },
  { name: 'Horizonte Azul — acesso viário', probabilidade: 2, impacto: 3, categoria: 'Entrega' },
  { name: 'Concentração FGTS — Sudeste', probabilidade: 2, impacto: 4, categoria: 'Funding' },
  { name: 'Covenant ESG — Costa Branca', probabilidade: 1, impacto: 2, categoria: 'Covenant' },
  { name: 'Licenciamento — BRT Serra Azul', probabilidade: 3, impacto: 3, categoria: 'Regulatório' },
  { name: 'Sobrepreço potencial — UBS Digital', probabilidade: 2, impacto: 2, categoria: 'Custos' },
];

export const TREEMAP_SOURCE = [
  { name: 'FGTS', value: 2900 },
  { name: 'Tesouro (OGU)', value: 1200 },
  { name: 'BID', value: 850 },
  { name: 'BIRD / Banco Mundial', value: 640 },
  { name: 'Recursos Próprios CAIXA', value: 780 },
  { name: 'Mercado (Green Bond)', value: 430 },
];

export const BAR_PROGRAM_DATA = [
  { programa: 'Saneamento', planejado: 1450, realizado: 1180 },
  { programa: 'Habitação', planejado: 980, realizado: 890 },
  { programa: 'Drenagem/Clima', planejado: 720, realizado: 430 },
  { programa: 'Rec. Hídricos', planejado: 520, realizado: 498 },
  { programa: 'Mobilidade', planejado: 610, realizado: 90 },
  { programa: 'Energia', planejado: 890, realizado: 890 },
];
