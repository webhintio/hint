import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('importHelpers_description', 'en'),
        name: getMessage('importHelpers_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('importHelpers_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('importHelpers_name', language);
    },
    id: 'typescript-config/import-helpers',
    schema: [],
    scope: HintScope.local
};

export default meta;
