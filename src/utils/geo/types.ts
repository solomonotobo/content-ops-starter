export type BoundingBox = [number, number, number, number];
export type Coordinate = [number, number];

export interface MapLayerLegendItem {
    label: string;
    color: string;
}

export interface MapLayerConfig {
    id: string;
    type: 'MapLayerConfig';
    label: string;
    description?: string;
    sourceUrl?: string;
    sourceLayer?: string;
    paint?: Record<string, string | number | boolean>;
    layout?: Record<string, string | number | boolean>;
    legend?: MapLayerLegendItem[];
    defaultVisible?: boolean;
    attribution?: string;
}

export interface ZoningFeature {
    id: string;
    layerId: string;
    label: string;
    district: string;
    description: string;
    color: string;
    coordinates: Coordinate[];
    bbox: BoundingBox;
}

export interface ParcelFeature {
    bbl: string;
    address: string;
    borough: string;
    block: string;
    lot: string;
    zoningDistrict: string;
    landUse: string;
    owner: string;
    areaSqFt: number;
    coordinates: Coordinate[];
    bbox: BoundingBox;
    centroid: Coordinate;
}

export interface GeoDataset {
    layers: MapLayerConfig[];
    zoningFeatures: ZoningFeature[];
    parcels: ParcelFeature[];
}

export interface SearchResult {
    id: string;
    label: string;
    type: 'address' | 'bbl' | 'zoning' | 'borough';
    description: string;
    bbox: BoundingBox;
    bbl?: string;
    layerId?: string;
}

export interface InitialMapState {
    bbox?: BoundingBox;
    selectedBbl?: string;
}
