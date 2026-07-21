import { useCallback, useEffect, useRef, useState } from 'react';
import { TopBar } from '@/components/shell/TopBar';
import { Sidebar } from '@/components/shell/Sidebar';
import { RightPanel } from '@/components/shell/RightPanel';
import { FooterBar } from '@/components/shell/FooterBar';
import { AskNexoPanel } from '@/components/AskNexo';
import { PresentationWizard } from '@/components/PresentationWizard';
import { HubView } from '@/components/views/HubView';
import { ControlView } from '@/components/views/ControlView';
import { AtivosView } from '@/components/views/AtivosView';
import { EntregaView } from '@/components/views/EntregaView';
import { EvidenciaView } from '@/components/views/EvidenciaView';
import { AgentsView } from '@/components/views/AgentsView';
import { CapitalView } from '@/components/views/CapitalView';
import { CarteiraView } from '@/components/views/CarteiraView';
import { EstruturaView } from '@/components/views/EstruturaView';
import { ContrataView } from '@/components/views/ContrataView';
import { ImpactoView } from '@/components/views/ImpactoView';
import { DataView } from '@/components/views/DataView';
import { Ativo360View } from '@/components/views/Ativo360View';
import { ASSETS, INITIAL_EVENTS, DEMO_SCRIPT, INITIAL_AUDIT, AGENTS, type AuditEntry, type EventItem } from '@/data/mockData';
import type { ProductKey } from '@/data/navConfig';
import type { ControlSection } from '@/data/controlData';
import type { CapitalSection } from '@/data/capitalData';
import type { CarteiraSection } from '@/data/carteiraData';
import type { EstruturaSection } from '@/data/estruturaData';
import type { ContrataSection } from '@/data/contrataData';
import type { EntregaSection } from '@/data/entregaData';
import type { EvidenciaSection } from '@/data/evidenciaData';
import type { AtivosSection } from '@/data/ativosData';
import type { ImpactoSection } from '@/data/impactoData';
import type { AgentsSection } from '@/data/agentsData';
import type { DataSection } from '@/data/dataData';
import { nowStr } from '@/lib/tokens';
import { PRESENTATION_ASSET_ID, type PresentationStep } from '@/data/presentationData';
import { NEXO_THEME_STORAGE_KEY, type NexoTheme } from '@/lib/theme';

export type VistoriaStage = 'agendada' | 'designada' | 'em_campo' | 'sincronizada' | 'validacao' | 'concluida';


export default function App() {
  const [product, setProductState] = useState<ProductKey>('hub');
  const [theme, setTheme] = useState<NexoTheme>(() => {
    const saved = localStorage.getItem(NEXO_THEME_STORAGE_KEY);
    return saved === 'office-light' ? 'office-light' : 'executive-dark';
  });
  const [prevProduct, setPrevProduct] = useState<ProductKey>('hub');
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [controlSection, setControlSection] = useState<ControlSection>('overview');
  const [capitalSection, setCapitalSection] = useState<CapitalSection>('overview');
  const [carteiraSection, setCarteiraSection] = useState<CarteiraSection>('overview');
  const [estruturaSection, setEstruturaSection] = useState<EstruturaSection>('overview');
  const [contrataSection, setContrataSection] = useState<ContrataSection>('overview');
  const [entregaSection, setEntregaSection] = useState<EntregaSection>('overview');
  const [evidenciaSection, setEvidenciaSection] = useState<EvidenciaSection>('overview');
  const [ativosSection, setAtivosSection] = useState<AtivosSection>('overview');
  const [impactoSection, setImpactoSection] = useState<ImpactoSection>('overview');
  const [agentsSection, setAgentsSection] = useState<AgentsSection>('cockpit');
  const [dataSection, setDataSection] = useState<DataSection>('overview');

  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [vistoriaStage, setVistoriaStage] = useState<VistoriaStage>('agendada');
  const [decision, setDecision] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStepIdx, setDemoStepIdx] = useState(0);
  const auditIdRef = useRef(1000);

  useEffect(() => {
    document.documentElement.dataset.nexoTheme = theme;
    document.documentElement.style.colorScheme = theme === 'office-light' ? 'light' : 'dark';
    localStorage.setItem(NEXO_THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => current === 'executive-dark' ? 'office-light' : 'executive-dark');
  }

  function setProduct(p: ProductKey) {
    setProductState(p);
  }

  function openAsset(id: string, from?: ProductKey) {
    setPrevProduct(from ?? product);
    setActiveAssetId(id);
    setProductState('ativo360');
  }
  function closeAsset() {
    setProductState(prevProduct);
    setActiveAssetId(null);
  }

  const pushEvent = useCallback((text: string, type: EventItem['type']) => {
    setEvents((prev) => [...prev, { t: nowStr(), text, type }]);
  }, []);
  function pushAudit(action: string, detail: string) {
    auditIdRef.current += 1;
    setAuditTrail((prev) => [{ id: auditIdRef.current, t: nowStr(), user: 'Marlos Batista', action, detail }, ...prev]);
  }

  useEffect(() => {
    if (!demoRunning) return;
    if (demoStepIdx >= DEMO_SCRIPT.length) {
      setDemoRunning(false);
      return;
    }
    const timer = setTimeout(() => {
      const step = DEMO_SCRIPT[demoStepIdx];
      pushEvent(step.text, step.type);
      if (step.vistoriaStage) setVistoriaStage(step.vistoriaStage as VistoriaStage);
      setDemoStepIdx((i) => i + 1);
    }, 1900);
    return () => clearTimeout(timer);
  }, [demoRunning, demoStepIdx, pushEvent]);

  function toggleDemo() {
    setDemoRunning((v) => !v);
  }

  function handleDecision(action: 'parcial' | 'diligenciar' | 'suspender') {
    const label =
      action === 'parcial'
        ? 'Desembolso parcial aprovado: R$ 15,7 milhões liberados; R$ 2,65 milhões mantidos retidos até nova verificação.'
        : action === 'diligenciar'
        ? 'Diligência aberta para os itens divergentes — proponente notificado para manifestação em até 5 dias úteis.'
        : 'Trecho T-22 suspenso — execução interrompida até resolução da divergência geométrica.';
    setDecision(label);
    pushAudit(
      action === 'parcial' ? 'Desembolso parcial aprovado' : action === 'diligenciar' ? 'Diligência aberta' : 'Trecho suspenso',
      label
    );
    pushEvent(`Decisão registrada: ${label}`, 'success');
  }

  function navigatePresentationStep(step: PresentationStep) {
    if (step.product === 'ativo360') {
      setPrevProduct('control');
      setActiveAssetId(PRESENTATION_ASSET_ID);
      setProductState('ativo360');
      return;
    }
    setActiveAssetId(null);
    setProductState(step.product);
    if (step.product === 'control') setControlSection(step.section as ControlSection);
    if (step.product === 'capital') setCapitalSection(step.section as CapitalSection);
    if (step.product === 'carteira') setCarteiraSection(step.section as CarteiraSection);
    if (step.product === 'estrutura') setEstruturaSection(step.section as EstruturaSection);
    if (step.product === 'contrata') setContrataSection(step.section as ContrataSection);
    if (step.product === 'entrega') setEntregaSection(step.section as EntregaSection);
    if (step.product === 'evidencia') setEvidenciaSection(step.section as EvidenciaSection);
    if (step.product === 'ativos') setAtivosSection(step.section as AtivosSection);
    if (step.product === 'impacto') setImpactoSection(step.section as ImpactoSection);
    if (step.product === 'agents') setAgentsSection(step.section as AgentsSection);
    if (step.product === 'data') setDataSection(step.section as DataSection);
  }

  function runPresentationLive() {
    if (!demoRunning) {
      setDemoStepIdx(0);
      setVistoriaStage('agendada');
      setDemoRunning(true);
      pushEvent('Modo apresentação: simulação ao vivo iniciada para o caso Vale Verde', 'info');
    } else {
      setDemoRunning(false);
      pushEvent('Modo apresentação: simulação ao vivo pausada', 'warning');
    }
  }

  const asset = ASSETS.find((a) => a.id === activeAssetId) ?? null;
  const demoDone = demoStepIdx >= DEMO_SCRIPT.length;

  return (
    <div className="nexo-app-shell w-full min-h-screen flex flex-col">
      <TopBar
        product={product}
        onNavigateHub={() => setProduct('hub')}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onOpenAsk={() => setAskOpen(true)}
        onOpenPresentation={() => setPresentationOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectAsset={(id) => openAsset(id, product)}
      />
      <div className="flex flex-1 min-h-0">
        {product !== 'ativo360' && (
          <Sidebar
            product={product}
            collapsed={sidebarCollapsed}
            onNavigate={setProduct}
            activeItemId={product === 'control' ? controlSection : product === 'capital' ? capitalSection : product === 'carteira' ? carteiraSection : product === 'estrutura' ? estruturaSection : product === 'contrata' ? contrataSection : product === 'entrega' ? entregaSection : product === 'evidencia' ? evidenciaSection : product === 'ativos' ? ativosSection : product === 'impacto' ? impactoSection : product === 'agents' ? agentsSection : product === 'data' ? dataSection : undefined}
            onItemSelect={product === 'control' ? (id) => setControlSection(id as ControlSection) : product === 'capital' ? (id) => setCapitalSection(id as CapitalSection) : product === 'carteira' ? (id) => setCarteiraSection(id as CarteiraSection) : product === 'estrutura' ? (id) => setEstruturaSection(id as EstruturaSection) : product === 'contrata' ? (id) => setContrataSection(id as ContrataSection) : product === 'entrega' ? (id) => setEntregaSection(id as EntregaSection) : product === 'evidencia' ? (id) => setEvidenciaSection(id as EvidenciaSection) : product === 'ativos' ? (id) => setAtivosSection(id as AtivosSection) : product === 'impacto' ? (id) => setImpactoSection(id as ImpactoSection) : product === 'agents' ? (id) => setAgentsSection(id as AgentsSection) : product === 'data' ? (id) => setDataSection(id as DataSection) : undefined}
          />
        )}

        <main className="flex-1 min-w-0 overflow-y-auto nexo-scroll">
          {product === 'hub' && <HubView onOpenProduct={setProduct} onOpenAsset={(id) => openAsset(id, 'hub')} />}
          {product === 'control' && (
            <ControlView
              section={controlSection}
              onSectionChange={setControlSection}
              onOpenAsset={(id) => openAsset(id, 'control')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'ativos' && (
            <AtivosView
              section={ativosSection}
              onSectionChange={setAtivosSection}
              onOpenAsset={(id) => openAsset(id, 'ativos')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'entrega' && (
            <EntregaView
              section={entregaSection}
              onSectionChange={setEntregaSection}
              onOpenAsset={(id) => openAsset(id, 'entrega')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
              vistoriaStage={vistoriaStage}
              onDecision={handleDecision}
              decision={decision}
            />
          )}
          {product === 'evidencia' && (
            <EvidenciaView
              section={evidenciaSection}
              onSectionChange={setEvidenciaSection}
              onOpenAsset={(id) => openAsset(id, 'evidencia')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
              vistoriaStage={vistoriaStage}
              demoStepIdx={demoStepIdx}
              demoRunning={demoRunning}
            />
          )}
          {product === 'agents' && (
            <AgentsView
              section={agentsSection}
              onSectionChange={setAgentsSection}
              onOpenAsset={(id) => openAsset(id, 'agents')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'capital' && (
            <CapitalView
              section={capitalSection}
              onSectionChange={setCapitalSection}
              onOpenAsset={(id) => openAsset(id, 'capital')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'carteira' && (
            <CarteiraView
              section={carteiraSection}
              onSectionChange={setCarteiraSection}
              onOpenAsset={(id) => openAsset(id, 'carteira')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'estrutura' && (
            <EstruturaView
              section={estruturaSection}
              onSectionChange={setEstruturaSection}
              onOpenAsset={(id) => openAsset(id, 'estrutura')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'contrata' && (
            <ContrataView
              section={contrataSection}
              onSectionChange={setContrataSection}
              onOpenAsset={(id) => openAsset(id, 'contrata')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'impacto' && (
            <ImpactoView
              section={impactoSection}
              onSectionChange={setImpactoSection}
              onOpenAsset={(id) => openAsset(id, 'impacto')}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'data' && (
            <DataView
              section={dataSection}
              onSectionChange={setDataSection}
              onNavigateProduct={setProduct}
              events={events}
              onPushEvent={pushEvent}
            />
          )}
          {product === 'ativo360' && asset && (
            <Ativo360View
              asset={asset}
              onClose={closeAsset}
              vistoriaStage={vistoriaStage}
              decision={decision}
              auditTrail={auditTrail}
              onNavigateProduct={(p) => setProduct(p)}
            />
          )}
        </main>

        {product !== 'ativo360' && rightPanelOpen && (
          <RightPanel
            onClose={() => setRightPanelOpen(false)}
            product={product}
            onNavigate={setProduct}
            onOpenAsset={(id) => openAsset(id, product)}
            onOpenAsk={() => setAskOpen(true)}
            onPushEvent={pushEvent}
          />
        )}
        {product !== 'ativo360' && !rightPanelOpen && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="w-8 shrink-0 border-l border-white/10 bg-[#0B2235]/70 flex items-start justify-center pt-3 text-neutral-500 hover:text-neutral-300"
          >
            <span style={{ writingMode: 'vertical-rl' }} className="text-[10px] tracking-wide">CONTEXTO</span>
          </button>
        )}
      </div>

      <FooterBar events={events} agents={AGENTS} demoRunning={demoRunning} onToggleDemo={toggleDemo} demoDone={demoDone} />
      <AskNexoPanel open={askOpen} onClose={() => setAskOpen(false)} product={product} activeAssetId={activeAssetId} />
      <PresentationWizard
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        onNavigateStep={navigatePresentationStep}
        onRunLive={runPresentationLive}
      />
    </div>
  );
}
