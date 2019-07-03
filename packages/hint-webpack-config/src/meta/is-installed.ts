import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('isInstalled_description', 'en'),
        name: getMessage('isInstalled_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('isInstalled_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('isInstalled_name', language);
    },
    id: 'webpack-config/is-installed',
    schema: [],
    scope: HintScope.local
};

export default meta;
