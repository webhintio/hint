import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('consistentCasing_description', 'en'),
        name: getMessage('consistentCasing_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('consistentCasing_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('consistentCasing_name', language);
    },
    id: 'typescript-config/consistent-casing',
    schema: [],
    scope: HintScope.local
};

export default meta;
