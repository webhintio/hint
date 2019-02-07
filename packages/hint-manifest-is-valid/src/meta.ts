import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: 'Require valid web app manifest',
        name: 'Valid manifest'
    },
    id: 'manifest-is-valid',
    schema: [],
    scope: HintScope.any
};

export default meta;
