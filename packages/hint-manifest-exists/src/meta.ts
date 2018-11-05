import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: 'Require a web app manifest',
        name: 'Require a web app manifest'
    },
    id: 'manifest-exists',
    schema: [],
    scope: HintScope.any
};

export default meta;
