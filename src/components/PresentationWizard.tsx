import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/lib/icons';
import { PRESENTATION_STEPS, type PresentationStep } from '@/data/presentationData';
import { cls } from '@/lib/tokens';

export function PresentationWizard({
  open,
  onClose,
  onNavigateStep,
  onRunLive,
}: {
  open: boolean;
  onClose: () => void;
  onNavigateStep: (step: PresentationStep) => void;
  onRunLive: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const step = PRESENTATION_STEPS[index];
  const progress = ((index + 1) / PRESENTATION_STEPS.length) * 100;

  useEffect(() => {
    if (!open) return;
    onNavigateStep(step);
  }, [open, index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !autoPlay) return;
    const timer = window.setTimeout(() => {
      if (index < PRESENTATION_STEPS.length - 1) setIndex((v) => v + 1);
      else setAutoPlay(false);
    }, 8500);
    return () => window.clearTimeout(timer);
  }, [open, autoPlay, index]);

  const totalMinutes = useMemo(() => Math.floor(elapsed / 60).toString().padStart(2, '0'), [elapsed]);
  const totalSeconds = useMemo(() => (elapsed % 60).toString().padStart(2, '0'), [elapsed]);

  if (!open) return null;

  const go = (next: number) => {
    const safe = Math.max(0, Math.min(PRESENTATION_STEPS.length - 1, next));
    setIndex(safe);
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-[#020A10]/30 pointer-events-auto" onClick={onClose} />

      <aside className="absolute top-16 right-4 bottom-12 w-[430px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-[#071521]/[0.98] shadow-2xl overflow-hidden pointer-events-auto flex flex-col nexo-fade-in">
        <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#0B2235] to-[#071521]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1584D1] to-[#087C78] flex items-center justify-center text-white shadow-lg">
                <Icon name="Presentation" size={18} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">Demonstração do ciclo de vida</div>
                <div className="text-[10.5px] text-neutral-400">Caso: Sistema Integrado de Esgotamento Vale Verde</div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/8 text-neutral-400"><Icon name="X" size={16} /></button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: step.color }} /></div>
            <span className="text-[10px] text-neutral-400 font-mono-id">{index + 1}/{PRESENTATION_STEPS.length}</span>
            <span className="text-[10px] text-neutral-500 font-mono-id">{totalMinutes}:{totalSeconds}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto nexo-scroll">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border" style={{ background: `${step.color}18`, borderColor: `${step.color}50`, color: step.color }}>
                  <Icon name={step.icon} size={19} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: step.color }}>{step.phase}</div>
                  <h2 className="text-[18px] leading-tight font-semibold text-white mt-1">{step.title}</h2>
                  <p className="text-[11.5px] text-neutral-400 mt-1">{step.subtitle}</p>
                </div>
              </div>
              <span className="text-[10px] rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-neutral-400 shrink-0">{step.duration}</span>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
              <p className="text-[12.5px] leading-relaxed text-neutral-200">{step.narrative}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="text-[9.5px] uppercase tracking-wider text-neutral-500">Indicador da cena</div>
                <div className="text-[20px] font-semibold mt-1" style={{ color: step.color }}>{step.metric}</div>
                <div className="text-[10.5px] text-neutral-400">{step.metricLabel}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="text-[9.5px] uppercase tracking-wider text-neutral-500">Entregável</div>
                <div className="text-[11.5px] font-medium text-neutral-200 mt-2 leading-snug">{step.output}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">O que demonstrar na tela</div>
              <div className="space-y-2">
                {step.show.map((item, i) => (
                  <div key={item} className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
                    <span className="w-5 h-5 rounded-full text-[9px] font-semibold flex items-center justify-center shrink-0" style={{ background: `${step.color}20`, color: step.color }}>{i + 1}</span>
                    <span className="text-[11.5px] text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#E5A11A]/30 bg-[#E5A11A]/[0.07] p-3">
              <div className="flex gap-2">
                <Icon name="CircleHelp" size={15} className="text-[#E5A11A] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[9.5px] uppercase tracking-wider text-[#E5A11A]">Decisão-chave</div>
                  <div className="text-[12px] text-neutral-200 mt-1">{step.decision}</div>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#18B7D6]/25 bg-[#18B7D6]/[0.06] p-3 flex items-start gap-2.5">
              <Icon name="Bot" size={15} className="text-[#6FD8EC] mt-0.5 shrink-0" />
              <div>
                <div className="text-[9.5px] uppercase tracking-wider text-[#6FD8EC]">Agente em destaque</div>
                <div className="text-[11.5px] text-neutral-200 mt-1">{step.agent}</div>
              </div>
            </div>

            {showNotes && (
              <div className="mt-4 rounded-xl border border-[#7C5CBF]/30 bg-[#7C5CBF]/[0.07] p-3 nexo-fade-in">
                <div className="flex gap-2">
                  <Icon name="Mic2" size={14} className="text-[#B7A3E6] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[9.5px] uppercase tracking-wider text-[#B7A3E6]">Nota do apresentador</div>
                    <p className="text-[11.5px] leading-relaxed text-neutral-300 mt-1">{step.speakerNote}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/8 px-4 py-3">
            <div className="text-[9.5px] uppercase tracking-wider text-neutral-500 mb-2">Mapa da apresentação</div>
            <div className="grid grid-cols-6 gap-1.5">
              {PRESENTATION_STEPS.map((s, i) => (
                <button key={s.id} onClick={() => go(i)} title={`${s.number}. ${s.title}`} className={cls('h-8 rounded-md border text-[9.5px] font-semibold transition-all', i === index ? 'border-white/40 text-white scale-[1.04]' : i < index ? 'border-white/10 text-neutral-400 bg-white/[0.04]' : 'border-white/[0.06] text-neutral-600 bg-transparent')} style={i === index ? { background: `${s.color}35`, borderColor: s.color } : undefined}>{s.number}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#06131E] p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <button onClick={() => setShowNotes((v) => !v)} className={cls('px-2.5 h-8 rounded-lg border text-[10.5px] flex items-center gap-1.5', showNotes ? 'border-[#7C5CBF]/50 bg-[#7C5CBF]/15 text-[#C8B9EB]' : 'border-white/10 text-neutral-400')}><Icon name="Mic2" size={13} /> Notas</button>
            <button onClick={() => setAutoPlay((v) => !v)} className={cls('px-2.5 h-8 rounded-lg border text-[10.5px] flex items-center gap-1.5', autoPlay ? 'border-[#0FA39D]/50 bg-[#0FA39D]/15 text-[#60D2CB]' : 'border-white/10 text-neutral-400')}><Icon name={autoPlay ? 'Pause' : 'Play'} size={13} /> {autoPlay ? 'Pausar' : 'Auto'}</button>
            {(step.id === 'delivery' || step.id === 'evidence' || step.id === 'agents') && (
              <button onClick={onRunLive} className="ml-auto px-2.5 h-8 rounded-lg border border-[#18B7D6]/50 bg-[#18B7D6]/15 text-[#6FD8EC] text-[10.5px] flex items-center gap-1.5"><Icon name="Radio" size={13} /> Executar ao vivo</button>
            )}
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
            <button disabled={index === 0} onClick={() => go(index - 1)} className="h-10 rounded-lg border border-white/10 text-[11.5px] text-neutral-300 hover:bg-white/[0.05] disabled:opacity-30 flex items-center justify-center gap-1.5"><Icon name="ChevronLeft" size={14} /> Anterior</button>
            <button onClick={() => { setIndex(0); setElapsed(0); setAutoPlay(false); }} className="w-10 h-10 rounded-lg border border-white/10 text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.05] flex items-center justify-center" title="Reiniciar"><Icon name="RotateCcw" size={14} /></button>
            {index < PRESENTATION_STEPS.length - 1 ? (
              <button onClick={() => go(index + 1)} className="h-10 rounded-lg text-[11.5px] font-semibold text-white flex items-center justify-center gap-1.5" style={{ background: step.color }}>Próximo <Icon name="ChevronRight" size={14} /></button>
            ) : (
              <button onClick={onClose} className="h-10 rounded-lg bg-[#0FA39D] text-[11.5px] font-semibold text-white flex items-center justify-center gap-1.5"><Icon name="Check" size={14} /> Concluir</button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
