import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: 'Require highest available document mode',
        name: 'Highest document mode'
    },
    id: 'highest-available-document-mode',
    schema: [{
        additionalProperties: false,
        properties: { requireMetaElement: { type: 'boolean' } },
        type: ['object', 'null']
    }],
    scope: HintScope.any
};

export default meta;
