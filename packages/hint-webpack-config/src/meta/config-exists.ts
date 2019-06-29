import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('config-exists/description', 'en'),
        name: getMessage('config-exists/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('config-exists/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('config-exists/name', language);
    },
    id: 'webpack-config/config-exists',
    schema: [],
    scope: HintScope.local
};

export default meta;
