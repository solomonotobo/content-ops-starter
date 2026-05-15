import { sampleParcels, sampleZoningFeatures } from './sample-data';
import { ParcelFeature, SearchResult } from './types';

function parcelToResult(parcel: ParcelFeature, type: 'address' | 'bbl' = 'address'): SearchResult {
    return {
        id: parcel.bbl,
        label: type === 'bbl' ? `BBL ${parcel.bbl}` : parcel.address,
        type,
        description: `${parcel.borough} Block ${parcel.block}, Lot ${parcel.lot} · ${parcel.zoningDistrict}`,
        bbox: parcel.bbox,
        bbl: parcel.bbl
    };
}

export function isBblLike(query: string): boolean {
    return /^\d{10}$/.test(query.replace(/\D/g, ''));
}

export async function lookupBbl(bbl: string): Promise<SearchResult | undefined> {
    const normalizedBbl = bbl.replace(/\D/g, '');
    const parcel = sampleParcels.find((candidate) => candidate.bbl === normalizedBbl);
    return parcel ? parcelToResult(parcel, 'bbl') : undefined;
}

export async function searchLocations(query: string): Promise<SearchResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    if (isBblLike(normalized)) {
        const exact = await lookupBbl(normalized);
        return exact ? [exact] : [];
    }

    const parcelResults = sampleParcels
        .filter((parcel) => {
            const target = [parcel.address, parcel.bbl, parcel.borough, parcel.block, parcel.lot, parcel.zoningDistrict, parcel.landUse].join(' ').toLowerCase();
            return target.includes(normalized);
        })
        .map((parcel) => parcelToResult(parcel, parcel.bbl.includes(normalized) ? 'bbl' : 'address'));

    const zoningResults = sampleZoningFeatures
        .filter((feature) => [feature.label, feature.district, feature.description].join(' ').toLowerCase().includes(normalized))
        .map<SearchResult>((feature) => ({
            id: feature.id,
            label: `${feature.district} · ${feature.label}`,
            type: 'zoning',
            description: feature.description,
            bbox: feature.bbox,
            layerId: feature.layerId
        }));

    return [...parcelResults, ...zoningResults].slice(0, 8);
}
