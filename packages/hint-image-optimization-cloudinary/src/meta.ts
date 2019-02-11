import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Image optimization with cloudinary`,
        name: 'Optimize images'
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
