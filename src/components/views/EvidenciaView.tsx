import React, { useState } from 'react';
import { Icon } from '@/lib/icons';
import { EVIDENCIAS_VALE_VERDE, HERO_ASSET_ID, ASSETS, type Evidence } from '@/data/mockData';
import { Panel, Pill, ProgressBar } from '@/components/shared/Primitives';
import { TrechoMap } from '@/components/shared/TrechoMap';
import { cls } from '@/lib/tokens';
import type { VistoriaStage } from '@/App';

const asset = ASSETS.find((a) => a.id === HERO_ASSET_ID)!;

const VISTORIA_STEPS: { key: VistoriaStage; label: string }[] = [
  { key: 'agendada', label: 'Agendada' },
  { key: 'designada', label: 'Equipe designada' },
  { key: 'em_campo', label: 'Em campo' },
  { key: 'sincronizada', label: 'Sincronizada' },
  { key: 'validacao', label: 'Em validação' },
  { key: 'concluida', label: 'Concluída' },
];

// mapeia o passo do roteiro de demonstração para o waypoint onde a equipe está (estilo StreamLayer)
const STEP_TO_WAYPOINT = [0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3];

const TIPO_ICON: Record<string, string> = { Foto: 'Camera', Vídeo: 'Video', Documento: 'FileText', Geometria: 'Route' };

function EvidencePreview({ ev }: { ev: Evidence }) {
  const icon = TIPO_ICON[ev.tipo] ?? 'FileText';
  return (
    <div className="aspect-video rounded-lg bg-gradient-to-br from-[#123353] to-[#071521] border border-white/10 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)' }} />
      <Icon name={icon} size={30} className="text-neutral-500 relative" />
      <span className="text-[10.5px] text-neutral-500 relative">{ev.tipo} · {ev.trecho}</span>
    </div>
  );
}

export function EvidenciaView({ vistoriaStage, demoStepIdx, demoRunning }: { vistoriaStage: VistoriaStage; demoStepIdx: number; demoRunning: boolean }) {
  const [selected, setSelected] = useState<Evidence>(EVIDENCIAS_VALE_VERDE[2]);
  const stepIdx = VISTORIA_STEPS.findIndex((s) => s.key === vistoriaStage);
  const crewWaypointIndex = STEP_TO_WAYPOINT[Math.min(demoStepIdx, STEP_TO_WAYPOINT.length - 1)] ?? 0;

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div>
        <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Evidência</h1>
        <p className="text-[12px] text-neutral-500 mt-0.5">Vistorias, documentos, imagens e cadeia de custódia</p>
      </div>

      <Panel title="Ordem de vistoria OV-2026-0871" subtitle={`${asset.name} · Trechos T-14, T-17, T-22`}>
        <div className="flex items-center">
          {VISTORIA_STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cls(
                    'w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0',
                    i <= stepIdx ? 'border-[#18B7D6] bg-[#18B7D6]/20' : 'border-white/15',
                    i === stepIdx && 'nexo-pulse-ring'
                  )}
                >
                  {i < stepIdx ? <Icon name="CheckCircle2" size={12} className="text-[#18B7D6]" /> : <span className={cls('w-1.5 h-1.5 rounded-full', i <= stepIdx ? 'bg-[#18B7D6]' : 'bg-white/20')} />}
                </div>
                <span className={cls('text-[10.5px] text-center leading-tight max-w-[70px]', i <= stepIdx ? 'text-neutral-300' : 'text-neutral-600')}>{s.label}</span>
              </div>
              {i < VISTORIA_STEPS.length - 1 && <div className={cls('h-[2px] flex-1 mx-1', i < stepIdx ? 'bg-[#18B7D6]/60' : 'bg-white/10')} />}
            </React.Fragment>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-1">
          <Panel title="Caixa de entrada de evidências" subtitle={`${EVIDENCIAS_VALE_VERDE.length} itens`} dense>
            <div className="space-y-1.5">
              {EVIDENCIAS_VALE_VERDE.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  className={cls('w-full text-left rounded-lg border p-2.5 transition-colors', selected.id === ev.id ? 'border-[#1584D1]/60 bg-[#1584D1]/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] text-neutral-200 truncate">{ev.descricao}</span>
                    <Icon name={TIPO_ICON[ev.tipo] ?? 'FileText'} size={12} className="text-neutral-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                    <span className="font-mono-id">{ev.id}</span>
                    {ev.status === 'divergente'
                      ? <span className="text-[#D14A55] font-medium">Divergente</span>
                      : <span className="text-[#0FA39D]">Validada</span>}
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="Mapa — frentes de trabalho" dense>
            <TrechoMap crewWaypointIndex={crewWaypointIndex} active={demoRunning} />
          </Panel>
          <Panel title="Evidência original" subtitle={selected.id} dense>
            <EvidencePreview ev={selected} />
          </Panel>
          <Panel title="Metadados e validações" dense>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between"><span className="text-neutral-500">Tipo</span><span className="text-neutral-200">{selected.tipo}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Trecho</span><span className="text-neutral-200 font-mono-id">{selected.trecho}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Capturado em</span><span className="text-neutral-200 tnum">{new Date(selected.capturadoEm).toLocaleString('pt-BR')}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Coordenadas</span><span className="text-neutral-200 font-mono-id text-[11px]">{selected.geo}</span></div>
              <div className="pt-1">
                <div className="flex justify-between mb-1"><span className="text-neutral-500">Nível de confiança</span><span className="text-neutral-200 tnum">{Math.round(selected.confianca * 100)}%</span></div>
                <ProgressBar value={selected.confianca} tone={selected.confianca > 0.85 ? 'teal' : selected.confianca > 0.7 ? 'amber' : 'red'} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {selected.status === 'divergente' ? (
                  <span className="inline-flex items-center rounded-md border border-[#D14A55]/30 bg-[#D14A55]/15 text-[#D14A55] px-2 py-0.5 text-[11px] font-medium">Divergente</span>
                ) : (
                  <Pill tone="blue">Validada</Pill>
                )}
              </div>
            </div>
          </Panel>
          <Panel title="Recomendação do agente" dense>
            <div className="rounded-lg border border-[#18B7D6]/30 bg-[#18B7D6]/8 p-3 text-[12px] text-neutral-200 leading-relaxed">
              {selected.status === 'divergente'
                ? 'O Agente de Inconsistências e Fraude identificou desvio acima da tolerância de 15 m nesta evidência. Recomenda-se validação humana em campo antes da liberação do item associado.'
                : 'Evidência validada automaticamente — atende aos critérios de geolocalização, metadados e comparação com o baseline contratual.'}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-neutral-500">
              <Icon name="Link2" size={11} /> Cadeia de custódia: hash verificado · assinatura digital válida
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
