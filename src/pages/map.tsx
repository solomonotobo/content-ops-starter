import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { fetchGeoDataset } from '../utils/geo/layers-api';
import { GeoDataset } from '../utils/geo/types';

const MapShell = dynamic(() => import('../components/map/MapShell'), { ssr: false });

interface MapPageProps {
    dataset: GeoDataset;
}

export default function MapPage({ dataset }: MapPageProps) {
    return (
        <>
            <Head>
                <title>Planning Explorer | Zoning and land-use map</title>
                <meta
                    name="description"
                    content="Explore zoning districts, tax lots, BBL links, bounding boxes, and parcel search in a ZoLa-inspired planning map."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <MapShell dataset={dataset} />
        </>
    );
}

export const getStaticProps: GetStaticProps<MapPageProps> = async () => {
    return {
        props: {
            dataset: await fetchGeoDataset()
        }
    };
};
