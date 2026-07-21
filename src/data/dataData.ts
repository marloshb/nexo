import { REALISTIC_DATA_PRODUCTS, REALISTIC_QUALITY_ISSUES, REALISTIC_LINEAGE_NODES } from '@/data/realisticPortfolioData';
export type DataSection = 'overview' | 'catalog' | 'lineage' | 'quality' | 'integrations' | 'admin';

export interface DataDomain { id:string; name:string; owner:string; steward:string; products:number; entities:number; quality:number; freshness:number; classification:string; color:string; }
export interface DataProduct { id:string; name:string; domain:string; owner:string; description:string; records:string; quality:number; freshness:string; sla:string; consumers:string[]; sources:string[]; status:'certified'|'attention'|'draft'; tags:string[]; }
export interface QualityIssue { id:string; severity:'critical'|'high'|'medium'|'low'; entity:string; rule:string; source:string; affected:number; opened:string; owner:string; status:'open'|'investigating'|'resolved'; recommendation:string; }
export interface LineageNode { id:string; label:string; type:'source'|'pipeline'|'entity'|'product'|'consumer'; x:number; y:number; status:'ok'|'warning'|'error'; }
export interface DataAgent { id:string; name:string; status:'idle'|'running'|'waiting'|'alert'; progress:number; step:string; confidence:number; sources:string[]; recommendation:string; }

export const DATA_DOMAINS: DataDomain[] = [
 {id:'DOM-CAP',name:'Capital e Funding',owner:'VP Finanças',steward:'Ana Costa',products:6,entities:11,quality:97,freshness:96,classification:'Confidencial',color:'#087C78'},
 {id:'DOM-PRJ',name:'Projetos e Contratos',owner:'VP Governo',steward:'Carlos Mendes',products:9,entities:18,quality:93,freshness:91,classification:'Uso interno',color:'#1584D1'},
 {id:'DOM-GEO',name:'Território e Geoespacial',owner:'Nexo Data',steward:'Marina Reis',products:8,entities:15,quality:98,freshness:94,classification:'Mista',color:'#18B7D6'},
 {id:'DOM-ATV',name:'Ativos e Operação',owner:'VP Governo',steward:'Paulo Nunes',products:7,entities:16,quality:91,freshness:89,classification:'Uso interno',color:'#7C5CBF'},
 {id:'DOM-EVD',name:'Evidências e Impacto',owner:'VP Sustentabilidade',steward:'Luciana Prado',products:7,entities:14,quality:95,freshness:92,classification:'Mista',color:'#0FA39D'},
];

export const DATA_PRODUCTS: DataProduct[] = [
 {id:'DP-001',name:'Passaporte Capital–Ativo',domain:'Capital e Funding',owner:'Nexo Data',description:'Visão certificada que conecta funding, operação, projeto, contrato, ativo e resultado.',records:'214 mil ativos',quality:98,freshness:'há 4 min',sla:'99,8%',consumers:['Control','Capital','Ativo 360'],sources:['Sistemas CAIXA','Transferegov','Obrasgov'],status:'certified',tags:['golden record','grafo','financeiro']},
 {id:'DP-002',name:'Carteira Nacional de Investimentos',domain:'Projetos e Contratos',owner:'VP Governo',description:'Projetos, contratos, marcos, desembolsos e criticidade consolidados.',records:'32,4 mil operações',quality:95,freshness:'há 9 min',sla:'99,5%',consumers:['Carteira','Contrata','Entrega'],sources:['Transferegov','Obrasgov','Compras.gov'],status:'certified',tags:['carteira','contratos','execução']},
 {id:'DP-003',name:'Contexto Territorial Corporativo',domain:'Território e Geoespacial',owner:'Nexo Geo',description:'Limites, população, riscos, cobertura do solo e áreas de influência padronizadas.',records:'5.570 municípios',quality:99,freshness:'há 26 min',sla:'99,9%',consumers:['Todos os módulos','Agents'],sources:['IBGE','Living Atlas','ANA','INPE'],status:'certified',tags:['GIS','território','Living Atlas']},
 {id:'DP-004',name:'Estado Verificado da Execução',domain:'Projetos e Contratos',owner:'Nexo Entrega',description:'Medições verificadas, evidências, confiança, valores liberáveis e divergências.',records:'18,8 mil medições',quality:94,freshness:'há 2 min',sla:'99,6%',consumers:['Entrega','Evidência','Capital'],sources:['Medições','Campo','SINAPI'],status:'attention',tags:['medição','desembolso','evidência']},
 {id:'DP-005',name:'Saúde Operacional dos Ativos',domain:'Ativos e Operação',owner:'Nexo Ativos',description:'Telemetria, disponibilidade, manutenção, falhas e vida útil remanescente.',records:'2,1 mi leituras/dia',quality:91,freshness:'tempo real',sla:'99,2%',consumers:['Ativos','Control','Impacto'],sources:['SCADA','IoT','Manutenção'],status:'attention',tags:['IoT','saúde','manutenção']},
 {id:'DP-006',name:'Demonstração de Valor',domain:'Evidências e Impacto',owner:'Nexo Impacto',description:'Indicadores, beneficiários, atribuição, adicionalidade e evidências de resultado.',records:'486 indicadores',quality:96,freshness:'há 1 h',sla:'99,4%',consumers:['Impacto','Capital','Control'],sources:['Ativos','Evidência','IBGE'],status:'certified',tags:['MRV','impacto','beneficiários']},
];
DATA_PRODUCTS.push(...REALISTIC_DATA_PRODUCTS);

export const QUALITY_ISSUES: QualityIssue[] = [
 {id:'DQ-2041',severity:'critical',entity:'Contrato',rule:'Fornecedor deve possuir CNPJ válido e único',source:'Compras.gov',affected:128,opened:'há 18 min',owner:'Equipe Integrações',status:'investigating',recommendation:'Reprocessar após restabelecimento da API e bloquear enriquecimento incompleto.'},
 {id:'DQ-2038',severity:'high',entity:'Ativo',rule:'Geometria deve intersectar o município contratual',source:'Obrasgov/CIPI',affected:34,opened:'há 42 min',owner:'Steward Geoespacial',status:'open',recommendation:'Acionar resolução espacial e encaminhar 7 casos ambíguos para validação humana.'},
 {id:'DQ-2029',severity:'medium',entity:'Beneficiário',rule:'CPF/NIS não pode gerar dupla contagem entre programas',source:'Impacto',affected:286,opened:'há 2 h',owner:'Steward Impacto',status:'investigating',recommendation:'Aplicar matching probabilístico e revisão amostral.'},
 {id:'DQ-2012',severity:'low',entity:'Evidência',rule:'Metadados de captura devem estar completos',source:'App Campo',affected:19,opened:'ontem',owner:'Nexo Evidência',status:'resolved',recommendation:'Regra corrigida na versão 2.6 do aplicativo.'},
];
QUALITY_ISSUES.push(...REALISTIC_QUALITY_ISSUES);

export const LINEAGE_NODES: LineageNode[] = [
 {id:'s1',label:'Transferegov',type:'source',x:4,y:18,status:'ok'},{id:'s2',label:'Obrasgov',type:'source',x:4,y:48,status:'ok'},{id:'s3',label:'Sistemas CAIXA',type:'source',x:4,y:78,status:'ok'},
 {id:'p1',label:'Ingestão & CDC',type:'pipeline',x:26,y:32,status:'ok'},{id:'p2',label:'Resolução de entidades',type:'pipeline',x:26,y:68,status:'warning'},
 {id:'e1',label:'Operação Financeira',type:'entity',x:50,y:22,status:'ok'},{id:'e2',label:'Projeto / Contrato',type:'entity',x:50,y:50,status:'warning'},{id:'e3',label:'Ativo',type:'entity',x:50,y:78,status:'ok'},
 {id:'d1',label:'Passaporte Capital–Ativo',type:'product',x:73,y:42,status:'ok'},{id:'d2',label:'Carteira Nacional',type:'product',x:73,y:72,status:'ok'},
 {id:'c1',label:'Nexo Control',type:'consumer',x:92,y:30,status:'ok'},{id:'c2',label:'Nexo Agents',type:'consumer',x:92,y:58,status:'ok'},{id:'c3',label:'Ativo 360',type:'consumer',x:92,y:82,status:'ok'},
];
LINEAGE_NODES.push(...REALISTIC_LINEAGE_NODES);

export const INITIAL_DATA_AGENTS: DataAgent[] = [
 {id:'A-DATA-01',name:'Agente de Qualidade e Profiling',status:'running',progress:62,step:'Executando 184 regras sobre Projeto e Contrato',confidence:.97,sources:['Catálogo','Obrasgov','Compras.gov'],recommendation:'Priorizar as 34 geometrias inconsistentes antes do próximo ciclo de contratação.'},
 {id:'A-DATA-02',name:'Agente de Resolução de Entidades',status:'waiting',progress:78,step:'Aguardando revisão humana de 7 pares ambíguos',confidence:.89,sources:['CNPJ','CIPI','Sistemas CAIXA'],recommendation:'Manter bloqueio de consolidação para pares com confiança inferior a 92%.'},
 {id:'A-DATA-03',name:'Agente de Linhagem e Impacto',status:'idle',progress:100,step:'Mapa de dependências atualizado',confidence:.99,sources:['Pipelines','Produtos de dados','Agents'],recommendation:'Compras.gov afeta 3 produtos e 5 agentes; manter fallback de última carga válida.'},
 {id:'A-DATA-04',name:'Agente de Observabilidade',status:'alert',progress:45,step:'Latência elevada no feed CEMADEN',confidence:.96,sources:['APM','Logs','CEMADEN'],recommendation:'Reduzir janela de consulta e habilitar circuito de contingência.'},
];

export const QUALITY_TREND = [
 {mes:'Fev',qualidade:90,completude:92,frescor:88},{mes:'Mar',qualidade:91,completude:93,frescor:90},{mes:'Abr',qualidade:92,completude:94,frescor:91},{mes:'Mai',qualidade:93,completude:95,frescor:92},{mes:'Jun',qualidade:94,completude:96,frescor:93},{mes:'Jul',qualidade:95,completude:97,frescor:94},
];
