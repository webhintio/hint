import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('consistent-casing/description', 'en'),
        name: getMessage('consistent-casing/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('consistent-casing/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('consistent-casing/name', language);
    },
    id: 'typescript-config/consistent-casing',
    schema: [],
    scope: HintScope.local
};

export default meta;
