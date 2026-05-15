import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { MapLayerConfig } from './types';

const layerConfigDir = path.join(process.cwd(), 'content/data/map-layers');

export const fallbackLayerConfigs: MapLayerConfig[] = [
    {
        type: 'MapLayerConfig',
        id: 'zoning-districts',
        label: 'Zoning Districts',
        description: 'Illustrative zoning district polygons for the demo map.',
        sourceUrl: 'local:sample-zoning-features',
        sourceLayer: 'zoning-districts',
        paint: {
            fillOpacity: 0.42,
            strokeColor: '#1f2937',
            strokeWidth: 1
        },
        layout: {
            visibility: 'visible'
        },
        legend: [
            { label: 'C6-4 Commercial', color: '#2563eb' },
            { label: 'R8 Residential', color: '#16a34a' },
            { label: 'M1-5 Manufacturing', color: '#f97316' }
        ],
        defaultVisible: true,
        attribution: 'Demo zoning data bundled with this starter.'
    },
    {
        type: 'MapLayerConfig',
        id: 'tax-lots',
        label: 'Tax Lots',
        description: 'Illustrative tax-lot footprints with BBL, owner, land-use, and area attributes.',
        sourceUrl: 'local:sample-parcels',
        sourceLayer: 'tax-lots',
        paint: {
            fillOpacity: 0.18,
            strokeColor: '#111827',
            strokeWidth: 1.5
        },
        layout: {
            visibility: 'visible'
        },
        legend: [{ label: 'Tax lot footprint', color: '#f8fafc' }],
        defaultVisible: true,
        attribution: 'Demo parcel data bundled with this starter.'
    }
];

function isMapLayerConfig(value: unknown): value is MapLayerConfig {
    return !!value && typeof value === 'object' && (value as MapLayerConfig).type === 'MapLayerConfig' && Boolean((value as MapLayerConfig).id);
}

export function getLocalLayerConfigs(): MapLayerConfig[] {
    if (!fs.existsSync(layerConfigDir)) {
        return fallbackLayerConfigs;
    }

    const files = globSync('*.json', { cwd: layerConfigDir });
    const layers = files
        .map((file) => {
            const raw = fs.readFileSync(path.join(layerConfigDir, file), 'utf8');
            return JSON.parse(raw);
        })
        .filter(isMapLayerConfig);

    return layers.length ? layers : fallbackLayerConfigs;
}
