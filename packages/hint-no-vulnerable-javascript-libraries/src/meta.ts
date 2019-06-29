import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from './i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
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
    id: 'no-vulnerable-javascript-libraries',
    schema: [{
        additionalProperties: false,
        properties: {
            severity: {
                pattern: '^(low|medium|high)$',
                type: 'string'
            }
        },
        type: 'object'
    }],
    /*
     * Snyk can not analyze a file itself, it needs a connector.
     * TODO: Change to any once the local connector has jsdom.
     */
    scope: HintScope.site
};

export default meta;
