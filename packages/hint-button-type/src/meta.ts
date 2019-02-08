import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pitfalls,
        description: `Check if button has type attribute set`,
        name: 'Specify button type'
    },
    id: 'button-type',
    schema: [],
    scope: HintScope.any
};

export default meta;
