import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('strict/description', 'en'),
        name: getMessage('strict/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('strict/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('strict/name', language);
    },
    id: 'typescript-config/strict',
    schema: [],
    scope: HintScope.local
};

export default meta;
