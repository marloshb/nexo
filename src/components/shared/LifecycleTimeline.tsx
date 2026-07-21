import { useState } from 'react';
import { STAGE_ORDER, type Asset, type StageHistoryEntry } from '@/data/mockData';
import { Icon } from '@/lib/icons';
import { cls } from '@/lib/tokens';

function computeGenericHistory(asset: Asset): StageHistoryEntry[] {
  const currentIdx = STAGE_ORDER.indexOf(asset.stage);
  return STAGE_ORDER.map((stage, i) => ({
    stage,
    date: '',
    status: i < currentIdx ? 'concluido' : i === currentIdx ? 'atual' : 'pendente',
  }));
}

export function LifecycleTimeline({ asset, compact = false }: { asset: Asset; compact?: boolean }) {
  const history = asset.history ?? computeGenericHistory(asset);
  const [openIdx, setOpenIdx] = useState<number | null>(() => {
    const idx = history.findIndex((h) => h.status === 'atual');
    return idx >= 0 ? idx : null;
  });

  return (
    <div className="w-full overflow-x-auto nexo-scroll">
      <div className="flex items-stretch min-w-[900px]">
        {history.map((h, i) => {
          const isLast = i === history.length - 1;
          const color = h.status === 'concluido' ? '#0FA39D' : h.status === 'atual' ? '#1584D1' : '#394B59';
          return (
            <div key={h.stage} className="flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
                  <div
                    className={cls('w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0', h.status === 'atual' && 'nexo-pulse-ring')}
                    style={{ borderColor: color, background: h.status === 'pendente' ? 'transparent' : `${color}22` }}
                  >
                    {h.status === 'concluido' ? (
                      <Icon name="CheckCircle2" size={13} style={{ color }} />
                    ) : h.status === 'atual' ? (
                      <Icon name="Clock" size={13} style={{ color }} />
                    ) : (
                      <Icon name="Circle" size={8} style={{ color }} />
                    )}
                  </div>
                </div>
                {!isLast && <div className="h-[2px] flex-1" style={{ background: h.status === 'concluido' ? '#0FA39D55' : '#39485955' }} />}
              </div>
              {!compact && (
                <button
                  className="text-left mt-2 pr-2"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                >
                  <div className={cls('text-[12px] font-medium', h.status === 'pendente' ? 'text-neutral-500' : 'text-neutral-200')}>{h.stage}</div>
                  <div className="text-[10.5px] text-neutral-500 tnum">{h.date ? new Date(h.date).toLocaleDateString('pt-BR') : '—'}</div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!compact && openIdx !== null && history[openIdx].status !== 'pendente' && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3.5 nexo-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="font-display text-[13px] font-semibold text-neutral-100">{history[openIdx].stage}</div>
            {history[openIdx].date && <div className="text-[11px] text-neutral-500 tnum">{new Date(history[openIdx].date).toLocaleDateString('pt-BR')}</div>}
          </div>
          {history[openIdx].decision && (
            <div className="text-[12.5px] text-neutral-300 mb-2"><span className="text-neutral-500">Decisão: </span>{history[openIdx].decision}</div>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px] text-neutral-400">
            {history[openIdx].responsible && <span><Icon name="User" size={11} className="inline mr-1 -mt-0.5" />{history[openIdx].responsible}</span>}
            {typeof history[openIdx].docs === 'number' && <span><Icon name="FileText" size={11} className="inline mr-1 -mt-0.5" />{history[openIdx].docs} documentos</span>}
            {typeof history[openIdx].evidences === 'number' && <span><Icon name="Images" size={11} className="inline mr-1 -mt-0.5" />{history[openIdx].evidences} evidências</span>}
            {history[openIdx].agents && history[openIdx].agents!.length > 0 && (
              <span><Icon name="Bot" size={11} className="inline mr-1 -mt-0.5" />{history[openIdx].agents!.join(', ')}</span>
            )}
          </div>
          {history[openIdx].pendencies && history[openIdx].pendencies!.length > 0 && (
            <div className="mt-2 flex items-start gap-1.5 text-[11.5px] text-[#F0B94A]">
              <Icon name="AlertTriangle" size={12} className="mt-0.5 shrink-0" />
              <span>{history[openIdx].pendencies!.join('; ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
