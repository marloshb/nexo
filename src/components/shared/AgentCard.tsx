import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AGENT_STATUS_META, type Agent } from '@/data/mockData';
import { Icon } from '@/lib/icons';
import { cls } from '@/lib/tokens';

function AgentStatusDot({ status }: { status: Agent['status'] }) {
  const m = AGENT_STATUS_META[status];
  const pulsing = status === 'em_execucao' || status === 'coletando' || status === 'analisando';
  return (
    <span className="relative inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {pulsing && <span className="nexo-pulse-ring absolute inline-flex h-2 w-2 rounded-full" style={{ background: m.color }} />}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: m.color }} />
      </span>
      <span className="text-[11px] font-medium" style={{ color: m.color }}>{m.label}</span>
    </span>
  );
}

export function AgentCard({ agent }: { agent: Agent }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-left rounded-xl border border-white/10 bg-[#0E2A40]/60 p-3.5 hover:border-[#1584D1]/50 hover:bg-[#0E2A40] transition-all flex flex-col gap-2.5 min-w-0"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-[13px] font-semibold text-neutral-100 leading-snug line-clamp-2">{agent.name}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">{agent.entity}</div>
          </div>
          <Icon name="Bot" size={16} className="text-[#18B7D6] shrink-0 mt-0.5" />
        </div>
        <AgentStatusDot status={agent.status} />
        <div className="text-[11.5px] text-neutral-400 line-clamp-2 min-h-[32px]">{agent.step}</div>
        <div className="flex items-center justify-between pt-1.5 border-t border-white/8 text-[10.5px] text-neutral-500">
          <span className="tnum">{agent.duration}</span>
          {agent.confidence != null ? (
            <span className="tnum font-medium text-neutral-300">{Math.round(agent.confidence * 100)}% confiança</span>
          ) : <span>—</span>}
        </div>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-lg overflow-y-auto nexo-scroll">
          <SheetHeader>
            <SheetTitle className="font-display text-neutral-50 flex items-center gap-2 pr-6">
              <Icon name="Bot" size={17} className="text-[#18B7D6]" /> {agent.name}
            </SheetTitle>
            <SheetDescription className="text-neutral-400">{agent.function}</SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <AgentStatusDot status={agent.status} />
              <span className="text-[11px] text-neutral-500 tnum">{agent.started} · {agent.duration}</span>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Entidade analisada</div>
              <div className="text-[13px] text-neutral-200">{agent.entity}</div>
            </div>

            {agent.execSteps ? (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-2">Linha do tempo de execução</div>
                <ol className="space-y-0">
                  {agent.execSteps.map((s, i) => (
                    <li key={i} className="relative pl-6 pb-4 last:pb-0">
                      {i !== agent.execSteps!.length - 1 && <span className="absolute left-[7px] top-3 bottom-0 w-px bg-white/12" />}
                      <span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-[#1584D1]/20 border border-[#1584D1] flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-[#1584D1]" />
                      </span>
                      <div className="text-[12px] font-medium text-neutral-200">{i + 1}. {s.label}</div>
                      <div className="text-[11.5px] text-neutral-400 mt-0.5">{s.detail}</div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Etapa atual</div>
                <div className="text-[13px] text-neutral-200">{agent.step}</div>
              </div>
            )}

            <div>
              <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium mb-1.5">Fontes consultadas</div>
              <div className="flex flex-wrap gap-1.5">
                {agent.sources.map((src) => (
                  <span key={src} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-neutral-300">{src}</span>
                ))}
              </div>
            </div>

            <div className={cls('rounded-lg border p-3', agent.status === 'concluido_alerta' ? 'border-[#E5A11A]/40 bg-[#E5A11A]/10' : 'border-[#18B7D6]/30 bg-[#18B7D6]/8')}>
              <div className="text-[11px] uppercase tracking-wide text-neutral-400 font-medium mb-1">Recomendação</div>
              <div className="text-[13px] text-neutral-100">{agent.recommendation}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <div className="text-neutral-500 text-[11px]">Ação aguardada</div>
                <div className="text-neutral-200 mt-0.5">{agent.awaiting}</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px]">Responsável humano</div>
                <div className="text-neutral-200 mt-0.5">{agent.human}</div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
