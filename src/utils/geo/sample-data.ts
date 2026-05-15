import { BoundingBox, Coordinate, ParcelFeature, ZoningFeature } from './types';

export const DEFAULT_BBOX: BoundingBox = [-74.014, 40.704, -73.982, 40.724];

function bboxFromCoordinates(coordinates: Coordinate[]): BoundingBox {
    const xs = coordinates.map(([x]) => x);
    const ys = coordinates.map(([, y]) => y);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function centroidFromCoordinates(coordinates: Coordinate[]): Coordinate {
    const totals = coordinates.reduce(
        (acc, [x, y]) => {
            acc[0] += x;
            acc[1] += y;
            return acc;
        },
        [0, 0]
    );
    return [totals[0] / coordinates.length, totals[1] / coordinates.length];
}

const zoningCoordinates: Array<Omit<ZoningFeature, 'bbox'>> = [
    {
        id: 'zoning-c6-4',
        layerId: 'zoning-districts',
        label: 'Lower Manhattan Core',
        district: 'C6-4',
        description: 'High-density commercial district supporting offices, retail, civic uses, and mixed-use towers.',
        color: '#2563eb',
        coordinates: [
            [-74.014, 40.707],
            [-74.004, 40.704],
            [-73.996, 40.711],
            [-74.006, 40.717],
            [-74.014, 40.713]
        ]
    },
    {
        id: 'zoning-r8',
        layerId: 'zoning-districts',
        label: 'Civic Center Residential Edge',
        district: 'R8',
        description: 'Medium-to-high density residential envelope for contextual apartments and community facilities.',
        color: '#16a34a',
        coordinates: [
            [-74.006, 40.717],
            [-73.996, 40.711],
            [-73.986, 40.716],
            [-73.992, 40.724],
            [-74.004, 40.723]
        ]
    },
    {
        id: 'zoning-m1-5',
        layerId: 'zoning-districts',
        label: 'Waterfront Production Buffer',
        district: 'M1-5',
        description: 'Light manufacturing and commercial district intended for production, maker, and logistics uses.',
        color: '#f97316',
        coordinates: [
            [-74.004, 40.704],
            [-73.982, 40.706],
            [-73.986, 40.716],
            [-73.996, 40.711]
        ]
    }
];

const parcelCoordinates: Array<Omit<ParcelFeature, 'bbox' | 'centroid'>> = [
    {
        bbl: '1000477501',
        address: '1 Planning Plaza',
        borough: 'Manhattan',
        block: '47',
        lot: '7501',
        zoningDistrict: 'C6-4',
        landUse: 'Mixed commercial and civic offices',
        owner: 'City Planning Demo Authority',
        areaSqFt: 128000,
        coordinates: [
            [-74.0105, 40.7092],
            [-74.0067, 40.7081],
            [-74.0052, 40.7112],
            [-74.0092, 40.7124]
        ]
    },
    {
        bbl: '1000890012',
        address: '22 Broadway',
        borough: 'Manhattan',
        block: '89',
        lot: '12',
        zoningDistrict: 'C6-4',
        landUse: 'Office with ground-floor retail',
        owner: 'Harbor Commercial LLC',
        areaSqFt: 94500,
        coordinates: [
            [-74.0053, 40.7072],
            [-74.0018, 40.7063],
            [-74.0004, 40.7091],
            [-74.0039, 40.7101]
        ]
    },
    {
        bbl: '1001560033',
        address: '145 Civic Row',
        borough: 'Manhattan',
        block: '156',
        lot: '33',
        zoningDistrict: 'R8',
        landUse: 'Residential with community facility',
        owner: 'Civic Housing Partners',
        areaSqFt: 51200,
        coordinates: [
            [-74.0026, 40.718],
            [-73.9986, 40.7165],
            [-73.9968, 40.7195],
            [-74.0008, 40.721]
        ]
    },
    {
        bbl: '1002010045',
        address: '310 Market Street',
        borough: 'Manhattan',
        block: '201',
        lot: '45',
        zoningDistrict: 'M1-5',
        landUse: 'Light industrial and studio space',
        owner: 'Market Works Cooperative',
        areaSqFt: 68400,
        coordinates: [
            [-73.994, 40.7081],
            [-73.9898, 40.7086],
            [-73.9893, 40.7114],
            [-73.9932, 40.7112]
        ]
    }
];

export const sampleZoningFeatures: ZoningFeature[] = zoningCoordinates.map((feature) => ({
    ...feature,
    bbox: bboxFromCoordinates(feature.coordinates)
}));

export const sampleParcels: ParcelFeature[] = parcelCoordinates.map((parcel) => ({
    ...parcel,
    bbox: bboxFromCoordinates(parcel.coordinates),
    centroid: centroidFromCoordinates(parcel.coordinates)
}));
