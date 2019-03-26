import { Category, HintMetadata, HintScope } from 'hint';

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
