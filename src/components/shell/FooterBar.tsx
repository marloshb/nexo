
import { Icon } from '@/lib/icons';
import { FooterTicker } from '@/components/shared/EventFeed';
import type { EventItem, Agent } from '@/data/mockData';
import { cls } from '@/lib/tokens';

export function FooterBar({
  events, agents, demoRunning, onToggleDemo, demoDone,
}: {
  events: EventItem[]; agents: Agent[]; demoRunning: boolean; onToggleDemo: () => void; demoDone: boolean;
}) {
  const running = agents.filter((a) => ['em_execucao', 'coletando', 'analisando'].includes(a.status)).length;

  return (
    <footer className="h-9 shrink-0 border-t border-white/10 bg-[#050F19] flex items-center gap-4 px-3.5 text-[11px] text-neutral-500 overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0FA39D]" />
        <span>17 serviços conectados</span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Icon name="RefreshCw" size={11} /> <span>Última sinc. há 4s</span>
      </div>
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        <Icon name="Bot" size={11} className="text-[#18B7D6]" /> <span>{running} agentes em execução</span>
      </div>
      <div className="hidden xl:flex items-center gap-1.5 shrink-0 text-[#F0B94A]">
        <Icon name="AlertTriangle" size={11} /> <span>1 falha de integração</span>
      </div>

      <div className="w-px h-4 bg-white/10 shrink-0 hidden sm:block" />
      <div className="flex-1 min-w-0 hidden sm:block">
        <FooterTicker events={events} />
      </div>

      <button
        onClick={onToggleDemo}
        disabled={demoDone && !demoRunning}
        className={cls(
          'shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors',
          demoRunning ? 'bg-[#D14A55]/15 text-[#D14A55]' : demoDone ? 'text-neutral-600 cursor-not-allowed' : 'bg-[#18B7D6]/15 text-[#6FD8EC] hover:bg-[#18B7D6]/25'
        )}
      >
        <Icon name={demoRunning ? 'Pause' : demoDone ? 'CheckCircle2' : 'Play'} size={11} />
        {demoRunning ? 'Pausar simulação' : demoDone ? 'Simulação concluída' : 'Iniciar simulação da vistoria'}
      </button>

      <div className="shrink-0 rounded-md bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-neutral-400 hidden sm:block">
        Ambiente: Demonstração
      </div>
    </footer>
  );
}
