// Dados sintéticos — Nexo Impacto (V2)

export interface Indicator {
  id: string;
  nome: string;
  descricao: string;
  unidade: string;
  formula: string;
  dimensao: 'Social' | 'Ambiental' | 'Econômica';
  nivelCadeia: 'Insumo' | 'Atividade' | 'Produto' | 'Serviço' | 'Resultado' | 'Impacto';
  ativo: string;
  baseline: number;
  meta: number;
  realizado: number;
  territorio: string;
  periodicidade: string;
  fonte: string;
  metodo: string;
  responsavel: string;
  tolerancia: string;
  status: 'validado' | 'divergente' | 'pendente';
}

export const INDICATORS: Indicator[] = [
  {
    id: 'IND-001', nome: 'Beneficiários com água segura', descricao: 'População com acesso contínuo a água tratada via adutora',
    unidade: 'pessoas', formula: 'Domicílios conectados × habitantes/domicílio (IBGE)', dimensao: 'Social', nivelCadeia: 'Resultado',
    ativo: 'Adutora Sertão Vivo', baseline: 0, meta: 310_000, realizado: 296_000, territorio: 'Iguatu e região — CE',
    periodicidade: 'Trimestral', fonte: 'Pesquisa domiciliar + telemetria de vazão', metodo: 'Amostragem estatística com validação cruzada',
    responsavel: 'Juliana Prado', tolerancia: '±3%', status: 'validado',
  },
  {
    id: 'IND-002', nome: 'Empregos gerados na operação', descricao: 'Postos de trabalho diretos e indiretos na fase de operação',
    unidade: 'empregos', formula: 'Folha de pagamento do operador + fornecedores diretos', dimensao: 'Econômica', nivelCadeia: 'Resultado',
    ativo: 'Complexo Eólico Costa Branca', baseline: 0, meta: 1_200, realizado: 1_340, territorio: 'Litoral Norte — RN',
    periodicidade: 'Anual', fonte: 'RAIS + declaração do operador', metodo: 'Conciliação com cadastro do operador',
    responsavel: 'Tiago Almeida', tolerancia: '±5%', status: 'validado',
  },
  {
    id: 'IND-003', nome: 'Domicílios atendidos por esgotamento', descricao: 'Domicílios com ligação de esgoto ativa e operante',
    unidade: 'domicílios', formula: 'Ligações ativas cadastradas no sistema', dimensao: 'Social', nivelCadeia: 'Produto',
    ativo: 'Sistema Integrado de Esgotamento Vale Verde', baseline: 0, meta: 58_000, realizado: 0, territorio: 'São José dos Campos — SP',
    periodicidade: 'Mensal', fonte: 'Cadastro técnico da concessionária', metodo: 'Contagem direta com auditoria amostral',
    responsavel: 'Ana Beatriz Souza', tolerancia: '±2%', status: 'pendente',
  },
  {
    id: 'IND-004', nome: 'Matrículas em cursos técnicos', descricao: 'Alunos matriculados nos cursos ofertados pela escola técnica',
    unidade: 'matrículas', formula: 'Registros acadêmicos ativos', dimensao: 'Social', nivelCadeia: 'Produto',
    ativo: 'Escola Técnica Cerrado', baseline: 0, meta: 2_400, realizado: 1_150, territorio: 'Goiânia — GO',
    periodicidade: 'Semestral', fonte: 'Sistema acadêmico', metodo: 'Extração direta do sistema', responsavel: 'Bruno Castro',
    tolerancia: '±1%', status: 'validado',
  },
  {
    id: 'IND-005', nome: 'Redução de emissões evitadas', descricao: 'Emissões de CO2e evitadas pela geração eólica frente à matriz marginal',
    unidade: 'toneladas CO2e/ano', formula: 'Energia gerada × fator de emissão marginal do SIN', dimensao: 'Ambiental', nivelCadeia: 'Impacto',
    ativo: 'Complexo Eólico Costa Branca', baseline: 0, meta: 410_000, realizado: 447_000, territorio: 'Litoral Norte — RN',
    periodicidade: 'Anual', fonte: 'ONS + operador', metodo: 'Metodologia MDL adaptada', responsavel: 'Tiago Almeida',
    tolerancia: '±8%', status: 'validado',
  },
  {
    id: 'IND-006', nome: 'População com exposição a inundação reduzida', descricao: 'População na área de influência das obras de macrodrenagem com risco mitigado',
    unidade: 'pessoas', formula: 'Modelagem hidrológica antes/depois', dimensao: 'Ambiental', nivelCadeia: 'Impacto',
    ativo: 'Programa de Macrodrenagem Rio Norte', baseline: 340_000, meta: 238_000, realizado: 0, territorio: 'Região Metropolitana de Belém — PA',
    periodicidade: 'Anual', fonte: 'Modelagem hidrológica + INPE', metodo: 'Comparação de cenários simulados', responsavel: 'Fernanda Ribeiro',
    tolerancia: '±10%', status: 'pendente',
  },
  {
    id: 'IND-007', nome: 'Unidades habitacionais entregues', descricao: 'Unidades habitacionais concluídas e aptas à ocupação',
    unidade: 'unidades', formula: 'Registros de habite-se por unidade', dimensao: 'Social', nivelCadeia: 'Produto',
    ativo: 'Residencial Horizonte Azul', baseline: 0, meta: 1_240, realizado: 1_079, territorio: 'Recife — PE',
    periodicidade: 'Mensal', fonte: 'Cadastro da construtora + vistoria', metodo: 'Contagem direta com vistoria amostral',
    responsavel: 'Carlos Eduardo Lima', tolerancia: '±1%', status: 'divergente',
  },
];

export const RESULT_CHAIN = ['Insumo', 'Atividade', 'Produto', 'Serviço', 'Resultado', 'Impacto'] as const;

export const IMPACT_TIME_SERIES = [
  { ano: '2022', previsto: 320_000, comprovado: 180_000 },
  { ano: '2023', previsto: 810_000, comprovado: 640_000 },
  { ano: '2024', previsto: 1_450_000, comprovado: 1_190_000 },
  { ano: '2025', previsto: 2_260_000, comprovado: 1_870_000 },
  { ano: '2026', previsto: 3_850_000, comprovado: 2_390_000 },
];
