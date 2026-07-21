import { REALISTIC_FUNDING_SOURCES, REALISTIC_COVENANTS, REALISTIC_PROGRAM_ENVELOPES } from '@/data/realisticPortfolioData';
// Dados sintéticos — Nexo Capital (V2)

export interface FundingSource {
  id: string;
  nome: string;
  instituicao: string;
  tipoInstrumento: string;
  moeda: string;
  valor: number;
  custo: string;
  indexador: string;
  prazoAnos: number;
  carenciaAnos: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  programasElegiveis: string[];
  setores: string[];
  territorios: string[];
  publicoBeneficiario: string;
  atividadesExcluidas: string[];
  taxonomia: string;
  categoriasVerdesSociais: string[];
  metasSustentaveis: string;
  frequenciaReporte: string;
  unidadeResponsavel: string;
  responsaveis: string[];
  alcadas: string;
  periodicidadeRevisao: string;
  valorAlocado: number;
  valorUtilizado: number;
  status: 'normal' | 'atencao' | 'critico';
}

export const FUNDING_SOURCES: FundingSource[] = [
  {
    id: 'FND-001', nome: 'Envelope FGTS Saneamento e Habitação 2026', instituicao: 'FGTS', tipoInstrumento: 'Repasse habitacional/saneamento',
    moeda: 'BRL', valor: 2_900_000_000, custo: 'TR + 5,3% a.a.', indexador: 'TR', prazoAnos: 30, carenciaAnos: 3,
    vigenciaInicio: '2024-01-15', vigenciaFim: '2038-01-15',
    programasElegiveis: ['Programa Nacional de Saneamento Rural e Urbano', 'Programa Habitacional de Interesse Social'],
    setores: ['Saneamento', 'Habitação'], territorios: ['Nacional, com prioridade Norte/Nordeste'],
    publicoBeneficiario: 'Municípios e estados com IDH abaixo da média regional',
    atividadesExcluidas: ['Empreendimentos em áreas de risco não mitigável', 'Obras sem licenciamento ambiental prévio'],
    taxonomia: 'Taxonomia Social CAIXA v2', categoriasVerdesSociais: ['Acesso à água e saneamento', 'Moradia digna'],
    metasSustentaveis: '1,2 milhão de novas ligações de esgoto até 2030',
    frequenciaReporte: 'Trimestral', unidadeResponsavel: 'Nexo Capital — Fundos Sociais',
    responsaveis: ['Marlos Batista'], alcadas: 'Diretoria Executiva acima de R$ 200 mi por operação',
    periodicidadeRevisao: 'Anual', valorAlocado: 2_900_000_000, valorUtilizado: 1_780_000_000, status: 'normal',
  },
  {
    id: 'FND-002', nome: 'Transferência Voluntária OGU — Infraestrutura Social', instituicao: 'Tesouro Nacional (OGU)', tipoInstrumento: 'Transferência voluntária',
    moeda: 'BRL', valor: 1_200_000_000, custo: 'Sem custo financeiro', indexador: '—', prazoAnos: 6, carenciaAnos: 0,
    vigenciaInicio: '2025-02-01', vigenciaFim: '2030-02-01',
    programasElegiveis: ['Programa de Infraestrutura Social Ribeirinha', 'Programa de Adaptação Climática Urbana'],
    setores: ['Saúde', 'Drenagem'], territorios: ['Regiões Norte e Nordeste'],
    publicoBeneficiario: 'Municípios com população vulnerável a eventos climáticos',
    atividadesExcluidas: ['Despesas de custeio administrativo'],
    taxonomia: 'Não aplicável', categoriasVerdesSociais: ['Adaptação climática'],
    metasSustentaveis: 'Reduzir em 30% a população exposta a inundação nos municípios atendidos',
    frequenciaReporte: 'Semestral', unidadeResponsavel: 'Nexo Capital — Convênios',
    responsaveis: ['Marlos Batista'], alcadas: 'Comitê de Convênios acima de R$ 50 mi',
    periodicidadeRevisao: 'Semestral', valorAlocado: 1_200_000_000, valorUtilizado: 612_000_000, status: 'atencao',
  },
  {
    id: 'FND-003', nome: 'Linha BID Infraestrutura Resiliente', instituicao: 'BID', tipoInstrumento: 'Empréstimo multilateral',
    moeda: 'USD', valor: 850_000_000, custo: 'SOFR + 1,8% a.a.', indexador: 'SOFR', prazoAnos: 20, carenciaAnos: 5,
    vigenciaInicio: '2023-06-10', vigenciaFim: '2041-06-10',
    programasElegiveis: ['Programa de Adaptação Climática Urbana', 'Programa de Mobilidade Urbana Sustentável'],
    setores: ['Drenagem', 'Mobilidade'], territorios: ['Municípios com risco climático mapeado'],
    publicoBeneficiario: 'Áreas urbanas com exposição a eventos extremos',
    atividadesExcluidas: ['Empreendimentos em áreas protegidas', 'Atividades com alto risco fundiário não regularizado'],
    taxonomia: 'Green Bond Principles (ICMA)', categoriasVerdesSociais: ['Adaptação e resiliência climática'],
    metasSustentaveis: '850 mil pessoas com exposição a inundação reduzida até 2029',
    frequenciaReporte: 'Trimestral', unidadeResponsavel: 'Nexo Capital — Organismos Multilaterais',
    responsaveis: ['Marlos Batista'], alcadas: 'Board conjunto CAIXA–BID acima de US$ 30 mi',
    periodicidadeRevisao: 'Trimestral', valorAlocado: 850_000_000, valorUtilizado: 323_000_000, status: 'critico',
  },
  {
    id: 'FND-004', nome: 'BIRD Mobilidade Urbana Sustentável', instituicao: 'BIRD / Banco Mundial', tipoInstrumento: 'Empréstimo multilateral',
    moeda: 'USD', valor: 640_000_000, custo: 'SOFR + 1,6% a.a.', indexador: 'SOFR', prazoAnos: 22, carenciaAnos: 6,
    vigenciaInicio: '2024-09-01', vigenciaFim: '2046-09-01',
    programasElegiveis: ['Programa de Mobilidade Urbana Sustentável'], setores: ['Mobilidade'],
    territorios: ['Regiões metropolitanas acima de 500 mil habitantes'],
    publicoBeneficiario: 'Usuários de transporte público de baixa renda',
    atividadesExcluidas: ['Expansão de infraestrutura viária para veículos particulares'],
    taxonomia: 'Green Bond Principles (ICMA)', categoriasVerdesSociais: ['Transporte de baixo carbono'],
    metasSustentaveis: 'Redução de 18% nas emissões de transporte nos corredores atendidos',
    frequenciaReporte: 'Semestral', unidadeResponsavel: 'Nexo Capital — Organismos Multilaterais',
    responsaveis: ['Marlos Batista'], alcadas: 'Board conjunto CAIXA–BIRD acima de US$ 25 mi',
    periodicidadeRevisao: 'Semestral', valorAlocado: 640_000_000, valorUtilizado: 38_000_000, status: 'normal',
  },
  {
    id: 'FND-005', nome: 'Green Bond Transição Energética 2033', instituicao: 'Mercado de Capitais', tipoInstrumento: 'Título de dívida (green bond)',
    moeda: 'BRL', valor: 430_000_000, custo: 'IPCA + 6,1% a.a.', indexador: 'IPCA', prazoAnos: 7, carenciaAnos: 2,
    vigenciaInicio: '2026-03-20', vigenciaFim: '2033-03-20',
    programasElegiveis: ['Programa de Energias Renováveis e Transição Justa'], setores: ['Energia'],
    territorios: ['Nacional'], publicoBeneficiario: 'Comunidades no entorno de empreendimentos de energia renovável',
    atividadesExcluidas: ['Geração a partir de combustíveis fósseis'],
    taxonomia: 'Climate Bonds Standard', categoriasVerdesSociais: ['Energia renovável', 'Transição justa'],
    metasSustentaveis: '1,2 GW de capacidade renovável adicional até 2029',
    frequenciaReporte: 'Trimestral', unidadeResponsavel: 'Nexo Capital — Mercado de Capitais',
    responsaveis: ['Marlos Batista'], alcadas: 'Comitê Financeiro acima de R$ 100 mi',
    periodicidadeRevisao: 'Anual', valorAlocado: 430_000_000, valorUtilizado: 430_000_000, status: 'normal',
  },
  {
    id: 'FND-006', nome: 'Recursos Próprios CAIXA — Carteira Estratégica', instituicao: 'Recursos Próprios CAIXA', tipoInstrumento: 'Capital próprio',
    moeda: 'BRL', valor: 780_000_000, custo: 'Custo de oportunidade interno', indexador: 'CDI', prazoAnos: 15, carenciaAnos: 1,
    vigenciaInicio: '2024-01-01', vigenciaFim: '2039-01-01',
    programasElegiveis: ['Programa Nacional de Educação Profissionalizante', 'Programa de Infraestrutura Social Ribeirinha'],
    setores: ['Educação', 'Saúde'], territorios: ['Nacional, prioridade Centro-Oeste e Norte'],
    publicoBeneficiario: 'Jovens e comunidades ribeirinhas', atividadesExcluidas: ['Atividades sem contrapartida de manutenção'],
    taxonomia: 'Taxonomia Social CAIXA v2', categoriasVerdesSociais: ['Educação profissionalizante', 'Saúde básica'],
    metasSustentaveis: '40 mil vagas de educação profissionalizante até 2028',
    frequenciaReporte: 'Anual', unidadeResponsavel: 'Nexo Capital — Carteira Própria',
    responsaveis: ['Marlos Batista'], alcadas: 'Diretoria Executiva acima de R$ 30 mi',
    periodicidadeRevisao: 'Anual', valorAlocado: 780_000_000, valorUtilizado: 106_000_000, status: 'normal',
  },
];
FUNDING_SOURCES.push(...REALISTIC_FUNDING_SOURCES);

export interface Covenant {
  id: string; fonteId: string; descricao: string; proximaVerificacao: string; status: 'normal' | 'atencao' | 'critico';
}
export const COVENANTS: Covenant[] = [
  { id: 'COV-11', fonteId: 'FND-003', descricao: 'Relatório trimestral de resiliência climática ao BID', proximaVerificacao: '2026-08-15', status: 'critico' },
  { id: 'COV-12', fonteId: 'FND-005', descricao: 'Certificação anual Climate Bonds Standard', proximaVerificacao: '2027-03-20', status: 'normal' },
  { id: 'COV-13', fonteId: 'FND-002', descricao: 'Comprovação semestral de redução de exposição a inundação', proximaVerificacao: '2026-09-01', status: 'atencao' },
  { id: 'COV-14', fonteId: 'FND-004', descricao: 'Relatório de emissões evitadas — corredores de mobilidade', proximaVerificacao: '2026-12-01', status: 'normal' },
  { id: 'COV-15', fonteId: 'FND-001', descricao: 'Comprovação trimestral de novas ligações de esgoto', proximaVerificacao: '2026-10-15', status: 'normal' },
];
COVENANTS.push(...REALISTIC_COVENANTS);

export interface ProgramEnvelope { programa: string; envelope: number; alocado: number; territorio: string; }
export const PROGRAM_ENVELOPES: ProgramEnvelope[] = [
  { programa: 'Programa Nacional de Saneamento Rural e Urbano', envelope: 2_900, alocado: 1_780, territorio: 'Nacional' },
  { programa: 'Programa Habitacional de Interesse Social', envelope: 980, alocado: 890, territorio: 'Nordeste' },
  { programa: 'Programa de Adaptação Climática Urbana', envelope: 1_200, alocado: 612, territorio: 'Norte' },
  { programa: 'Programa de Mobilidade Urbana Sustentável', envelope: 640, alocado: 38, territorio: 'Sudeste' },
  { programa: 'Programa de Energias Renováveis e Transição Justa', envelope: 430, alocado: 430, territorio: 'Nordeste' },
  { programa: 'Programa Nacional de Educação Profissionalizante', envelope: 420, alocado: 42, territorio: 'Centro-Oeste' },
];
PROGRAM_ENVELOPES.push(...REALISTIC_PROGRAM_ENVELOPES);

export type CapitalSection = 'overview' | 'sources' | 'programs' | 'covenants' | 'map' | 'analytics' | 'agents' | 'reports' | 'integrations' | 'admin';

export type CapitalAgentStatus = 'idle' | 'running' | 'waiting' | 'done' | 'alert';

export interface CapitalAgentRuntime {
  id: string;
  name: string;
  icon: string;
  status: CapitalAgentStatus;
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

export const CAPITAL_AGENT_RUNTIME: CapitalAgentRuntime[] = [
  {
    id: 'AG-CAP-01', name: 'Agente de Funding', icon: 'Landmark', status: 'idle', entity: 'Carteira corporativa 2026',
    step: 'Pronto para reconciliar disponibilidade, custo, prazo e destinação das fontes.', progress: 0, confidence: 96,
    sources: ['Sistemas financeiros CAIXA', 'SIAFF', 'Contratos de funding'],
    recommendation: 'Executar reconciliação diária antes da rodada de alocação.', impact: 'R$ 6,8 bi monitorados', lastRun: 'Hoje, 06:10',
    awaiting: 'Nenhuma ação', human: 'Gerência de Funding',
  },
  {
    id: 'AG-CAP-02', name: 'Agente de Covenants', icon: 'FileWarning', status: 'alert', entity: 'Linha BID Infraestrutura Resiliente',
    step: 'Relatório trimestral de resiliência com 2 evidências ainda não reconciliadas.', progress: 68, confidence: 91,
    sources: ['Contratos BID', 'Nexo Impacto', 'Nexo Evidência'],
    recommendation: 'Solicitar validação das evidências de redução de exposição até 24/07.', impact: 'US$ 52 mi sob risco de postergação', lastRun: 'Há 18 min',
    awaiting: 'Validação técnica', human: 'VP Sustentabilidade e Cidadania',
  },
  {
    id: 'AG-CAP-03', name: 'Agente de Alocação', icon: 'SlidersHorizontal', status: 'idle', entity: 'Envelopes de infraestrutura urbana',
    step: 'Pronto para otimizar alocação por impacto, risco, execução e custo de capital.', progress: 0, confidence: 93,
    sources: ['Nexo Carteira', 'Nexo Contrata', 'Nexo Control', 'IBGE'],
    recommendation: 'Priorizar saneamento Norte/Nordeste e mobilidade em carteiras com prontidão acima de 72%.', impact: 'R$ 920 mi realocáveis', lastRun: 'Ontem, 21:40',
    awaiting: 'Novo cenário', human: 'Comitê de Alocação',
  },
  {
    id: 'AG-CAP-04', name: 'Agente de Elegibilidade do Capital', icon: 'BadgeCheck', status: 'idle', entity: 'Fontes multilaterais e green bonds',
    step: 'Verifica taxonomia, atividades excluídas, território e público beneficiário.', progress: 0, confidence: 94,
    sources: ['Taxonomias CAIXA', 'Princípios do Equador', 'Nexo Contrata'],
    recommendation: 'Executar no ingresso de toda nova operação e após alteração de escopo.', impact: '32 operações elegíveis', lastRun: 'Hoje, 07:15',
    awaiting: 'Nenhuma ação', human: 'Gerência de Sustentabilidade',
  },
  {
    id: 'AG-CAP-05', name: 'Agente de Prestação ao Financiador', icon: 'FileText', status: 'waiting', entity: 'Green Bond Transição Energética 2033',
    step: 'Minuta do relatório de alocação e impacto gerada; aguardando aprovação humana.', progress: 92, confidence: 97,
    sources: ['Nexo Impacto', 'Nexo Ativos', 'Razão financeiro'],
    recommendation: 'Aprovar versão 1.4 e agendar publicação após revisão jurídica.', impact: 'R$ 430 mi reportados', lastRun: 'Há 42 min',
    awaiting: 'Aprovação do relatório', human: 'Relações com Investidores',
  },
  {
    id: 'AG-CAP-06', name: 'Agente de Liquidez e Desembolso', icon: 'Banknote', status: 'idle', entity: 'Previsão 12 meses',
    step: 'Projeta desembolsos, vencimentos e necessidade incremental de funding.', progress: 0, confidence: 89,
    sources: ['Nexo Entrega', 'Nexo Contrata', 'Tesouraria'],
    recommendation: 'Antecipar captação de R$ 380 mi no 4º trimestre para preservar buffer mínimo.', impact: 'Buffer projetado: 14,8%', lastRun: 'Hoje, 05:55',
    awaiting: 'Nova curva de execução', human: 'Tesouraria Corporativa',
  },
];

export const CAPITAL_LIVE_STEPS = [
  { agentId: 'AG-CAP-01', progress: 18, status: 'running' as const, step: 'Conectando SIAFF, contratos de funding e razão financeiro...', text: 'Agente de Funding iniciou reconciliação das seis fontes.', type: 'info' as const },
  { agentId: 'AG-CAP-01', progress: 54, status: 'running' as const, step: 'Normalizando moedas, indexadores e cronogramas de disponibilidade...', text: 'Funding reconciliado: R$ 6,8 bi equivalentes; 3 diferenças cambiais ajustadas.', type: 'info' as const },
  { agentId: 'AG-CAP-02', progress: 78, status: 'running' as const, step: 'Validando covenants contra evidências e indicadores de impacto...', text: 'Covenant BID: duas evidências pendentes identificadas.', type: 'warning' as const },
  { agentId: 'AG-CAP-03', progress: 31, status: 'running' as const, step: 'Executando 2.400 combinações de alocação territorial e programática...', text: 'Agente de Alocação está simulando cenários de impacto e execução.', type: 'info' as const },
  { agentId: 'AG-CAP-04', progress: 66, status: 'running' as const, step: 'Verificando atividades excluídas e aderência às taxonomias...', text: 'Elegibilidade: uma operação requer reenquadramento territorial.', type: 'warning' as const },
  { agentId: 'AG-CAP-06', progress: 72, status: 'running' as const, step: 'Projetando desembolsos com base na curva física dos ativos...', text: 'Liquidez: déficit potencial de R$ 380 mi no 4º trimestre.', type: 'warning' as const },
  { agentId: 'AG-CAP-03', progress: 100, status: 'done' as const, step: 'Cenário ótimo calculado e preparado para decisão do comitê.', text: 'Cenário recomendado: realocar R$ 220 mi para saneamento e R$ 110 mi para adaptação.', type: 'success' as const },
  { agentId: 'AG-CAP-02', progress: 100, status: 'waiting' as const, step: 'Despacho de diligência preparado; aguardando validação humana.', text: 'Despacho de covenant preparado e enviado para revisão humana.', type: 'success' as const },
  { agentId: 'AG-CAP-01', progress: 100, status: 'done' as const, step: 'Reconciliação concluída sem divergências materiais.', text: 'Ciclo de capital concluído: dados reconciliados e recomendações publicadas.', type: 'success' as const },
];

export const CAPITAL_CASHFLOW_FORECAST = [
  { mes: 'Ago', planejado: 420, projetado: 398 },
  { mes: 'Set', planejado: 510, projetado: 488 },
  { mes: 'Out', planejado: 620, projetado: 676 },
  { mes: 'Nov', planejado: 730, projetado: 802 },
  { mes: 'Dez', planejado: 680, projetado: 742 },
  { mes: 'Jan', planejado: 540, projetado: 565 },
  { mes: 'Fev', planejado: 490, projetado: 510 },
  { mes: 'Mar', planejado: 610, projetado: 646 },
];

export const CAPITAL_ANALYTICS_INSIGHTS = [
  { id: 'INS-CAP-01', title: 'Concentração elevada em FGTS', detail: '42,6% do funding equivalente está concentrado em uma única fonte. Diversificação reduz risco de programação.', impact: 'R$ 2,9 bi', confidence: 94, target: 'sources' as CapitalSection },
  { id: 'INS-CAP-02', title: 'Envelope de mobilidade subutilizado', detail: 'Somente 5,9% do envelope BIRD está utilizado; quatro oportunidades maduras existem no Nexo Carteira.', impact: 'R$ 602 mi disponíveis', confidence: 91, target: 'programs' as CapitalSection },
  { id: 'INS-CAP-03', title: 'Pressão de liquidez no 4º trimestre', detail: 'A aceleração física de seis ativos pode elevar desembolsos em 11,4% sobre o planejado.', impact: 'Gap de R$ 380 mi', confidence: 89, target: 'analytics' as CapitalSection },
  { id: 'INS-CAP-04', title: 'Covenant BID próximo do limite operacional', detail: 'Duas evidências pendentes podem atrasar a próxima janela de desembolso multilateral.', impact: 'US$ 52 mi', confidence: 91, target: 'covenants' as CapitalSection },
];

export const CAPITAL_REPORTS = [
  { id: 'RPT-CAP-01', name: 'Utilização do Funding', description: 'Disponível, comprometido, alocado, utilizado e saldo por fonte.', cadence: 'Mensal', owner: 'Gerência de Funding', format: 'PDF + XLSX', last: '01/07/2026' },
  { id: 'RPT-CAP-02', name: 'Covenants e Compromissos', description: 'Obrigações, evidências, risco, ações e trilha de aprovação.', cadence: 'Trimestral', owner: 'Sustentabilidade', format: 'PDF', last: '30/06/2026' },
  { id: 'RPT-CAP-03', name: 'Previsão de Liquidez e Desembolso', description: 'Projeção de 12 meses, cenários e necessidade de funding.', cadence: 'Semanal', owner: 'Tesouraria', format: 'XLSX + API', last: '18/07/2026' },
  { id: 'RPT-CAP-04', name: 'Alocação e Impacto por Programa', description: 'Rastreabilidade da fonte aos ativos, beneficiários e resultados.', cadence: 'Semestral', owner: 'Nexo Impacto', format: 'PDF + Dashboard', last: '30/06/2026' },
  { id: 'RPT-CAP-05', name: 'Green Bond Allocation Report', description: 'Relatório ao mercado conforme framework e Climate Bonds Standard.', cadence: 'Anual', owner: 'Relações com Investidores', format: 'PDF público', last: '20/03/2026' },
];

export const CAPITAL_ADMIN_RULES = [
  { id: 'RULE-CAP-01', name: 'Limite de concentração por fonte', description: 'Alertar quando uma fonte representar mais de 40% do funding equivalente.', value: '40%', status: 'ativa' },
  { id: 'RULE-CAP-02', name: 'Buffer mínimo de liquidez', description: 'Manter recursos livres equivalentes a pelo menos 12% dos desembolsos projetados em 90 dias.', value: '12%', status: 'ativa' },
  { id: 'RULE-CAP-03', name: 'Gate humano para realocação', description: 'Realocações acima de R$ 50 milhões exigem decisão do Comitê de Alocação.', value: 'R$ 50 mi', status: 'ativa' },
  { id: 'RULE-CAP-04', name: 'Alerta antecipado de covenant', description: 'Abrir workflow 45 dias antes do vencimento de cada obrigação.', value: '45 dias', status: 'ativa' },
  { id: 'RULE-CAP-05', name: 'Taxonomia obrigatória', description: 'Fontes sustentáveis devem ter categorias e indicadores vinculados antes da alocação.', value: 'Obrigatório', status: 'ativa' },
];

export const CAPITAL_ROLE_MATRIX = [
  { role: 'Gestor de Funding', sources: 'Editar', allocations: 'Propor', covenants: 'Executar', approvals: 'Até R$ 20 mi' },
  { role: 'Comitê de Alocação', sources: 'Consultar', allocations: 'Aprovar', covenants: 'Escalar', approvals: 'Acima de R$ 20 mi' },
  { role: 'Sustentabilidade', sources: 'Consultar', allocations: 'Parecer', covenants: 'Validar', approvals: 'Sem alçada financeira' },
  { role: 'Tesouraria', sources: 'Reconciliar', allocations: 'Parecer', covenants: 'Consultar', approvals: 'Liquidez e hedge' },
  { role: 'Auditoria', sources: 'Leitura', allocations: 'Leitura', covenants: 'Leitura', approvals: 'Sem alçada' },
];
