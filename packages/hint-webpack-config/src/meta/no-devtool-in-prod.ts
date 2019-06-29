import { Category, HintMetadata, HintScope } from 'hint';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: getMessage('no-devtool-in-prod/description', 'en'),
        name: getMessage('no-devtool-in-prod/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('no-devtool-in-prod/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('no-devtool-in-prod/name', language);
    },
    id: 'webpack-config/no-devtool-in-prod',
    schema: [],
    scope: HintScope.local
};

export default meta;
