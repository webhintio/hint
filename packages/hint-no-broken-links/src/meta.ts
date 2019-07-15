import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from './i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: getMessage('description', 'en'),
        name: getMessage('name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('name', language);
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
