import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import { cls } from '@/lib/tokens';

interface ChatMsg { role: 'user' | 'assistant'; text: string; }

const SYSTEM_PROMPT = `Você é o "Nexo AI", o assistente de inteligência do CAIXA Nexo — uma plataforma corporativa que conecta capital, programas, operações, projetos, contratos, execução, medições, desembolsos, ativos, serviços, beneficiários e evidências.

Responda sempre em português do Brasil, de forma direta, objetiva e executiva (parágrafos curtos ou tópicos, no máximo ~120 palavras a menos que o usuário peça mais detalhe). Baseie-se no contexto sintético de demonstração abaixo. Se a pergunta fugir desse escopo, responda com conhecimento geral sobre gestão de carteiras de infraestrutura, financiamento público e MRV, deixando claro quando estiver fora dos dados da plataforma. Nunca invente números específicos que não estejam no contexto ou que não sejam claramente estimativas.

CONTEXTO DA CARTEIRA (dados sintéticos de demonstração):
- Capital alocado: R$ 6,8 bi | Contratado: R$ 5,1 bi | Desembolsado: R$ 3,2 bi | Execução física média: 58%
- 8 ativos acompanhados em SP, PE, PA, CE, MG, RN, AM e GO, nos setores de saneamento, habitação, drenagem, recursos hídricos, mobilidade, energia, saúde e educação
- Caso em destaque: "Sistema Integrado de Esgotamento Vale Verde" (SP, NEXO-ASSET-BR-SP-3549904-SAN-000284) — R$ 480 milhões, execução física 64%, risco Crítico. A Medição nº 6 apresentou divergência espacial (desvio médio de 47m) em 3 trechos (T-14, T-17, T-22); o Agente de Inconsistências e Fraude recomendou vistoria; a Ordem OV-2026-0871 foi aberta; liberação parcial sugerida de R$ 15,7 milhões de R$ 18,4 milhões solicitados
- "Residencial Horizonte Azul" (PE) — 1.240 unidades habitacionais, execução 87%, prontidão operacional NÃO concedida por pendência de acesso viário
- "Programa de Macrodrenagem Rio Norte" (PA) — 14 ativos, 5 contratos, 3 municípios, execução 42%; evento climático simulado expôs 2 ativos; Agente de Risco Territorial e Climático recomendou reprogramação
- Demais ativos operando normalmente: Adutora Sertão Vivo (CE, saúde do ativo 91), Complexo Eólico Costa Branca (RN, saúde do ativo 87), Escola Técnica Cerrado (GO), com Corredor BRT Serra Azul (MG) e UBS Digital Norte (AM) em contratação/estruturação

Você também conhece os 11 produtos do Nexo (Control, Capital, Carteira, Estrutura, Contrata, Entrega, Evidência, Ativos, Impacto, Agents, Data) e os 12 agentes de IA da plataforma (Orquestrador, Funding e Covenants, Elegibilidade, Risco Territorial e Climático, Engenharia e Custos, Inconsistências e Fraude, Medição e Desembolso, Vistoria, Despachos e Diligências, Comissionamento, Saúde do Ativo, Impacto e MRV). Pode comentar sobre qualquer um deles.`;

export function AskNexoPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: 'Olá, Marlos. Sou o Nexo AI. Posso responder sobre a carteira, um ativo específico, um agente ou um produto do Nexo. O que você quer saber?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const nextMessages: ChatMsg[] = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      const textBlocks = (data.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text);
      const answer = textBlocks.join('\n').trim() || 'Não consegui gerar uma resposta agora. Tente reformular a pergunta.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (e) {
      setError('Não foi possível conectar ao serviço de IA no momento.');
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    'Por que o Vale Verde está crítico?',
    'O que o Agente de Risco Climático recomendou?',
    'Resuma a carteira nacional em 3 pontos',
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-white/8 shrink-0">
          <SheetTitle className="font-display text-neutral-50 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#18B7D6]/20 flex items-center justify-center"><Icon name="Sparkles" size={13} className="text-[#18B7D6]" /></span>
            Perguntar ao Nexo
          </SheetTitle>
          <SheetDescription className="text-neutral-400 text-[12px]">
            Respostas geradas em tempo real (Claude), fundamentadas nos dados sintéticos da plataforma.
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto nexo-scroll p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cls('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cls(
                  'max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                  m.role === 'user' ? 'bg-[#1584D1] text-white' : 'bg-white/[0.06] border border-white/10 text-neutral-200'
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-3.5 py-2.5 bg-white/[0.06] border border-white/10 flex items-center gap-2 text-[12.5px] text-neutral-400">
                <Icon name="Loader2" size={13} className="animate-spin" /> pensando…
              </div>
            </div>
          )}
          {error && <div className="text-[12px] text-[#D14A55] text-center">{error}</div>}
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-[11px] rounded-full border border-white/12 px-2.5 py-1 text-neutral-400 hover:text-neutral-200 hover:border-white/25">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-3.5 border-t border-white/8 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1.5 focus-within:border-[#1584D1]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre a carteira, um ativo ou um agente…"
              className="flex-1 bg-transparent outline-none text-[12.5px] text-neutral-200 placeholder:text-neutral-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="p-1.5 rounded-md bg-[#1584D1] disabled:opacity-40 text-white shrink-0">
              <Icon name="Send" size={13} />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
