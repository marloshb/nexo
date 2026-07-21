// Dados sintéticos — Nexo Contrata (V2)

export type ContrataDecision =
  | 'aprovar' | 'aprovar_condicionantes' | 'diligenciar' | 'reenquadrar'
  | 'reprovar' | 'escalar' | 'vistoria' | 'nova_modelagem';

export interface DossieSection { label: string; status: 'ok' | 'atencao' | 'critico'; nota: string; }

export interface QueueItem {
  id: string;
  operacao: string;
  programa: string;
  proponente: string;
  funding: string;
  valor: number;
  etapa: string;
  alcada: string;
  prazoDias: number;
  criticidade: 'normal' | 'atencao' | 'critico';
  elegibilidadePct: number;
  sections: DossieSection[];
  condicionantes: string[];
  parecer: string;
  decisaoRecomendada: ContrataDecision;
}

export const CONTRATA_DECISION_LABEL: Record<ContrataDecision, string> = {
  aprovar: 'Aprovar', aprovar_condicionantes: 'Aprovar com condicionantes', diligenciar: 'Diligenciar',
  reenquadrar: 'Reenquadrar', reprovar: 'Reprovar', escalar: 'Escalar para comitê',
  vistoria: 'Solicitar vistoria', nova_modelagem: 'Solicitar nova modelagem',
};

export const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'CTR-2026-0031', operacao: 'Corredor BRT Serra Azul', programa: 'Programa de Mobilidade Urbana Sustentável',
    proponente: 'Região Metropolitana de Belo Horizonte', funding: 'BIRD / Banco Mundial', valor: 355_000_000,
    etapa: 'Condicionantes ambientais', alcada: 'Comitê Regional', prazoDias: 5, criticidade: 'atencao', elegibilidadePct: 82,
    sections: [
      { label: 'Dados da operação', status: 'ok', nota: 'Completo' },
      { label: 'Proponente', status: 'ok', nota: 'Capacidade institucional adequada' },
      { label: 'Programa', status: 'ok', nota: 'Aderente' },
      { label: 'Funding', status: 'ok', nota: 'Elegível — BIRD Mobilidade Urbana Sustentável' },
      { label: 'Garantias', status: 'ok', nota: 'Contragarantia FPM aprovada' },
      { label: 'Engenharia', status: 'ok', nota: 'Projeto executivo validado' },
      { label: 'Território', status: 'ok', nota: 'Sem sobreposição com áreas restritas' },
      { label: 'Meio ambiente', status: 'atencao', nota: 'Licença de instalação em análise — 2 condicionantes abertas' },
      { label: 'Aspectos sociais', status: 'ok', nota: 'Plano de comunicação social aprovado' },
      { label: 'Risco climático', status: 'ok', nota: 'Baixa exposição' },
      { label: 'Crédito', status: 'ok', nota: 'Capacidade de pagamento suficiente' },
      { label: 'Condicionantes', status: 'atencao', nota: '2 condicionantes ambientais em aberto' },
    ],
    condicionantes: ['Plano de manejo de fauna aprovado pelo órgão ambiental', 'Compensação ambiental protocolada'],
    parecer: 'Operação tecnicamente e financeiramente elegível. Pendência exclusivamente ambiental — recomenda-se aprovação condicionada à apresentação do plano de manejo de fauna no prazo de 30 dias.',
    decisaoRecomendada: 'aprovar_condicionantes',
  },
  {
    id: 'CTR-2026-0034', operacao: 'UBS Digital Norte', programa: 'Programa de Infraestrutura Social Ribeirinha',
    proponente: 'Secretaria Estadual de Saúde do Amazonas', funding: 'Recursos Próprios CAIXA', valor: 64_000_000,
    etapa: 'Análise fundiária', alcada: 'Analista sênior', prazoDias: 12, criticidade: 'normal', elegibilidadePct: 91,
    sections: [
      { label: 'Dados da operação', status: 'ok', nota: 'Completo' },
      { label: 'Proponente', status: 'ok', nota: 'Histórico de execução regular' },
      { label: 'Programa', status: 'ok', nota: 'Aderente' },
      { label: 'Funding', status: 'ok', nota: 'Elegível' },
      { label: 'Garantias', status: 'ok', nota: 'Não aplicável — recurso próprio' },
      { label: 'Engenharia', status: 'ok', nota: 'Alternativa A (módulos fluviais) selecionada no Nexo Estrutura' },
      { label: 'Território', status: 'atencao', nota: 'Regularização fundiária em 2 dos 12 pontos' },
      { label: 'Meio ambiente', status: 'ok', nota: 'Licenciamento simplificado aplicável' },
      { label: 'Aspectos sociais', status: 'ok', nota: 'Consulta a comunidades ribeirinhas concluída' },
      { label: 'Risco climático', status: 'ok', nota: 'Módulos flutuantes mitigam risco de cheia' },
      { label: 'Crédito', status: 'ok', nota: 'Não aplicável — recurso próprio' },
      { label: 'Condicionantes', status: 'atencao', nota: '1 condicionante fundiária em aberto' },
    ],
    condicionantes: ['Regularização fundiária concluída em 2 pontos antes da assinatura'],
    parecer: 'Elegibilidade elevada (91%). Única pendência é fundiária em 2 dos 12 pontos previstos, sem impacto na viabilidade do restante do projeto.',
    decisaoRecomendada: 'aprovar_condicionantes',
  },
  {
    id: 'CTR-2026-0037', operacao: '2ª fase Complexo Eólico Costa Branca', programa: 'Programa de Energias Renováveis e Transição Justa',
    proponente: 'Consórcio Costa Branca Energia', funding: 'Green Bond', valor: 290_000_000,
    etapa: 'Parecer de crédito', alcada: 'Comitê de Crédito', prazoDias: 3, criticidade: 'normal', elegibilidadePct: 96,
    sections: [
      { label: 'Dados da operação', status: 'ok', nota: 'Completo' },
      { label: 'Proponente', status: 'ok', nota: 'Operador da 1ª fase — histórico de saúde do ativo 87' },
      { label: 'Programa', status: 'ok', nota: 'Aderente' },
      { label: 'Funding', status: 'ok', nota: 'Green Bond elegível — Climate Bonds Standard' },
      { label: 'Garantias', status: 'ok', nota: 'Penhor dos recebíveis da 1ª fase' },
      { label: 'Engenharia', status: 'ok', nota: 'Expansão do mesmo parque — sem novo licenciamento locacional' },
      { label: 'Território', status: 'ok', nota: 'Área contígua já licenciada' },
      { label: 'Meio ambiente', status: 'ok', nota: 'Aditivo de licença já protocolado' },
      { label: 'Aspectos sociais', status: 'ok', nota: 'Programa de compensação social vigente' },
      { label: 'Risco climático', status: 'ok', nota: 'Sem exposição relevante' },
      { label: 'Crédito', status: 'ok', nota: 'Fluxo de caixa da 1ª fase suporta nova dívida' },
      { label: 'Condicionantes', status: 'ok', nota: 'Nenhuma pendente' },
    ],
    condicionantes: [],
    parecer: 'Operação de baixo risco — expansão de ativo já em operação com desempenho comprovado (saúde do ativo 87). Recomenda-se aprovação direta.',
    decisaoRecomendada: 'aprovar',
  },
  {
    id: 'CTR-2026-0039', operacao: 'Sistema Adutor Chapada Norte', programa: 'Programa de Segurança Hídrica do Semiárido',
    proponente: 'Governo do Estado da Bahia', funding: 'BID', valor: 340_000_000,
    etapa: 'Análise ambiental', alcada: 'Comitê Regional', prazoDias: 21, criticidade: 'atencao', elegibilidadePct: 68,
    sections: [
      { label: 'Dados da operação', status: 'ok', nota: 'Completo' },
      { label: 'Proponente', status: 'ok', nota: 'Capacidade institucional adequada' },
      { label: 'Programa', status: 'ok', nota: 'Aderente' },
      { label: 'Funding', status: 'atencao', nota: 'Concentração elevada da linha BID nesta UF' },
      { label: 'Garantias', status: 'ok', nota: 'Contragarantia estadual em análise' },
      { label: 'Engenharia', status: 'atencao', nota: 'Traçado alternativo ainda em avaliação no Nexo Estrutura' },
      { label: 'Território', status: 'atencao', nota: 'Sobreposição parcial com área de proteção ambiental' },
      { label: 'Meio ambiente', status: 'critico', nota: 'Estudo de impacto ambiental incompleto' },
      { label: 'Aspectos sociais', status: 'ok', nota: 'Consulta pública realizada' },
      { label: 'Risco climático', status: 'ok', nota: 'Risco de seca favorece o projeto' },
      { label: 'Crédito', status: 'ok', nota: 'Capacidade de pagamento do estado suficiente' },
      { label: 'Condicionantes', status: 'critico', nota: '3 condicionantes ambientais críticas em aberto' },
    ],
    condicionantes: ['Estudo de impacto ambiental completo', 'Definição do traçado final', 'Anuência do órgão de proteção ambiental'],
    parecer: 'Elegibilidade parcial (68%). Estudo de impacto ambiental incompleto impede avanço nesta etapa — recomenda-se diligência antes de nova submissão.',
    decisaoRecomendada: 'diligenciar',
  },
];
