import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Checks if URLs in the manifest are in scope and accessible`,
        name: 'Manifest has scoped `start_url`'
    },
    id: 'manifest-scoped-urls',
    schema: [],
    scope: HintScope.site
};

export default meta;
