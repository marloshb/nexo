
import { Icon } from '@/lib/icons';
import { AGENTS } from '@/data/mockData';
import { Pill } from '@/components/shared/Primitives';

export function RightPanel({ onClose }: { onClose: () => void }) {
  const alerts = AGENTS.filter((a) => a.status === 'concluido_alerta' || a.status === 'aguardando_humano');

  return (
    <aside className="w-[280px] shrink-0 border-l border-white/10 bg-[#0B2235]/70 flex flex-col">
      <div className="h-11 shrink-0 flex items-center justify-between px-3.5 border-b border-white/8">
        <span className="text-[11px] uppercase tracking-wide font-semibold text-neutral-400">Painel de contexto</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/8 text-neutral-500"><Icon name="PanelRightClose" size={14} /></button>
      </div>

      <div className="flex-1 overflow-y-auto nexo-scroll p-3 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">
            <Icon name="Sparkles" size={12} className="text-[#18B7D6]" /> Recomendações da IA
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <div className="text-[11px] text-neutral-500 mb-1">{a.name}</div>
                <div className="text-[12px] text-neutral-200 leading-snug">{a.recommendation}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">
            <Icon name="ShieldAlert" size={12} className="text-[#E5A11A]" /> Riscos identificados
          </div>
          <div className="space-y-1.5">
            {['Divergência geométrica — Vale Verde', 'Exposição climática — Rio Norte', 'Acesso viário — Horizonte Azul'].map((r) => (
              <div key={r} className="flex items-center gap-2 text-[12px] text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D14A55] shrink-0" /> {r}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">
            <Icon name="FileText" size={12} /> Documentos relacionados
          </div>
          <div className="space-y-1">
            {['Boletim de medição nº 6.pdf', 'Baseline contratual CT-2025-SAN-0142.pdf', 'Laudo de vistoria OV-2026-0871.pdf'].map((d) => (
              <button key={d} className="w-full flex items-center gap-2 text-[11.5px] text-neutral-400 hover:text-neutral-200 py-1 truncate">
                <Icon name="FileCheck" size={12} className="shrink-0" /><span className="truncate">{d}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">
            <Icon name="Users" size={12} /> Responsáveis
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Pill>Ana Beatriz Souza</Pill>
            <Pill>Fernanda Ribeiro</Pill>
            <Pill>Eng. Paulo R. Menezes</Pill>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">
            <Icon name="CalendarClock" size={12} /> Próximos marcos
          </div>
          <div className="space-y-1.5 text-[12px] text-neutral-300">
            <div className="flex justify-between"><span>Laudo de vistoria OV-2026-0871</span><span className="text-neutral-500 tnum">2 dias</span></div>
            <div className="flex justify-between"><span>Comitê de reprogramação — Rio Norte</span><span className="text-neutral-500 tnum">5 dias</span></div>
            <div className="flex justify-between"><span>Certificado de prontidão — Horizonte Azul</span><span className="text-neutral-500 tnum">12 dias</span></div>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-2">Ações rápidas</div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: 'ClipboardCheck', label: 'Nova vistoria' },
              { icon: 'FileText', label: 'Gerar relatório' },
              { icon: 'Send', label: 'Emitir despacho' },
              { icon: 'Download', label: 'Exportar dados' },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] py-2.5 hover:bg-white/[0.07] transition-colors">
                <Icon name={a.icon} size={15} className="text-neutral-400" />
                <span className="text-[10.5px] text-neutral-400 text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
