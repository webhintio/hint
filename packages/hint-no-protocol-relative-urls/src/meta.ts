import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: 'Disallow protocol relative URLs',
        name: 'Disallow protocol-relative URLs'
    },
    id: 'no-protocol-relative-urls',
    schema: [],
    scope: HintScope.any
};

export default meta;
