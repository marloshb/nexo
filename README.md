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
- **Capital / Carteira / Estrutura / Contrata / Impacto / Data** — stubs estruturais navegáveis (profundidade completa é Versão 2)
- **"Perguntar ao Nexo"** — chamada real à API da Anthropic (Claude), fundamentada no contexto sintético da carteira
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

O GitHub Pages hospeda apenas arquivos estáticos. As chamadas atuais à API da Anthropic, feitas diretamente no navegador, não devem receber uma chave secreta no frontend. Para habilitar essas funções em produção, use uma API intermediária protegida, por exemplo uma função serverless, e mantenha a chave somente no servidor. Sem essa API, o restante do mockup funciona, mas os botões de geração por IA exibirão erro de conexão.


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
