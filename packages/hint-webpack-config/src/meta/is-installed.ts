import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('is-installed/description', 'en'),
        name: getMessage('is-installed/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('is-installed/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('is-installed/name', language);
    },
    id: 'webpack-config/is-installed',
    schema: [],
    scope: HintScope.local
};

export default meta;
