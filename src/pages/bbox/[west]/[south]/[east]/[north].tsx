import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { fetchGeoDataset, normalizeBbox } from '../../../../../utils/geo/layers-api';
import { BoundingBox, GeoDataset, InitialMapState } from '../../../../../utils/geo/types';

const MapShell = dynamic(() => import('../../../../../components/map/MapShell'), { ssr: false });

interface BboxPageProps {
    dataset: GeoDataset;
    initialState: InitialMapState;
}

export default function BboxPage({ dataset, initialState }: BboxPageProps) {
    return (
        <>
            <Head>
                <title>Bounding box map view | Planning Explorer</title>
                <meta name="description" content="Open a planning explorer map to a shared bounding box view." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <MapShell dataset={dataset} initialState={initialState} />
        </>
    );
}

export const getServerSideProps: GetServerSideProps<BboxPageProps> = async ({ params }) => {
    const rawValues = [params?.west, params?.south, params?.east, params?.north].map((value) => Number(value));
    const bbox = normalizeBbox(rawValues as BoundingBox);

    return {
        props: {
            dataset: await fetchGeoDataset(),
            initialState: { bbox }
        }
    };
};
