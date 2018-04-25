/**
 * @fileoverview `typescript-config/strict` checks if the property `strict`
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

export default class TypeScriptConfigStrict implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/strict` checks if the property `strict` is enabled in the TypeScript configuration file (i.e `tsconfig.json`).'
        },
        id: 'typescript-config/strict',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {
        const validate = configChecker('compilerOptions.strict', true, 'The compiler option "strict" should be enabled to reduce type errors.', context);

        context.on('parse::typescript-config::end', validate);
    }
}
