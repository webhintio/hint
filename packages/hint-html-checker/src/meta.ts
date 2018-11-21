import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: `Validate HTML using 'the Nu HTML checker'`,
        name: 'Nu HTML test'
    },
    id: 'html-checker',
    schema: [{
        properties: {
            details: { type: 'boolean' },
            ignore: {
                anyOf: [
                    {
                        items: { type: 'string' },
                        type: 'array'
                    }, { type: 'string' }
                ]
            },
            validator: {
                pattern: '^(http|https)://',
                type: 'string'
            }
        }
    }],
    scope: HintScope.any
};

export default meta;
