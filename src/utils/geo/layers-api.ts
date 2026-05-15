import { DEFAULT_BBOX, sampleParcels, sampleZoningFeatures } from './sample-data';
import { getLocalLayerConfigs } from './local-layer-config';
import { BoundingBox, GeoDataset, MapLayerConfig, ParcelFeature, ZoningFeature } from './types';

function intersects(a: BoundingBox, b: BoundingBox): boolean {
    return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

export async function fetchLayerGroups(): Promise<MapLayerConfig[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_GEO_API_BASE_URL;

    if (apiBaseUrl && typeof window !== 'undefined') {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/layers`);
        if (response.ok) {
            return response.json();
        }
    }

    return getLocalLayerConfigs();
}

export async function fetchGeoDataset(): Promise<GeoDataset> {
    return {
        layers: await fetchLayerGroups(),
        zoningFeatures: sampleZoningFeatures,
        parcels: sampleParcels
    };
}

export async function fetchParcelByBbl(bbl: string): Promise<ParcelFeature | undefined> {
    return sampleParcels.find((parcel) => parcel.bbl === bbl);
}

export async function fetchFeaturesByBounds(bounds: BoundingBox): Promise<{ parcels: ParcelFeature[]; zoningFeatures: ZoningFeature[] }> {
    return {
        parcels: sampleParcels.filter((parcel) => intersects(parcel.bbox, bounds)),
        zoningFeatures: sampleZoningFeatures.filter((feature) => intersects(feature.bbox, bounds))
    };
}

export function normalizeBbox(input?: BoundingBox): BoundingBox {
    if (!input) return DEFAULT_BBOX;
    const [west, south, east, north] = input;
    if ([west, south, east, north].some((value) => !Number.isFinite(value))) return DEFAULT_BBOX;
    if (west >= east || south >= north) return DEFAULT_BBOX;
    return input;
}

export function parseBboxParam(values: string[]): BoundingBox | undefined {
    if (values.length !== 4) return undefined;
    const parsed = values.map((value) => Number(value));
    if (parsed.some((value) => !Number.isFinite(value))) return undefined;
    return normalizeBbox(parsed as BoundingBox);
}
