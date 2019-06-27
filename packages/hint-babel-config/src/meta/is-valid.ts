import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('is-valid/description', 'en'),
        name: getMessage('is-valid/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('is-valid/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('is-valid/name', language);
    },
    id: 'babel-config/is-valid',
    schema: [],
    scope: HintScope.local
};

export default meta;
