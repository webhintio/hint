import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('modules-false-babel/description', 'en'),
        name: getMessage('modules-false-babel/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('modules-false-babel/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('modules-false-babel/name', language);
    },
    id: 'webpack-config/modules-false-babel',
    schema: [],
    scope: HintScope.local
};

export default meta;
