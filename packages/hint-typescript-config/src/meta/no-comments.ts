import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('noComments_description', 'en'),
        name: getMessage('noComments_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('noComments_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('noComments_name', language);
    },
    id: 'typescript-config/no-comments',
    schema: [],
    scope: HintScope.local
};

export default meta;
