import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: `Image optimization with cloudinary`,
        name: 'Image optimization with Cloudinary'
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
