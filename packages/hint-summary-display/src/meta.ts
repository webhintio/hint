import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `Checks if display applied to a summary tag will hide the open/close icon`
    },
    id: 'summary-display',
    schema: [
        /*
         * If you want to allow the user to configure your hint
         * you should use a valid JSON schema. More info in:
         * https://webhint.io/docs/contributor-guide/hints/#themetaproperty
         */
    ],
    scope: HintScope.any
};

export default meta;
