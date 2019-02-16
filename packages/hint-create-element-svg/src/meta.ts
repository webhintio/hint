import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pitfalls,
        description: `Inform users that they need to use createElementNS to create SVG elements instead of createElement`,
        name: 'No `createElement` with SVG'
    },
    id: 'create-element-svg',
    schema: [],
    scope: HintScope.any
};

export default meta;
