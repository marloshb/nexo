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

export interface ProgramEnvelope { programa: string; envelope: number; alocado: number; territorio: string; }
export const PROGRAM_ENVELOPES: ProgramEnvelope[] = [
  { programa: 'Programa Nacional de Saneamento Rural e Urbano', envelope: 2_900, alocado: 1_780, territorio: 'Nacional' },
  { programa: 'Programa Habitacional de Interesse Social', envelope: 980, alocado: 890, territorio: 'Nordeste' },
  { programa: 'Programa de Adaptação Climática Urbana', envelope: 1_200, alocado: 612, territorio: 'Norte' },
  { programa: 'Programa de Mobilidade Urbana Sustentável', envelope: 640, alocado: 38, territorio: 'Sudeste' },
  { programa: 'Programa de Energias Renováveis e Transição Justa', envelope: 430, alocado: 430, territorio: 'Nordeste' },
  { programa: 'Programa Nacional de Educação Profissionalizante', envelope: 420, alocado: 42, territorio: 'Centro-Oeste' },
];
