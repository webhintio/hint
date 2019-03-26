import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: 'Require resources to be served compressed',
        name: 'Optimal compression'
    },
    id: 'http-compression',
    schema: [{
        additionalProperties: false,
        definitions: {
            options: {
                additionalProperties: false,
                minProperties: 1,
                properties: {
                    brotli: { type: 'boolean' },
                    gzip: { type: 'boolean' },
                    zopfli: { type: 'boolean' }
                }
            }
        },
        properties: {
            html: { $ref: '#/definitions/options' },
            resource: { $ref: '#/definitions/options' }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
