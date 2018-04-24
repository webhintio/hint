/**
 * @fileoverview `typescript-config/no-comments` checks if the property `removeComments`
 * is enabled in the TypeScript configuration file (i.e `tsconfig.json`).
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { configChecker } from './helpers/config-checker';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigNoComments implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/no-comments` checks that the property `removeComments` is enabled in the TypeScript configuration file (i.e `tsconfig.json`).'
        },
        id: 'typescript-config/no-comments',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {
        const validate = configChecker('compilerOptions.removeComments', true, 'The compiler option "removeComments" should be enabled to reduce the output size.', context);

        context.on('parse::typescript-config::end', validate);
    }
}
