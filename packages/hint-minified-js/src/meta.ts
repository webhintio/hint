import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Hint to check script is minified or not`,
        name: 'Minify JavaScript'
    },
    id: 'minified-js',
    schema: [{
        additionalProperties: false,
        properties: { threshold: { type: 'number' } }
    }],
    scope: HintScope.any
};

export default meta;
