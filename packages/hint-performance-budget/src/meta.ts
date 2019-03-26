import { Category, HintMetadata, HintScope } from 'hint';

import * as Connections from './connections';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Performance budget checks if your site will load fast enough based on the size of your resources and a given connection speed`,
        name: 'Performance budget'
    },
    id: 'performance-budget',
    schema: [{
        additionalProperties: false,
        properties: {
            connectionType: {
                enum: Connections.ids,
                type: 'string'
            },
            loadTime: {
                minimum: 1,
                type: 'number'
            }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
