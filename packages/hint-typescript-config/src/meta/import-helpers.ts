import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('import-helpers/description', 'en'),
        name: getMessage('import-helpers/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('import-helpers/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('import-helpers/name', language);
    },
    id: 'typescript-config/import-helpers',
    schema: [],
    scope: HintScope.local
};

export default meta;
