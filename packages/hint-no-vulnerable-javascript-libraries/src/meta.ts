import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: `This hint checks if the site is running any vulnerable library using https://snyk.io database`,
        name: 'No vulnerable libraries'
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
     * Snyk can not analize a file itself, it needs a connector.
     * TODO: Change to any once the local connector has jsdom.
     */
    scope: HintScope.site
};

export default meta;
