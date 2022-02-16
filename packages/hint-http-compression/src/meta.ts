import { rxLocalhost } from '@hint/utils-network/dist/src/rx-localhost';
import { rxLocalFile } from '@hint/utils-network/dist/src/rx-local-file';
import { Category } from '@hint/utils-types';
import { HintMetadata, HintScope } from 'hint';

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
    id: 'http-compression',
    ignoredUrls: [rxLocalhost, rxLocalFile],
    schema: [{
        additionalProperties: false,
        definitions: {
            options: {
                additionalProperties: false,
                minProperties: 1,
                properties: {
                    brotli: { type: 'boolean' },
                    gzip: { type: 'boolean' },
                    zopfli: { type: 'boolean' }
                }
            }
        },
        properties: {
            html: { $ref: '#/definitions/options' },
            resource: { $ref: '#/definitions/options' }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
