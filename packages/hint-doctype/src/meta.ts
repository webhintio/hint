import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `This hint checks if the HTML is using the most modern DOCTYPE.`,
        name: 'Modern DOCTYPE'
    },
    id: 'doctype',
    schema: [],
    scope: HintScope.any
};

export default meta;
