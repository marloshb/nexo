import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message?: string }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CAIXA Nexo runtime error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071521] p-6 text-neutral-100">
        <section className="max-w-xl rounded-2xl border border-[#C74D5A]/30 bg-[#0B2235] p-6 shadow-2xl">
          <div className="text-lg font-semibold">A aplicação encontrou um erro de inicialização</div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            A home foi protegida para não permanecer em branco. Recarregue a página; caso o erro continue, consulte o console do navegador.
          </p>
          {this.state.message && <pre className="mt-4 overflow-auto rounded-lg bg-black/25 p-3 text-xs text-[#E47780]">{this.state.message}</pre>}
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-[#1584D1] px-4 py-2 text-sm text-white">Recarregar aplicação</button>
        </section>
      </main>
    );
  }
}
