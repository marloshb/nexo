import { ASSETS } from '@/data/mockData';
import { NAV_PRODUCTS, type ProductKey } from '@/data/navConfig';

export interface NexoChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface NexoAssistantContext {
  product: ProductKey;
  activeAssetId?: string | null;
}

export interface NexoAssistantReply {
  answer: string;
  sources: string[];
  confidence: number;
  mode: 'local' | 'remote' | 'fallback';
}

interface RemoteReply {
  answer?: string;
  text?: string;
  sources?: string[];
  confidence?: number;
}

const PRODUCT_CONTEXT: Partial<Record<ProductKey, {
  name: string;
  purpose: string;
  decisions: string;
  agents: string[];
  highlights: string[];
}>> = {
  hub: {
    name: 'Nexo Hub',
    purpose: 'porta única para navegar pelos produtos, alertas, tarefas, ativos e eventos críticos',
    decisions: 'direcionar o usuário ao produto e ao ativo corretos sem perder o contexto',
    agents: ['Orquestrador do Ciclo de Vida'],
    highlights: ['visão corporativa integrada', 'pesquisa global', 'feed de eventos'],
  },
  control: {
    name: 'Nexo Control',
    purpose: 'centro de comando executivo e operacional da carteira',
    decisions: 'priorização, escalonamento, previsão de desembolso e tratamento de exceções',
    agents: ['Orquestrador', 'Agente de Risco', 'Agente de Desembolso'],
    highlights: ['sala de situação', 'agenda crítica', 'simulador de carteira'],
  },
  capital: {
    name: 'Nexo Capital',
    purpose: 'gerenciar funding, envelopes, custos, covenants e alocação de recursos',
    decisions: 'onde alocar capital, como preservar condicionantes e quando reenquadrar operações',
    agents: ['Funding e Covenants', 'Alocação', 'Liquidez e Desembolso'],
    highlights: ['Passaporte do Capital', 'programas e envelopes', 'covenants'],
  },
  carteira: {
    name: 'Nexo Carteira',
    purpose: 'detectar oportunidades, qualificar demandas e priorizar projetos',
    decisions: 'quais oportunidades devem seguir para estruturação e em qual ordem',
    agents: ['Radar Territorial', 'Duplicidades', 'Priorização Multicritério'],
    highlights: ['radar territorial', 'funil de oportunidades', 'ranking multicritério'],
  },
  estrutura: {
    name: 'Nexo Estrutura',
    purpose: 'comparar alternativas técnicas, financeiras, territoriais e institucionais',
    decisions: 'qual alternativa deve compor a baseline enviada à contratação',
    agents: ['Alternativas Técnicas', 'Financeiro e Funding', 'Riscos e Dependências'],
    highlights: ['modelo financeiro', 'cenários', 'gêmeo de decisão'],
  },
  contrata: {
    name: 'Nexo Contrata',
    purpose: 'consolidar elegibilidade, riscos, pareceres, comitê e baseline contratual',
    decisions: 'aprovar, aprovar com condicionantes, diligenciar, reenquadrar ou reprovar',
    agents: ['Elegibilidade', 'Documental e Inconsistências', 'Risco Integrado'],
    highlights: ['fila de análises', 'matriz de riscos', 'comitê e workflows'],
  },
  entrega: {
    name: 'Nexo Entrega',
    purpose: 'acompanhar cronograma, medições, execução física, desembolsos e gargalos',
    decisions: 'liberar, reter, diligenciar, vistoriar, reprogramar ou suspender',
    agents: ['Medição e Desembolso', 'Inconsistências e Fraude', 'Vistoria'],
    highlights: ['curva S', 'fila de medições', 'workflow de desembolso'],
  },
  evidencia: {
    name: 'Nexo Evidência',
    purpose: 'validar documentos, fotos, imagens, geometrias e cadeia de custódia',
    decisions: 'aceitar evidência, solicitar vistoria, rejeitar ou elevar para análise humana',
    agents: ['Ingestão e Metadados', 'Validação Geoespacial', 'Integridade e Fraude'],
    highlights: ['visualizador', 'vistorias', 'cadeia de custódia'],
  },
  ativos: {
    name: 'Nexo Ativos',
    purpose: 'acompanhar comissionamento, operação, saúde, manutenção e reinvestimento',
    decisions: 'emitir prontidão, realizar manutenção, mitigar risco ou programar renovação',
    agents: ['Comissionamento', 'Saúde do Ativo', 'Manutenção Preditiva'],
    highlights: ['portfólio de ativos', 'índice de saúde', 'manutenção e reinvestimento'],
  },
  impacto: {
    name: 'Nexo Impacto',
    purpose: 'conectar capital, ativos, beneficiários, resultados, MRV e prestação de contas',
    decisions: 'validar indicadores, reconhecer resultados e publicar relatórios auditáveis',
    agents: ['Indicadores e Fórmulas', 'Beneficiários', 'Atribuição e Adicionalidade'],
    highlights: ['cadeia de resultados', 'indicadores', 'beneficiários e relatórios'],
  },
  agents: {
    name: 'Nexo Agents',
    purpose: 'governar agentes, automações, exceções, logs e gates humanos',
    decisions: 'quais ações podem ser automatizadas e quais exigem alçada humana',
    agents: ['Orquestrador e agentes especialistas'],
    highlights: ['cockpit de agentes', 'fila de execuções', 'logs e alçadas'],
  },
  data: {
    name: 'Nexo Data',
    purpose: 'governar catálogo, integração, qualidade, linhagem e resolução de entidades',
    decisions: 'qual fonte é confiável e como os dados podem sustentar decisões e evidências',
    agents: ['Qualidade de Dados', 'Resolução de Entidades'],
    highlights: ['catálogo', 'linhagem', 'monitoramento de integrações'],
  },
  ativo360: {
    name: 'Ativo 360',
    purpose: 'reunir toda a trajetória Capital–Ativo–Resultado de um ativo específico',
    decisions: 'entender o estado atual, riscos, evidências, pendências e próxima ação',
    agents: ['Agentes associados ao estágio atual do ativo'],
    highlights: ['linha do tempo', 'capital', 'execução', 'operação e impacto'],
  },
};

const GLOBAL_NUMBERS = {
  allocated: 'R$ 6,8 bi',
  contracted: 'R$ 5,1 bi',
  disbursed: 'R$ 3,2 bi',
  physical: '58%',
  assets: ASSETS.length,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function includesAny(query: string, terms: string[]) {
  return terms.some((term) => query.includes(normalize(term)));
}

function formatBRL(value: number) {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function formatPct(value: number) {
  return `${Math.round(value * 100)}%`;
}

function findAsset(query: string, activeAssetId?: string | null) {
  const normalized = normalize(query);
  const byQuery = ASSETS.find((asset) => {
    const fields = [asset.name, asset.id, asset.city, asset.uf, asset.sector].map(normalize);
    const nameTokens = normalize(asset.name).split(/\s+/).filter((token) => token.length >= 4);
    const tokenMatch = nameTokens.length > 0 && nameTokens.every((token) => normalized.includes(token));
    return tokenMatch || fields.some((field) => normalized.includes(field) || field.includes(normalized));
  });
  return byQuery ?? ASSETS.find((asset) => asset.id === activeAssetId) ?? null;
}

function assetAnswer(asset: (typeof ASSETS)[number]): NexoAssistantReply {
  const health = asset.healthIndex == null ? 'ainda sem índice operacional' : `${asset.healthIndex}/100`;
  const verified = asset.beneficiariesVerified > 0
    ? `${asset.beneficiariesVerified.toLocaleString('pt-BR')} beneficiários comprovados`
    : 'beneficiários ainda não comprovados';
  return {
    answer: `**${asset.name}** está em **${asset.stage}**, com status **${asset.status}**.\n\n• Valor: ${formatBRL(asset.value)}\n• Execução física: ${formatPct(asset.physicalProgress)}\n• Desembolso: ${formatPct(asset.disbursed)}\n• Saúde: ${health}\n• Resultado: ${verified}\n\n${asset.summary}\n\nPróxima ação recomendada: tratar a pendência dominante antes de avançar para a etapa seguinte do ciclo de vida.`,
    sources: ['Ativo 360', asset.program, asset.fundingSource],
    confidence: 0.97,
    mode: 'local',
  };
}

function currentModuleAnswer(product: ProductKey): NexoAssistantReply {
  const module = PRODUCT_CONTEXT[product] ?? PRODUCT_CONTEXT.hub!;
  return {
    answer: `Você está no **${module.name}**. Este produto serve para ${module.purpose}.\n\nA decisão central é: ${module.decisions}.\n\nPrincipais capacidades:\n• ${module.highlights.join('\n• ')}\n\nAgentes mais relevantes:\n• ${module.agents.join('\n• ')}`,
    sources: [module.name, 'Arquitetura funcional CAIXA Nexo'],
    confidence: 0.96,
    mode: 'local',
  };
}

function localAnswer(question: string, context: NexoAssistantContext): NexoAssistantReply {
  const q = normalize(question);
  const asset = findAsset(question, context.product === 'ativo360' ? context.activeAssetId : null);

  if (includesAny(q, ['ola', 'bom dia', 'boa tarde', 'boa noite', 'oi', 'ajuda', 'o que voce faz'])) {
    return {
      answer: 'Posso analisar a carteira, explicar um módulo, resumir um ativo, indicar riscos, agentes envolvidos e a próxima decisão recomendada. Exemplos: “quais são as prioridades?”, “resuma o Vale Verde” ou “o que faz o Nexo Impacto?”.',
      sources: ['Contexto corporativo CAIXA Nexo'],
      confidence: 0.99,
      mode: 'local',
    };
  }

  if (includesAny(q, ['este modulo', 'modulo atual', 'tela atual', 'onde estou', 'o que faz o nexo'])) {
    return currentModuleAnswer(context.product);
  }

  if (asset && (includesAny(q, ['resuma', 'situacao', 'status', 'risco', 'ativo', 'projeto', 'obra', 'saude', 'desembolso', 'execucao']) || q.length < 35)) {
    return assetAnswer(asset);
  }

  if (includesAny(q, ['resuma a carteira', 'carteira nacional', 'visao geral', 'panorama', 'portfolio'])) {
    const critical = ASSETS.filter((a) => a.status === 'critico');
    const operating = ASSETS.filter((a) => a.stage === 'Operação');
    return {
      answer: `A carteira sintética possui **${GLOBAL_NUMBERS.assets} ativos**, com ${GLOBAL_NUMBERS.allocated} alocados, ${GLOBAL_NUMBERS.contracted} contratados e ${GLOBAL_NUMBERS.disbursed} desembolsados. A execução física média é ${GLOBAL_NUMBERS.physical}.\n\nPrioridades:\n• ${critical.map((a) => a.name).join(' e ')} estão críticos.\n• ${operating.length} ativos estão em operação, com destaque para Adutora Sertão Vivo e Complexo Eólico Costa Branca.\n• Horizonte Azul exige resolver acesso viário antes da prontidão operacional.`,
      sources: ['Nexo Control', 'Nexo Ativos', 'Nexo Entrega'],
      confidence: 0.98,
      mode: 'local',
    };
  }

  if (includesAny(q, ['prioridade', 'o que fazer agora', 'proxima acao', 'decisao urgente', 'agenda critica'])) {
    return {
      answer: 'As três ações prioritárias são:\n\n1. **Vale Verde:** concluir a vistoria dos trechos T-14, T-17 e T-22 e decidir sobre a liberação parcial de R$ 15,7 milhões.\n2. **Rio Norte:** reprogramar os dois ativos expostos ao evento climático simulado.\n3. **Horizonte Azul:** concluir acesso viário e transporte antes de emitir prontidão operacional plena.\n\nTodas exigem gate humano após a recomendação dos agentes.',
      sources: ['Nexo Control', 'Nexo Entrega', 'Nexo Ativos'],
      confidence: 0.98,
      mode: 'local',
    };
  }

  if (includesAny(q, ['vale verde', 'medicao 6', 't-14', 't-17', 't-22', 'divergencia espacial'])) {
    return assetAnswer(ASSETS[0]);
  }

  if (includesAny(q, ['horizonte azul', 'residencial', '1240 unidades', 'acesso viario'])) {
    return assetAnswer(ASSETS[1]);
  }

  if (includesAny(q, ['rio norte', 'macrodrenagem', 'evento climatico', 'transbordamento'])) {
    return assetAnswer(ASSETS[2]);
  }

  if (includesAny(q, ['capital', 'funding', 'covenant', 'envelope', 'captacao', 'green bond'])) {
    return {
      answer: 'No **Nexo Capital**, o foco é preservar a rastreabilidade entre a fonte do recurso, suas condições e os ativos financiados. O fluxo é: cadastrar funding → validar elegibilidade → criar envelopes → simular alocação → aprovar → acompanhar utilização e covenants. Os agentes críticos são Funding e Covenants, Alocação e Liquidez/Desembolso.',
      sources: ['Nexo Capital', 'Passaporte do Capital'],
      confidence: 0.95,
      mode: 'local',
    };
  }

  if (includesAny(q, ['origem', 'oportunidade', 'radar territorial', 'priorizacao', 'carteira'])) {
    return {
      answer: 'O **Nexo Carteira** transforma sinais territoriais e demandas em oportunidades qualificadas. Ele georreferencia, procura duplicidades, enriquece com dados externos e aplica priorização multicritério. O produto final é um ranking homologado para encaminhamento ao Nexo Estrutura.',
      sources: ['Nexo Carteira', 'Radar Territorial'],
      confidence: 0.94,
      mode: 'local',
    };
  }

  if (includesAny(q, ['alternativa', 'modelo financeiro', 'cenario', 'estrutura', 'vpl', 'capex', 'opex'])) {
    return {
      answer: 'O **Nexo Estrutura** compara alternativas técnicas, financeiras, territoriais e institucionais. Ele calcula Capex, Opex, cobertura, riscos, funding e sensibilidade. A saída é uma baseline recomendada, com premissas auditáveis, encaminhada ao Nexo Contrata após homologação humana.',
      sources: ['Nexo Estrutura', 'Gêmeo de Decisão'],
      confidence: 0.95,
      mode: 'local',
    };
  }

  if (includesAny(q, ['elegibilidade', 'comite', 'contrata', 'parecer', 'condicionante', 'aprovar', 'reprovar'])) {
    return {
      answer: 'O **Nexo Contrata** consolida elegibilidade, documentos, engenharia, crédito, território e riscos socioambientais. Os agentes preparam checklists, pareceres e diligências; a decisão de aprovar, condicionar, reenquadrar ou reprovar é sempre humana e gera a baseline contratual.',
      sources: ['Nexo Contrata', 'Matriz de Risco', 'Comitê'],
      confidence: 0.96,
      mode: 'local',
    };
  }

  if (includesAny(q, ['medicao', 'desembolso', 'cronograma', 'entrega', 'obra', 'curva s'])) {
    return {
      answer: 'O **Nexo Entrega** cruza cronograma, medição, evidências, geometria, custos e condições precedentes. Para cada solicitação, calcula o percentual validado, o valor liberável e a necessidade de vistoria. A decisão final pode ser liberar, reter, diligenciar, reprogramar ou suspender.',
      sources: ['Nexo Entrega', 'Nexo Evidência', 'SINAPI'],
      confidence: 0.96,
      mode: 'local',
    };
  }

  if (includesAny(q, ['evidencia', 'vistoria', 'custodia', 'hash', 'foto', 'fraude', 'autenticidade'])) {
    return {
      answer: 'O **Nexo Evidência** recebe e valida documentos, fotos, vídeos, imagens, sensores e geometrias. Ele preserva hash, assinatura, localização e cadeia de custódia; detecta duplicidade ou divergência; e abre vistoria quando a confiança é insuficiente. A evidência validada retorna ao módulo que suporta a decisão.',
      sources: ['Nexo Evidência', 'Cadeia de Custódia', 'ArcGIS'],
      confidence: 0.97,
      mode: 'local',
    };
  }

  if (includesAny(q, ['saude do ativo', 'manutencao', 'comissionamento', 'operacao', 'falha', 'reinvestimento'])) {
    return {
      answer: 'O **Nexo Ativos** começa no comissionamento e acompanha disponibilidade, integridade, manutenção, resiliência e vida útil. O Complexo Eólico Costa Branca, por exemplo, tem saúde 87/100 e requer manutenção preditiva em três componentes críticos dentro de 45 dias.',
      sources: ['Nexo Ativos', 'Telemetria', 'Plano de Manutenção'],
      confidence: 0.96,
      mode: 'local',
    };
  }

  if (includesAny(q, ['impacto', 'mrv', 'indicador', 'beneficiario', 'resultado', 'emissao', 'prestacao de contas'])) {
    return {
      answer: 'O **Nexo Impacto** conecta insumo, atividade, produto, serviço, resultado e impacto. Ele valida fórmulas, evidências, beneficiários, atribuição e adicionalidade. Só publica indicadores que atendem aos limiares de confiança e revisão humana, preservando a rastreabilidade até o funding e o ativo.',
      sources: ['Nexo Impacto', 'Nexo Evidência', 'Frameworks de MRV'],
      confidence: 0.96,
      mode: 'local',
    };
  }

  if (includesAny(q, ['agente', 'agentes', 'ia', 'automacao', 'orquestrador'])) {
    return {
      answer: 'Os agentes analisam, recomendam e orquestram, mas não substituem decisões críticas. O Orquestrador distribui o caso; agentes especialistas verificam funding, elegibilidade, riscos, custos, evidências, medições, vistorias, saúde e impacto. Aprovação, desembolso, suspensão, alteração contratual e publicação exigem gate humano.',
      sources: ['Nexo Agents', 'Governança de IA'],
      confidence: 0.98,
      mode: 'local',
    };
  }

  if (includesAny(q, ['diferenca', 'compare', 'comparar']) && includesAny(q, ['capital', 'carteira', 'estrutura', 'contrata', 'entrega', 'evidencia', 'ativos', 'impacto'])) {
    return {
      answer: `A sequência dos produtos é:\n\n• **Capital:** de onde vem o recurso e quais condições carrega.\n• **Carteira:** quais oportunidades devem avançar.\n• **Estrutura:** qual alternativa é tecnicamente e financeiramente melhor.\n• **Contrata:** a operação pode ser aprovada e contratada?\n• **Entrega:** o que foi executado e quanto pode ser desembolsado.\n• **Evidência:** a comprovação é autêntica e suficiente?\n• **Ativos:** o ativo funciona e permanece saudável?\n• **Impacto:** qual resultado foi efetivamente produzido?`,
      sources: ['Arquitetura Capital–Ativo–Resultado'],
      confidence: 0.99,
      mode: 'local',
    };
  }

  const module = PRODUCT_CONTEXT[context.product] ?? PRODUCT_CONTEXT.hub!;
  return {
    answer: `Não encontrei uma correspondência exata nos dados sintéticos. No contexto atual do **${module.name}**, posso ajudar a analisar ${module.highlights.join(', ')}. Reformule incluindo o nome do ativo, agente, indicador ou decisão desejada.`,
    sources: [module.name, 'Base sintética CAIXA Nexo'],
    confidence: 0.72,
    mode: 'local',
  };
}

function remoteEndpoint() {
  return String(import.meta.env.VITE_NEXO_AI_ENDPOINT ?? '').trim();
}

export function hasSecureEndpoint() {
  return Boolean(remoteEndpoint());
}

async function requestRemote(
  question: string,
  history: NexoChatMessage[],
  context: NexoAssistantContext,
): Promise<NexoAssistantReply> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(remoteEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        messages: history.map(({ role, text }) => ({ role, content: text })),
        context: {
          product: context.product,
          productName: PRODUCT_CONTEXT[context.product]?.name,
          activeAssetId: context.activeAssetId ?? null,
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI endpoint returned ${response.status}`);
    const data = (await response.json()) as RemoteReply;
    const answer = String(data.answer ?? data.text ?? '').trim();
    if (!answer) throw new Error('AI endpoint returned an empty answer');
    return {
      answer,
      sources: Array.isArray(data.sources) ? data.sources.map(String).slice(0, 6) : ['Endpoint seguro Nexo AI'],
      confidence: typeof data.confidence === 'number' ? Math.max(0, Math.min(1, data.confidence)) : 0.9,
      mode: 'remote',
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function askNexo(
  question: string,
  history: NexoChatMessage[],
  context: NexoAssistantContext,
): Promise<NexoAssistantReply> {
  if (hasSecureEndpoint()) {
    try {
      return await requestRemote(question, history, context);
    } catch {
      const fallback = localAnswer(question, context);
      return { ...fallback, mode: 'fallback', sources: [...fallback.sources, 'Fallback local'] };
    }
  }
  await new Promise((resolve) => window.setTimeout(resolve, 650 + Math.random() * 450));
  return localAnswer(question, context);
}

export function suggestionsFor(product: ProductKey) {
  const common = ['Quais são as prioridades agora?', 'Resuma a carteira nacional em 3 pontos'];
  const byProduct: Partial<Record<ProductKey, string[]>> = {
    capital: ['Quais covenants exigem atenção?', 'Como o funding chega aos ativos?'],
    carteira: ['Quais oportunidades devem avançar?', 'Como funciona a priorização?'],
    estrutura: ['Qual alternativa deve ser escolhida?', 'Explique o modelo financeiro'],
    contrata: ['Quais riscos bloqueiam a contratação?', 'Como funciona o comitê?'],
    entrega: ['Por que o Vale Verde está crítico?', 'Quanto pode ser liberado na medição 6?'],
    evidencia: ['O que a vistoria do Vale Verde precisa comprovar?', 'Como funciona a cadeia de custódia?'],
    ativos: ['Quais ativos precisam de manutenção?', 'Por que Horizonte Azul não está pronto?'],
    impacto: ['Quais resultados estão comprovados?', 'Como os beneficiários são validados?'],
    control: ['Quais decisões são urgentes?', 'Mostre os ativos críticos'],
    agents: ['Quais decisões exigem gate humano?', 'O que faz o Orquestrador?'],
    data: ['Quais integrações sustentam as decisões?', 'Como funciona a linhagem?'],
    ativo360: ['Resuma este ativo', 'Qual é a próxima ação recomendada?'],
  };
  return [...(byProduct[product] ?? []), ...common].slice(0, 4);
}

export function productDisplayName(product: ProductKey) {
  return PRODUCT_CONTEXT[product]?.name
    ?? NAV_PRODUCTS.find((item) => item.key === product)?.name
    ?? 'CAIXA Nexo';
}
