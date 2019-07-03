import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('isValid_description', 'en'),
        name: getMessage('isValid_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('isValid_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('isValid_name', language);
    },
    id: 'babel-config/is-valid',
    schema: [],
    scope: HintScope.local
};

export default meta;
