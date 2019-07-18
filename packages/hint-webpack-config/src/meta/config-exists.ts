import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('configExists_description', 'en'),
        name: getMessage('configExists_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('configExists_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('configExists_name', language);
    },
    id: 'webpack-config/config-exists',
    schema: [],
    scope: HintScope.local
};

export default meta;
