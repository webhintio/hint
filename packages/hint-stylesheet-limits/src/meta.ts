import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `Checks if CSS exceeds known stylesheet limits.`,
        name: 'Avoid CSS limits'
    },
    id: 'stylesheet-limits',
    schema: [{
        additionalProperties: false,
        definitions: {
            number: {
                minimum: 0,
                type: 'integer'
            }
        },
        properties: {
            maxImports: { $ref: '#/definitions/number' },
            maxRules: { $ref: '#/definitions/number' },
            maxSheets: { $ref: '#/definitions/number' }
        },
        type: ['object', 'null']
    }],
    scope: HintScope.site
};

export default meta;
