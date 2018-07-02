/**
 * @fileoverview `typescript-config/consistent-casing` checks if the property `forceConsistentCasingInFileNames`
 * is enabled in the TypeScript configuration file (i.e `tsconfig.json`).
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { configChecker } from './helpers/config-checker';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigConsistentCasing implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/consistent-casing` checks if the property `forceConsistentCasingInFileNames` is enabled in the TypeScript configuration file (i.e `tsconfig.json`)'
        },
        id: 'typescript-config/consistent-casing',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {
        const validate = configChecker('compilerOptions.forceConsistentCasingInFileNames', true, 'The compiler option "forceConsistentCasingInFileNames" should be enabled to reduce issues when working with different OSes.', context);

        context.on('parse::typescript-config::end', validate);
    }
}
