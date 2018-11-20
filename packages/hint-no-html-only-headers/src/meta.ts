import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: 'Disallow unneeded HTTP headers for non-HTML resources',
        name: 'Unneeded HTTP headers'
    },
    id: 'no-html-only-headers',
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
