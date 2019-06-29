import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('no-comments/description', 'en'),
        name: getMessage('no-comments/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('no-comments/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('no-comments/name', language);
    },
    id: 'typescript-config/no-comments',
    schema: [],
    scope: HintScope.local
};

export default meta;
