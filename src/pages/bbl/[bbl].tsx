import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { fetchGeoDataset, fetchParcelByBbl } from '../../utils/geo/layers-api';
import { sampleParcels } from '../../utils/geo/sample-data';
import { GeoDataset, InitialMapState, ParcelFeature } from '../../utils/geo/types';

const MapShell = dynamic(() => import('../../components/map/MapShell'), { ssr: false });

interface BblPageProps {
    dataset: GeoDataset;
    parcel: ParcelFeature;
    initialState: InitialMapState;
}

export default function BblPage({ dataset, parcel, initialState }: BblPageProps) {
    return (
        <>
            <Head>
                <title>{parcel.address} | BBL {parcel.bbl}</title>
                <meta name="description" content={`Inspect BBL ${parcel.bbl}, ${parcel.address}, in the planning explorer map.`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <MapShell dataset={dataset} initialState={initialState} />
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: sampleParcels.map((parcel) => ({ params: { bbl: parcel.bbl } })),
    fallback: false
});

export const getStaticProps: GetStaticProps<BblPageProps> = async ({ params }) => {
    const bbl = String(params?.bbl ?? '');
    const parcel = await fetchParcelByBbl(bbl);

    if (!parcel) {
        return { notFound: true };
    }

    return {
        props: {
            dataset: await fetchGeoDataset(),
            parcel,
            initialState: {
                selectedBbl: parcel.bbl,
                bbox: parcel.bbox
            }
        }
    };
};
