import { useMemo, useState } from 'react';
import { DEFAULT_BBOX } from '../../utils/geo/sample-data';
import { BoundingBox, GeoDataset, InitialMapState, ParcelFeature, SearchResult, ZoningFeature } from '../../utils/geo/types';
import MapSearch from './MapSearch';

const SVG_WIDTH = 900;
const SVG_HEIGHT = 620;
const BBOX_PADDING = 0.0025;

interface MapShellProps {
    dataset: GeoDataset;
    initialState?: InitialMapState;
}

function expandBbox(bbox: BoundingBox, padding = BBOX_PADDING): BoundingBox {
    return [bbox[0] - padding, bbox[1] - padding, bbox[2] + padding, bbox[3] + padding];
}

function projectPoint([lng, lat]: [number, number], bbox: BoundingBox): [number, number] {
    const [west, south, east, north] = bbox;
    const x = ((lng - west) / (east - west)) * SVG_WIDTH;
    const y = SVG_HEIGHT - ((lat - south) / (north - south)) * SVG_HEIGHT;
    return [x, y];
}

function pathFromCoordinates(coordinates: Array<[number, number]>, bbox: BoundingBox): string {
    return coordinates
        .map((point, index) => {
            const [x, y] = projectPoint(point, bbox);
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ') + ' Z';
}

function formatBbox(bbox: BoundingBox) {
    return bbox.map((value) => value.toFixed(5)).join(', ');
}

export default function MapShell({ dataset, initialState }: MapShellProps) {
    const initialSelectedParcel = initialState?.selectedBbl ? dataset.parcels.find((parcel) => parcel.bbl === initialState.selectedBbl) : undefined;
    const [viewport, setViewport] = useState<BoundingBox>(expandBbox(initialSelectedParcel?.bbox ?? initialState?.bbox ?? DEFAULT_BBOX));
    const [selectedParcel, setSelectedParcel] = useState<ParcelFeature | undefined>(initialSelectedParcel);
    const [selectedZoning, setSelectedZoning] = useState<ZoningFeature | undefined>();
    const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(dataset.layers.map((layer) => [layer.id, layer.defaultVisible !== false]))
    );

    const visibleZoningFeatures = useMemo(
        () => dataset.zoningFeatures.filter((feature) => visibleLayers[feature.layerId]),
        [dataset.zoningFeatures, visibleLayers]
    );

    const showTaxLots = visibleLayers['tax-lots'] !== false;

    function zoomToBbox(bbox: BoundingBox) {
        setViewport(expandBbox(bbox));
    }

    function handleSearchSelect(result: SearchResult) {
        zoomToBbox(result.bbox);
        if (result.bbl) {
            setSelectedParcel(dataset.parcels.find((parcel) => parcel.bbl === result.bbl));
            setSelectedZoning(undefined);
        } else if (result.layerId) {
            setSelectedZoning(dataset.zoningFeatures.find((feature) => feature.id === result.id));
            setSelectedParcel(undefined);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 text-slate-950">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Planning Explorer</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">Zoning and land-use map</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                            A ZoLa-inspired starter experience with editable layer metadata, BBL deep links, bounding-box links, parcel search,
                            zoning overlays, legends, and feature details.
                        </p>
                    </div>
                    <a className="text-sm font-semibold text-blue-700 hover:text-blue-900" href="/map">
                        Reset map
                    </a>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[340px_1fr]">
                <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                    <MapSearch onSelect={handleSearchSelect} />

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Layers</h2>
                        <div className="mt-3 space-y-3">
                            {dataset.layers.map((layer) => (
                                <label key={layer.id} className="flex gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                                    <input
                                        className="mt-1 h-4 w-4 rounded border-slate-300"
                                        type="checkbox"
                                        checked={visibleLayers[layer.id] !== false}
                                        onChange={(event) => setVisibleLayers((current) => ({ ...current, [layer.id]: event.target.checked }))}
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-950">{layer.label}</span>
                                        {layer.description && <span className="mt-1 block text-xs leading-5 text-slate-600">{layer.description}</span>}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Legend</h2>
                        <div className="mt-3 space-y-3">
                            {dataset.layers.flatMap((layer) =>
                                visibleLayers[layer.id] === false
                                    ? []
                                    : (layer.legend ?? []).map((item) => (
                                          <div key={`${layer.id}-${item.label}`} className="flex items-center gap-3 text-sm text-slate-700">
                                              <span className="h-4 w-4 rounded border border-slate-300" style={{ backgroundColor: item.color }} />
                                              <span>{item.label}</span>
                                          </div>
                                      ))
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Feature details</h2>
                        {selectedParcel ? (
                            <dl className="mt-3 grid grid-cols-[90px_1fr] gap-x-3 gap-y-2 text-sm">
                                <dt className="text-slate-500">Address</dt>
                                <dd className="font-semibold">{selectedParcel.address}</dd>
                                <dt className="text-slate-500">BBL</dt>
                                <dd>
                                    <a className="font-semibold text-blue-700 hover:text-blue-900" href={`/bbl/${selectedParcel.bbl}`}>
                                        {selectedParcel.bbl}
                                    </a>
                                </dd>
                                <dt className="text-slate-500">Zoning</dt>
                                <dd>{selectedParcel.zoningDistrict}</dd>
                                <dt className="text-slate-500">Land use</dt>
                                <dd>{selectedParcel.landUse}</dd>
                                <dt className="text-slate-500">Owner</dt>
                                <dd>{selectedParcel.owner}</dd>
                                <dt className="text-slate-500">Area</dt>
                                <dd>{selectedParcel.areaSqFt.toLocaleString()} sq ft</dd>
                            </dl>
                        ) : selectedZoning ? (
                            <div className="mt-3 text-sm leading-6 text-slate-700">
                                <p className="font-semibold text-slate-950">{selectedZoning.district}</p>
                                <p>{selectedZoning.description}</p>
                            </div>
                        ) : (
                            <p className="mt-3 text-sm leading-6 text-slate-600">Select a parcel or zoning polygon to inspect its attributes.</p>
                        )}
                    </section>
                </aside>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                        <div>
                            <h2 className="font-semibold">Interactive map canvas</h2>
                            <p className="text-xs text-slate-500">Current bbox: {formatBbox(viewport)}</p>
                        </div>
                        <a
                            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            href={`/bbox/${viewport.map((value) => value.toFixed(5)).join('/')}`}
                        >
                            Copy bbox link
                        </a>
                    </div>
                    <div className="relative bg-[linear-gradient(135deg,#e0f2fe_0%,#f8fafc_45%,#dbeafe_100%)] p-3">
                        <svg className="h-[68vh] min-h-[520px] w-full rounded-2xl border border-slate-200 bg-sky-50" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} role="img" aria-label="Zoning and parcel map">
                            <defs>
                                <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
                                    <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.45" />
                                </pattern>
                            </defs>
                            <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#grid)" />
                            <path d="M 40 520 C 250 450 350 150 540 96 C 660 62 740 116 860 60 L 860 620 L 40 620 Z" fill="#bfdbfe" opacity="0.56" />

                            {visibleZoningFeatures.map((feature) => (
                                <path
                                    key={feature.id}
                                    d={pathFromCoordinates(feature.coordinates, viewport)}
                                    fill={feature.color}
                                    fillOpacity="0.42"
                                    stroke="#1e293b"
                                    strokeWidth="2"
                                    className="cursor-pointer transition hover:brightness-110"
                                    onClick={() => {
                                        setSelectedZoning(feature);
                                        setSelectedParcel(undefined);
                                    }}
                                />
                            ))}

                            {showTaxLots &&
                                dataset.parcels.map((parcel) => {
                                    const selected = selectedParcel?.bbl === parcel.bbl;
                                    return (
                                        <path
                                            key={parcel.bbl}
                                            d={pathFromCoordinates(parcel.coordinates, viewport)}
                                            fill={selected ? '#fde68a' : '#f8fafc'}
                                            fillOpacity={selected ? 0.82 : 0.58}
                                            stroke={selected ? '#b45309' : '#0f172a'}
                                            strokeWidth={selected ? 4 : 2}
                                            className="cursor-pointer transition hover:fill-amber-100"
                                            onClick={() => {
                                                setSelectedParcel(parcel);
                                                setSelectedZoning(undefined);
                                            }}
                                        />
                                    );
                                })}

                            {dataset.parcels.map((parcel) => {
                                const [x, y] = projectPoint(parcel.centroid, viewport);
                                return (
                                    <text key={`${parcel.bbl}-label`} x={x} y={y} textAnchor="middle" className="pointer-events-none fill-slate-950 text-[14px] font-bold">
                                        {parcel.block}/{parcel.lot}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500">
                        {dataset.layers.map((layer) => layer.attribution).filter(Boolean).join(' ')} Connect `NEXT_PUBLIC_GEO_API_BASE_URL` to replace the bundled sample data with live layer metadata.
                    </div>
                </section>
            </div>
        </main>
    );
}
