import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Require HTML page to be AMP valid.`,
        name: 'AMP HTML validator'
    },
    id: 'amp-validator',
    schema: [{
        additionalProperties: false,
        properties: { 'errors-only': { type: 'boolean' } },
        type: 'object'
    }],
    scope: HintScope.any
};

export default meta;
