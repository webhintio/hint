import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: 'Require viewport meta element',
        name: 'Correct viewport'
    },
    id: 'meta-viewport',
    schema: [],
    scope: HintScope.any
};

export default meta;
