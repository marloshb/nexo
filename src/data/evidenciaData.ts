import { REALISTIC_EVIDENCE_RECORDS, REALISTIC_INSPECTIONS, REALISTIC_CUSTODY_EVENTS } from '@/data/realisticPortfolioData';
import type { StatusKey } from '@/lib/tokens';

export type EvidenciaSection =
  | 'overview'
  | 'viewer'
  | 'inspections'
  | 'custody'
  | 'map'
  | 'agents'
  | 'reports';

export type EvidenceStatus = 'validada' | 'divergente' | 'revisao' | 'pendente' | 'rejeitada';
export type EvidenceType = 'Foto' | 'Vídeo' | 'Documento' | 'Geometria' | 'Imagem orbital' | 'Sensor' | 'BIM';

export interface EvidenceRecord {
  id: string;
  assetId: string;
  assetName: string;
  measurementId: string;
  contract: string;
  title: string;
  type: EvidenceType;
  sector: string;
  city: string;
  uf: string;
  capturedAt: string;
  receivedAt: string;
  source: string;
  operator: string;
  status: EvidenceStatus;
  confidence: number;
  geoMatch: number;
  metadataScore: number;
  duplicateScore: number;
  manipulationRisk: number;
  lat: number;
  lon: number;
  locationLabel: string;
  hash: string;
  signature: string;
  linkedItem: string;
  relatedValue: number;
  decision: string;
  tags: string[];
  anomaly?: string;
}

export const EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: 'EV-08841', assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', assetName: 'Sistema Integrado de Esgotamento Vale Verde', measurementId: 'MED-VALE-006', contract: 'CT-2025-SAN-0142',
    title: 'Vala aberta — rede coletora DN200', type: 'Foto', sector: 'Saneamento', city: 'São José dos Campos', uf: 'SP', capturedAt: '2026-07-20 18:54:12', receivedAt: '2026-07-20 19:42:06', source: 'Field Maps — GEREG Sudeste', operator: 'Paulo R. Menezes',
    status: 'validada', confidence: 0.96, geoMatch: 0.98, metadataScore: 0.97, duplicateScore: 0.99, manipulationRisk: 0.03, lat: -23.1710, lon: -45.9020, locationLabel: 'Trecho T-14',
    hash: 'SHA256:8e2b…4c91', signature: 'ICP-Brasil válida', linkedItem: 'Rede coletora DN200 · Item 4.2.1', relatedValue: 1_240_000, decision: 'Aceita para comprovação física do item', tags: ['campo', 'rede', 'DN200'],
  },
  {
    id: 'EV-08842', assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', assetName: 'Sistema Integrado de Esgotamento Vale Verde', measurementId: 'MED-VALE-006', contract: 'CT-2025-SAN-0142',
    title: 'Poço de visita concluído PV-42', type: 'Foto', sector: 'Saneamento', city: 'São José dos Campos', uf: 'SP', capturedAt: '2026-07-20 18:58:40', receivedAt: '2026-07-20 19:42:07', source: 'Field Maps — GEREG Sudeste', operator: 'Paulo R. Menezes',
    status: 'validada', confidence: 0.98, geoMatch: 0.99, metadataScore: 0.99, duplicateScore: 1, manipulationRisk: 0.01, lat: -23.1800, lon: -45.8950, locationLabel: 'Trecho T-17',
    hash: 'SHA256:b196…0a2f', signature: 'ICP-Brasil válida', linkedItem: 'Poço de visita PV-42 · Item 4.2.8', relatedValue: 420_000, decision: 'Aceita sem ressalvas', tags: ['campo', 'poço de visita'],
  },
  {
    id: 'EV-08843', assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', assetName: 'Sistema Integrado de Esgotamento Vale Verde', measurementId: 'MED-VALE-006', contract: 'CT-2025-SAN-0142',
    title: 'Levantamento topográfico pós-execução', type: 'Geometria', sector: 'Saneamento', city: 'São José dos Campos', uf: 'SP', capturedAt: '2026-07-20 19:01:15', receivedAt: '2026-07-20 19:42:08', source: 'ArcGIS Survey123 + GNSS RTK', operator: 'Equipe Topografia 04',
    status: 'divergente', confidence: 0.68, geoMatch: 0.42, metadataScore: 0.94, duplicateScore: 0.98, manipulationRisk: 0.04, lat: -23.1920, lon: -45.8740, locationLabel: 'Trecho T-22',
    hash: 'SHA256:29a4…c717', signature: 'Assinatura técnica válida', linkedItem: 'Rede coletora · Item 4.2.14', relatedValue: 2_650_000, decision: 'Retida até vistoria', tags: ['geometria', 'RTK', 'divergência'], anomaly: 'Desvio médio de 47 m em relação ao traçado aprovado; tolerância contratual: 15 m.',
  },
  {
    id: 'EV-08844', assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', assetName: 'Sistema Integrado de Esgotamento Vale Verde', measurementId: 'MED-VALE-006', contract: 'CT-2025-SAN-0142',
    title: 'Boletim de medição nº 6 assinado', type: 'Documento', sector: 'Saneamento', city: 'São José dos Campos', uf: 'SP', capturedAt: '2026-07-20 19:15:00', receivedAt: '2026-07-20 19:42:09', source: 'Gestão documental CAIXA', operator: 'Eng. Paulo R. Menezes',
    status: 'validada', confidence: 0.99, geoMatch: 1, metadataScore: 1, duplicateScore: 1, manipulationRisk: 0.01, lat: -23.1770, lon: -45.8890, locationLabel: 'Canteiro central',
    hash: 'SHA256:c31e…5bb8', signature: 'ICP-Brasil válida', linkedItem: 'Medição nº 6', relatedValue: 18_350_000, decision: 'Documento formal validado', tags: ['documento', 'medição'],
  },
  {
    id: 'EV-08845', assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', assetName: 'Sistema Integrado de Esgotamento Vale Verde', measurementId: 'MED-VALE-006', contract: 'CT-2025-SAN-0142',
    title: 'Inspeção com câmera de rede', type: 'Vídeo', sector: 'Saneamento', city: 'São José dos Campos', uf: 'SP', capturedAt: '2026-07-20 18:55:28', receivedAt: '2026-07-20 19:42:10', source: 'Câmera robotizada CCTV', operator: 'Inspeção Técnica Vale Verde',
    status: 'validada', confidence: 0.92, geoMatch: 0.95, metadataScore: 0.93, duplicateScore: 1, manipulationRisk: 0.02, lat: -23.1720, lon: -45.9010, locationLabel: 'Trecho T-14',
    hash: 'SHA256:f187…9a0d', signature: 'Dispositivo autenticado', linkedItem: 'Teste de integridade · Item 4.3.2', relatedValue: 640_000, decision: 'Aceita para ateste técnico', tags: ['vídeo', 'CCTV', 'integridade'],
  },
  {
    id: 'EV-08846', assetId: 'NEXO-ASSET-BR-SP-3549904-SAN-000284', assetName: 'Sistema Integrado de Esgotamento Vale Verde', measurementId: 'MED-VALE-006', contract: 'CT-2025-SAN-0142',
    title: 'Traçado executado versus projeto aprovado', type: 'Geometria', sector: 'Saneamento', city: 'São José dos Campos', uf: 'SP', capturedAt: '2026-07-20 19:02:45', receivedAt: '2026-07-20 19:42:11', source: 'ArcGIS Pro — análise espacial', operator: 'Agente de Inconsistências e Fraude',
    status: 'divergente', confidence: 0.71, geoMatch: 0.38, metadataScore: 0.98, duplicateScore: 1, manipulationRisk: 0.01, lat: -23.1715, lon: -45.9015, locationLabel: 'Trechos T-14, T-17 e T-22',
    hash: 'SHA256:fb70…1cd6', signature: 'Gerada pelo sistema', linkedItem: 'Comparação baseline × executado', relatedValue: 2_650_000, decision: 'Vistoria direcionada', tags: ['análise espacial', 'baseline', 'anomalia'], anomaly: 'Três segmentos apresentam deslocamento superior à tolerância e possível sobreposição com rede existente.',
  },
  {
    id: 'EV-09112', assetId: 'NEXO-ASSET-BR-PA-1501402-DRE-000198', assetName: 'Programa de Macrodrenagem Rio Norte', measurementId: 'MED-RION-011', contract: 'CT-2025-DRE-0202',
    title: 'Imagem orbital pós-evento extremo', type: 'Imagem orbital', sector: 'Drenagem', city: 'Belém', uf: 'PA', capturedAt: '2026-07-18 13:20:00', receivedAt: '2026-07-18 14:11:24', source: 'ArcGIS Living Atlas — Sentinel-2', operator: 'Agente de Risco Climático',
    status: 'revisao', confidence: 0.83, geoMatch: 0.91, metadataScore: 1, duplicateScore: 1, manipulationRisk: 0, lat: -1.4558, lon: -48.4902, locationLabel: 'Bacia Rio Norte',
    hash: 'ITEM:sentinel2-20260718', signature: 'Item Living Atlas', linkedItem: 'Reprogramação climática', relatedValue: 7_300_000, decision: 'Em revisão pela engenharia', tags: ['satélite', 'inundação', 'clima'], anomaly: 'Área alagada intercepta duas frentes de obra previstas no cronograma original.',
  },
  {
    id: 'EV-09571', assetId: 'NEXO-ASSET-BR-PE-2611606-HAB-000512', assetName: 'Residencial Horizonte Azul', measurementId: 'MED-HORI-018', contract: 'CT-2024-HAB-0871',
    title: 'Modelo BIM as built — bloco 07', type: 'BIM', sector: 'Habitação', city: 'Recife', uf: 'PE', capturedAt: '2026-07-16 09:42:00', receivedAt: '2026-07-16 10:33:18', source: 'Building Scene Layer', operator: 'Construtora Horizonte',
    status: 'validada', confidence: 0.97, geoMatch: 0.99, metadataScore: 0.96, duplicateScore: 1, manipulationRisk: 0.01, lat: -8.0578, lon: -34.8829, locationLabel: 'Bloco 07',
    hash: 'SHA256:bim7…88d4', signature: 'Responsabilidade técnica válida', linkedItem: 'Infraestrutura interna', relatedValue: 9_420_000, decision: 'Aceita; pendência operacional externa', tags: ['BIM', 'as built', 'habitação'],
  },
  {
    id: 'EV-09908', assetId: 'NEXO-ASSET-BR-MG-3106200-MOB-000341', assetName: 'BRT Serra Azul', measurementId: 'MED-BRT-001', contract: 'CT-2026-MOB-0031',
    title: 'Telemetria de equipamentos mobilizados', type: 'Sensor', sector: 'Mobilidade', city: 'Belo Horizonte', uf: 'MG', capturedAt: '2026-07-19 07:58:00', receivedAt: '2026-07-19 08:06:21', source: 'IoT Fleet Gateway', operator: 'Consórcio BRT Serra Azul',
    status: 'pendente', confidence: 0.79, geoMatch: 0.87, metadataScore: 0.91, duplicateScore: 1, manipulationRisk: 0.02, lat: -19.9167, lon: -43.9345, locationLabel: 'Pátio de mobilização',
    hash: 'IOT:brt-sa-20260719', signature: 'Gateway autenticado', linkedItem: 'Mobilização inicial', relatedValue: 1_900_000, decision: 'Aguardando confirmação em campo', tags: ['IoT', 'equipamento', 'mobilização'], anomaly: 'Três equipamentos previstos não transmitiram localização durante a janela mínima.',
  },
];
EVIDENCE_RECORDS.push(...REALISTIC_EVIDENCE_RECORDS);

export interface InspectionOrder {
  id: string;
  assetId: string;
  assetName: string;
  measurementId: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'agendada' | 'designada' | 'em_campo' | 'sincronizada' | 'validacao' | 'concluida';
  team: string;
  lead: string;
  scheduledFor: string;
  sla: string;
  route: string[];
  distanceKm: number;
  evidenceIds: string[];
  objective: string;
  finding: string;
  progress: number;
  decision: string;
  risk: StatusKey;
}

export const INSPECTION_ORDERS: InspectionOrder[] = [
  { id: 'OV-2026-0871', assetId: EVIDENCE_RECORDS[0].assetId, assetName: 'Vale Verde', measurementId: 'MED-VALE-006', priority: 'P0', status: 'em_campo', team: 'GEREG Sudeste · Equipe 04', lead: 'Marina Lopes', scheduledFor: '21/07/2026 09:30', sla: '04h 12m', route: ['Canteiro', 'T-14', 'T-17', 'T-22'], distanceKm: 38, evidenceIds: ['EV-08843', 'EV-08846'], objective: 'Confirmar traçado, extensão e conexão da rede executada.', finding: 'Coleta em andamento; T-14 já confirmado com ressalva de deslocamento.', progress: 0.58, decision: 'Aguardando laudo', risk: 'critico' },
  { id: 'OV-2026-0864', assetId: EVIDENCE_RECORDS[6].assetId, assetName: 'Rio Norte', measurementId: 'MED-RION-011', priority: 'P1', status: 'designada', team: 'GEREG Norte · Equipe Climática', lead: 'Eduardo Barros', scheduledFor: '22/07/2026 07:00', sla: '18h 40m', route: ['Canal A', 'Comporta C-06', 'Reservatório R-03'], distanceKm: 52, evidenceIds: ['EV-09112'], objective: 'Verificar impacto do evento extremo sobre duas frentes de obra.', finding: 'Checklist climático e rota preparados.', progress: 0.24, decision: 'Aguardando campo', risk: 'critico' },
  { id: 'OV-2026-0859', assetId: EVIDENCE_RECORDS[7].assetId, assetName: 'Horizonte Azul', measurementId: 'MED-HORI-018', priority: 'P2', status: 'concluida', team: 'GEREG Nordeste · Habitação', lead: 'Luciana Aguiar', scheduledFor: '18/07/2026 10:00', sla: 'Concluída', route: ['Acesso viário', 'Bloco 07', 'Terminal previsto'], distanceKm: 12, evidenceIds: ['EV-09571'], objective: 'Verificar prontidão física e dependências de funcionalidade.', finding: 'Bloco concluído; acesso viário e transporte ainda incompletos.', progress: 1, decision: 'Prontidão operacional não reconhecida', risk: 'atencao' },
  { id: 'OV-2026-0875', assetId: EVIDENCE_RECORDS[8].assetId, assetName: 'BRT Serra Azul', measurementId: 'MED-BRT-001', priority: 'P1', status: 'agendada', team: 'GEREG Sudeste · Mobilidade', lead: 'André Farias', scheduledFor: '23/07/2026 08:00', sla: '42h 15m', route: ['Pátio central', 'Frente 01'], distanceKm: 18, evidenceIds: ['EV-09908'], objective: 'Confirmar mobilização dos equipamentos previstos no contrato.', finding: 'Aguardando designação formal da equipe.', progress: 0.08, decision: 'Pendente', risk: 'atencao' },
];
INSPECTION_ORDERS.push(...REALISTIC_INSPECTIONS);

export interface CustodyEvent {
  id: string;
  evidenceId: string;
  at: string;
  event: string;
  actor: string;
  system: string;
  hashState: 'íntegro' | 'alerta';
  detail: string;
}

export const CUSTODY_EVENTS: CustodyEvent[] = [
  { id: 'CC-1001', evidenceId: 'EV-08843', at: '19:01:15', event: 'Captura GNSS RTK', actor: 'Equipe Topografia 04', system: 'Survey123', hashState: 'íntegro', detail: 'Geometria capturada com precisão horizontal declarada de 2,8 cm.' },
  { id: 'CC-1002', evidenceId: 'EV-08843', at: '19:01:18', event: 'Assinatura do dispositivo', actor: 'Gateway de campo', system: 'PKI corporativa', hashState: 'íntegro', detail: 'Certificado e relógio do dispositivo validados.' },
  { id: 'CC-1003', evidenceId: 'EV-08843', at: '19:42:08', event: 'Recebimento', actor: 'Nexo Evidência', system: 'Evidence API', hashState: 'íntegro', detail: 'Objeto recebido, hash recalculado e metadados preservados.' },
  { id: 'CC-1004', evidenceId: 'EV-08843', at: '19:42:12', event: 'Comparação espacial', actor: 'Agente de Inconsistências', system: 'ArcGIS GeoAnalytics', hashState: 'íntegro', detail: 'Geometria comparada com baseline contratual e redes existentes.' },
  { id: 'CC-1005', evidenceId: 'EV-08843', at: '19:42:16', event: 'Alerta de divergência', actor: 'Agente de Inconsistências', system: 'Nexo Agents', hashState: 'alerta', detail: 'Desvio espacial acima da tolerância; integridade do arquivo permanece válida.' },
  { id: 'CC-1006', evidenceId: 'EV-08843', at: '19:42:23', event: 'Vínculo à ordem de vistoria', actor: 'Agente Orquestrador', system: 'Workflow Manager', hashState: 'íntegro', detail: 'Evidência vinculada à OV-2026-0871 e bloqueada para edição.' },
  { id: 'CC-1007', evidenceId: 'EV-08843', at: '09:48:31', event: 'Consulta em campo', actor: 'Marina Lopes', system: 'Field Maps', hashState: 'íntegro', detail: 'Versão somente leitura aberta pela equipe autorizada.' },
];
CUSTODY_EVENTS.push(...REALISTIC_CUSTODY_EVENTS);

export interface EvidenceAgentRuntime {
  id: string;
  name: string;
  function: string;
  status: 'idle' | 'running' | 'waiting' | 'done' | 'alert';
  progress: number;
  entity: string;
  stage: string;
  confidence: number;
  sources: string[];
  recommendation: string;
  human: string;
  impact: string;
}

export const EVIDENCE_AGENTS: EvidenceAgentRuntime[] = [
  { id: 'orchestrator', name: 'Orquestrador de Evidências', function: 'Coordena validação, exceções, vistorias e decisões.', status: 'running', progress: 62, entity: 'MED-VALE-006', stage: 'Coordenando retorno da equipe de campo', confidence: 0.96, sources: ['Barramento de eventos', 'Plano de evidências', 'Workflows'], recommendation: 'Priorizar conclusão de T-22 e recalcular confiança da medição.', human: 'Ana Beatriz Souza', impact: 'R$ 2,65 mi condicionados' },
  { id: 'ingestion', name: 'Agente de Ingestão e Metadados', function: 'Extrai, normaliza e valida metadados das evidências.', status: 'done', progress: 100, entity: 'Lote EV-08841–EV-08846', stage: 'Lote processado', confidence: 0.99, sources: ['EXIF', 'GNSS', 'Assinatura', 'Gestão documental'], recommendation: '28 de 28 objetos recebidos com cadeia inicial íntegra.', human: '—', impact: '7 min poupados por lote' },
  { id: 'spatial', name: 'Agente de Validação Geoespacial', function: 'Compara localização e geometria com baseline e contexto territorial.', status: 'alert', progress: 100, entity: 'EV-08843 / EV-08846', stage: 'Divergência confirmada', confidence: 0.93, sources: ['FeatureLayer do projeto', 'Geometria RTK', 'Redes existentes'], recommendation: 'Manter retenção e validar T-22 em campo.', human: 'Engenharia regional', impact: 'R$ 2,65 mi protegidos' },
  { id: 'fraud', name: 'Agente de Integridade e Fraude', function: 'Detecta duplicidade, manipulação e inconsistência temporal.', status: 'done', progress: 100, entity: 'Medição nº 6', stage: 'Análise concluída', confidence: 0.94, sources: ['Hashes', 'EXIF', 'Histórico de evidências', 'Notas fiscais'], recommendation: 'Sem indício de manipulação; anomalia é exclusivamente espacial.', human: 'Auditoria sob demanda', impact: '18 itens liberados da revisão manual' },
  { id: 'inspection', name: 'Agente de Vistoria', function: 'Prioriza amostra, gera checklist, rota e laudo preliminar.', status: 'running', progress: 58, entity: 'OV-2026-0871', stage: 'Equipe no trecho T-17', confidence: 0.89, sources: ['Ordem de vistoria', 'Rotas ArcGIS', 'Checklist contratual'], recommendation: 'Coletar ponto GNSS adicional antes de seguir para T-22.', human: 'Marina Lopes', impact: '38 km de rota otimizada' },
  { id: 'custody', name: 'Agente de Cadeia de Custódia', function: 'Monitora integridade, acesso, retenção e versão dos objetos.', status: 'waiting', progress: 76, entity: 'Pacote MED-VALE-006', stage: 'Aguardando fechamento do laudo', confidence: 1, sources: ['Object storage', 'IAM', 'PKI', 'Logs'], recommendation: 'Selar o pacote após assinatura do laudo final.', human: 'Gestor da evidência', impact: 'Trilha pronta para auditoria' },
];

export const EVIDENCE_LIVE_STEPS = [
  { agentId: 'orchestrator', text: 'Gatilho recebido: nova evidência de campo sincronizada em T-17.' },
  { agentId: 'ingestion', text: 'Metadados, hash, assinatura e coordenadas extraídos.' },
  { agentId: 'spatial', text: 'Ponto GNSS comparado com baseline contratual e traçado medido.' },
  { agentId: 'fraud', text: 'Duplicidade e manipulação verificadas; nenhum indício encontrado.' },
  { agentId: 'inspection', text: 'Checklist da ordem OV-2026-0871 atualizado em tempo real.' },
  { agentId: 'spatial', text: 'T-17 validado; confiança da evidência elevada para 95%.' },
  { agentId: 'inspection', text: 'Equipe direcionada ao trecho T-22; ETA estimada em 14 minutos.' },
  { agentId: 'orchestrator', text: 'Workflow de medição notificado sobre validação parcial.' },
  { agentId: 'custody', text: 'Nova versão da evidência selada e vinculada à cadeia de custódia.' },
  { agentId: 'orchestrator', text: 'Gate humano preparado para decisão de liberação parcial.' },
];

export const EVIDENCE_STATUS_CHART = [
  { name: 'Validadas', value: 62, fill: '#0FA39D' },
  { name: 'Em revisão', value: 17, fill: '#1584D1' },
  { name: 'Divergentes', value: 11, fill: '#D14A55' },
  { name: 'Pendentes', value: 10, fill: '#E5A11A' },
];

export const EVIDENCE_VOLUME_SERIES = [
  { mes: 'Fev', recebidas: 1840, validadas: 1632 },
  { mes: 'Mar', recebidas: 2210, validadas: 1974 },
  { mes: 'Abr', recebidas: 2480, validadas: 2240 },
  { mes: 'Mai', recebidas: 2960, validadas: 2688 },
  { mes: 'Jun', recebidas: 3410, validadas: 3158 },
  { mes: 'Jul', recebidas: 3820, validadas: 3542 },
];

export const EVIDENCE_REPORTS = [
  { id: 'REP-EV-01', title: 'Pacote Auditável da Medição', description: 'Evidências, validações, exceções, laudos e cadeia de custódia da medição.', format: 'PDF + ZIP', frequency: 'Por medição', audience: 'Engenharia / Auditoria', lastGenerated: '20/07/2026 20:18' },
  { id: 'REP-EV-02', title: 'Carteira de Evidências e Confiança', description: 'Cobertura, confiança, divergências e tempos de validação por programa.', format: 'Dashboard', frequency: 'Diário', audience: 'Gestão executiva', lastGenerated: '21/07/2026 08:00' },
  { id: 'REP-EV-03', title: 'Vistorias e Produtividade de Campo', description: 'Ordens, rotas, SLA, achados, economia de deslocamento e decisões.', format: 'XLSX', frequency: 'Semanal', audience: 'Rede técnica', lastGenerated: '18/07/2026 17:30' },
  { id: 'REP-EV-04', title: 'Integridade e Cadeia de Custódia', description: 'Hashes, assinaturas, acessos, versões, retenção e exceções de integridade.', format: 'PDF', frequency: 'Mensal', audience: 'Compliance / Auditoria', lastGenerated: '30/06/2026 18:00' },
  { id: 'REP-EV-05', title: 'Anomalias Geoespaciais', description: 'Divergências entre projeto, medição, campo e imagens, com valor exposto.', format: 'GeoPDF', frequency: 'Sob demanda', audience: 'Engenharia / Riscos', lastGenerated: '20/07/2026 19:58' },
  { id: 'REP-EV-06', title: 'Evidências de Resultado', description: 'Pacote que será transferido ao Nexo Impacto para comprovação de resultados.', format: 'API + PDF', frequency: 'Trimestral', audience: 'Sustentabilidade', lastGenerated: '30/06/2026 12:10' },
];
