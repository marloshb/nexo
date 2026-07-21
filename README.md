# CAIXA Nexo — mockup funcional (Versão 1)

Mockup interativo de alta fidelidade da plataforma CAIXA Nexo, construído em React + TypeScript + Vite + Tailwind + shadcn/ui — o mesmo stack usado no GeoComex Integrity.

## Rodar localmente

```bash
pnpm install
pnpm dev       # ambiente de desenvolvimento
pnpm build     # build de produção (dist/)
```

## O que está implementado (Versão 1 — mockup funcional essencial, seção 31 da especificação)

- **Nexo Hub** — portal corporativo com carteira consolidada, indicadores pessoais e mapa nacional
- **Nexo Control** — cockpit executivo, sala de situação e simulador de alocação
- **Nexo Entrega** — cronograma, Medição nº 6 do caso Vale Verde e workflow de decisão de desembolso
- **Nexo Evidência** — caixa de entrada de evidências, visualizador em 4 áreas e rastreador da vistoria OV-2026-0871
- **Ativo 360** — passaporte completo do ativo, com as 14 abas da especificação
- **Nexo Agents** — os 12 agentes de IA da seção 20, com timeline de execução detalhada
- **Nexo Ativos** — portfólio nacional (tabela + mapa)
- **Nexo Capital, Carteira, Estrutura, Contrata e Impacto** — módulos funcionais com fluxos, agentes, relatórios e integrações
- **Nexo Data** — catálogo, integrações, qualidade e governança
- **"Perguntar ao Nexo"** — assistente funcional híbrido: motor local para GitHub Pages e endpoint seguro opcional para IA generativa
- Todos os dados são sintéticos — ver `src/data/mockData.ts`, `src/data/navConfig.ts` e `src/data/brazilMap.ts`

## Mapa: da versão sintética para o ArcGIS Maps SDK 5.1 real

O mapa atual (`src/components/shared/BrazilMap.tsx`) é um SVG próprio, gerado a partir dos limites reais das 27 UFs (processados uma única vez em `mapdata/`), com uma projeção equirretangular simples embutida em `src/data/brazilMap.ts`. Essa escolha evita depender de rede/API key dentro do ambiente de artifact do Claude, mas o componente foi isolado exatamente para ser substituído.

Para a integração de produção sugerida pela especificação (seção 24):

```bash
pnpm add @arcgis/core
```

```ts
// .env.local
VITE_ARCGIS_API_KEY=xxxxxxxxxxxxxxxxxxxx   // API key com privilégios mínimos, URLs de referência restritas
```

```javascript
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";
import esriConfig from "@arcgis/core/config.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;

const worldCover = new ImageryTileLayer({
  portalItem: { id: "7bec35d76dd54ea584f98d286571eb84" }, // ESA WorldCover 2021
  opacity: 0.55,
});

const map = new Map({ basemap: "arcgis/navigation", layers: [worldCover] });
const view = new MapView({ container: "map", map, center: [-52, -14], zoom: 4 });
```

Mantenha um fallback visual (o `BrazilMap.tsx` atual) para demonstrações sem chave configurada, como a própria especificação recomenda.

## Empacotar como artifact único (.html)

```bash
bash scripts/bundle-artifact.sh   # do skill web-artifacts-builder — gera bundle.html autocontido
```

## O que foi adicionado na Versão 2

- **Nexo Capital** — painel de funding, passaporte do capital por fonte, programas/envelopes, covenants e fluxo completo de cadastro de nova fonte
- **Nexo Carteira** — radar territorial, oportunidades, priorização multicritério, funil de originação e comparador
- **Nexo Estrutura** — comparação de 3 alternativas (UBS Digital Norte), radar comparativo, modelo financeiro, sensibilidade/vida útil e resumo executivo gerado por IA (chamada real à API)
- **Nexo Contrata** — fila de análises, dossiê com as 14 seções da especificação, matriz de risco e workflow de decisão do comitê (8 tipos de decisão)
- **Nexo Impacto** — indicadores, cadeia de resultados, beneficiários, mapa de impacto e report builder
- **Nexo Data** — matriz de integrações detalhada (12 conectores) com drawer de detalhe por conector, catálogo e qualidade
- **Comissionamento** — fluxo completo de 10 etapas + checklist do Residencial Horizonte Azul, dentro do Nexo Ativos

## Próximos passos (Versão 3, seção 31) — implementada

- **Sensores e telemetria** — `src/components/shared/Sparkline.tsx` simula leituras ao vivo (StreamLayer-style) para vibração, vazão, pressão e temperatura, atualizando a cada ~2,4s
- **Manutenção preditiva** — previsão de falha por componente (30/90 dias), ordens de serviço e recomendações, no Nexo Ativos → aba Manutenção
- **Modelos 3D** — `src/components/shared/WindComplexScene.tsx`: cena isométrica em SVG do Complexo Eólico Costa Branca (substitui SceneLayer nesta versão do mockup; ver nota sobre ArcGIS acima)
- **Mapa em tempo real (StreamLayer-style)** — `src/components/shared/TrechoMap.tsx`: marcador da equipe de vistoria se desloca entre os trechos T-14/T-17/T-22 conforme a simulação avança (Nexo Evidência)
- **Resiliência climática e reinvestimento** — exposição a risco por ativo e previsão de necessidade de reinvestimento com vida útil remanescente
- **Índice de saúde completo** — as 10 dimensões da especificação (não apenas 5) para os ativos em operação, no Ativo 360 e no Nexo Ativos

Com isso, as três versões do roteiro da seção 31 estão implementadas nesta mesma base de código.

## Publicar corretamente no GitHub Pages

Este projeto é uma aplicação React/Vite. Não publique a raiz do repositório diretamente: o `index.html` de desenvolvimento referencia `/src/main.tsx`, que precisa ser compilado pelo Vite.

O projeto já contém o workflow `.github/workflows/deploy-pages.yml`, que:

1. instala as dependências;
2. executa `pnpm build`;
3. publica somente a pasta compilada `dist/`.

No GitHub:

1. envie todos os arquivos para a branch `main`, incluindo a pasta `.github`;
2. abra **Settings → Pages**;
3. em **Build and deployment → Source**, escolha **GitHub Actions**;
4. abra a aba **Actions** e confirme que o workflow **Deploy CAIXA Nexo to GitHub Pages** terminou com sucesso;
5. acesse a URL informada pelo job de deploy.

A configuração `base: "./"` em `vite.config.ts` evita caminhos quebrados quando o site é publicado em uma URL de projeto, como `https://usuario.github.io/nome-do-repositorio/`.

### Observação sobre as funções de IA

O **Perguntar ao Nexo funciona no GitHub Pages sem backend**, utilizando o motor local fundamentado nos dados sintéticos da plataforma. Para respostas generativas abertas, configure `VITE_NEXO_AI_ENDPOINT` com uma API intermediária protegida. A chave do provedor permanece no servidor; se o endpoint falhar, o painel retorna automaticamente ao modo local.


## Nexo Control — implementação ampliada

O módulo **Nexo Control** passou a ter navegação funcional em todas as opções do menu lateral:

- Visão geral;
- Sala de situação;
- Mapa;
- Agenda crítica;
- Simulador;
- Analytics;
- Agentes;
- Relatórios;
- Integrações;
- Administração.

Foram incluídos dados sintéticos coerentes, vínculos com os demais produtos Nexo, workflows, decisões com SLA, simulações, relatórios, sincronizações demonstrativas e um ciclo de agentes ao vivo. As decisões críticas continuam exigindo gate humano.

## Nexo Capital — implementação funcional

O módulo Nexo Capital foi ampliado para cobrir todas as entradas do menu lateral:

- Visão geral corporativa de funding, utilização, saldo, custo e covenants;
- Fontes de capital com busca, filtros, Passaporte do Capital e cadastro multiagente;
- Programas e envelopes com simulador de alocação e submissão ao comitê;
- Covenants com workflow assistido, evidências e gate humano;
- Mapa territorial da aplicação do capital e conexão com o Ativo 360;
- Analytics de liquidez, concentração, risco e previsão de desembolso;
- Central de agentes com execução live e eventos em tempo real;
- Biblioteca e geração dinâmica de relatórios;
- Monitoramento e sincronização das integrações;
- Administração de regras, taxonomias, perfis e alçadas.

Todos os dados e identificadores deste módulo são sintéticos e destinados exclusivamente à demonstração funcional.

## Nexo Carteira — implementação funcional ampliada

O módulo **Nexo Carteira** passou a cobrir todas as opções do menu lateral com navegação funcional e integrações contextuais:

- Visão geral com funil, demanda por setor, mapa, ranking e agentes críticos;
- Radar territorial com sinais, contexto geográfico e conversão de sinal em oportunidade;
- Oportunidades com filtros, cadastro, ficha completa, enriquecimento e arquivamento;
- Priorização multicritério com pesos, cenários, ranking dinâmico e gate humano;
- Mapa integrado com filtros, camadas temáticas e vínculos com ativos e programas;
- Analytics do funil, maturidade, demanda, duplicidades e aderência ao funding;
- Central de agentes com execução ao vivo, progresso, confiança, recomendações e eventos;
- Biblioteca e geração dinâmica de relatórios e pacotes de decisão;
- Monitoramento e sincronização das integrações externas e internas;
- Administração de regras, critérios, perfis e alçadas.

A simulação ao vivo orquestra os agentes de Radar Territorial, Geocodificação, Duplicidades, Enriquecimento, Priorização e Despachos. Aprovações, arquivamentos e encaminhamentos materiais permanecem sujeitos a decisão humana. Todos os registros são sintéticos e destinados exclusivamente à demonstração funcional.

## Nexo Estrutura — implementação funcional ampliada

O módulo **Nexo Estrutura** foi implementado integralmente, preservando os módulos Nexo Control, Capital e Carteira e suas integrações.

- Visão geral com casos, alternativas, linha de estruturação, decisões e eventos ao vivo;
- Alternativas técnicas com comparador, dossiê detalhado e criação de novo cenário;
- Modelo financeiro com premissas editáveis, Capex, Opex, funding mix, fluxo e bancabilidade;
- Cenários com sensibilidade, vida útil, riscos e simulação dinâmica;
- Mapa da carteira com cobertura, dependências e contexto territorial;
- Analytics de tempo, precisão, retrabalho, maturidade e valor otimizado;
- Agentes de orquestração, alternativas, finanças, território, riscos e despacho;
- Relatórios gerados dinamicamente e pacote estruturado de decisão;
- Administração de regras, perfis, alçadas, integrações e governança de IA.

O ciclo ao vivo simula coleta de dados, comparação de soluções, otimização territorial, recálculo financeiro, análise de dependências e preparação da baseline. A homologação e o encaminhamento ao Nexo Contrata permanecem sujeitos a gate humano. Todos os dados são sintéticos.


## Nexo Contrata — implementação funcional ampliada

O módulo **Nexo Contrata** foi implementado integralmente e integrado aos produtos Nexo Control, Capital, Carteira, Estrutura, Entrega, Evidência e Ativo 360.

- Visão geral com indicadores, funil, agenda decisória, riscos, integrações e agentes críticos;
- Fila de análises com busca, filtros, SLA, elegibilidade, risco, documentos e dossiê completo;
- Matriz integrada de riscos com exposição, mitigação, responsáveis e agentes;
- Comitê com pauta, quórum, parecer, votos, fundamentação, gate humano e ata simulada;
- Workflows em kanban com triagem automática, análise, diligência, decisão e formalização;
- Analytics de aprovação, tempo, retrabalho, gargalos e insights explicáveis;
- Central de agentes com execução ao vivo, progresso, fontes, confiança e recomendações;
- Relatórios dinâmicos, pacote de comitê, baseline e exportação CSV;
- Administração de regras, alçadas, guardrails, integrações e governança de IA.

O ciclo ao vivo simula elegibilidade, análise documental, risco integrado, diligências, preparação de decisão e geração da baseline contratual. Aprovação, reprovação, suspensão, contratação e exceções permanecem condicionadas a decisão humana. Todos os dados e identificadores do módulo são sintéticos.

## Nexo Entrega — implementação funcional

O módulo Nexo Entrega inclui visão executiva, cronograma, mapa operacional, fila de medições, desembolsos, workflows, analytics, agentes, relatórios e integrações. O fluxo sintético principal conecta medição, validação automática, inconsistência geoespacial, vistoria, gate humano e liquidação financeira.

Principais arquivos:

- `src/components/views/EntregaView.tsx`
- `src/data/entregaData.ts`
- `src/data/navConfig.ts`
- `src/App.tsx`

Todos os projetos, contratos, valores, pessoas, eventos e decisões são dados sintéticos de demonstração.

## Nexo Evidência — implementação funcional

O módulo **Nexo Evidência** foi implementado integralmente e integrado aos produtos Nexo Entrega, Contrata, Ativos, Impacto, Data e Ativo 360.

- Visão geral com carteira de evidências, confiança, exceções, valor condicionado e operação ao vivo;
- Visualizador com caixa de entrada, filtros, pré-visualização, metadados, validações, decisão e gate humano;
- Vistorias com ordens, prioridade, SLA, rota, equipe, checklist offline e atualização de status;
- Cadeia de custódia com hash, assinatura, versões, acessos, retenção e selagem de pacote;
- Mapa nacional com ativos, evidências, ordens, anomalias, camadas operacionais e Living Atlas simulado;
- Central de agentes para ingestão, validação geoespacial, integridade, vistoria, custódia e orquestração;
- Relatórios auditáveis, pacotes de medição, vistorias, integridade e evidências de resultado;
- Simulação em tempo real conectando coleta de campo, validação, workflow, custódia e decisão de desembolso.

O ciclo live preserva o gate humano para validação, rejeição, liberação, suspensão e aceite. Todos os ativos, pessoas, valores, evidências e eventos são sintéticos e destinados exclusivamente à demonstração funcional.

Principais arquivos:

- `src/components/views/EvidenciaView.tsx`
- `src/data/evidenciaData.ts`
- `src/data/navConfig.ts`
- `src/App.tsx`

## Nexo Ativos — implementação funcional

O módulo Nexo Ativos foi ampliado com navegação funcional por seção, portfólio, mapa operacional, comissionamento, saúde multidimensional, telemetria sintética, manutenção preditiva, analytics, agentes ao vivo, relatórios e integrações. As decisões críticas permanecem sujeitas a gate humano e todos os dados operacionais são sintéticos para demonstração.

## Nexo Impacto — implementação funcional ampliada

O módulo **Nexo Impacto** foi implementado integralmente e conectado ao ciclo Capital–Ativo–Resultado:

- Visão geral com capital rastreado, beneficiários comprovados, índice de valor, confiança, emissões evitadas e linha de resultados;
- Indicadores com catálogo, busca, filtros, fórmulas, baseline, metas, frameworks, evidências, materialidade e validação assistida;
- Beneficiários com segmentação, deduplicação, cobertura territorial, comparação previsto × comprovado e reconciliação cadastral;
- Mapa corporativo de impacto com ativos, áreas de influência, vulnerabilidade, riscos, camadas Living Atlas e acesso ao Ativo 360;
- Relatórios de valor, alocação, Green Bond, financiadores e painel público, com geração progressiva e gate humano;
- Administração de frameworks, taxonomias, regras de confiança, atribuição, dupla contagem, integrações e trilha de auditoria;
- Agentes de indicadores, beneficiários, atribuição, evidências e relatórios, com execução dinâmica e eventos ao vivo.

O ciclo ao vivo simula validação metodológica, conciliação de beneficiários, ligação de evidências, cálculo de atribuição e preparação da publicação. Indicadores divergentes permanecem restritos até decisão humana. Todos os dados são sintéticos.

## Perguntar ao Nexo

O assistente funciona imediatamente no GitHub Pages por meio de um motor local de demonstração, fundamentado nos dados sintéticos da plataforma. Ele reconhece módulos, ativos, riscos, agentes e decisões, exibe fontes consultadas e simula o processamento em tempo real.

Para conectar uma IA generativa real, configure apenas a URL de um endpoint seguro:

```bash
VITE_NEXO_AI_ENDPOINT=https://seu-backend.exemplo.com/api/nexo-ai
```

O frontend envia `question`, `messages` e `context`. O endpoint deve devolver:

```json
{
  "answer": "Resposta em português",
  "sources": ["Nexo Entrega", "Ativo 360"],
  "confidence": 0.93
}
```

A chave do provedor de IA deve permanecer exclusivamente no backend. Nunca use `VITE_ANTHROPIC_API_KEY`, `VITE_OPENAI_API_KEY` ou qualquer segredo no GitHub Pages, pois variáveis Vite são incorporadas ao JavaScript público.

## Nexo Agents — implementação funcional ampliada

O módulo **Nexo Agents** foi implementado como centro corporativo de orquestração e governança dos agentes da plataforma:

- Cockpit com KPIs, execuções, gates humanos, casos críticos, throughput, volume por módulo e integrações;
- Fila operacional com busca, filtros, prioridades, progresso, reprocessamento, cancelamento e detalhe da execução;
- Casos orquestrados com cadeia de agentes, resultados, decisões, exceções e acesso ao módulo responsável e Ativo 360;
- Central de exceções com severidade, impacto, SLA, responsáveis, resolução e escalonamento;
- Console de logs estruturados com streaming sintético, correlação, níveis, eventos, latência e exportação CSV;
- Matriz de alçadas com autonomia, limites financeiros, confiança mínima, gates, dupla aprovação e simulador;
- Registro corporativo de agentes com proprietário, risco, SLA, fontes, entregas, autonomia e gates humanos;
- Ciclo ao vivo conectando vistoria, validação geoespacial, recálculo de desembolso, despacho e decisão humana.

Os agentes recomendam, preparam e orquestram. Liberações financeiras, reprovações, suspensões, sanções, alterações contratuais e publicações externas permanecem condicionadas às alçadas humanas configuradas. Todos os casos, valores, logs e execuções são sintéticos.

Principais arquivos:

- `src/components/views/AgentsView.tsx`
- `src/data/agentsData.ts`
- `src/data/navConfig.ts`
- `src/App.tsx`

## Nexo Data — módulo funcional

O Nexo Data foi ampliado como camada corporativa de dados e governança da plataforma, com:

- visão geral de saúde dos domínios e produtos de dados;
- catálogo e marketplace de produtos certificados;
- contratos de dados, owners, stewards, SLAs e consumidores;
- linhagem da fonte até decisões, agentes e relatórios;
- qualidade, profiling, incidentes, regras e resolução assistida;
- integrações, pipelines, observabilidade e sincronização simulada;
- identidade persistente, golden records, segurança, privacidade e políticas;
- agentes de qualidade, resolução de entidades, linhagem e observabilidade;
- ciclo ao vivo com eventos dinâmicos e gates humanos.

Todos os dados do módulo são sintéticos para demonstração.

## Modo Apresentação — Wizard do ciclo de vida

O botão **Apresentar ciclo**, na barra superior, abre um roteiro guiado de 12 cenas usando o caso sintético Vale Verde. O wizard navega automaticamente entre Control, Capital, Carteira, Estrutura, Contrata, Entrega, Evidência, Ativos, Impacto, Agents, Data e Ativo 360. Inclui notas do apresentador, decisões-chave, agentes em destaque, autoplay, cronômetro e execução ao vivo nas cenas operacionais.


## Base embarcada ampliada

A aplicação inclui uma base local extensa em `src/data/realisticPortfolioData.ts`. Os registros são sintéticos e não representam operações reais da CAIXA, mas foram calibrados com referências públicas oficiais de população municipal, modalidades de funding e tipologias de infraestrutura. Não existe dependência de banco de dados ou backend.

Volumes adicionais: 120 ativos, 32 fontes de capital, 220 oportunidades, 60 casos de estruturação, 180 alternativas, 270 medições, 800 evidências, 480 indicadores, 360 execuções de agentes e 1.200 logs.

Referências conceituais: IBGE Cidades e Estados; FINISA/CAIXA; Programas de Aplicação do FGTS; Transferegov; Obrasgov/CIPI.

## Camadas geoespaciais ampliadas

Os mapas compartilhados agora oferecem dois modos: a visualização sintética original e uma visão ArcGIS real, acessível pelo botão **Abrir ArcGIS**. A visão ArcGIS preserva os dados embarcados e adiciona um catálogo de camadas públicas com carregamento isolado e fallback.

Camadas públicas configuradas:

- ESA WorldCover 2021 — 10 m;
- Sentinel-2 Land Use/Land Cover Time Series;
- WorldPop Population Density — 100 m;
- Populated Footprint 2020;
- Gridded Population of the World v4;
- Cities of the World;
- World Population Footprint;
- cenário global de cobertura do solo 2050.

Camadas operacionais locais, geradas a partir dos arquivos embarcados:

- ativos financiados e acompanhados;
- hotspots de evidências e inconsistências;
- equipes e ordens de vistoria;
- concentrações de beneficiários;
- alertas climáticos associados aos ativos;
- dependências entre ativos e redes.

As camadas públicas são carregadas diretamente do ArcGIS Online por `portalItem`. Uma falha externa não interrompe o mapa nem as camadas locais. Para uso de basemaps e serviços que exijam autenticação, configure uma API key restrita por domínio:

```env
VITE_ARCGIS_API_KEY=sua_chave_restrita
```

## Correção de tela branca após integração ArcGIS

O ArcGIS Maps SDK é carregado sob demanda somente quando o usuário abre a visão ArcGIS. Assim, indisponibilidade do CDN, CSP corporativa, bloqueadores ou falha de uma camada pública não impedem a inicialização da home. A aplicação também possui uma barreira global de erro para exibir uma mensagem diagnóstica em vez de uma página vazia.

## Painel de contexto funcional

O painel lateral preserva a estrutura visual original e agora oferece ações operacionais locais: abertura de recomendações no Nexo Agents, detalhamento de riscos, navegação para o Ativo 360, pré-visualização e exportação de documentos, contatos dos responsáveis, conclusão/reabertura de marcos, criação simulada de vistoria, geração de relatório, emissão de despacho e exportação JSON do contexto. Todas as interações funcionam sem backend e publicam eventos no barramento local da aplicação.

## Correção ArcGIS MapView — appendChild

O `MapView` não inclui mais `attribution` entre os componentes do `DefaultUI` no ArcGIS Maps SDK 5.x. A configuração anterior tentava adicioná-lo manualmente em `ui.components`, provocando `Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'`. O mapa agora usa apenas `zoom`, mantém a atribuição nativa da View, captura um `HTMLDivElement` estável antes da inicialização e destrói corretamente a View em remontagens do React.
