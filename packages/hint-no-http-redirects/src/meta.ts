import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Checks if there are unnecesary redirects when accessign resources`,
        name: 'Avoid HTTP redirects'
    },
    id: 'no-http-redirects',
    schema: [{
        additionalProperties: false,
        properties: {
            'max-html-redirects': {
                minimum: 0,
                type: 'integer'
            },
            'max-resource-redirects': {
                minimum: 0,
                type: 'integer'
            }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
