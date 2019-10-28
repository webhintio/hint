import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from './i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.pitfalls,
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
    id: 'scoped-svg-styles',
    schema: [
        {
            additionalProperties: false,
            properties: { maxReportsPerCSSRule: { type: 'number' } }
        }
    ],
    scope: HintScope.any
};

export default meta;
