import { REALISTIC_OPPORTUNITIES } from '@/data/realisticPortfolioData';
// Dados sintéticos — Nexo Carteira. Todos os registros são fictícios e servem ao mockup funcional.

export type OpportunityStage = 'Triagem' | 'Georreferenciada' | 'Enriquecida' | 'Verificada' | 'Estruturação' | 'Arquivada';
export type OpportunityPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type CarteiraSection = 'overview' | 'radar' | 'opportunities' | 'prioritization' | 'map' | 'analytics' | 'agents' | 'reports' | 'integrations' | 'admin';

export interface OpportunityDimension {
  demanda: number;
  impacto: number;
  prontidao: number;
  capacidade: number;
  aderencia: number;
  resiliencia: number;
}

export interface Opportunity {
  id: string;
  titulo: string;
  proponente: string;
  setor: string;
  problema: string;
  uf: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  populacaoBeneficiada: number;
  ativoPrevisto: string;
  valorEstimado: number;
  fonteDesejada: string;
  programaRecomendado: string;
  origem: string;
  estagio: OpportunityStage;
  prioridade: OpportunityPriority;
  score: number;
  confidence: number;
  documentosDisponiveis: number;
  documentosEsperados: number;
  restricoesConhecidas: string[];
  dataAlvo: string;
  contato: string;
  responsavel: string;
  proximaAcao: string;
  atualizacao: string;
  duplicidadeDetectada: boolean;
  linkedAssetId?: string;
  dimensions: OpportunityDimension;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-2026-0142', titulo: 'Sistema Adutor Chapada Norte', proponente: 'Governo do Estado da Bahia', setor: 'Recursos Hídricos',
    problema: 'Insegurança hídrica em 12 municípios do semiárido baiano', uf: 'BA', city: 'Chapada Diamantina', region: 'Nordeste', lat: -12.35, lon: -41.4,
    populacaoBeneficiada: 186_000, ativoPrevisto: 'Adutora + 3 reservatórios', valorEstimado: 340_000_000, fonteDesejada: 'BID',
    programaRecomendado: 'Programa de Segurança Hídrica do Semiárido', origem: 'Plano Estadual de Segurança Hídrica', estagio: 'Estruturação', prioridade: 'P0',
    score: 84.2, confidence: 94, documentosDisponiveis: 9, documentosEsperados: 12, restricoesConhecidas: ['Licenciamento ambiental em análise'],
    dataAlvo: '2027-06-01', contato: 'Secretaria Estadual de Infraestrutura Hídrica', responsavel: 'Fernanda Ribeiro — GEREG Nordeste',
    proximaAcao: 'Concluir parecer ambiental e submeter cenário técnico B ao Nexo Estrutura', atualizacao: 'Há 12 min', duplicidadeDetectada: false,
    dimensions: { demanda: 94, impacto: 91, prontidao: 76, capacidade: 78, aderencia: 93, resiliencia: 88 },
  },
  {
    id: 'OPP-2026-0158', titulo: 'Requalificação Orla Fluvial', proponente: 'Prefeitura Municipal de Manaus', setor: 'Mobilidade',
    problema: 'Falta de acessibilidade e drenagem na orla urbana', uf: 'AM', city: 'Manaus', region: 'Norte', lat: -3.13, lon: -60.0,
    populacaoBeneficiada: 64_000, ativoPrevisto: 'Requalificação viária e passeio público', valorEstimado: 88_000_000, fonteDesejada: 'Tesouro (OGU)',
    programaRecomendado: 'Programa de Adaptação Climática Urbana', origem: 'Radar territorial Nexo', estagio: 'Triagem', prioridade: 'P2',
    score: 65.8, confidence: 82, documentosDisponiveis: 3, documentosEsperados: 11, restricoesConhecidas: ['Estudo de tráfego pendente', 'Área de proteção ambiental próxima'],
    dataAlvo: '2028-01-15', contato: 'Secretaria Municipal de Obras', responsavel: 'Equipe Originação Norte',
    proximaAcao: 'Solicitar estudo de tráfego e delimitação da área de intervenção', atualizacao: 'Há 2 h', duplicidadeDetectada: false,
    dimensions: { demanda: 76, impacto: 72, prontidao: 39, capacidade: 63, aderencia: 74, resiliencia: 71 },
  },
  {
    id: 'OPP-2026-0163', titulo: 'Rede Escolar Sertão', proponente: 'Governo do Estado do Piauí', setor: 'Educação',
    problema: 'Déficit de vagas de educação técnica no sertão piauiense', uf: 'PI', city: 'Picos', region: 'Nordeste', lat: -7.08, lon: -41.47,
    populacaoBeneficiada: 12_400, ativoPrevisto: '4 escolas técnicas regionais', valorEstimado: 96_000_000, fonteDesejada: 'Recursos Próprios CAIXA',
    programaRecomendado: 'Programa Nacional de Educação Profissionalizante', origem: 'Carteira estadual', estagio: 'Enriquecida', prioridade: 'P1',
    score: 78.9, confidence: 91, documentosDisponiveis: 7, documentosEsperados: 10, restricoesConhecidas: [],
    dataAlvo: '2027-09-01', contato: 'Secretaria Estadual de Educação', responsavel: 'Lucas Medeiros — Carteira Social',
    proximaAcao: 'Validar demanda por microrregião e encaminhar para verificação', atualizacao: 'Há 38 min', duplicidadeDetectada: false,
    linkedAssetId: 'NEXO-ASSET-BR-GO-5208707-EDU-000063', dimensions: { demanda: 86, impacto: 82, prontidao: 69, capacidade: 81, aderencia: 89, resiliencia: 66 },
  },
  {
    id: 'OPP-2026-0171', titulo: 'Parque Linear Igarapé Azul', proponente: 'Prefeitura de Ananindeua', setor: 'Drenagem',
    problema: 'Ocupação irregular de fundo de vale com risco de alagamento', uf: 'PA', city: 'Ananindeua', region: 'Norte', lat: -1.37, lon: -48.37,
    populacaoBeneficiada: 41_000, ativoPrevisto: 'Parque linear com macrodrenagem', valorEstimado: 122_000_000, fonteDesejada: 'BID',
    programaRecomendado: 'Programa de Adaptação Climática Urbana', origem: 'Plano Municipal de Drenagem', estagio: 'Estruturação', prioridade: 'P0',
    score: 79.4, confidence: 90, documentosDisponiveis: 6, documentosEsperados: 12, restricoesConhecidas: ['Reassentamento de 84 famílias'],
    dataAlvo: '2027-11-01', contato: 'Secretaria Municipal de Meio Ambiente', responsavel: 'Fernanda Ribeiro — GEREG Norte',
    proximaAcao: 'Estruturar plano de reassentamento e matriz de riscos sociais', atualizacao: 'Há 24 min', duplicidadeDetectada: false,
    linkedAssetId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', dimensions: { demanda: 91, impacto: 88, prontidao: 62, capacidade: 68, aderencia: 94, resiliencia: 95 },
  },
  {
    id: 'OPP-2026-0179', titulo: 'Complexo Solar Vale do Sol', proponente: 'Consórcio Vale Solar', setor: 'Energia',
    problema: 'Expansão de capacidade renovável na matriz regional', uf: 'PE', city: 'Petrolina', region: 'Nordeste', lat: -9.4, lon: -40.5,
    populacaoBeneficiada: 210_000, ativoPrevisto: 'Usina fotovoltaica 180 MWp', valorEstimado: 410_000_000, fonteDesejada: 'Mercado (Green Bond)',
    programaRecomendado: 'Programa de Energias Renováveis e Transição Justa', origem: 'Prospecção comercial', estagio: 'Verificada', prioridade: 'P0',
    score: 88.6, confidence: 96, documentosDisponiveis: 11, documentosEsperados: 12, restricoesConhecidas: [],
    dataAlvo: '2027-03-01', contato: 'Diretoria de Projetos do Consórcio', responsavel: 'Carla Nunes — Energia e Clima',
    proximaAcao: 'Submeter ao Nexo Estrutura para otimização de funding e garantias', atualizacao: 'Há 8 min', duplicidadeDetectada: false,
    linkedAssetId: 'NEXO-ASSET-BR-RN-2408102-ENE-000029', dimensions: { demanda: 82, impacto: 93, prontidao: 91, capacidade: 88, aderencia: 96, resiliencia: 84 },
  },
  {
    id: 'OPP-2026-0184', titulo: 'Requalificação Viária Centro Histórico', proponente: 'Prefeitura de Ouro Preto', setor: 'Mobilidade',
    problema: 'Congestionamento e falta de acessibilidade no centro histórico', uf: 'MG', city: 'Ouro Preto', region: 'Sudeste', lat: -20.38, lon: -43.5,
    populacaoBeneficiada: 28_000, ativoPrevisto: 'Corredor de acessibilidade urbana', valorEstimado: 54_000_000, fonteDesejada: 'Tesouro (OGU)',
    programaRecomendado: 'Programa de Mobilidade Urbana Sustentável', origem: 'Transferegov', estagio: 'Triagem', prioridade: 'P3',
    score: 49.8, confidence: 87, documentosDisponiveis: 2, documentosEsperados: 11, restricoesConhecidas: ['Sobreposição com área tombada', 'Possível duplicidade com proposta 2024'],
    dataAlvo: '2028-04-01', contato: 'Secretaria Municipal de Mobilidade', responsavel: 'Equipe Originação Sudeste',
    proximaAcao: 'Confirmar duplicidade e consultar órgão de patrimônio', atualizacao: 'Há 4 h', duplicidadeDetectada: true,
    linkedAssetId: 'NEXO-ASSET-BR-MG-3106200-MOB-000341', dimensions: { demanda: 64, impacto: 58, prontidao: 28, capacidade: 61, aderencia: 55, resiliencia: 44 },
  },
  {
    id: 'OPP-2026-0190', titulo: 'UBS Fluviais Baixo Amazonas', proponente: 'Secretaria Estadual de Saúde do Amazonas', setor: 'Saúde',
    problema: 'Cobertura insuficiente de atenção básica em comunidades ribeirinhas', uf: 'AM', city: 'Parintins', region: 'Norte', lat: -2.63, lon: -56.74,
    populacaoBeneficiada: 38_000, ativoPrevisto: '8 unidades básicas de saúde fluviais', valorEstimado: 71_000_000, fonteDesejada: 'Recursos Próprios CAIXA',
    programaRecomendado: 'Programa de Infraestrutura Social Ribeirinha', origem: 'Radar territorial Nexo', estagio: 'Georreferenciada', prioridade: 'P1',
    score: 72.4, confidence: 89, documentosDisponiveis: 4, documentosEsperados: 10, restricoesConhecidas: ['Logística de suprimento em análise'],
    dataAlvo: '2027-12-01', contato: 'Coordenação de Atenção Básica Ribeirinha', responsavel: 'Equipe Originação Norte',
    proximaAcao: 'Enriquecer demanda com tempo de deslocamento e cobertura SUS', atualizacao: 'Há 51 min', duplicidadeDetectada: false,
    linkedAssetId: 'NEXO-ASSET-BR-AM-1302603-SAU-000156', dimensions: { demanda: 92, impacto: 87, prontidao: 48, capacidade: 70, aderencia: 84, resiliencia: 79 },
  },
  {
    id: 'OPP-2026-0198', titulo: 'Corredor BRT Metropolitano Sul', proponente: 'Consórcio Metropolitano do Paraná', setor: 'Mobilidade',
    problema: 'Tempo de viagem elevado e baixa integração metropolitana', uf: 'PR', city: 'Curitiba', region: 'Sul', lat: -25.43, lon: -49.27,
    populacaoBeneficiada: 420_000, ativoPrevisto: '32 km de corredor BRT e 18 estações', valorEstimado: 780_000_000, fonteDesejada: 'BIRD / Banco Mundial',
    programaRecomendado: 'Programa de Mobilidade Urbana Sustentável', origem: 'Carteira metropolitana', estagio: 'Verificada', prioridade: 'P0',
    score: 86.9, confidence: 93, documentosDisponiveis: 10, documentosEsperados: 13, restricoesConhecidas: ['Integração tarifária em negociação'],
    dataAlvo: '2027-08-15', contato: 'Unidade de Gestão Metropolitana', responsavel: 'Rafael Costa — Mobilidade',
    proximaAcao: 'Consolidar arranjo tarifário e encaminhar estruturação financeira', atualizacao: 'Há 19 min', duplicidadeDetectada: false,
    dimensions: { demanda: 95, impacto: 94, prontidao: 79, capacidade: 86, aderencia: 92, resiliencia: 80 },
  },
  {
    id: 'OPP-2026-0204', titulo: 'Universalização do Esgoto Alto Tietê', proponente: 'Consórcio Intermunicipal Alto Tietê', setor: 'Saneamento',
    problema: 'Cobertura de esgotamento inferior a 65% em cinco municípios', uf: 'SP', city: 'Mogi das Cruzes', region: 'Sudeste', lat: -23.52, lon: -46.19,
    populacaoBeneficiada: 365_000, ativoPrevisto: 'ETE regional e 146 km de redes', valorEstimado: 620_000_000, fonteDesejada: 'FGTS',
    programaRecomendado: 'Programa Nacional de Saneamento Rural e Urbano', origem: 'Plano Regional de Saneamento', estagio: 'Enriquecida', prioridade: 'P0',
    score: 83.1, confidence: 92, documentosDisponiveis: 8, documentosEsperados: 12, restricoesConhecidas: ['Definição do operador regional pendente'],
    dataAlvo: '2027-10-01', contato: 'Secretaria Executiva do Consórcio', responsavel: 'Ana Beatriz Souza — GEREG Sudeste',
    proximaAcao: 'Validar arranjo operacional e modelar capacidade de pagamento', atualizacao: 'Há 33 min', duplicidadeDetectada: false,
    linkedAssetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', dimensions: { demanda: 96, impacto: 95, prontidao: 68, capacidade: 76, aderencia: 97, resiliencia: 82 },
  },
  {
    id: 'OPP-2026-0210', titulo: 'Centro Integrado de Saúde da Mulher', proponente: 'Governo do Estado de Goiás', setor: 'Saúde',
    problema: 'Baixa cobertura regional de diagnóstico e atenção especializada', uf: 'GO', city: 'Anápolis', region: 'Centro-Oeste', lat: -16.33, lon: -48.95,
    populacaoBeneficiada: 275_000, ativoPrevisto: 'Hospital-dia e centro diagnóstico', valorEstimado: 185_000_000, fonteDesejada: 'Recursos Próprios CAIXA',
    programaRecomendado: 'Programa de Infraestrutura Social', origem: 'Plano Estadual de Saúde', estagio: 'Georreferenciada', prioridade: 'P1',
    score: 74.7, confidence: 88, documentosDisponiveis: 5, documentosEsperados: 11, restricoesConhecidas: ['Plano de custeio operacional preliminar'],
    dataAlvo: '2028-02-01', contato: 'Secretaria Estadual de Saúde', responsavel: 'Lucas Medeiros — Carteira Social',
    proximaAcao: 'Enriquecer fluxo assistencial e custo operacional de 10 anos', atualizacao: 'Há 1 h', duplicidadeDetectada: false,
    dimensions: { demanda: 89, impacto: 86, prontidao: 52, capacidade: 75, aderencia: 82, resiliencia: 67 },
  },
  {
    id: 'OPP-2026-0217', titulo: 'Microgeração Solar em Equipamentos Públicos', proponente: 'Governo do Estado do Ceará', setor: 'Energia',
    problema: 'Custo energético elevado em escolas e unidades de saúde', uf: 'CE', city: 'Fortaleza', region: 'Nordeste', lat: -3.73, lon: -38.52,
    populacaoBeneficiada: 520_000, ativoPrevisto: '320 sistemas fotovoltaicos distribuídos', valorEstimado: 148_000_000, fonteDesejada: 'Green Bond',
    programaRecomendado: 'Programa de Energias Renováveis e Transição Justa', origem: 'Radar de eficiência energética', estagio: 'Verificada', prioridade: 'P1',
    score: 82.5, confidence: 95, documentosDisponiveis: 9, documentosEsperados: 10, restricoesConhecidas: [],
    dataAlvo: '2027-04-01', contato: 'Secretaria de Planejamento', responsavel: 'Carla Nunes — Energia e Clima',
    proximaAcao: 'Confirmar baseline de consumo e enviar para estruturação', atualizacao: 'Há 15 min', duplicidadeDetectada: false,
    dimensions: { demanda: 78, impacto: 88, prontidao: 88, capacidade: 83, aderencia: 95, resiliencia: 81 },
  },
  {
    id: 'OPP-2026-0121', titulo: 'Terminal Intermodal Cerrado', proponente: 'Governo do Estado de Goiás', setor: 'Mobilidade',
    problema: 'Baixa integração entre modais de transporte metropolitano', uf: 'GO', city: 'Aparecida de Goiânia', region: 'Centro-Oeste', lat: -16.82, lon: -49.24,
    populacaoBeneficiada: 95_000, ativoPrevisto: 'Terminal intermodal + corredor de ônibus', valorEstimado: 175_000_000, fonteDesejada: 'BIRD / Banco Mundial',
    programaRecomendado: 'Programa de Mobilidade Urbana Sustentável', origem: 'Carteira estadual', estagio: 'Arquivada', prioridade: 'P3',
    score: 43.8, confidence: 90, documentosDisponiveis: 5, documentosEsperados: 12, restricoesConhecidas: ['Capacidade de pagamento insuficiente no ciclo atual'],
    dataAlvo: '2029-01-01', contato: 'Secretaria Estadual de Infraestrutura', responsavel: 'Arquivo técnico',
    proximaAcao: 'Reavaliar após atualização fiscal do ente', atualizacao: '12/06/2026', duplicidadeDetectada: false,
    dimensions: { demanda: 70, impacto: 69, prontidao: 44, capacidade: 28, aderencia: 66, resiliencia: 54 },
  },
];
OPPORTUNITIES.push(...REALISTIC_OPPORTUNITIES);

export interface TerritorialSignal {
  id: string; title: string; territory: string; sector: string; score: number; trend: string; evidence: string; recommendation: string; status: 'normal' | 'atencao' | 'critico';
}
export const TERRITORIAL_SIGNALS: TerritorialSignal[] = [
  { id: 'SIG-01', title: 'Déficit de esgotamento sanitário', territory: 'Alto Tietê · SP', sector: 'Saneamento', score: 94, trend: '+8,2%', evidence: 'Cobertura abaixo de 65% e crescimento urbano acelerado.', recommendation: 'Gerar oportunidade regional e validar operador.', status: 'critico' },
  { id: 'SIG-02', title: 'Risco combinado de inundação', territory: 'RM Belém · PA', sector: 'Drenagem', score: 91, trend: '+12,4%', evidence: '340 mil pessoas em áreas com recorrência de alagamentos.', recommendation: 'Priorizar carteira de macrodrenagem e soluções baseadas na natureza.', status: 'critico' },
  { id: 'SIG-03', title: 'Vazio de atenção básica ribeirinha', territory: 'Baixo Amazonas · AM', sector: 'Saúde', score: 87, trend: '+4,6%', evidence: 'Tempo médio de deslocamento superior a 5 horas.', recommendation: 'Estruturar unidades móveis e logística de suprimento.', status: 'atencao' },
  { id: 'SIG-04', title: 'Potencial de geração solar distribuída', territory: 'Semiárido Nordeste', sector: 'Energia', score: 84, trend: '+16,8%', evidence: 'Alta irradiação e custo energético crescente em equipamentos públicos.', recommendation: 'Formar carteira padronizada multiativos.', status: 'normal' },
  { id: 'SIG-05', title: 'Déficit de mobilidade metropolitana', territory: 'Curitiba Sul · PR', sector: 'Mobilidade', score: 82, trend: '+6,9%', evidence: 'Tempo de viagem acima da meta e corredores saturados.', recommendation: 'Acelerar verificação do corredor BRT.', status: 'atencao' },
];

export type CarteiraAgentStatus = 'idle' | 'running' | 'waiting' | 'done' | 'alert';
export interface CarteiraAgentRuntime {
  id: string; name: string; icon: string; status: CarteiraAgentStatus; entity: string; step: string; progress: number; confidence: number;
  sources: string[]; recommendation: string; impact: string; lastRun: string; awaiting: string; human: string;
}
export const CARTEIRA_AGENT_RUNTIME: CarteiraAgentRuntime[] = [
  { id: 'AG-CAR-01', name: 'Agente de Radar Territorial', icon: 'Radar', status: 'idle', entity: 'Território nacional', step: 'Pronto para detectar déficits, sobreposições e sinais de demanda.', progress: 0, confidence: 94, sources: ['IBGE', 'Living Atlas', 'Obrasgov', 'Planos setoriais'], recommendation: 'Executar varredura diária e priorizar sinais com score acima de 80.', impact: '5 sinais prioritários', lastRun: 'Hoje, 05:40', awaiting: 'Nenhuma ação', human: 'Gerência de Originação' },
  { id: 'AG-CAR-02', name: 'Agente de Geocodificação e Contexto', icon: 'MapPin', status: 'idle', entity: 'Novas oportunidades', step: 'Geocodifica, delimita área de influência e agrega contexto territorial.', progress: 0, confidence: 97, sources: ['ArcGIS', 'IBGE', 'Cadastros municipais'], recommendation: 'Executar automaticamente em toda nova entrada.', impact: '12 oportunidades localizadas', lastRun: 'Há 22 min', awaiting: 'Nenhuma ação', human: 'Equipe GIS' },
  { id: 'AG-CAR-03', name: 'Agente de Duplicidades e Sobreposições', icon: 'ScanLine', status: 'alert', entity: 'OPP-2026-0184', step: 'Possível duplicidade com proposta de 2024 e interseção em área tombada.', progress: 74, confidence: 92, sources: ['Transferegov', 'Obrasgov', 'Carteira histórica'], recommendation: 'Abrir verificação manual antes de enriquecer a oportunidade.', impact: 'R$ 54 mi potencialmente duplicados', lastRun: 'Há 9 min', awaiting: 'Validação humana', human: 'Equipe Originação Sudeste' },
  { id: 'AG-CAR-04', name: 'Agente de Enriquecimento', icon: 'Sparkles', status: 'idle', entity: 'Carteira em triagem', step: 'Agrega demanda, beneficiários, capacidade fiscal, risco e serviços existentes.', progress: 0, confidence: 91, sources: ['IBGE', 'STN', 'SUS', 'SNIS', 'Nexo Data'], recommendation: 'Enriquecer primeiro as oportunidades P0 e P1.', impact: 'R$ 2,77 bi em análise', lastRun: 'Hoje, 07:02', awaiting: 'Nova execução', human: 'Analistas setoriais' },
  { id: 'AG-CAR-05', name: 'Agente de Priorização Multicritério', icon: 'ListOrdered', status: 'idle', entity: 'Carteira corporativa 2026', step: 'Otimiza ranking por demanda, impacto, prontidão, capacidade, aderência e resiliência.', progress: 0, confidence: 93, sources: ['Nexo Capital', 'Nexo Contrata', 'Nexo Control'], recommendation: 'Executar cenário base e cenário de aceleração climática.', impact: 'R$ 1,72 bi priorizáveis', lastRun: 'Ontem, 21:18', awaiting: 'Pesos do cenário', human: 'Comitê de Carteira' },
  { id: 'AG-CAR-06', name: 'Agente de Despachos e Encaminhamentos', icon: 'Send', status: 'waiting', entity: 'Complexo Solar Vale do Sol', step: 'Minuta de encaminhamento ao Nexo Estrutura preparada.', progress: 96, confidence: 98, sources: ['Ficha da oportunidade', 'Parecer de verificação', 'Regras de alçada'], recommendation: 'Aprovar despacho e abrir caso de estruturação.', impact: 'R$ 410 mi encaminháveis', lastRun: 'Há 14 min', awaiting: 'Aprovação humana', human: 'Gestor da Carteira' },
];

export const CARTEIRA_LIVE_STEPS = [
  { agentId: 'AG-CAR-01', progress: 16, status: 'running' as const, step: 'Consultando indicadores territoriais, planos e carteira pública...', text: 'Agente de Radar Territorial iniciou varredura nacional.', type: 'agent' as const },
  { agentId: 'AG-CAR-01', progress: 48, status: 'running' as const, step: 'Calculando déficits, tendências e vazios de investimento...', text: 'Radar: 37 sinais territoriais detectados; 5 acima do limiar prioritário.', type: 'info' as const },
  { agentId: 'AG-CAR-02', progress: 58, status: 'running' as const, step: 'Geocodificando novas demandas e áreas de influência...', text: 'Geocodificação: 4 oportunidades posicionadas e enriquecidas com contexto urbano.', type: 'success' as const },
  { agentId: 'AG-CAR-03', progress: 82, status: 'running' as const, step: 'Comparando geometrias, títulos e proponentes com a carteira histórica...', text: 'Duplicidade provável identificada em Ouro Preto — confiança 92%.', type: 'warning' as const },
  { agentId: 'AG-CAR-04', progress: 44, status: 'running' as const, step: 'Agregando população, CAPAG, risco climático e cobertura de serviços...', text: 'Enriquecimento territorial em execução sobre 7 oportunidades prioritárias.', type: 'agent' as const },
  { agentId: 'AG-CAR-05', progress: 62, status: 'running' as const, step: 'Executando cenários multicritério e restrições de funding...', text: 'Priorização: 2.800 combinações avaliadas para a carteira 2026.', type: 'info' as const },
  { agentId: 'AG-CAR-05', progress: 100, status: 'done' as const, step: 'Ranking recalculado e três oportunidades recomendadas para estruturação.', text: 'Ranking atualizado: Solar Vale do Sol, BRT Metropolitano e Adutora Chapada Norte lideram.', type: 'success' as const },
  { agentId: 'AG-CAR-06', progress: 100, status: 'waiting' as const, step: 'Despachos preparados e aguardando aprovação humana.', text: 'Três minutas de encaminhamento ao Nexo Estrutura prontas para aprovação.', type: 'success' as const },
  { agentId: 'AG-CAR-01', progress: 100, status: 'done' as const, step: 'Varredura concluída; sinais publicados no Radar Territorial.', text: 'Ciclo da carteira concluído com 5 sinais, 1 alerta de duplicidade e 3 encaminhamentos.', type: 'success' as const },
];

export const CARTEIRA_PIPELINE_HISTORY = [
  { mes: 'Fev', entradas: 6, estruturadas: 2 }, { mes: 'Mar', entradas: 8, estruturadas: 3 }, { mes: 'Abr', entradas: 11, estruturadas: 4 },
  { mes: 'Mai', entradas: 9, estruturadas: 5 }, { mes: 'Jun', entradas: 14, estruturadas: 6 }, { mes: 'Jul', entradas: 12, estruturadas: 7 },
  { mes: 'Ago', entradas: 15, estruturadas: 9 },
];

export const CARTEIRA_REPORTS = [
  { id: 'RPT-CAR-01', name: 'Radar Territorial de Oportunidades', description: 'Sinais de demanda, territórios prioritários e oportunidades recomendadas.', cadence: 'Semanal', owner: 'Gerência de Originação', format: 'PDF + Dashboard', last: '18/07/2026' },
  { id: 'RPT-CAR-02', name: 'Carteira e Funil de Originação', description: 'Entradas, estágios, ageing, valores e encaminhamentos.', cadence: 'Mensal', owner: 'Gestão de Carteira', format: 'PDF + XLSX', last: '01/07/2026' },
  { id: 'RPT-CAR-03', name: 'Ranking Multicritério', description: 'Critérios, pesos, scores, sensibilidades e justificativas.', cadence: 'Sob demanda', owner: 'Comitê de Carteira', format: 'PDF', last: '20/07/2026' },
  { id: 'RPT-CAR-04', name: 'Duplicidades e Sobreposições', description: 'Ocorrências territoriais, similaridades e encaminhamentos de validação.', cadence: 'Quinzenal', owner: 'Qualidade e Integridade', format: 'PDF + GeoJSON', last: '15/07/2026' },
  { id: 'RPT-CAR-05', name: 'Demanda versus Funding Disponível', description: 'Compatibilidade entre carteira potencial, programas e fontes de capital.', cadence: 'Mensal', owner: 'Nexo Capital', format: 'Dashboard + XLSX', last: '01/07/2026' },
];

export const CARTEIRA_ADMIN_RULES = [
  { id: 'RULE-CAR-01', name: 'Limiar de entrada na carteira', description: 'Oportunidades com score inferior ao limiar permanecem em triagem ou são arquivadas.', value: '55 pontos', status: 'ativa' },
  { id: 'RULE-CAR-02', name: 'Alerta de duplicidade', description: 'Abrir verificação humana quando similaridade documental ou espacial exceder o limiar.', value: '82%', status: 'ativa' },
  { id: 'RULE-CAR-03', name: 'Georreferenciamento obrigatório', description: 'Nenhuma oportunidade avança para enriquecimento sem geometria e área de influência.', value: 'Obrigatório', status: 'ativa' },
  { id: 'RULE-CAR-04', name: 'Gate humano de priorização', description: 'Encaminhamento ao Nexo Estrutura exige aprovação do gestor da carteira.', value: 'Sempre', status: 'ativa' },
  { id: 'RULE-CAR-05', name: 'Revisão de oportunidade inativa', description: 'Oportunidades sem atualização retornam para revisão automática.', value: '45 dias', status: 'ativa' },
];

export const CARTEIRA_ROLE_MATRIX = [
  { role: 'Analista de Originação', radar: 'Consultar', opportunities: 'Criar/editar', prioritization: 'Propor', approvals: 'Sem alçada final' },
  { role: 'Gestor da Carteira', radar: 'Configurar', opportunities: 'Aprovar', prioritization: 'Aprovar', approvals: 'Encaminhar à Estrutura' },
  { role: 'Especialista Setorial', radar: 'Consultar', opportunities: 'Parecer', prioritization: 'Parecer', approvals: 'Sem alçada financeira' },
  { role: 'Comitê de Carteira', radar: 'Consultar', opportunities: 'Consultar', prioritization: 'Homologar', approvals: 'Carteiras acima de R$ 500 mi' },
  { role: 'Auditoria', radar: 'Leitura', opportunities: 'Leitura', prioritization: 'Leitura', approvals: 'Sem alçada' },
];

export const PRIORITY_WEIGHTS = [
  { key: 'demanda', label: 'Demanda territorial', value: 20 },
  { key: 'impacto', label: 'Impacto esperado', value: 22 },
  { key: 'prontidao', label: 'Prontidão', value: 18 },
  { key: 'capacidade', label: 'Capacidade de execução', value: 14 },
  { key: 'aderencia', label: 'Aderência programática', value: 16 },
  { key: 'resiliencia', label: 'Resiliência climática', value: 10 },
] as const;
