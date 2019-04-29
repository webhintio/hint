import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Checks if urls in the manifest are in scope and accessible`
    },
    id: 'manifest-scoped-urls',
    schema: [],
    scope: HintScope.any
};

export default meta;
