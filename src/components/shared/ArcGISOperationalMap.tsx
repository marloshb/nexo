import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/lib/icons';
import { ARCGIS_PUBLIC_LAYERS, EMBEDDED_OPERATIONAL_LAYERS } from '@/data/arcgisLayerCatalog';

export interface ArcGISPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city?: string;
  uf?: string;
  status?: string;
  sector?: string;
  value?: number;
  beneficiaries?: number;
  sublabel?: string;
}

interface ArcGISOperationalMapProps {
  points: ArcGISPoint[];
  height?: number;
  selectedId?: string | null;
  onSelectPoint?: (id: string) => void;
  context?: string;
}

type LayerState = {
  visible: boolean;
  opacity: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const STATUS_COLORS: Record<string, string> = {
  normal: '#16A394',
  atencao: '#E5A11A',
  critico: '#C74D5A',
  bloqueado: '#8E3340',
  pendente: '#7A8C99',
  validada: '#16A394',
  ativa: '#1584D1',
};

function money(value?: number) {
  if (!value) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function ArcGISOperationalMap({ points, height = 420, selectedId, onSelectPoint, context = 'Portfólio Nexo' }: ArcGISOperationalMapProps) {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const layerRefs = useRef<Record<string, any>>({});
  const [ready, setReady] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [basemap, setBasemap] = useState<'osm' | 'satellite' | 'gray-vector'>('osm');
  const [layerState, setLayerState] = useState<Record<string, LayerState>>(() => {
    const entries: [string, LayerState][] = [
      ...ARCGIS_PUBLIC_LAYERS.map((layer) => [layer.id, { visible: layer.visible, opacity: layer.opacity, status: 'idle' } as LayerState] as [string, LayerState]),
      ...EMBEDDED_OPERATIONAL_LAYERS.map((layer, index) => [layer.id, { visible: index < 2, opacity: index === 0 ? 0.92 : 0.75, status: 'idle' } as LayerState] as [string, LayerState]),
    ];
    return Object.fromEntries(entries);
  });

  const mapPoints = useMemo(() => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)), [points]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function initialize() {
      if (!mapDiv.current) return;
      try {
        const arcgis = await waitForArcGIS();
        if (!arcgis) throw new Error('ArcGIS Maps SDK indisponível.');
        const [Map, MapView, FeatureLayer, Graphic, Point, Polyline, Layer, esriConfig] = await arcgis.import([
          "@arcgis/core/Map.js",
          "@arcgis/core/views/MapView.js",
          "@arcgis/core/layers/FeatureLayer.js",
          "@arcgis/core/Graphic.js",
          "@arcgis/core/geometry/Point.js",
          "@arcgis/core/geometry/Polyline.js",
          "@arcgis/core/layers/Layer.js",
          "@arcgis/core/config.js",
        ]);

        if (cancelled) return;
        const apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string | undefined;
        if (apiKey) esriConfig.apiKey = apiKey;

        const map = new Map({ basemap: 'osm' as any });
        const view = new MapView({
          container: mapDiv.current as HTMLDivElement,
          map,
          center: [-52.7, -14.2],
          zoom: 4,
          constraints: { minZoom: 3, maxZoom: 18 },
          popup: { dockEnabled: true, dockOptions: { position: 'bottom-right', buttonEnabled: false } },
          ui: { components: ['attribution', 'zoom'] },
        });
        viewRef.current = view;

        const assetGraphics = mapPoints.map((p, index) => new Graphic({
          geometry: new Point({ longitude: p.lon, latitude: p.lat }),
          attributes: {
            OBJECTID: index + 1,
            id: p.id,
            name: p.name,
            city: p.city ?? '',
            uf: p.uf ?? '',
            status: p.status ?? 'ativa',
            sector: p.sector ?? context,
            value: p.value ?? 0,
            beneficiaries: p.beneficiaries ?? 0,
            sublabel: p.sublabel ?? '',
          },
        }));

        const assetsLayer = new FeatureLayer({
          id: 'nexo-assets',
          title: 'Ativos financiados e acompanhados',
          source: assetGraphics,
          objectIdField: 'OBJECTID',
          geometryType: 'point',
          spatialReference: { wkid: 4326 },
          fields: [
            { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' },
            { name: 'id', alias: 'Identificador Nexo', type: 'string' },
            { name: 'name', alias: 'Ativo / projeto', type: 'string' },
            { name: 'city', alias: 'Município', type: 'string' },
            { name: 'uf', alias: 'UF', type: 'string' },
            { name: 'status', alias: 'Situação', type: 'string' },
            { name: 'sector', alias: 'Setor', type: 'string' },
            { name: 'value', alias: 'Valor', type: 'double' },
            { name: 'beneficiaries', alias: 'Beneficiários', type: 'double' },
            { name: 'sublabel', alias: 'Contexto', type: 'string' },
          ],
          renderer: {
            type: 'unique-value',
            field: 'status',
            defaultSymbol: { type: 'simple-marker', color: '#1584D1', size: 8, outline: { color: '#071521', width: 1 } },
            uniqueValueInfos: Object.entries(STATUS_COLORS).map(([value, color]) => ({
              value,
              symbol: { type: 'simple-marker', color, size: value === 'critico' ? 11 : 8, outline: { color: '#071521', width: 1.2 } },
            })),
          } as any,
          popupTemplate: {
            title: '{name}',
            content: [
              { type: 'fields', fieldInfos: [
                { fieldName: 'id', label: 'Identificador' },
                { fieldName: 'city', label: 'Município' },
                { fieldName: 'uf', label: 'UF' },
                { fieldName: 'sector', label: 'Setor' },
                { fieldName: 'status', label: 'Situação' },
                { fieldName: 'value', label: 'Valor', format: { digitSeparator: true, places: 0 } },
                { fieldName: 'beneficiaries', label: 'Beneficiários', format: { digitSeparator: true, places: 0 } },
                { fieldName: 'sublabel', label: 'Contexto' },
              ] },
            ],
          },
          visible: layerState['nexo-assets'].visible,
          opacity: layerState['nexo-assets'].opacity,
        });
        map.add(assetsLayer);
        layerRefs.current['nexo-assets'] = assetsLayer;

        const hotspotGraphics = mapPoints.filter((_, i) => i % 5 === 0).map((p, index) => new Graphic({
          geometry: new Point({ longitude: p.lon + 0.035 * ((index % 3) - 1), latitude: p.lat + 0.025 * ((index % 4) - 1.5) }),
          attributes: { OBJECTID: index + 1, id: `HOT-${p.id}`, name: `Inconsistência · ${p.name}`, risk: 62 + (index % 35), assetId: p.id },
        }));
        const hotspotsLayer = new FeatureLayer({
          id: 'nexo-evidence-hotspots', title: 'Hotspots de evidências e inconsistências', source: hotspotGraphics,
          objectIdField: 'OBJECTID', geometryType: 'point', spatialReference: { wkid: 4326 },
          fields: [
            { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' }, { name: 'id', alias: 'ID', type: 'string' },
            { name: 'name', alias: 'Ocorrência', type: 'string' }, { name: 'risk', alias: 'Risco', type: 'integer' },
            { name: 'assetId', alias: 'Ativo', type: 'string' },
          ],
          renderer: { type: 'simple', symbol: { type: 'simple-marker', style: 'diamond', color: '#E5A11A', size: 9, outline: { color: '#071521', width: 1 } } } as any,
          popupTemplate: { title: '{name}', content: 'Risco calculado: <b>{risk}%</b><br/>Ativo: {assetId}' },
          visible: layerState['nexo-evidence-hotspots'].visible, opacity: layerState['nexo-evidence-hotspots'].opacity,
        });
        map.add(hotspotsLayer); layerRefs.current['nexo-evidence-hotspots'] = hotspotsLayer;

        const inspectionGraphics = mapPoints.filter((_, i) => i % 11 === 0).map((p, index) => new Graphic({
          geometry: new Point({ longitude: p.lon - 0.05, latitude: p.lat + 0.04 }),
          attributes: { OBJECTID: index + 1, id: `VIS-${1000 + index}`, name: `Equipe de vistoria ${index + 1}`, status: index % 3 === 0 ? 'Em campo' : 'Agendada', assetId: p.id },
        }));
        const inspectionsLayer = new FeatureLayer({
          id: 'nexo-inspection-teams', title: 'Equipes e ordens de vistoria', source: inspectionGraphics,
          objectIdField: 'OBJECTID', geometryType: 'point', spatialReference: { wkid: 4326 },
          fields: [
            { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' }, { name: 'id', alias: 'Ordem', type: 'string' },
            { name: 'name', alias: 'Equipe', type: 'string' }, { name: 'status', alias: 'Status', type: 'string' },
            { name: 'assetId', alias: 'Ativo', type: 'string' },
          ],
          renderer: { type: 'simple', symbol: { type: 'simple-marker', style: 'triangle', color: '#18B7D6', size: 10, outline: { color: '#071521', width: 1 } } } as any,
          popupTemplate: { title: '{name}', content: 'Ordem: {id}<br/>Situação: {status}<br/>Ativo: {assetId}' },
          visible: false, opacity: 0.85,
        });
        map.add(inspectionsLayer); layerRefs.current['nexo-inspection-teams'] = inspectionsLayer;

        const beneficiaryGraphics = mapPoints.filter((_, i) => i % 3 === 0).map((p, index) => new Graphic({
          geometry: new Point({ longitude: p.lon, latitude: p.lat }),
          attributes: { OBJECTID: index + 1, name: p.name, beneficiaries: p.beneficiaries || 12000 + index * 2300 },
        }));
        const beneficiariesLayer = new FeatureLayer({
          id: 'nexo-beneficiary-clusters', title: 'Concentrações de beneficiários', source: beneficiaryGraphics,
          objectIdField: 'OBJECTID', geometryType: 'point', spatialReference: { wkid: 4326 },
          fields: [
            { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' }, { name: 'name', alias: 'Ativo', type: 'string' },
            { name: 'beneficiaries', alias: 'Beneficiários', type: 'double' },
          ],
          renderer: { type: 'simple', symbol: { type: 'simple-marker', color: [18, 132, 209, 0.22], size: 20, outline: { color: '#5FB4E8', width: 1 } }, visualVariables: [{ type: 'size', field: 'beneficiaries', minDataValue: 1000, maxDataValue: 250000, minSize: 8, maxSize: 35 }] } as any,
          popupTemplate: { title: '{name}', content: 'Beneficiários estimados: <b>{beneficiaries}</b>' }, visible: false, opacity: 0.7,
        });
        map.add(beneficiariesLayer); layerRefs.current['nexo-beneficiary-clusters'] = beneficiariesLayer;

        const alertTypes = ['Cheia', 'Calor extremo', 'Seca', 'Deslizamento'];
        const alertGraphics = mapPoints.filter((_, i) => i % 9 === 0).map((p, index) => new Graphic({
          geometry: new Point({ longitude: p.lon + 0.08, latitude: p.lat - 0.05 }),
          attributes: { OBJECTID: index + 1, name: alertTypes[index % alertTypes.length], severity: 55 + (index * 7) % 44, assetId: p.id },
        }));
        const alertsLayer = new FeatureLayer({
          id: 'nexo-climate-alerts', title: 'Alertas climáticos associados aos ativos', source: alertGraphics,
          objectIdField: 'OBJECTID', geometryType: 'point', spatialReference: { wkid: 4326 },
          fields: [
            { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' }, { name: 'name', alias: 'Ameaça', type: 'string' },
            { name: 'severity', alias: 'Severidade', type: 'integer' }, { name: 'assetId', alias: 'Ativo', type: 'string' },
          ],
          renderer: { type: 'simple', symbol: { type: 'simple-marker', style: 'x', color: '#C74D5A', size: 11, outline: { color: '#C74D5A', width: 2 } } } as any,
          popupTemplate: { title: '{name}', content: 'Severidade: <b>{severity}%</b><br/>Ativo: {assetId}' }, visible: false,
        });
        map.add(alertsLayer); layerRefs.current['nexo-climate-alerts'] = alertsLayer;

        const dependencyGraphics = mapPoints.slice(0, Math.min(35, mapPoints.length - 1)).map((p, index) => {
          const target = mapPoints[(index + 7) % mapPoints.length];
          return new Graphic({
            geometry: new Polyline({ paths: [[[p.lon, p.lat], [target.lon, target.lat]]], spatialReference: { wkid: 4326 } }),
            attributes: { OBJECTID: index + 1, sourceName: p.name, targetName: target.name, criticality: 45 + (index * 9) % 50 },
          });
        });
        const dependenciesLayer = new FeatureLayer({
          id: 'nexo-dependencies', title: 'Dependências entre ativos e redes', source: dependencyGraphics,
          objectIdField: 'OBJECTID', geometryType: 'polyline', spatialReference: { wkid: 4326 },
          fields: [
            { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' }, { name: 'sourceName', alias: 'Origem', type: 'string' },
            { name: 'targetName', alias: 'Destino', type: 'string' }, { name: 'criticality', alias: 'Criticidade', type: 'integer' },
          ],
          renderer: { type: 'simple', symbol: { type: 'simple-line', color: [24, 183, 214, 0.45], width: 1.2, style: 'dash' } } as any,
          popupTemplate: { title: 'Dependência territorial', content: '{sourceName}<br/>↳ {targetName}<br/>Criticidade: {criticality}%' }, visible: false,
        });
        map.add(dependenciesLayer); layerRefs.current['nexo-dependencies'] = dependenciesLayer;

        setLayerState((current) => {
          const next = { ...current };
          for (const layer of EMBEDDED_OPERATIONAL_LAYERS) next[layer.id] = { ...next[layer.id], status: 'ready' };
          return next;
        });

        for (const definition of ARCGIS_PUBLIC_LAYERS) {
          setLayerState((current) => ({ ...current, [definition.id]: { ...current[definition.id], status: 'loading' } }));
          try {
            const layer = await Layer.fromPortalItem({ portalItem: { id: definition.portalItemId } });
            layer.id = definition.id;
            layer.title = definition.title;
            layer.opacity = definition.opacity;
            layer.visible = definition.visible;
            if (definition.minScale) layer.minScale = definition.minScale;
            map.add(layer);
            layerRefs.current[definition.id] = layer;
            setLayerState((current) => ({ ...current, [definition.id]: { ...current[definition.id], status: 'ready' } }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Camada indisponível';
            setLayerState((current) => ({ ...current, [definition.id]: { ...current[definition.id], status: 'error', error: message } }));
          }
        }

        await view.when();
        if (mapPoints.length > 0) {
          try { await view.goTo(assetsLayer.fullExtent?.expand(1.15), { duration: 700 }); } catch { /* mantém visão Brasil */ }
        }
        const clickHandle = view.on('click', async (event: any) => {
          const hit = await view.hitTest(event, { include: assetsLayer });
          const result = hit.results?.find((r: any) => r.graphic?.layer?.id === 'nexo-assets');
          const id = result?.graphic?.attributes?.id;
          if (id) onSelectPoint?.(id);
        });
        setReady(true);
        cleanup = () => { clickHandle.remove(); view.destroy(); };
      } catch (error) {
        setFatalError(error instanceof Error ? error.message : 'Não foi possível iniciar o ArcGIS Maps SDK.');
      }
    }

    initialize();
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !selectedId) return;
    const layer = layerRefs.current['nexo-assets'];
    if (!layer) return;
    layer.queryFeatures({ where: `id='${selectedId.replaceAll("'", "''")}'`, returnGeometry: true, outFields: ['*'] }).then((result: any) => {
      const feature = result.features?.[0];
      if (feature) {
        view.goTo({ target: feature.geometry, zoom: 11 }, { duration: 600 }).catch(() => undefined);
        view.openPopup({ features: [feature], location: feature.geometry });
      }
    }).catch(() => undefined);
  }, [selectedId]);

  function toggleLayer(id: string) {
    setLayerState((current) => {
      const nextVisible = !current[id].visible;
      const layer = layerRefs.current[id];
      if (layer) layer.visible = nextVisible;
      return { ...current, [id]: { ...current[id], visible: nextVisible } };
    });
  }

  function changeOpacity(id: string, opacity: number) {
    setLayerState((current) => {
      const layer = layerRefs.current[id];
      if (layer) layer.opacity = opacity;
      return { ...current, [id]: { ...current[id], opacity } };
    });
  }

  function changeBasemap(value: 'osm' | 'satellite' | 'gray-vector') {
    setBasemap(value);
    if (viewRef.current?.map) viewRef.current.map.basemap = value;
  }

  const publicByCategory = useMemo(() => ARCGIS_PUBLIC_LAYERS.reduce<Record<string, typeof ARCGIS_PUBLIC_LAYERS>>((groups, layer) => {
    (groups[layer.category] ??= []).push(layer);
    return groups;
  }, {}), []);

  if (fatalError) {
    return <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-[#C74D5A]/30 bg-[#C74D5A]/8 p-6 text-center text-xs text-neutral-300"><div><Icon name="TriangleAlert" size={24} className="mx-auto mb-2 text-[#E47780]"/><div className="font-medium">Mapa ArcGIS indisponível</div><div className="mt-1 text-neutral-500">{fatalError}</div></div></div>;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#071521]" style={{ height }}>
      <div ref={mapDiv} className="absolute inset-0" />
      {!ready && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#071521]/82 backdrop-blur-sm"><div className="text-center"><Icon name="LoaderCircle" size={24} className="mx-auto animate-spin text-[#18B7D6]"/><div className="mt-2 text-[11px] text-neutral-300">Inicializando ArcGIS e carregando camadas públicas…</div></div></div>}

      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-[#071521]/88 p-1 shadow-xl backdrop-blur-md">
        {(['osm', 'satellite', 'gray-vector'] as const).map((item) => <button key={item} onClick={() => changeBasemap(item)} className={`rounded px-2 py-1 text-[9.5px] transition-colors ${basemap === item ? 'bg-[#1584D1] text-white' : 'text-neutral-400 hover:bg-white/10'}`}>{item === 'osm' ? 'Ruas' : item === 'satellite' ? 'Imagem' : 'Cinza'}</button>)}
      </div>

      <button onClick={() => setPanelOpen((value) => !value)} className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#071521]/90 px-2.5 py-1.5 text-[10px] text-neutral-200 shadow-xl backdrop-blur-md hover:bg-[#0B2235]"><Icon name="Layers3" size={13}/>{panelOpen ? 'Ocultar camadas' : 'Camadas'}</button>

      {panelOpen && <div className="absolute bottom-3 right-3 top-12 z-10 w-[310px] overflow-y-auto rounded-xl border border-white/12 bg-[#071521]/94 p-3 shadow-2xl backdrop-blur-lg">
        <div className="mb-3"><div className="text-[11.5px] font-semibold text-neutral-100">Catálogo de camadas</div><div className="mt-0.5 text-[9.5px] text-neutral-500">Living Atlas + camadas embarcadas publicáveis</div></div>
        <div className="space-y-3">
          <LayerGroup title="Operação Nexo" layers={EMBEDDED_OPERATIONAL_LAYERS.map((layer) => ({ ...layer, source: 'CAIXA Nexo · dados sintéticos embarcados' }))} state={layerState} onToggle={toggleLayer} onOpacity={changeOpacity}/>
          {Object.entries(publicByCategory).map(([category, layers]) => <LayerGroup key={category} title={category} layers={layers ?? []} state={layerState} onToggle={toggleLayer} onOpacity={changeOpacity}/>) }
        </div>
        <div className="mt-3 rounded-lg border border-[#18B7D6]/20 bg-[#18B7D6]/7 p-2.5 text-[9.5px] leading-relaxed text-[#7DDDEB]">Camadas externas são carregadas diretamente do ArcGIS Online. Se um item estiver temporariamente indisponível, apenas ele falha; o mapa e as camadas locais continuam operacionais.</div>
      </div>}

      <div className="absolute bottom-3 left-3 z-10 max-w-[320px] rounded-lg border border-white/10 bg-[#071521]/84 px-2.5 py-1.5 text-[9.5px] text-neutral-400 backdrop-blur-md"><span className="font-medium text-neutral-200">{mapPoints.length}</span> registros locais · {context} · ArcGIS Maps SDK for JavaScript</div>
    </div>
  );
}

function LayerGroup({ title, layers, state, onToggle, onOpacity }: { title: string; layers: readonly any[]; state: Record<string, LayerState>; onToggle: (id: string) => void; onOpacity: (id: string, opacity: number) => void }) {
  return <div><div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{title}</div><div className="space-y-1.5">{layers.map((layer) => {
    const item = state[layer.id];
    return <div key={layer.id} className={`rounded-lg border p-2 ${item?.visible ? 'border-[#1584D1]/35 bg-[#1584D1]/8' : 'border-white/8 bg-white/[0.025]'}`}>
      <div className="flex items-start gap-2"><button onClick={() => onToggle(layer.id)} disabled={item?.status === 'loading' || item?.status === 'error'} className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item?.visible ? 'border-[#18B7D6] bg-[#18B7D6] text-[#071521]' : 'border-white/20 text-transparent'} disabled:opacity-40`}>{item?.visible && <Icon name="Check" size={11}/>}</button><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate text-[10.5px] text-neutral-200">{layer.title}</span>{item?.status === 'loading' && <Icon name="LoaderCircle" size={10} className="animate-spin text-[#18B7D6]"/>}{item?.status === 'error' && <Icon name="TriangleAlert" size={10} className="text-[#E47780]"/>}</div><div className="mt-0.5 line-clamp-2 text-[8.8px] leading-relaxed text-neutral-500">{layer.description}</div><div className="mt-1 text-[8px] text-neutral-600">{layer.source}</div></div></div>
      {item?.visible && item.status === 'ready' && <div className="mt-2 flex items-center gap-2"><span className="text-[8px] text-neutral-600">Opacidade</span><input type="range" min="0.15" max="1" step="0.05" value={item.opacity} onChange={(event) => onOpacity(layer.id, Number(event.target.value))} className="h-1 flex-1 accent-[#18B7D6]"/><span className="w-7 text-right text-[8px] text-neutral-500">{Math.round(item.opacity * 100)}%</span></div>}
      {item?.status === 'error' && <div className="mt-1.5 text-[8.5px] text-[#E47780]">Item público indisponível nesta sessão.</div>}
    </div>;
  })}</div></div>;
}


declare global {
  interface Window {
    $arcgis?: { import: (modules: string | string[]) => Promise<any> };
  }
}

let arcgisLoaderPromise: Promise<NonNullable<Window["$arcgis"]>> | null = null;

function ensureArcGISAssets() {
  const cssId = 'arcgis-sdk-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'https://js.arcgis.com/5.1/esri/themes/dark/main.css';
    document.head.appendChild(link);
  }

  if (window.$arcgis?.import) return Promise.resolve(window.$arcgis);
  if (arcgisLoaderPromise) return arcgisLoaderPromise;

  arcgisLoaderPromise = new Promise<NonNullable<Window["$arcgis"]>>((resolve, reject) => {
    const existing = document.getElementById('arcgis-sdk-script') as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    const timeout = window.setTimeout(() => reject(new Error('O CDN do ArcGIS Maps SDK não respondeu dentro do tempo esperado.')), 15000);

    const finish = () => {
      window.clearTimeout(timeout);
      if (window.$arcgis?.import) resolve(window.$arcgis);
      else reject(new Error('O ArcGIS Maps SDK foi carregado, mas o importador global não ficou disponível.'));
    };

    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => {
      window.clearTimeout(timeout);
      reject(new Error('Não foi possível carregar o ArcGIS Maps SDK. Verifique a conexão ou as políticas de conteúdo do navegador.'));
    }, { once: true });

    if (!existing) {
      script.id = 'arcgis-sdk-script';
      script.type = 'module';
      script.src = 'https://js.arcgis.com/5.1/';
      document.head.appendChild(script);
    }
  }).catch((error) => {
    arcgisLoaderPromise = null;
    throw error;
  });

  return arcgisLoaderPromise;
}

async function waitForArcGIS() {
  return ensureArcGISAssets();
}

export { money };
