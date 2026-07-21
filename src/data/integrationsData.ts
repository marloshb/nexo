// Dados sintéticos — Nexo Data / matriz de integrações (seção 25 da especificação)

export interface Integration {
  id: string;
  origem: string;
  categoria: 'Governo Federal' | 'Referenciais Técnicos' | 'Dados Territoriais' | 'Clima e Ambiente' | 'Sistemas Internos' | 'Sensores';
  dadosEsperados: string;
  metodo: string;
  objetos: string;
  campos: string[];
  transformacao: string;
  frequencia: string;
  autenticacao: string;
  ultimaExecucao: string;
  proximaExecucao: string;
  latenciaMs: number;
  volume24h: string;
  status: 'ativa' | 'falha' | 'degradada';
  erro?: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: 'INT-01', origem: 'Transferegov', categoria: 'Governo Federal',
    dadosEsperados: 'Instrumentos, planos, propostas, execução e prestação de contas', metodo: 'API / dados abertos',
    objetos: 'Convênios, Termos de Execução Descentralizada', campos: ['numero_instrumento', 'proponente', 'valor_repasse', 'situacao'],
    transformacao: 'Mapeamento para entidade Operação Financeira', frequencia: 'Diária', autenticacao: 'OAuth2 client credentials',
    ultimaExecucao: 'Hoje, 06:00', proximaExecucao: 'Amanhã, 06:00', latenciaMs: 340, volume24h: '4.200 registros', status: 'ativa',
  },
  {
    id: 'INT-02', origem: 'Obrasgov / CIPI', categoria: 'Governo Federal',
    dadosEsperados: 'Projetos, georreferenciamento, valores e execução física', metodo: 'API REST',
    objetos: 'Projetos de investimento', campos: ['id_projeto', 'geometria', 'valor_investimento', 'percentual_execucao'],
    transformacao: 'Enriquecimento de Projeto e Território', frequencia: 'Diária', autenticacao: 'API key',
    ultimaExecucao: 'Hoje, 05:40', proximaExecucao: 'Amanhã, 05:40', latenciaMs: 510, volume24h: '1.850 registros', status: 'ativa',
  },
  {
    id: 'INT-03', origem: 'SINAPI', categoria: 'Referenciais Técnicos',
    dadosEsperados: 'Insumos, composições e índices de custo da construção', metodo: 'Arquivos e serviços disponibilizados',
    objetos: 'Composições e insumos', campos: ['codigo_composicao', 'preco_unitario', 'uf', 'mes_referencia'],
    transformacao: 'Referencial de custo para o Agente de Engenharia e Custos', frequencia: 'Mensal', autenticacao: 'Download público (CAIXA)',
    ultimaExecucao: '01/07/2026', proximaExecucao: '01/08/2026', latenciaMs: 890, volume24h: '—', status: 'ativa',
  },
  {
    id: 'INT-04', origem: 'Compras.gov', categoria: 'Governo Federal',
    dadosEsperados: 'Licitações, contratos, itens e fornecedores', metodo: 'API REST',
    objetos: 'Licitações e contratos', campos: ['numero_licitacao', 'fornecedor', 'cnpj', 'valor_homologado'],
    transformacao: 'Enriquecimento de Fornecedor e Contrato', frequencia: 'Diária', autenticacao: 'API key',
    ultimaExecucao: 'Hoje, 04:15', proximaExecucao: 'Falhou — nova tentativa em 20 min', latenciaMs: 0, volume24h: '0 registros', status: 'falha',
    erro: 'Timeout na API pública (HTTP 504) — 3 tentativas consecutivas',
  },
  {
    id: 'INT-05', origem: 'IBGE', categoria: 'Dados Territoriais',
    dadosEsperados: 'Territórios, população e indicadores socioeconômicos', metodo: 'API',
    objetos: 'Malha municipal e estimativas populacionais', campos: ['codigo_ibge', 'populacao_estimada', 'geometria_limite'],
    transformacao: 'Referencial de Território', frequencia: 'Anual', autenticacao: 'Pública',
    ultimaExecucao: '15/01/2026', proximaExecucao: '15/01/2027', latenciaMs: 220, volume24h: '—', status: 'ativa',
  },
  {
    id: 'INT-06', origem: 'ANA', categoria: 'Clima e Ambiente',
    dadosEsperados: 'Hidrografia, saneamento e recursos hídricos', metodo: 'Serviços geográficos',
    objetos: 'Bacias hidrográficas e outorgas', campos: ['id_bacia', 'vazao_media', 'status_outorga'],
    transformacao: 'Referencial territorial para Recursos Hídricos', frequencia: 'Semanal', autenticacao: 'Pública',
    ultimaExecucao: 'Ontem, 22:00', proximaExecucao: 'Em 6 dias', latenciaMs: 410, volume24h: '—', status: 'ativa',
  },
  {
    id: 'INT-07', origem: 'INPE', categoria: 'Clima e Ambiente',
    dadosEsperados: 'Queimadas, desmatamento e imagens orbitais', metodo: 'APIs e serviços',
    objetos: 'Focos de calor e alertas de desmatamento', campos: ['latitude', 'longitude', 'data_deteccao', 'confianca'],
    transformacao: 'Alimenta o Agente de Risco Territorial e Climático', frequencia: 'Diária', autenticacao: 'Pública',
    ultimaExecucao: 'Hoje, 03:00', proximaExecucao: 'Amanhã, 03:00', latenciaMs: 680, volume24h: '312 focos', status: 'ativa',
  },
  {
    id: 'INT-08', origem: 'CEMADEN', categoria: 'Clima e Ambiente',
    dadosEsperados: 'Ameaças e alertas hidrometeorológicos', metodo: 'API / feed',
    objetos: 'Alertas de risco geo-hidrológico', campos: ['municipio', 'nivel_alerta', 'tipo_ameaca', 'validade'],
    transformacao: 'Gatilho direto do Agente de Risco Territorial e Climático', frequencia: 'Tempo real', autenticacao: 'API key',
    ultimaExecucao: 'Há 4 min', proximaExecucao: 'Contínua', latenciaMs: 120, volume24h: '38 alertas', status: 'degradada',
    erro: 'Latência acima do esperado (SLA: <100ms) — monitorando',
  },
  {
    id: 'INT-09', origem: 'MapBiomas', categoria: 'Clima e Ambiente',
    dadosEsperados: 'Uso do solo e transições de cobertura', metodo: 'Download ou serviço',
    objetos: 'Coleções de uso e cobertura da terra', campos: ['classe_uso', 'ano', 'geometria'],
    transformacao: 'Camada de contexto territorial', frequencia: 'Anual', autenticacao: 'Pública',
    ultimaExecucao: '10/03/2026', proximaExecucao: '10/03/2027', latenciaMs: 950, volume24h: '—', status: 'ativa',
  },
  {
    id: 'INT-10', origem: 'ArcGIS Living Atlas', categoria: 'Dados Territoriais',
    dadosEsperados: 'Imagens, uso do solo, relevo e contexto', metodo: 'Portal items',
    objetos: 'World Imagery, ESA WorldCover 2021', campos: ['portal_item_id', 'resolucao', 'data_captura'],
    transformacao: 'Camada de basemap para o mapa nacional', frequencia: 'Conforme publicação do provedor', autenticacao: 'ArcGIS API key',
    ultimaExecucao: 'Hoje, 00:10', proximaExecucao: 'Contínua', latenciaMs: 260, volume24h: '—', status: 'ativa',
  },
  {
    id: 'INT-11', origem: 'Sistemas estaduais e municipais', categoria: 'Sistemas Internos',
    dadosEsperados: 'Projetos, ativos, manutenção e operação locais', metodo: 'API, arquivo ou integração dedicada',
    objetos: 'Cadastros locais de ativos', campos: ['id_local', 'tipo_ativo', 'status_operacional'],
    transformacao: 'Reconciliação de entidades com o cadastro nacional', frequencia: 'Semanal', autenticacao: 'Variável por convênio',
    ultimaExecucao: 'Há 2 dias', proximaExecucao: 'Em 5 dias', latenciaMs: 1_200, volume24h: '—', status: 'ativa',
  },
  {
    id: 'INT-12', origem: 'Sensores e SCADA', categoria: 'Sensores',
    dadosEsperados: 'Telemetria e estado operacional dos ativos', metodo: 'MQTT, WebSocket ou stream',
    objetos: 'Leituras de vazão, vibração, disponibilidade', campos: ['id_sensor', 'timestamp', 'valor', 'unidade'],
    transformacao: 'Alimenta o Agente de Saúde do Ativo em tempo real', frequencia: 'Tempo real', autenticacao: 'Certificado por dispositivo',
    ultimaExecucao: 'Contínua', proximaExecucao: 'Contínua', latenciaMs: 45, volume24h: '2,1 milhões de leituras', status: 'ativa',
  },
];

export const CATALOG_ENTITIES = [
  { entidade: 'Ativo', origemPrincipal: 'Cadastro interno + Obrasgov/CIPI', qualidade: 97, registros: '8 (mockup) · 214.000 (produção projetada)' },
  { entidade: 'Operação Financeira', origemPrincipal: 'Transferegov + sistemas internos', qualidade: 95, registros: '32' },
  { entidade: 'Contrato', origemPrincipal: 'Compras.gov + sistemas internos', qualidade: 91, registros: '48' },
  { entidade: 'Fornecedor', origemPrincipal: 'Compras.gov', qualidade: 88, registros: '312' },
  { entidade: 'Território', origemPrincipal: 'IBGE + Living Atlas', qualidade: 99, registros: '5.570 municípios' },
  { entidade: 'Evidência', origemPrincipal: 'Captura própria (app de campo)', qualidade: 94, registros: '6 (mockup) · 48.000 (produção projetada)' },
];
