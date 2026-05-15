import { Model } from '@stackbit/types';

export const MapLayerConfig: Model = {
    type: 'data',
    name: 'MapLayerConfig',
    label: 'Map Layer Config',
    labelField: 'label',
    folder: 'content/data/map-layers',
    filePath: 'content/data/map-layers/{slug}.json',
    fields: [
        { type: 'string', name: 'id', label: 'Layer ID', required: true },
        { type: 'string', name: 'label', label: 'Label', required: true },
        { type: 'text', name: 'description', label: 'Description', required: false },
        { type: 'string', name: 'sourceUrl', label: 'Source URL', required: false },
        { type: 'string', name: 'sourceLayer', label: 'Source layer', required: false },
        {
            type: 'list',
            name: 'legend',
            label: 'Legend',
            required: false,
            items: {
                type: 'model',
                models: ['MapLayerLegendItem']
            }
        },
        { type: 'boolean', name: 'defaultVisible', label: 'Visible by default', required: false, default: true },
        { type: 'string', name: 'attribution', label: 'Attribution', required: false }
    ]
};
