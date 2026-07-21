import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/lib/icons';
import { cls } from '@/lib/tokens';
import type { ProductKey } from '@/data/navConfig';
import {
  askNexo,
  hasSecureEndpoint,
  productDisplayName,
  suggestionsFor,
  type NexoAssistantReply,
  type NexoChatMessage,
} from '@/lib/nexoAssistant';

interface ChatMsg extends NexoChatMessage {
  sources?: string[];
  confidence?: number;
  mode?: NexoAssistantReply['mode'];
}

const START_MESSAGE: ChatMsg = {
  role: 'assistant',
  text: 'Olá, Marlos. Sou o Nexo AI. Posso analisar a carteira, explicar um módulo, resumir um ativo e indicar riscos, agentes e próximas decisões.',
  sources: ['Base sintética CAIXA Nexo'],
  confidence: 0.99,
  mode: 'local',
};


function MessageText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`}>
          {line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, partIndex) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={`${part}-${partIndex}`} className="font-semibold text-neutral-50">{part.slice(2, -2)}</strong>
              : <span key={`${part}-${partIndex}`}>{part}</span>
          )}
          {lineIndex < text.split('\n').length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

const ANALYSIS_STEPS = [
  'Identificando intenção e contexto…',
  'Consultando produtos e ativos relacionados…',
  'Cruzando riscos, evidências e decisões…',
  'Consolidando recomendação executiva…',
];

export function AskNexoPanel({
  open,
  onClose,
  product,
  activeAssetId,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductKey;
  activeAssetId?: string | null;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([START_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endpointConfigured = hasSecureEndpoint();
  const suggestions = useMemo(() => suggestionsFor(product), [product]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, analysisStep]);

  useEffect(() => {
    if (!loading) {
      setAnalysisStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setAnalysisStep((step) => Math.min(step + 1, ANALYSIS_STEPS.length - 1));
    }, 520);
    return () => window.clearInterval(timer);
  }, [loading]);

  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || loading) return;

    const userMessage: ChatMsg = { role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const reply = await askNexo(
        text,
        nextMessages.map(({ role, text: messageText }) => ({ role, text: messageText })),
        { product, activeAssetId },
      );
      setMessages((current) => [...current, {
        role: 'assistant',
        text: reply.answer,
        sources: reply.sources,
        confidence: reply.confidence,
        mode: reply.mode,
      }]);
    } catch {
      setError('Não foi possível processar a pergunta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([START_MESSAGE]);
    setInput('');
    setError(null);
  }

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="right" className="bg-[#0B2235] border-white/10 text-neutral-100 w-full sm:max-w-[470px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-white/8 shrink-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle className="font-display text-neutral-50 flex items-center gap-2">
                <span className="w-7 h-7 rounded-md bg-[#18B7D6]/20 flex items-center justify-center">
                  <Icon name="Sparkles" size={14} className="text-[#18B7D6]" />
                </span>
                Perguntar ao Nexo
              </SheetTitle>
              <SheetDescription className="text-neutral-400 text-[11.5px] mt-1">
                Contexto atual: {productDisplayName(product)}
              </SheetDescription>
            </div>
            <button onClick={resetChat} className="rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-neutral-400 hover:text-neutral-200" title="Limpar conversa">
              <Icon name="RotateCcw" size={12} className="inline mr-1" /> Limpar
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10.5px]">
            <span className={cls(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-1',
              endpointConfigured
                ? 'border-[#0FA39D]/30 bg-[#0FA39D]/10 text-[#67D6D0]'
                : 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC]',
            )}>
              <span className={cls('w-1.5 h-1.5 rounded-full', endpointConfigured ? 'bg-[#0FA39D]' : 'bg-[#18B7D6]')} />
              {endpointConfigured ? 'IA conectada por endpoint seguro' : 'Demonstração funcional local'}
            </span>
            <span className="text-neutral-600">Nenhuma chave exposta no navegador</span>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto nexo-scroll p-4 space-y-3">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={cls('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cls(
                'max-w-[88%] rounded-xl px-3.5 py-2.5 text-[12.5px] leading-relaxed whitespace-pre-wrap',
                message.role === 'user'
                  ? 'bg-[#1584D1] text-white'
                  : 'bg-white/[0.06] border border-white/10 text-neutral-200',
              )}>
                <MessageText text={message.text} />
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/8">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[9.5px] uppercase tracking-wide text-neutral-600">Fontes consultadas</span>
                      {typeof message.confidence === 'number' && (
                        <span className="text-[9.5px] text-neutral-500">confiança {Math.round(message.confidence * 100)}%</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source) => (
                        <span key={source} className="rounded-full bg-white/[0.06] border border-white/8 px-2 py-0.5 text-[9.5px] text-neutral-400">
                          {source}
                        </span>
                      ))}
                    </div>
                    {message.mode === 'fallback' && (
                      <div className="mt-1.5 text-[9.5px] text-[#E5A11A]">Endpoint indisponível; resposta produzida pela base local.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-[88%] rounded-xl px-3.5 py-3 bg-white/[0.06] border border-white/10">
                <div className="flex items-center gap-2 text-[12px] text-neutral-300">
                  <Icon name="Loader2" size={13} className="animate-spin text-[#18B7D6]" />
                  {ANALYSIS_STEPS[analysisStep]}
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-[#18B7D6] transition-all duration-500" style={{ width: `${25 + analysisStep * 24}%` }} />
                </div>
                <div className="mt-2 flex gap-1.5">
                  {['contexto', 'ativos', 'riscos', 'decisão'].map((item, index) => (
                    <span key={item} className={cls(
                      'rounded-full border px-1.5 py-0.5 text-[9px]',
                      index <= analysisStep ? 'border-[#18B7D6]/30 bg-[#18B7D6]/10 text-[#6FD8EC]' : 'border-white/8 text-neutral-600',
                    )}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <div className="text-[11.5px] text-[#D14A55] text-center rounded-md bg-[#D14A55]/8 border border-[#D14A55]/20 p-2">{error}</div>}
        </div>

        {messages.length <= 2 && (
          <div className="px-4 pb-2 shrink-0">
            <div className="text-[9.5px] uppercase tracking-wide text-neutral-600 mb-2">Perguntas sugeridas</div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  disabled={loading}
                  className="text-[10.5px] rounded-full border border-white/12 px-2.5 py-1.5 text-neutral-400 hover:text-neutral-200 hover:border-[#18B7D6]/40 disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3.5 border-t border-white/8 shrink-0">
          <form
            onSubmit={(event) => { event.preventDefault(); void send(input); }}
            className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1.5 focus-within:border-[#1584D1]"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pergunte sobre carteira, ativo, agente ou decisão…"
              className="flex-1 bg-transparent outline-none text-[12.5px] text-neutral-200 placeholder:text-neutral-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="p-1.5 rounded-md bg-[#1584D1] disabled:opacity-40 text-white shrink-0">
              <Icon name="Send" size={13} />
            </button>
          </form>
          <div className="mt-1.5 text-[9.5px] text-neutral-600 text-center">Dados sintéticos de demonstração. Decisões críticas exigem validação humana.</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
