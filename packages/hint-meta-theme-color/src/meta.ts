import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Require a 'theme-color' meta element`,
        name: 'Require `theme-color` meta tag'
    },
    id: 'meta-theme-color',
    schema: [],
    scope: HintScope.any
};

export default meta;
