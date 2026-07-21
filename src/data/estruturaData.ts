// Dados sintéticos — Nexo Estrutura (V2)

export interface Scenario {
  id: string;
  projeto: string;
  nome: string;
  localizacao: string;
  tecnologia: string;
  capacidade: string;
  prazoMeses: number;
  capex: number;
  opexAno: number;
  funding: string;
  tarifaOuCusteio: string;
  beneficiarios: number;
  vidaUtilAnos: number;
  premissas: string[];
  riscos: string[];
  restricoes: string[];
  indicadores: { custoPorBeneficiario: number; cobertura: number; resiliencia: number; acessibilidade: number; complexidade: number };
  recomendada: boolean;
  score: number;
}

export const PROJETO_ESTRUTURACAO = 'UBS Digital Norte';

export const SCENARIOS: Scenario[] = [
  {
    id: 'CEN-A', projeto: PROJETO_ESTRUTURACAO, nome: 'Alternativa A — Módulos fluviais pré-fabricados',
    localizacao: 'Ribeirinha — 12 pontos ao longo do rio', tecnologia: 'Módulo flutuante pré-fabricado com telemedicina',
    capacidade: '12 unidades · 58 mil habitantes', prazoMeses: 18, capex: 64_000_000, opexAno: 3_100_000,
    funding: 'Recursos Próprios CAIXA (100%)', tarifaOuCusteio: 'Custeio municipal + SUS',
    beneficiarios: 58_000, vidaUtilAnos: 20,
    premissas: ['Nível do rio estável na maior parte do ano', 'Manutenção fluvial trimestral disponível'],
    riscos: ['Variação sazonal do nível do rio', 'Logística de suprimento médico'],
    restricoes: ['Licenciamento ambiental simplificado aplicável'],
    indicadores: { custoPorBeneficiario: 1_103, cobertura: 92, resiliencia: 74, acessibilidade: 88, complexidade: 62 },
    recomendada: true, score: 8.4,
  },
  {
    id: 'CEN-B', projeto: PROJETO_ESTRUTURACAO, nome: 'Alternativa B — Unidades fixas de alvenaria',
    localizacao: 'Sedes distritais fixas — 8 pontos', tecnologia: 'Construção civil convencional',
    capacidade: '8 unidades · 58 mil habitantes', prazoMeses: 30, capex: 89_000_000, opexAno: 2_400_000,
    funding: 'Recursos Próprios CAIXA (100%)', tarifaOuCusteio: 'Custeio municipal + SUS',
    beneficiarios: 58_000, vidaUtilAnos: 35,
    premissas: ['Acesso terrestre viável na maioria dos distritos', 'Disponibilidade de terreno regularizado'],
    riscos: ['Tempo de deslocamento da população ribeirinha mais dispersa', 'Regularização fundiária em 2 distritos'],
    restricoes: ['Licenciamento ambiental convencional (mais lento)'],
    indicadores: { custoPorBeneficiario: 1_534, cobertura: 71, resiliencia: 90, acessibilidade: 58, complexidade: 79 },
    recomendada: false, score: 6.9,
  },
  {
    id: 'CEN-C', projeto: PROJETO_ESTRUTURACAO, nome: 'Alternativa C — Modelo híbrido (fluvial + fixo)',
    localizacao: 'Combinação de 6 módulos fluviais + 4 unidades fixas', tecnologia: 'Módulo flutuante + alvenaria em pontos de maior densidade',
    capacidade: '10 unidades · 58 mil habitantes', prazoMeses: 22, capex: 76_000_000, opexAno: 2_850_000,
    funding: 'Recursos Próprios CAIXA (100%)', tarifaOuCusteio: 'Custeio municipal + SUS',
    beneficiarios: 58_000, vidaUtilAnos: 28,
    premissas: ['Densidade populacional permite concentração parcial em pontos fixos'],
    riscos: ['Maior complexidade operacional por combinar dois modelos de manutenção'],
    restricoes: ['Licenciamento misto (simplificado + convencional)'],
    indicadores: { custoPorBeneficiario: 1_310, cobertura: 85, resiliencia: 83, acessibilidade: 76, complexidade: 85 },
    recomendada: false, score: 7.8,
  },
];

export const SENSIBILIDADE = [
  { variavel: 'Custo do módulo fluvial', impacto: 0.34 },
  { variavel: 'Tempo de licenciamento', impacto: 0.27 },
  { variavel: 'Custo de manutenção fluvial', impacto: 0.19 },
  { variavel: 'Câmbio de insumos importados', impacto: 0.12 },
  { variavel: 'Disponibilidade de mão de obra local', impacto: 0.08 },
];

export const VIDA_UTIL_CURVA = [
  { ano: 0, valor: 100 }, { ano: 5, valor: 94 }, { ano: 10, valor: 85 },
  { ano: 15, valor: 74 }, { ano: 20, valor: 60 }, { ano: 25, valor: 45 }, { ano: 30, valor: 30 },
];
