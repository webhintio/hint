import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Checks if your cache-control header and asset strategy follows best practices`,
        name: 'HTTP cache'
    },
    id: 'http-cache',
    schema: [{
        additionalProperties: false,
        definitions: {
            'string-array': {
                items: { type: 'string' },
                minItems: 1,
                type: 'array',
                uniqueItems: true
            }
        },
        properties: {
            maxAgeResource: { type: 'number' },
            maxAgeTarget: { type: 'number' },
            revvingPatterns: { $ref: '#/definitions/string-array' }
        }
    }],
    scope: HintScope.site
};

export default meta;
