/**
 * @fileoverview `typescript-config/no-comments` checks if the
 * property `removeComments` is enabled in your TypeScript configuration
 * file (i.e `tsconfig.json`).
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

export default class TypeScriptConfigNoComments implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/no-comments` checks if the property `removeComments` is enabled in the TypeScript configuration file (i.e `tsconfig.json`)'
        },
        id: 'typescript-config/no-comments',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {
        const validate = configChecker('compilerOptions.removeComments', true, 'The compiler option "removeComments" should be enabled to reduce the output size.', context);

        context.on('parse::typescript-config::end', validate);
    }
}
