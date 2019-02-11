import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.accessibility,
        description: 'Runs axe-core tests in the target',
        name: 'aXe accessibility check'
    },
    id: 'axe',
    schema: [{
        additionalProperties: false,
        properties: {
            rules: {
                patternProperties: {
                    '^.+$': {
                        additionalProperties: false,
                        properties: { enabled: { type: 'boolean' } },
                        required: ['enabled'],
                        type: 'object'
                    }
                },
                type: 'object'
            },
            runOnly: {
                additionalProperties: false,
                properties: {
                    type: { type: 'string' },
                    values: {
                        items: { type: 'string' },
                        minItems: 1,
                        type: 'array',
                        uniqueItems: true
                    }
                },
                type: 'object'
            }
        }
    }],
    /*
     * axe can not analize a file itself, it needs a connector.
     */
    scope: HintScope.any
};

export default meta;
