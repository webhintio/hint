import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: 'Require `<meta charset="utf-8">`',
        name: 'Use charset `utf-8`'
    },
    id: 'meta-charset-utf-8',
    schema: [],
    scope: HintScope.any
};

export default meta;
