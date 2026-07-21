import type { ProductKey } from '@/data/navConfig';

export type PresentationSection =
  | 'overview' | 'sources' | 'radar' | 'alternatives' | 'committee'
  | 'measurements' | 'inspections' | 'health' | 'indicators' | 'cockpit'
  | 'lineage' | 'asset360';

export interface PresentationStep {
  id: string;
  number: number;
  phase: string;
  title: string;
  subtitle: string;
  product: ProductKey;
  section: PresentationSection;
  duration: string;
  icon: string;
  color: string;
  narrative: string;
  show: string[];
  decision: string;
  agent: string;
  output: string;
  metric: string;
  metricLabel: string;
  speakerNote: string;
}

export const PRESENTATION_ASSET_ID = 'NEXO-ASSET-BR-SP-3549904-SAN-000284';

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: 'opening', number: 1, phase: 'Visão corporativa', title: 'Da origem do capital ao valor comprovado',
    subtitle: 'A linha digital Capital–Ativo–Resultado', product: 'control', section: 'overview', duration: '45s', icon: 'Gauge', color: '#1584D1',
    narrative: 'Começamos pela visão executiva: a CAIXA acompanha o capital, os projetos, a execução, os ativos e os resultados em uma única trajetória rastreável.',
    show: ['Funil Capital → Resultado', 'Carteira nacional e ativos críticos', 'Decisões que exigem ação humana'],
    decision: 'Onde concentrar atenção executiva agora?', agent: 'Orquestrador do Ciclo de Vida', output: 'Agenda corporativa priorizada', metric: 'R$ 28,4 bi', metricLabel: 'capital rastreado',
    speakerNote: 'Enfatize que o Nexo não substitui os sistemas existentes; ele conecta decisões e evidências ao longo do ciclo.'
  },
  {
    id: 'capital', number: 2, phase: 'Captação', title: 'Funding com condições preservadas até o ativo',
    subtitle: 'Passaporte do Capital e covenants', product: 'capital', section: 'sources', duration: '50s', icon: 'Landmark', color: '#087C78',
    narrative: 'O recurso entra com custo, prazo, destinação, metas e requisitos de evidência. Essas condições seguem vinculadas a cada operação e ativo.',
    show: ['Fonte FGTS + contrapartida', 'Envelope de saneamento', 'Regras de elegibilidade e reporte'],
    decision: 'O recurso pode financiar esta tipologia e este território?', agent: 'Agente de Funding e Covenants', output: 'Passaporte do Capital', metric: 'R$ 480 mi', metricLabel: 'operação Vale Verde',
    speakerNote: 'Mostre que taxonomias e frameworks existentes são consumidos, e não recriados.'
  },
  {
    id: 'origination', number: 3, phase: 'Originação', title: 'A necessidade territorial vira oportunidade qualificada',
    subtitle: 'Radar territorial e priorização da carteira', product: 'carteira', section: 'radar', duration: '55s', icon: 'Radar', color: '#1584D1',
    narrative: 'O radar combina déficit de saneamento, população, vulnerabilidade, capacidade de execução e disponibilidade de funding para formar a oportunidade.',
    show: ['Sinal territorial', 'Área de influência', 'Score preliminar e duplicidades'],
    decision: 'A oportunidade deve entrar na carteira e com qual prioridade?', agent: 'Agente de Radar e Priorização', output: 'Oportunidade priorizada', metric: '210 mil', metricLabel: 'beneficiários previstos',
    speakerNote: 'Diferencie de um pipeline genérico: o contexto territorial e o funding já orientam a decisão.'
  },
  {
    id: 'structure', number: 4, phase: 'Estruturação', title: 'Alternativas técnicas, financeiras e territoriais',
    subtitle: 'Gêmeo de decisão antes da contratação', product: 'estrutura', section: 'alternatives', duration: '60s', icon: 'GitBranch', color: '#7C5CBF',
    narrative: 'A plataforma compara tecnologias, localização, Capex, Opex, cobertura, resiliência e dependências para escolher a solução de maior valor.',
    show: ['Alternativa A × B × C', 'Cobertura e custo por beneficiário', 'Risco e sensibilidade'],
    decision: 'Qual alternativa deve se tornar a baseline?', agent: 'Agente de Alternativas e Estruturação', output: 'Baseline técnica e financeira', metric: '18%', metricLabel: 'ganho estimado de eficiência',
    speakerNote: 'Use a comparação para mostrar que a decisão ocorre antes de cristalizar custos e riscos no contrato.'
  },
  {
    id: 'contract', number: 5, phase: 'Contratação', title: 'Elegibilidade, risco e decisão auditável',
    subtitle: 'Dossiê consolidado e comitê humano', product: 'contrata', section: 'committee', duration: '60s', icon: 'ClipboardCheck', color: '#E5A11A',
    narrative: 'Análises de crédito, engenharia, território, meio ambiente, clima e documentação são consolidadas para o comitê, com condicionantes explícitas.',
    show: ['Parecer consolidado', 'Matriz de riscos', 'Condicionantes e alçadas'],
    decision: 'Aprovar, diligenciar, reenquadrar ou reprovar?', agent: 'Agente de Elegibilidade e Risco Integrado', output: 'Baseline contratual e plano de evidências', metric: '92%', metricLabel: 'elegibilidade consolidada',
    speakerNote: 'Reforce o gate humano: os agentes preparam e explicam; a decisão institucional permanece com a alçada.'
  },
  {
    id: 'delivery', number: 6, phase: 'Execução', title: 'Medição convertida em decisão de desembolso',
    subtitle: 'Execução física, financeira e geoespacial', product: 'entrega', section: 'measurements', duration: '75s', icon: 'Ruler', color: '#18B7D6',
    narrative: 'Na medição nº 6, o sistema cruza itens, valores, cronograma, geometrias e evidências. Três trechos apresentam divergência espacial.',
    show: ['Avanço informado × verificado', 'Itens e valores retidos', 'Recomendação de desembolso parcial'],
    decision: 'Quanto pode ser liberado com segurança?', agent: 'Agente de Medição e Desembolso', output: 'Despacho preliminar de liberação', metric: 'R$ 15,7 mi', metricLabel: 'valor liberável',
    speakerNote: 'Este é o momento de maior tensão da demonstração: mostre a anomalia e a necessidade de vistoria direcionada.'
  },
  {
    id: 'evidence', number: 7, phase: 'Evidência', title: 'Vistoria direcionada e cadeia de custódia',
    subtitle: 'Da anomalia ao fato comprovado', product: 'evidencia', section: 'inspections', duration: '80s', icon: 'ShieldCheck', color: '#0FA39D',
    narrative: 'A equipe recebe rota e checklist, coleta dados offline e sincroniza fotos, GNSS e documentos. Cada evidência é selada e vinculada ao trecho.',
    show: ['Equipe em campo em tempo real', 'Checklist e coleta georreferenciada', 'Hash, assinatura e confiança'],
    decision: 'A evidência é suficiente para validar o trecho?', agent: 'Agente de Vistoria e Integridade', output: 'Pacote auditável da medição', metric: '94%', metricLabel: 'confiança da evidência',
    speakerNote: 'Acione a simulação ao vivo para mostrar o deslocamento, a coleta e a atualização dos agentes.'
  },
  {
    id: 'asset', number: 8, phase: 'Ativo', title: 'A obra termina, mas o ativo começa',
    subtitle: 'Comissionamento, operação e saúde', product: 'ativos', section: 'health', duration: '60s', icon: 'HeartPulse', color: '#1584D1',
    narrative: 'Depois da conclusão, o ativo passa a ser acompanhado por disponibilidade, desempenho, manutenção, resiliência e vida útil.',
    show: ['Índice de Saúde do Ativo', 'Componentes críticos', 'Manutenção preditiva e reinvestimento'],
    decision: 'O ativo está funcional e sustentável ao longo da vida?', agent: 'Agente de Saúde e Manutenção Preditiva', output: 'Plano operacional e de manutenção', metric: '87/100', metricLabel: 'saúde projetada',
    speakerNote: 'Explique a diferença entre obra concluída, ativo comissionado e serviço público funcionando.'
  },
  {
    id: 'impact', number: 9, phase: 'Resultado', title: 'Serviço prestado e impacto comprovado',
    subtitle: 'Do produto físico ao valor público', product: 'impacto', section: 'indicators', duration: '60s', icon: 'Target', color: '#0FA39D',
    narrative: 'Indicadores conectam o recurso aplicado, a rede implantada, as ligações funcionando, a população atendida e os resultados territoriais.',
    show: ['Meta × realizado', 'Beneficiários comprovados', 'Evidências de resultado e atribuição'],
    decision: 'O resultado pode ser publicado e atribuído ao investimento?', agent: 'Agente de Impacto e MRV', output: 'Demonstração de Valor do Ativo', metric: '210 mil', metricLabel: 'pessoas atendidas',
    speakerNote: 'Mostre que o impacto não é uma declaração: ele herda evidências, metodologia e nível de confiança.'
  },
  {
    id: 'agents', number: 10, phase: 'Orquestração', title: 'Agentes trabalham; humanos governam',
    subtitle: 'Automação explicável com alçadas', product: 'agents', section: 'cockpit', duration: '55s', icon: 'Bot', color: '#18B7D6',
    narrative: 'Os agentes coordenam análises, exceções, diligências e despachos. A matriz de alçadas define o que pode ser automatizado e o que exige decisão humana.',
    show: ['Fila de execuções', 'Caso Vale Verde', 'Logs, confiança e gate humano'],
    decision: 'Qual ação pode seguir automaticamente e qual deve escalar?', agent: 'Orquestrador do Ciclo de Vida', output: 'Caso coordenado ponta a ponta', metric: '73%', metricLabel: 'automação assistida',
    speakerNote: 'Destaque segregação de funções, rastreabilidade e limites financeiros.'
  },
  {
    id: 'data', number: 11, phase: 'Dados', title: 'A linhagem que sustenta cada decisão',
    subtitle: 'Dados certificados, qualidade e integração', product: 'data', section: 'lineage', duration: '55s', icon: 'Database', color: '#9AACB8',
    narrative: 'A decisão pode ser rastreada até fontes, transformações, entidades corporativas, produtos de dados e regras de qualidade.',
    show: ['Grafo de linhagem', 'Produtos de dados certificados', 'Impacto de falhas sobre agentes e decisões'],
    decision: 'Os dados usados na decisão são confiáveis e atuais?', agent: 'Agente de Qualidade e Linhagem', output: 'Trilha técnica da decisão', metric: '96,4%', metricLabel: 'qualidade média',
    speakerNote: 'Use a linhagem para mostrar que IA e analytics não são uma caixa-preta desconectada da governança.'
  },
  {
    id: 'closing', number: 12, phase: 'Síntese', title: 'Passaporte completo do ativo',
    subtitle: 'Uma única trajetória, muitas decisões conectadas', product: 'ativo360', section: 'asset360', duration: '50s', icon: 'Route', color: '#1584D1',
    narrative: 'Encerramos no Ativo 360, onde funding, decisões, contratos, execução, evidências, operação e impacto permanecem conectados na mesma linha do tempo.',
    show: ['Linha de vida completa', 'Decisões e responsáveis', 'Documentos, agentes e evidências'],
    decision: 'Que aprendizado retorna para o próximo ciclo de capital?', agent: 'Nexo — inteligência corporativa integrada', output: 'Memória institucional do investimento', metric: '10 etapas', metricLabel: 'conectadas no ciclo',
    speakerNote: 'Finalize com a mensagem: cada real pode ser rastreado até o ativo funcionando e o resultado comprovado.'
  },
];
