import { Model } from '@stackbit/types';

export const MapLayerLegendItem: Model = {
    type: 'object',
    name: 'MapLayerLegendItem',
    label: 'Map Layer Legend Item',
    labelField: 'label',
    fields: [
        { type: 'string', name: 'label', label: 'Label', required: true },
        { type: 'color', name: 'color', label: 'Color', required: true }
    ]
};
