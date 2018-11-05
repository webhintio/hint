import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: 'Require highest available document mode',
        name: 'Require highest available document mode'
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
