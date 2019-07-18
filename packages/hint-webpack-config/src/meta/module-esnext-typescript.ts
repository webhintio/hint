import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('moduleEsnextTypescript_description', 'en'),
        name: getMessage('moduleEsnextTypescript_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('moduleEsnextTypescript_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('moduleEsnextTypescript_name', language);
    },
    id: 'webpack-config/module-esnext-typescript',
    schema: [],
    scope: HintScope.local
};

export default meta;
