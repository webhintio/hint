import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('target_description', 'en'),
        name: getMessage('target_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('target_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('target_name', language);
    },
    id: 'typescript-config/target',
    schema: [],
    scope: HintScope.local
};

export default meta;
