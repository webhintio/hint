import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Hint to flag broken links in the page`,
        name: 'No broken links'
    },
    id: 'no-broken-links',
    schema: [{
        properties: {
            method: {
                pattern: '^([hH][eE][aA][dD])|([gG][eE][tT])$',
                type: 'string'
            }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
