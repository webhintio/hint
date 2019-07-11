import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `Checks if display applied to a summary tag will hide the open/close icon`
    },
    id: 'summary-display',
    schema: [],
    scope: HintScope.any
};

export default meta;
