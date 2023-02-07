import { Category } from '@hint/utils-types';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from './i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: getMessage('description', 'en'),
        name: getMessage('name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('name', language);
    },
    id: 'optimizesvganimations',
    schema: [
        /*
         * If you want to allow the user to configure your hint
         * you should use a valid JSON schema. More info in:
         * https://webhint.io/docs/contributor-guide/how-to/hint/#the-meta-property
         */
    ],
    scope: HintScope.any
};

export default meta;
