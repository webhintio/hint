import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('module-esnext-typescript/description', 'en'),
        name: getMessage('module-esnext-typescript/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('module-esnext-typescript/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('module-esnext-typescript/name', language);
    },
    id: 'webpack-config/module-esnext-typescript',
    schema: [],
    scope: HintScope.local
};

export default meta;
