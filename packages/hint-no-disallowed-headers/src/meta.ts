import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: 'Disallow certain HTTP response headers',
        name: 'Disallowed HTTP headers'
    },
    id: 'no-disallowed-headers',
    schema: [{
        additionalProperties: false,
        definitions: {
            'string-array': {
                items: { type: 'string' },
                minItems: 1,
                type: 'array',
                uniqueItems: true
            }
        },
        properties: {
            ignore: { $ref: '#/definitions/string-array' },
            include: { $ref: '#/definitions/string-array' }
        },
        type: ['object', 'null']
    }],
    scope: HintScope.site
};

export default meta;
