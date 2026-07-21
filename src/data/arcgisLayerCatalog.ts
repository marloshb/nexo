export type ArcGISLayerCategory =
  | 'Base territorial'
  | 'População e ocupação'
  | 'Meio ambiente e cobertura'
  | 'Cenários e planejamento';

export interface ArcGISPortalLayerDefinition {
  id: string;
  title: string;
  description: string;
  category: ArcGISLayerCategory;
  portalItemId: string;
  opacity: number;
  visible: boolean;
  minScale?: number;
  source: string;
  kind: 'imagery' | 'feature' | 'webmap' | 'auto';
}

/**
 * Conteúdo público selecionado do ArcGIS Living Atlas / ArcGIS Online.
 * As camadas são carregadas por portalItem e falham de forma isolada, sem
 * interromper o mapa ou os dados embarcados da aplicação.
 */
export const ARCGIS_PUBLIC_LAYERS: ArcGISPortalLayerDefinition[] = [
  {
    id: 'esa-worldcover-2021',
    title: 'ESA WorldCover 2021 · 10 m',
    description: 'Cobertura global da terra em 11 classes, resolução de 10 metros.',
    category: 'Meio ambiente e cobertura',
    portalItemId: '7bec35d76dd54ea584f98d286571eb84',
    opacity: 0.42,
    visible: false,
    source: 'ESA / Esri Living Atlas',
    kind: 'imagery',
  },
  {
    id: 'sentinel-lulc-timeseries',
    title: 'Sentinel-2 Land Use/Land Cover',
    description: 'Série temporal global de uso e cobertura do solo derivada de Sentinel-2.',
    category: 'Meio ambiente e cobertura',
    portalItemId: 'cfcb7609de5f478eb7666240902d4d3d',
    opacity: 0.44,
    visible: false,
    source: 'Esri Living Atlas',
    kind: 'imagery',
  },
  {
    id: 'worldpop-density',
    title: 'WorldPop · Densidade populacional 100 m',
    description: 'Estimativas anuais de densidade populacional entre 2000 e 2020.',
    category: 'População e ocupação',
    portalItemId: 'c90197b8948948d7b2194e1b03b11d1e',
    opacity: 0.52,
    visible: false,
    source: 'WorldPop / Esri Living Atlas',
    kind: 'imagery',
  },
  {
    id: 'populated-footprint',
    title: 'Pegada populada 2020',
    description: 'Áreas com densidade estimada de 14 pessoas/km² ou mais.',
    category: 'População e ocupação',
    portalItemId: '564afc8398874a659e6bd964ce783f1d',
    opacity: 0.58,
    visible: false,
    source: 'WorldPop / Esri Living Atlas',
    kind: 'feature',
  },
  {
    id: 'gpwv4-population',
    title: 'GPWv4 · Densidade populacional',
    description: 'Estimativas globais consistentes com censos e registros nacionais.',
    category: 'População e ocupação',
    portalItemId: 'a9fea1ecd1ba4f7db80a0f667fbc508b',
    opacity: 0.48,
    visible: false,
    source: 'CIESIN / Esri Living Atlas',
    kind: 'imagery',
  },
  {
    id: 'cities-world',
    title: 'Cidades do mundo',
    description: 'Pontos urbanos globais para contexto de centralidades e redes territoriais.',
    category: 'Base territorial',
    portalItemId: '029cb24160194f9eaa5fac3f609f8fde',
    opacity: 0.7,
    visible: false,
    source: 'Esri Living Atlas',
    kind: 'feature',
  },
  {
    id: 'population-footprint-2016',
    title: 'Pegada da população mundial',
    description: 'Representação global das áreas onde a população está concentrada.',
    category: 'População e ocupação',
    portalItemId: 'ee79c2488ed44ee4ad34460e574c0ce2',
    opacity: 0.5,
    visible: false,
    source: 'Esri Living Atlas',
    kind: 'imagery',
  },
  {
    id: 'land-cover-2050',
    title: 'Cobertura do solo · Cenário 2050',
    description: 'Modelo global prospectivo de cobertura do solo para planejamento de longo prazo.',
    category: 'Cenários e planejamento',
    portalItemId: 'cee96e0ada6541d0bd3d67f3f8b5ce63',
    opacity: 0.4,
    visible: false,
    source: 'Esri Living Atlas',
    kind: 'imagery',
  },
];

export const EMBEDDED_OPERATIONAL_LAYERS = [
  {
    id: 'nexo-assets',
    title: 'Ativos financiados e acompanhados',
    description: 'Portfólio embarcado Capital–Ativo–Resultado.',
    category: 'Operação Nexo',
  },
  {
    id: 'nexo-evidence-hotspots',
    title: 'Hotspots de evidências e inconsistências',
    description: 'Pontos de maior criticidade de validação territorial.',
    category: 'Operação Nexo',
  },
  {
    id: 'nexo-inspection-teams',
    title: 'Equipes e ordens de vistoria',
    description: 'Posições simuladas e ordens priorizadas para inspeção.',
    category: 'Operação Nexo',
  },
  {
    id: 'nexo-beneficiary-clusters',
    title: 'Concentrações de beneficiários',
    description: 'Clusters sintéticos de população atendida pelos ativos.',
    category: 'Operação Nexo',
  },
  {
    id: 'nexo-climate-alerts',
    title: 'Alertas climáticos associados aos ativos',
    description: 'Exposição sintética a cheias, calor, seca e deslizamentos.',
    category: 'Operação Nexo',
  },
  {
    id: 'nexo-dependencies',
    title: 'Dependências entre ativos e redes',
    description: 'Relações críticas de conectividade entre infraestrutura e serviços.',
    category: 'Operação Nexo',
  },
] as const;
