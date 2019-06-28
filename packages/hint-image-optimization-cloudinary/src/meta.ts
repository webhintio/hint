import { Category, HintMetadata, HintScope } from 'hint';

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
    id: 'image-optimization-cloudinary',
    schema: [{
        additionalProperties: false,
        properties: {
            apiKey: { type: 'string' },
            apiSecret: { type: 'string' },
            cloudName: { type: 'string' },
            threshold: { type: 'number' }
        }
    }],
    scope: HintScope.any
};

export default meta;
