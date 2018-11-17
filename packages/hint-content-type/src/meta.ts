import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: 'Require `Content-Type` header with appropriate value',
        name: 'Correct `Content-Type` header'
    },
    id: 'content-type',
    schema: [{
        items: { type: 'string' },
        type: ['object', 'null'],
        uniqueItems: true
    }],
    scope: HintScope.site
};

export default meta;
