// Configuração de navegação: produtos, menu lateral por produto e conteúdo dos stubs (V2).

export type ProductKey =
  | 'hub' | 'control' | 'capital' | 'carteira' | 'estrutura' | 'contrata'
  | 'entrega' | 'evidencia' | 'ativos' | 'impacto' | 'agents' | 'data' | 'ativo360';

export interface NavProduct {
  key: ProductKey;
  name: string;
  tagline: string;
  iconKey: string;
  color: string;
  builtV1: boolean; // true = profundidade funcional; false = stub estrutural (V2)
}

export const NAV_PRODUCTS: NavProduct[] = [
  { key: 'control',   name: 'Nexo Control',   tagline: 'Centro de comando executivo e operacional',        iconKey: 'Gauge',        color: '#1584D1', builtV1: true },
  { key: 'capital',   name: 'Nexo Capital',   tagline: 'Funding, captação, programas e alocação',           iconKey: 'DollarSign',   color: '#087C78', builtV1: true },
  { key: 'carteira',  name: 'Nexo Carteira',  tagline: 'Originação, projetos e priorização',                iconKey: 'Briefcase',    color: '#1584D1', builtV1: true },
  { key: 'estrutura', name: 'Nexo Estrutura', tagline: 'Modelagem técnica, financeira e territorial',       iconKey: 'Layers',       color: '#7C5CBF', builtV1: true },
  { key: 'contrata',  name: 'Nexo Contrata',  tagline: 'Elegibilidade, risco, aprovações e contratação',     iconKey: 'ClipboardCheck', color: '#E5A11A', builtV1: true },
  { key: 'entrega',   name: 'Nexo Entrega',   tagline: 'Execução, medição, desembolso e destravamento',     iconKey: 'HardHat',      color: '#18B7D6', builtV1: true },
  { key: 'evidencia', name: 'Nexo Evidência', tagline: 'Vistorias, documentos, imagens e cadeia de custódia', iconKey: 'ShieldCheck',  color: '#0FA39D', builtV1: true },
  { key: 'ativos',    name: 'Nexo Ativos',    tagline: 'Comissionamento, operação, manutenção e resiliência', iconKey: 'Building2',   color: '#1584D1', builtV1: true },
  { key: 'impacto',   name: 'Nexo Impacto',   tagline: 'Indicadores, MRV, resultados e prestação de contas',  iconKey: 'Sprout',       color: '#0FA39D', builtV1: true },
  { key: 'agents',    name: 'Nexo Agents',    tagline: 'Central de agentes, automações e despachos',         iconKey: 'Bot',          color: '#18B7D6', builtV1: true },
  { key: 'data',      name: 'Nexo Data',      tagline: 'Dados, integrações, qualidade e governança',         iconKey: 'Database',     color: '#9AACB8', builtV1: true },
];

export interface SidebarItem { id?: string; label: string; iconKey: string; }
const STD = {
  visao: { label: 'Visão geral', iconKey: 'LayoutGrid' },
  mapa: { label: 'Mapa', iconKey: 'Map' },
  operacoes: { label: 'Operações', iconKey: 'Activity' },
  workflows: { label: 'Workflows', iconKey: 'Workflow' },
  analytics: { label: 'Analytics', iconKey: 'BarChart3' },
  agentes: { label: 'Agentes', iconKey: 'Bot' },
  relatorios: { label: 'Relatórios', iconKey: 'FileText' },
  integracoes: { label: 'Integrações', iconKey: 'Plug' },
  administracao: { label: 'Administração', iconKey: 'Settings' },
};

export const SIDEBAR_CONFIG: Record<ProductKey, SidebarItem[]> = {
  hub: [],
  control: [
    { id: 'overview', label: 'Visão geral', iconKey: 'LayoutGrid' },
    { id: 'situation', label: 'Sala de situação', iconKey: 'Radio' },
    { id: 'map', label: 'Mapa', iconKey: 'Map' },
    { id: 'agenda', label: 'Agenda crítica', iconKey: 'AlertTriangle' },
    { id: 'simulator', label: 'Simulador', iconKey: 'SlidersHorizontal' },
    { id: 'analytics', label: 'Analytics', iconKey: 'BarChart3' },
    { id: 'agents', label: 'Agentes', iconKey: 'Bot' },
    { id: 'reports', label: 'Relatórios', iconKey: 'FileText' },
    { id: 'integrations', label: 'Integrações', iconKey: 'Plug' },
    { id: 'admin', label: 'Administração', iconKey: 'Settings' },
  ],
  capital: [
    { id: 'overview', label: 'Visão geral', iconKey: 'LayoutGrid' },
    { id: 'sources', label: 'Fontes de capital', iconKey: 'Landmark' },
    { id: 'programs', label: 'Programas e envelopes', iconKey: 'Package' },
    { id: 'covenants', label: 'Covenants', iconKey: 'FileWarning' },
    { id: 'map', label: 'Mapa', iconKey: 'Map' },
    { id: 'analytics', label: 'Analytics', iconKey: 'BarChart3' },
    { id: 'agents', label: 'Agentes', iconKey: 'Bot' },
    { id: 'reports', label: 'Relatórios', iconKey: 'FileText' },
    { id: 'integrations', label: 'Integrações', iconKey: 'Plug' },
    { id: 'admin', label: 'Administração', iconKey: 'Settings' },
  ],
  carteira: [
    { id: 'overview', label: 'Visão geral', iconKey: 'LayoutGrid' },
    { id: 'radar', label: 'Radar territorial', iconKey: 'Radar' },
    { id: 'opportunities', label: 'Oportunidades', iconKey: 'Sparkles' },
    { id: 'prioritization', label: 'Priorização', iconKey: 'ListOrdered' },
    { id: 'map', label: 'Mapa', iconKey: 'Map' },
    { id: 'analytics', label: 'Analytics', iconKey: 'BarChart3' },
    { id: 'agents', label: 'Agentes', iconKey: 'Bot' },
    { id: 'reports', label: 'Relatórios', iconKey: 'FileText' },
    { id: 'integrations', label: 'Integrações', iconKey: 'Plug' },
    { id: 'admin', label: 'Administração', iconKey: 'Settings' },
  ],
  estrutura: [
    { id: 'overview', label: 'Visão geral', iconKey: 'LayoutGrid' },
    { id: 'alternatives', label: 'Alternativas', iconKey: 'GitBranch' },
    { id: 'financial', label: 'Modelo financeiro', iconKey: 'Calculator' },
    { id: 'scenarios', label: 'Cenários', iconKey: 'Layers' },
    { id: 'map', label: 'Mapa', iconKey: 'Map' },
    { id: 'analytics', label: 'Analytics', iconKey: 'BarChart3' },
    { id: 'agents', label: 'Agentes', iconKey: 'Bot' },
    { id: 'reports', label: 'Relatórios', iconKey: 'FileText' },
    { id: 'admin', label: 'Administração', iconKey: 'Settings' },
  ],
  contrata: [
    { id: 'overview', label: 'Visão geral', iconKey: 'LayoutGrid' },
    { id: 'queue', label: 'Fila de análises', iconKey: 'ListChecks' },
    { id: 'risks', label: 'Riscos', iconKey: 'ShieldAlert' },
    { id: 'committee', label: 'Comitê', iconKey: 'Users' },
    { id: 'workflows', label: 'Workflows', iconKey: 'Workflow' },
    { id: 'analytics', label: 'Analytics', iconKey: 'BarChart3' },
    { id: 'agents', label: 'Agentes', iconKey: 'Bot' },
    { id: 'reports', label: 'Relatórios', iconKey: 'FileText' },
    { id: 'admin', label: 'Administração', iconKey: 'Settings' },
  ],
  entrega: [
    { id: 'overview', label: 'Visão geral', iconKey: 'LayoutGrid' },
    { id: 'schedule', label: 'Cronograma', iconKey: 'CalendarClock' },
    { id: 'map', label: 'Mapa', iconKey: 'Map' },
    { id: 'measurements', label: 'Medições', iconKey: 'Ruler' },
    { id: 'disbursements', label: 'Desembolsos', iconKey: 'Banknote' },
    { id: 'workflows', label: 'Workflows', iconKey: 'Workflow' },
    { id: 'analytics', label: 'Analytics', iconKey: 'BarChart3' },
    { id: 'agents', label: 'Agentes', iconKey: 'Bot' },
    { id: 'reports', label: 'Relatórios', iconKey: 'FileText' },
    { id: 'integrations', label: 'Integrações', iconKey: 'Plug' },
  ],
  evidencia: [STD.visao, { label: 'Visualizador', iconKey: 'Images' }, { label: 'Vistorias', iconKey: 'ClipboardCheck' }, { label: 'Cadeia de custódia', iconKey: 'Link2' }, STD.mapa, STD.agentes, STD.relatorios],
  ativos: [STD.visao, { label: 'Portfólio', iconKey: 'Building2' }, STD.mapa, { label: 'Saúde', iconKey: 'HeartPulse' }, { label: 'Manutenção', iconKey: 'Wrench' }, STD.analytics, STD.agentes, STD.relatorios, STD.integracoes],
  impacto: [STD.visao, { label: 'Indicadores', iconKey: 'Target' }, { label: 'Beneficiários', iconKey: 'Users' }, STD.mapa, STD.relatorios, STD.administracao],
  agents: [{ label: 'Cockpit', iconKey: 'LayoutGrid' }, { label: 'Fila de execuções', iconKey: 'ListOrdered' }, { label: 'Casos', iconKey: 'FolderOpen' }, { label: 'Exceções', iconKey: 'AlertOctagon' }, { label: 'Logs', iconKey: 'Terminal' }, { label: 'Alçadas', iconKey: 'Settings' }],
  data: [STD.visao, { label: 'Catálogo', iconKey: 'Database' }, { label: 'Linhagem', iconKey: 'GitBranch' }, { label: 'Qualidade', iconKey: 'BadgeCheck' }, STD.integracoes, STD.administracao],
  ativo360: [],
};

