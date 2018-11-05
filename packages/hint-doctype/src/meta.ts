import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: `This hint checks if the HTML is using the most modern DOCTYPE.`,
        name: 'Ensure modern DOCTYPE'
    },
    id: 'doctype',
    schema: [],
    scope: HintScope.any
};

export default meta;
