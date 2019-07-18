import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('strict_description', 'en'),
        name: getMessage('strict_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('strict_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('strict_name', language);
    },
    id: 'typescript-config/strict',
    schema: [],
    scope: HintScope.local
};

export default meta;
