import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('modulesFalseBabel_description', 'en'),
        name: getMessage('modulesFalseBabel_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('modulesFalseBabel_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('modulesFalseBabel_name', language);
    },
    id: 'webpack-config/modules-false-babel',
    schema: [],
    scope: HintScope.local
};

export default meta;
