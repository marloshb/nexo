// Dados sintéticos — Nexo Carteira (V2)

export type OpportunityStage = 'Triagem' | 'Georreferenciada' | 'Enriquecida' | 'Verificada' | 'Estruturação' | 'Arquivada';

export interface Opportunity {
  id: string;
  titulo: string;
  proponente: string;
  setor: string;
  problema: string;
  uf: string;
  city: string;
  lat: number; lon: number;
  populacaoBeneficiada: number;
  ativoPrevisto: string;
  valorEstimado: number;
  fonteDesejada: string;
  estagio: OpportunityStage;
  score: number;
  documentosDisponiveis: number;
  restricoesConhecidas: string[];
  dataAlvo: string;
  contato: string;
  duplicidadeDetectada: boolean;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-2026-0142', titulo: 'Sistema Adutor Chapada Norte', proponente: 'Governo do Estado da Bahia', setor: 'Recursos Hídricos',
    problema: 'Insegurança hídrica em 12 municípios do semiárido baiano', uf: 'BA', city: 'Chapada Diamantina', lat: -12.35, lon: -41.4,
    populacaoBeneficiada: 186_000, ativoPrevisto: 'Adutora + 3 reservatórios', valorEstimado: 340_000_000, fonteDesejada: 'BID',
    estagio: 'Estruturação', score: 8.1, documentosDisponiveis: 9, restricoesConhecidas: ['Licenciamento ambiental em análise'],
    dataAlvo: '2027-06-01', contato: 'Secretaria Estadual de Infraestrutura Hídrica', duplicidadeDetectada: false,
  },
  {
    id: 'OPP-2026-0158', titulo: 'Requalificação Orla Fluvial', proponente: 'Prefeitura Municipal', setor: 'Mobilidade',
    problema: 'Falta de acessibilidade e drenagem na orla urbana', uf: 'AM', city: 'Manaus', lat: -3.13, lon: -60.0,
    populacaoBeneficiada: 64_000, ativoPrevisto: 'Requalificação viária e passeio público', valorEstimado: 88_000_000, fonteDesejada: 'Tesouro (OGU)',
    estagio: 'Triagem', score: 6.7, documentosDisponiveis: 3, restricoesConhecidas: ['Estudo de tráfego pendente', 'Área de proteção ambiental próxima'],
    dataAlvo: '2028-01-15', contato: 'Secretaria Municipal de Obras', duplicidadeDetectada: false,
  },
  {
    id: 'OPP-2026-0163', titulo: 'Rede Escolar Sertão', proponente: 'Governo do Estado do Piauí', setor: 'Educação',
    problema: 'Déficit de vagas de educação técnica no sertão piauiense', uf: 'PI', city: 'Picos', lat: -7.08, lon: -41.47,
    populacaoBeneficiada: 12_400, ativoPrevisto: '4 escolas técnicas regionais', valorEstimado: 96_000_000, fonteDesejada: 'Recursos Próprios CAIXA',
    estagio: 'Enriquecida', score: 7.9, documentosDisponiveis: 7, restricoesConhecidas: [],
    dataAlvo: '2027-09-01', contato: 'Secretaria Estadual de Educação', duplicidadeDetectada: false,
  },
  {
    id: 'OPP-2026-0171', titulo: 'Parque Linear Igarapé Azul', proponente: 'Prefeitura Municipal', setor: 'Drenagem',
    problema: 'Ocupação irregular de fundo de vale com risco de alagamento', uf: 'PA', city: 'Ananindeua', lat: -1.37, lon: -48.37,
    populacaoBeneficiada: 41_000, ativoPrevisto: 'Parque linear com macrodrenagem', valorEstimado: 122_000_000, fonteDesejada: 'BID',
    estagio: 'Estruturação', score: 7.2, documentosDisponiveis: 6, restricoesConhecidas: ['Reassentamento de 84 famílias'],
    dataAlvo: '2027-11-01', contato: 'Secretaria Municipal de Meio Ambiente', duplicidadeDetectada: false,
  },
  {
    id: 'OPP-2026-0179', titulo: 'Complexo Solar Vale do Sol', proponente: 'Consórcio Privado', setor: 'Energia',
    problema: 'Expansão de capacidade renovável na matriz regional', uf: 'PE', city: 'Petrolina', lat: -9.4, lon: -40.5,
    populacaoBeneficiada: 210_000, ativoPrevisto: 'Usina fotovoltaica 180 MWp', valorEstimado: 410_000_000, fonteDesejada: 'Mercado (Green Bond)',
    estagio: 'Verificada', score: 8.6, documentosDisponiveis: 11, restricoesConhecidas: [],
    dataAlvo: '2027-03-01', contato: 'Diretoria de Projetos do Consórcio', duplicidadeDetectada: false,
  },
  {
    id: 'OPP-2026-0184', titulo: 'Requalificação Viária Centro Histórico', proponente: 'Prefeitura Municipal', setor: 'Mobilidade',
    problema: 'Congestionamento e falta de acessibilidade no centro histórico', uf: 'MG', city: 'Ouro Preto', lat: -20.38, lon: -43.5,
    populacaoBeneficiada: 28_000, ativoPrevisto: 'Corredor de acessibilidade urbana', valorEstimado: 54_000_000, fonteDesejada: 'Tesouro (OGU)',
    estagio: 'Triagem', score: 5.4, documentosDisponiveis: 2, restricoesConhecidas: ['Sobreposição com área de patrimônio histórico tombado', 'Possível duplicidade com proposta 2024'],
    dataAlvo: '2028-04-01', contato: 'Secretaria Municipal de Mobilidade', duplicidadeDetectada: true,
  },
  {
    id: 'OPP-2026-0190', titulo: 'UBS Fluviais Baixo Amazonas', proponente: 'Secretaria Estadual de Saúde', setor: 'Saúde',
    problema: 'Cobertura insuficiente de atenção básica em comunidades ribeirinhas', uf: 'AM', city: 'Parintins', lat: -2.63, lon: -56.74,
    populacaoBeneficiada: 38_000, ativoPrevisto: '8 unidades básicas de saúde fluviais', valorEstimado: 71_000_000, fonteDesejada: 'Recursos Próprios CAIXA',
    estagio: 'Georreferenciada', score: 7.0, documentosDisponiveis: 4, restricoesConhecidas: ['Logística de suprimento em análise'],
    dataAlvo: '2027-12-01', contato: 'Coordenação de Atenção Básica Ribeirinha', duplicidadeDetectada: false,
  },
  {
    id: 'OPP-2026-0121', titulo: 'Terminal Intermodal Cerrado', proponente: 'Governo do Estado de Goiás', setor: 'Mobilidade',
    problema: 'Baixa integração entre modais de transporte metropolitano', uf: 'GO', city: 'Aparecida de Goiânia', lat: -16.82, lon: -49.24,
    populacaoBeneficiada: 95_000, ativoPrevisto: 'Terminal intermodal + corredor de ônibus', valorEstimado: 175_000_000, fonteDesejada: 'BIRD / Banco Mundial',
    estagio: 'Arquivada', score: 4.8, documentosDisponiveis: 5, restricoesConhecidas: ['Capacidade de pagamento do estado insuficiente no ciclo atual'],
    dataAlvo: '2029-01-01', contato: 'Secretaria Estadual de Infraestrutura', duplicidadeDetectada: false,
  },
];
