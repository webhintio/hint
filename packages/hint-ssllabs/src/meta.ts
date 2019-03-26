import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: 'Strength of your SSL configuration',
        name: 'SSL server test'
    },
    id: 'ssllabs',
    schema: [{
        additionalProperties: false,
        properties: {
            grade: {
                pattern: '^(A\\+|A\\-|[A-F]|T|M)$',
                type: 'string'
            },
            ssllabs: {
                properties: {
                    all: {
                        pattern: '^(on|done)$',
                        type: 'string'
                    },
                    fromCache: { type: 'boolean' },
                    ignoreMismatch: { type: 'boolean' },
                    maxAge: {
                        minimum: 0,
                        type: 'integer'
                    },
                    publish: { type: 'boolean' },
                    startNew: { type: 'boolean' }
                },
                type: 'object'
            }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
