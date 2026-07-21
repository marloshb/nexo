import React, { useState } from 'react';
import { Icon } from '@/lib/icons';
import { MEDICAO_VALE_VERDE_FULL, MEDICAO_ITENS, HERO_ASSET_ID, ASSETS } from '@/data/mockData';
import { fmtBRL, fmtCompactBRL, cls } from '@/lib/tokens';
import { Panel, Pill, EmptyHint } from '@/components/shared/Primitives';
import { SCurveChart } from '@/components/shared/Charts';
import type { VistoriaStage } from '@/App';

const asset = ASSETS.find((a) => a.id === HERO_ASSET_ID)!;

export function EntregaView({
  onOpenAsset, vistoriaStage, onDecision, decision,
}: {
  onOpenAsset: (id: string) => void;
  vistoriaStage: VistoriaStage;
  onDecision: (action: 'parcial' | 'diligenciar' | 'suspender') => void;
  decision: string | null;
}) {
  const [expandedItem, setExpandedItem] = useState<number | null>(2);
  const laudoPronto = vistoriaStage === 'validacao' || vistoriaStage === 'concluida';

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Entrega</h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">Execução, medição, desembolso e destravamento</p>
        </div>
        <button onClick={() => onOpenAsset(HERO_ASSET_ID)} className="text-[12px] text-[#5FB4E8] hover:underline flex items-center gap-1">
          Ver Ativo 360 — {asset.name} <Icon name="ArrowRight" size={12} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3.5">
          <div className="text-[11px] text-neutral-400">Cronograma físico-financeiro</div>
          <div className="font-display text-[20px] font-semibold text-neutral-50 tnum mt-1">64%</div>
          <div className="text-[10.5px] text-[#D14A55] mt-0.5">−2 p.p. vs. planejado</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3.5">
          <div className="text-[11px] text-neutral-400">Previsão de conclusão</div>
          <div className="font-display text-[20px] font-semibold text-neutral-50 mt-1">Mar/2027</div>
          <div className="text-[10.5px] text-neutral-500 mt-0.5">+ 6 semanas de atraso</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3.5">
          <div className="text-[11px] text-neutral-400">Contingência consumida</div>
          <div className="font-display text-[20px] font-semibold text-neutral-50 tnum mt-1">31%</div>
          <div className="text-[10.5px] text-neutral-500 mt-0.5">R$ 8,9 mi de R$ 28,7 mi</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3.5">
          <div className="text-[11px] text-neutral-400">Ocorrências abertas</div>
          <div className="font-display text-[20px] font-semibold text-[#E5A11A] tnum mt-1">3</div>
          <div className="text-[10.5px] text-neutral-500 mt-0.5">1 crítica — divergência geométrica</div>
        </div>
      </div>

      <Panel title="Curva S — Sistema Integrado de Esgotamento Vale Verde" subtitle="Execução física planejada × realizada">
        <SCurveChart />
      </Panel>

      <Panel
        title={`Medição nº ${MEDICAO_VALE_VERDE_FULL.numero}`}
        subtitle={`Contrato ${MEDICAO_VALE_VERDE_FULL.contrato} · ${MEDICAO_VALE_VERDE_FULL.marco} · Período ${MEDICAO_VALE_VERDE_FULL.periodo}`}
        actions={<Pill tone="cyan">{MEDICAO_VALE_VERDE_FULL.evidenciasRecebidas} evidências</Pill>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] text-neutral-500">Valor solicitado</div>
            <div className="font-display text-[17px] font-semibold text-neutral-50 tnum mt-1">{fmtCompactBRL(MEDICAO_VALE_VERDE_FULL.valorSolicitado)}</div>
          </div>
          <div className="rounded-lg border border-[#E5A11A]/30 bg-[#E5A11A]/8 p-3">
            <div className="text-[11px] text-neutral-400">Retido (vistoria em curso)</div>
            <div className="font-display text-[17px] font-semibold text-[#F0B94A] tnum mt-1">{fmtCompactBRL(MEDICAO_VALE_VERDE_FULL.valorRetido)}</div>
          </div>
          <div className="rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3">
            <div className="text-[11px] text-neutral-400">Liberável de imediato</div>
            <div className="font-display text-[17px] font-semibold text-[#0FA39D] tnum mt-1">{fmtCompactBRL(MEDICAO_VALE_VERDE_FULL.valorLiberavel)}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#D14A55]/30 bg-[#D14A55]/8 p-3 mb-4 flex items-start gap-2.5">
          <Icon name="AlertOctagon" size={16} className="text-[#D14A55] mt-0.5 shrink-0" />
          <div>
            <div className="text-[12.5px] font-medium text-neutral-100">Divergência espacial identificada pelo Agente de Inconsistências e Fraude</div>
            <p className="text-[11.5px] text-neutral-400 mt-1 leading-snug">
              Desvio médio de {MEDICAO_VALE_VERDE_FULL.desvioMedio} m entre a geometria executada e o projeto aprovado nos trechos{' '}
              {MEDICAO_VALE_VERDE_FULL.trechosDivergentes.map((t, i) => <span key={t} className="font-mono-id text-neutral-200">{t}{i < MEDICAO_VALE_VERDE_FULL.trechosDivergentes.length - 1 ? ', ' : ''}</span>)}.
              {' '}Confiança da detecção: {Math.round(MEDICAO_VALE_VERDE_FULL.confianca * 100)}%.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto nexo-scroll -mx-4">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-neutral-500 text-[10.5px] uppercase tracking-wide border-b border-white/8">
                <th className="font-medium px-4 py-2">Item medido</th>
                <th className="font-medium px-2 py-2">Quantidade</th>
                <th className="font-medium px-2 py-2">Valor unit.</th>
                <th className="font-medium px-2 py-2">Total</th>
                <th className="font-medium px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {MEDICAO_ITENS.map((it, i) => (
                <React.Fragment key={it.item}>
                  <tr onClick={() => setExpandedItem(expandedItem === i ? null : i)} className="border-b border-white/[0.05] hover:bg-white/[0.04] cursor-pointer">
                    <td className="px-4 py-2.5 text-neutral-200">{it.item}</td>
                    <td className="px-2 py-2.5 text-neutral-400 tnum whitespace-nowrap">{it.qtd.toLocaleString('pt-BR')} {it.unidade}</td>
                    <td className="px-2 py-2.5 text-neutral-400 tnum whitespace-nowrap">{fmtBRL(it.valorUnit)}</td>
                    <td className="px-2 py-2.5 text-neutral-200 tnum whitespace-nowrap">{fmtBRL(it.qtd * it.valorUnit)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cls(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                          it.status === 'ok' && 'bg-[#0FA39D]/15 text-[#0FA39D]',
                          it.status === 'divergente' && 'bg-[#D14A55]/15 text-[#D14A55]',
                          it.status === 'analise' && 'bg-[#1584D1]/15 text-[#5FB4E8]'
                        )}
                      >
                        {it.status === 'ok' ? 'Validado' : it.status === 'divergente' ? 'Divergente' : 'Em análise'}
                      </span>
                    </td>
                  </tr>
                  {expandedItem === i && it.status === 'divergente' && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={5} className="px-4 py-3 text-[11.5px] text-neutral-400">
                        Retenção proporcional aplicada aos trechos T-14, T-17 e T-22 até a conclusão da vistoria OV-2026-0871.
                        Demais trechos deste item liberados normalmente.
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Decisão de desembolso" subtitle="Workflow de liberação — requer decisão humana">
        {decision ? (
          <div className="rounded-lg border border-[#0FA39D]/30 bg-[#0FA39D]/8 p-3.5 flex items-start gap-2.5">
            <Icon name="CheckCircle2" size={16} className="text-[#0FA39D] mt-0.5 shrink-0" />
            <div>
              <div className="text-[12.5px] font-medium text-neutral-100">Decisão registrada</div>
              <p className="text-[11.5px] text-neutral-400 mt-1">{decision}</p>
            </div>
          </div>
        ) : laudoPronto ? (
          <div className="space-y-3">
            <p className="text-[12.5px] text-neutral-300">
              O laudo de vistoria foi recebido com nível de confiança de 93%. O Agente de Medição e Desembolso recalculou o valor liberável.
              Escolha a ação:
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onDecision('parcial')} className="flex items-center gap-1.5 rounded-lg bg-[#0FA39D] px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-[#0FA39D]/85 transition-colors">
                <Icon name="CheckCircle2" size={14} /> Aprovar desembolso parcial (R$ 15,7 mi)
              </button>
              <button onClick={() => onDecision('diligenciar')} className="flex items-center gap-1.5 rounded-lg border border-[#1584D1]/40 bg-[#1584D1]/10 px-3.5 py-2 text-[12.5px] font-medium text-[#5FB4E8] hover:bg-[#1584D1]/20 transition-colors">
                <Icon name="FileSearch" size={14} /> Diligenciar itens divergentes
              </button>
              <button onClick={() => onDecision('suspender')} className="flex items-center gap-1.5 rounded-lg border border-[#D14A55]/40 bg-[#D14A55]/10 px-3.5 py-2 text-[12.5px] font-medium text-[#D14A55] hover:bg-[#D14A55]/20 transition-colors">
                <Icon name="PauseCircle" size={14} /> Suspender trecho T-22
              </button>
            </div>
          </div>
        ) : (
          <EmptyHint icon="Clock">
            Aguardando laudo da vistoria OV-2026-0871. Acompanhe o andamento em tempo real no Nexo Evidência ou inicie a simulação no rodapé da tela.
          </EmptyHint>
        )}
      </Panel>
    </div>
  );
}
