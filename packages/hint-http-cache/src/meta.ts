import { rxLocalhost } from '@hint/utils-network/dist/src/rx-localhost';
import { rxLocalFile } from '@hint/utils-network/dist/src/rx-local-file';
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
    id: 'http-cache',
    ignoredUrls: [rxLocalhost, rxLocalFile],
    schema: [{
        additionalProperties: false,
        definitions: {
            'string-array': {
                items: { type: 'string' },
                minItems: 1,
                type: 'array',
                uniqueItems: true
            }
        },
        properties: {
            maxAgeResource: { type: 'number' },
            maxAgeTarget: { type: 'number' },
            revvingPatterns: { $ref: '#/definitions/string-array' }
        }
    }],
    scope: HintScope.site
};

export default meta;
