import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `Check if button has type attribute set`
    },
    id: 'button-type',
    schema: [],
    scope: HintScope.any
};

export default meta;
