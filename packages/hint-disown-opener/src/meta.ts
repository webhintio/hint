import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: 'Require `noopener` (and `noreferrer`) on `a` and `area` element with target="_blank"',
        name: 'Require external links to disown opener'
    },
    id: 'disown-opener',
    schema: [{
        additionalProperties: false,
        properties: { includeSameOriginURLs: { type: 'boolean' } },
        type: ['object', 'null']
    }],
    scope: HintScope.any
};

export default meta;
