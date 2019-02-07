import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

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
