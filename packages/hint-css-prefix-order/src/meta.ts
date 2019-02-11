import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pitfalls,
        description: `Ensure vendor-prefixed versions of a CSS property are listed before the unprefixed version.`,
        name: 'Prefixed CSS first'
    },
    id: 'css-prefix-order',
    schema: [],
    scope: HintScope.any
};

export default meta;
