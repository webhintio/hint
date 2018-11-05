import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Require an 'apple-touch-icon'`,
        name: 'Require an apple touch icon'
    },
    id: 'apple-touch-icons',
    schema: [],
    scope: HintScope.any
};

export default meta;
