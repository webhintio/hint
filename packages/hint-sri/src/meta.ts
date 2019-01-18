import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { Algorithms, OriginCriteria } from './types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: `Require scripts and link elements to use Subresource Integrity`,
        name: 'Use subresource integrity'
    },
    id: 'sri',
    schema: [{
        additionalProperties: false,
        properties: {
            baseline: {
                enum: Object.keys(Algorithms).filter((key) => {
                    return isNaN(parseInt(key, 10));
                }),
                type: 'string'
            },
            originCriteria: {
                enum: Object.keys(OriginCriteria).filter((key) => {
                    return isNaN(parseInt(key, 10));
                }),
                type: 'string'
            }
        }
    }],
    scope: HintScope.any
};

export default meta;
