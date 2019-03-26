import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: `Verifies if a website is using HTTPS and if it has mixed content.`,
        name: 'Use HTTPS'
    },
    id: 'https-only',
    schema: [],
    scope: HintScope.site
};

export default meta;
