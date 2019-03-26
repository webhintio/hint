import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
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
