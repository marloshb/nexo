import { useMemo, useState } from 'react';
import { AGENTS, type AgentStatus } from '@/data/mockData';
import { AgentCard } from '@/components/shared/AgentCard';
import { KpiCard, Panel } from '@/components/shared/Primitives';
import { cls } from '@/lib/tokens';

const FILTERS: Array<{ key: 'todos' | AgentStatus; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'em_execucao', label: 'Em execução' },
  { key: 'aguardando_humano', label: 'Aguardando humano' },
  { key: 'concluido_alerta', label: 'Concluído com alerta' },
  { key: 'concluido', label: 'Concluído' },
];

export function AgentsView() {
  const [filter, setFilter] = useState<'todos' | AgentStatus>('todos');
  const filtered = useMemo(() => (filter === 'todos' ? AGENTS : AGENTS.filter((a) => a.status === filter)), [filter]);

  const counts = {
    execucao: AGENTS.filter((a) => ['em_execucao', 'coletando', 'analisando'].includes(a.status)).length,
    humano: AGENTS.filter((a) => a.status === 'aguardando_humano').length,
    alerta: AGENTS.filter((a) => a.status === 'concluido_alerta').length,
    concluido: AGENTS.filter((a) => a.status === 'concluido').length,
  };

  return (
    <div className="p-5 space-y-4 max-w-[1500px] mx-auto nexo-fade-in">
      <div>
        <h1 className="font-display text-[19px] font-semibold text-neutral-50">Nexo Agents</h1>
        <p className="text-[12px] text-neutral-500 mt-0.5">Central de agentes, automações e despachos — {AGENTS.length} agentes configurados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Em execução agora" value={String(counts.execucao)} icon="Activity" />
        <KpiCard label="Aguardando decisão humana" value={String(counts.humano)} icon="User" />
        <KpiCard label="Concluídos com alerta" value={String(counts.alerta)} icon="AlertTriangle" />
        <KpiCard label="Concluídos (24h)" value={String(counts.concluido + 38)} icon="CheckCircle2" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cls('rounded-full px-3 py-1.5 text-[11.5px] font-medium border transition-colors', filter === f.key ? 'bg-[#1584D1]/20 border-[#1584D1]/50 text-[#5FB4E8]' : 'border-white/10 text-neutral-400 hover:text-neutral-200')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((a) => <AgentCard key={a.id} agent={a} />)}
      </div>

      <Panel title="Sobre a governança dos agentes" subtitle="Gate humano obrigatório">
        <p className="text-[12px] text-neutral-400 leading-relaxed">
          Todo agente exibe as fontes e regras consultadas, mas não uma cadeia de raciocínio interna irrestrita. A aprovação, rejeição,
          desembolso, suspensão, alteração contratual ou sanção sempre exige decisão humana registrada em trilha de auditoria — os agentes
          recomendam e orquestram; não decidem sozinhos nessas ações.
        </p>
      </Panel>
    </div>
  );
}
