import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icon } from '@/lib/icons';
import {
  type Asset, HERO_ASSET_ID, AGENTS, EVIDENCIAS_VALE_VERDE, MEDICAO_VALE_VERDE_FULL,
  RISK_MATRIX_DATA, type AuditEntry,
} from '@/data/mockData';
import { fmtCompactBRL, fmtCompactNum, fmtPct, fmtDate, cls } from '@/lib/tokens';
import { HEALTH_DIMENSIONS } from '@/data/ativosV3Data';
import { Panel, StatusChip, KpiCard, ProgressBar, EmptyHint, Pill } from '@/components/shared/Primitives';
import { LifecycleTimeline } from '@/components/shared/LifecycleTimeline';
import { BrazilMap } from '@/components/shared/BrazilMap';
import type { VistoriaStage } from '@/App';

const TABS = [
  'Resumo', 'Capital', 'Estruturação', 'Contratos', 'Execução', 'Mapa', 'Evidências',
  'Riscos', 'Ativo', 'Operação', 'Impacto', 'Workflows', 'Agentes', 'Histórico',
] as const;

export function Ativo360View({
  asset, onClose, vistoriaStage, decision, auditTrail, onNavigateProduct,
}: {
  asset: Asset; onClose: () => void; vistoriaStage: VistoriaStage; decision: string | null;
  auditTrail: AuditEntry[]; onNavigateProduct: (p: 'entrega' | 'evidencia' | 'ativos') => void;
}) {
  const [tab, setTab] = useState<typeof TABS[number]>('Resumo');
  const isHero = asset.id === HERO_ASSET_ID;
  const relatedAgents = AGENTS.filter((a) => a.entity.toLowerCase().includes(asset.name.toLowerCase()) || (isHero && ['fraude', 'medicao', 'vistoria', 'engenharia'].includes(a.id)));
  const relatedRisks = RISK_MATRIX_DATA.filter((r) => r.name.toLowerCase().includes(asset.name.split(' ')[asset.name.split(' ').length - 1].toLowerCase()) || (isHero && r.name.includes('Vale Verde')));

  return (
    <div className="p-5 max-w-[1500px] mx-auto nexo-fade-in">
      <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-neutral-200 mb-3">
        <Icon name="ChevronLeft" size={14} /> Voltar
      </button>

      {/* Cabeçalho */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#123353]/70 to-[#0B2235]/70 p-5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono-id text-[11px] text-neutral-500">{asset.id}</span>
              <StatusChip status={asset.status} size="sm" />
              <Pill tone="blue">{asset.sector}</Pill>
              <Pill>{asset.stage}</Pill>
            </div>
            <h1 className="font-display text-[22px] font-semibold text-neutral-50 leading-tight">{asset.name}</h1>
            <p className="text-[12.5px] text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">{asset.summary}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11.5px] text-neutral-500">
              <span className="flex items-center gap-1"><Icon name="MapPin" size={11} />{asset.city}, {asset.uf}</span>
              <span className="flex items-center gap-1"><Icon name="Layers" size={11} />{asset.program}</span>
              <span className="flex items-center gap-1"><Icon name="User" size={11} />{asset.responsible}</span>
              <span className="flex items-center gap-1"><Icon name="Clock" size={11} />Atualizado {fmtDate(asset.lastUpdate)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 shrink-0 w-full lg:w-auto lg:min-w-[320px]">
            <KpiCard label="Valor contratado" value={fmtCompactBRL(asset.value)} />
            <KpiCard label="Desembolsado" value={fmtPct(asset.disbursed)} />
            <KpiCard label="Execução física" value={fmtPct(asset.physicalProgress)} />
            <KpiCard label="Saúde do ativo" value={asset.healthIndex != null ? String(asset.healthIndex) : '—'} />
          </div>
        </div>
      </div>

      <Panel className="mb-4" title="Linha do tempo do ativo" subtitle="Captação → Programa → Originação → Estruturação → Aprovação → Contratação → Execução → Comissionamento → Operação → Impacto">
        <LifecycleTimeline asset={asset} />
      </Panel>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof TABS[number])}>
        <TabsList className="bg-white/[0.03] border border-white/10 p-1 h-auto flex-wrap justify-start gap-1 mb-4">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-[12px] data-[state=active]:bg-[#1584D1] data-[state=active]:text-white text-neutral-400 rounded-md px-2.5 py-1.5">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Resumo" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Beneficiários">
              <div className="flex items-center justify-between text-[13px] mb-2">
                <span className="text-neutral-400">Previstos</span><span className="text-neutral-100 tnum font-medium">{fmtCompactNum(asset.beneficiaries)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] mb-2">
                <span className="text-neutral-400">Comprovados</span><span className="text-neutral-100 tnum font-medium">{fmtCompactNum(asset.beneficiariesVerified)}</span>
              </div>
              <ProgressBar value={asset.beneficiaries ? asset.beneficiariesVerified / asset.beneficiaries : 0} tone="teal" />
            </Panel>
            <Panel title="Funding">
              <div className="text-[13px] text-neutral-200">{asset.fundingSource}</div>
              <div className="text-[11.5px] text-neutral-500 mt-1">{asset.program}</div>
            </Panel>
          </div>
          {isHero && (
            <div className="rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/8 p-3.5 flex items-start gap-2.5">
              <Icon name="AlertOctagon" size={16} className="text-[#D14A55] mt-0.5 shrink-0" />
              <div className="text-[12.5px] text-neutral-200">
                Pendência ativa: divergência espacial na Medição nº 6 (trechos T-14, T-17, T-22). Vistoria OV-2026-0871 em andamento —{' '}
                <button onClick={() => onNavigateProduct('evidencia')} className="text-[#5FB4E8] hover:underline">acompanhar no Nexo Evidência</button>.
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="Capital" className="mt-0">
          <Panel title="Passaporte do capital">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <div><div className="text-neutral-500 text-[11px]">Fonte</div><div className="text-neutral-200 mt-0.5">{asset.fundingSource}</div></div>
              <div><div className="text-neutral-500 text-[11px]">Programa</div><div className="text-neutral-200 mt-0.5">{asset.program}</div></div>
              <div><div className="text-neutral-500 text-[11px]">Valor total</div><div className="text-neutral-200 mt-0.5 tnum">{fmtCompactBRL(asset.value)}</div></div>
              <div><div className="text-neutral-500 text-[11px]">Desembolsado</div><div className="text-neutral-200 mt-0.5 tnum">{fmtCompactBRL(asset.value * asset.disbursed)} ({fmtPct(asset.disbursed)})</div></div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="Estruturação" className="mt-0">
          <Panel title="Modelo de estruturação">
            <p className="text-[12.5px] text-neutral-300 leading-relaxed">
              {isHero
                ? 'Alternativa técnica B (rede separadora) aprovada após comparação com solução combinada. Gêmeo de decisão disponível no Nexo Estrutura com premissas de vida útil de 25 anos e capacidade para 210 mil habitantes.'
                : 'Cenário técnico único modelado e aprovado — sem alternativas concorrentes registradas nesta versão do mockup.'}
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="Contratos" className="mt-0">
          <Panel title="Contratos vinculados">
            {asset.contract ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-neutral-200 font-mono-id">{asset.contract}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Baseline contratual emitida</div>
                </div>
                <StatusChip status="normal" size="sm" />
              </div>
            ) : <EmptyHint>Nenhum contrato formalizado nesta etapa.</EmptyHint>}
          </Panel>
        </TabsContent>

        <TabsContent value="Execução" className="mt-0 space-y-4">
          {isHero ? (
            <Panel title={`Medição nº ${MEDICAO_VALE_VERDE_FULL.numero}`} subtitle={MEDICAO_VALE_VERDE_FULL.marco}
              actions={<button onClick={() => onNavigateProduct('entrega')} className="text-[11.5px] text-[#5FB4E8] hover:underline flex items-center gap-1">Abrir no Nexo Entrega <Icon name="ArrowRight" size={11} /></button>}>
              <div className="grid grid-cols-3 gap-3 text-[13px]">
                <div><div className="text-neutral-500 text-[11px]">Solicitado</div><div className="text-neutral-200 tnum mt-0.5">{fmtCompactBRL(MEDICAO_VALE_VERDE_FULL.valorSolicitado)}</div></div>
                <div><div className="text-neutral-500 text-[11px]">Retido</div><div className="text-[#F0B94A] tnum mt-0.5">{fmtCompactBRL(MEDICAO_VALE_VERDE_FULL.valorRetido)}</div></div>
                <div><div className="text-neutral-500 text-[11px]">Liberável</div><div className="text-[#0FA39D] tnum mt-0.5">{fmtCompactBRL(MEDICAO_VALE_VERDE_FULL.valorLiberavel)}</div></div>
              </div>
            </Panel>
          ) : (
            <Panel title="Execução física"><ProgressBar value={asset.physicalProgress} tone="teal" /><div className="text-[11.5px] text-neutral-500 mt-2">{fmtPct(asset.physicalProgress)} concluído</div></Panel>
          )}
        </TabsContent>

        <TabsContent value="Mapa" className="mt-0">
          <Panel title="Localização e área de influência">
            <BrazilMap assets={[asset]} selectedId={asset.id} height={340} />
          </Panel>
        </TabsContent>

        <TabsContent value="Evidências" className="mt-0">
          <Panel title="Evidências vinculadas" subtitle={isHero ? `${EVIDENCIAS_VALE_VERDE.length} evidências` : undefined}>
            {isHero ? (
              <div className="space-y-1.5">
                {EVIDENCIAS_VALE_VERDE.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <span className="text-[12px] text-neutral-300">{ev.descricao}</span>
                    <span className={cls('text-[10.5px] font-medium', ev.status === 'divergente' ? 'text-[#D14A55]' : 'text-[#0FA39D]')}>{ev.status === 'divergente' ? 'Divergente' : 'Validada'}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyHint icon="Images">Nenhuma evidência pendente de revisão para este ativo.</EmptyHint>}
          </Panel>
        </TabsContent>

        <TabsContent value="Riscos" className="mt-0">
          <Panel title="Riscos identificados">
            {relatedRisks.length > 0 ? (
              <div className="space-y-1.5">
                {relatedRisks.map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <span className="text-[12px] text-neutral-300">{r.name}</span>
                    <span className="text-[10.5px] text-neutral-500 tnum">P{r.probabilidade} × I{r.impacto}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyHint icon="ShieldAlert">Nenhum risco crítico identificado no momento.</EmptyHint>}
          </Panel>
        </TabsContent>

        <TabsContent value="Ativo" className="mt-0">
          <Panel title="Componentes do ativo">
            <p className="text-[12.5px] text-neutral-300 leading-relaxed">
              Estrutura hierárquica de componentes cadastrada conforme documentação as built. Setor: {asset.sector} · Território: {asset.city}, {asset.uf}.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="Operação" className="mt-0">
          <Panel title="Índice de saúde do ativo" subtitle="10 dimensões da especificação">
            {asset.healthIndex != null && HEALTH_DIMENSIONS[asset.name] ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {HEALTH_DIMENSIONS[asset.name].map((d) => (
                  <div key={d.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-center">
                    <div className={cls('font-display text-[18px] font-semibold tnum', d.value > 85 ? 'text-[#0FA39D]' : d.value > 60 ? 'text-neutral-50' : 'text-[#E5A11A]')}>{d.value}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{d.label}</div>
                  </div>
                ))}
              </div>
            ) : asset.healthIndex != null ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[['Disponibilidade', 96], ['Desempenho', 91], ['Integridade física', asset.healthIndex], ['Custo operacional', 88], ['Vida útil remanescente', 82]].map(([label, v]) => (
                  <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-center">
                    <div className="font-display text-[18px] font-semibold text-neutral-50 tnum">{v as number}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{label as string}</div>
                  </div>
                ))}
              </div>
            ) : <EmptyHint icon="Activity">Ativo ainda não está em operação — sem telemetria disponível.</EmptyHint>}
            {asset.healthIndex != null && (
              <button onClick={() => onNavigateProduct('ativos')} className="mt-3 text-[11.5px] text-[#5FB4E8] hover:underline flex items-center gap-1">
                Ver sensores, manutenção preditiva e reinvestimento no Nexo Ativos <Icon name="ArrowRight" size={11} />
              </button>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="Impacto" className="mt-0">
          <Panel title="Demonstração de valor do ativo">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="Beneficiários previstos" value={fmtCompactNum(asset.beneficiaries)} />
              <KpiCard label="Beneficiários comprovados" value={fmtCompactNum(asset.beneficiariesVerified)} />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="Workflows" className="mt-0">
          <Panel title="Workflows ativos">
            {isHero ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="text-[12px] text-neutral-300">Vistoria OV-2026-0871</span>
                  <StatusChip status={vistoriaStage === 'concluida' ? 'normal' : 'decisao'} size="sm" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="text-[12px] text-neutral-300">Decisão de desembolso — Medição nº 6</span>
                  <StatusChip status={decision ? 'normal' : 'pendente'} size="sm" />
                </div>
              </div>
            ) : <EmptyHint icon="Workflow">Nenhum workflow ativo para este ativo.</EmptyHint>}
          </Panel>
        </TabsContent>

        <TabsContent value="Agentes" className="mt-0">
          <Panel title="Agentes envolvidos">
            {relatedAgents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedAgents.map((a) => (
                  <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                    <div className="text-[12px] text-neutral-200">{a.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{a.step}</div>
                  </div>
                ))}
              </div>
            ) : <EmptyHint icon="Bot">Nenhum agente acionado recentemente para este ativo.</EmptyHint>}
          </Panel>
        </TabsContent>

        <TabsContent value="Histórico" className="mt-0">
          <Panel title="Trilha de auditoria">
            <div className="space-y-2">
              {(isHero ? auditTrail : auditTrail.filter((e) => e.detail.includes(asset.name.split(' ')[0]))).map((e) => (
                <div key={e.id} className="flex items-start gap-3 text-[12px] border-b border-white/[0.05] pb-2 last:border-0">
                  <span className="text-neutral-500 tnum shrink-0 w-24">{e.t}</span>
                  <div>
                    <div className="text-neutral-200">{e.action} <span className="text-neutral-500">— {e.user}</span></div>
                    <div className="text-neutral-500 text-[11px]">{e.detail}</div>
                  </div>
                </div>
              ))}
              {!isHero && auditTrail.filter((e) => e.detail.includes(asset.name.split(' ')[0])).length === 0 && (
                <EmptyHint icon="Clock">Nenhum evento de auditoria registrado ainda para este ativo.</EmptyHint>
              )}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
