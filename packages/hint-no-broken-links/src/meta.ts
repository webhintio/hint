import { Category, HintMetadata, HintScope } from 'hint';

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
