/**
 * @fileoverview `typescript-config/strict` checks if the property `strict`
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

export default class TypeScriptConfigStrict implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/strict` checks if the property `strict` is enabled in the TypeScript configuration file (i.e `tsconfig.json`).'
        },
        id: 'typescript-config/strict',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {
        const validate = configChecker('compilerOptions.strict', true, 'The compiler option "strict" should be enabled to reduce type errors.', context);

        context.on('parse::typescript-config::end', validate);
    }
}
