/**
 * @fileoverview `typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`.
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

import { TypeScriptConfigInvalidJSON, TypeScriptConfigInvalidSchema } from '@sonarwhal/parser-typescript-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigIsValid implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/is-valid` warns again providing an invalid TypeScript configuration file `tsconfig.json`'
        },
        id: 'typescript-config/is-valid',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {

        const invalidJSONFile = async (typeScriptConfigInvalid: TypeScriptConfigInvalidJSON) => {
            const { error, resource } = typeScriptConfigInvalid;

            debug(`parse::typescript-config::error::json received`);

            await context.report(resource, null, error.message);
        };

        const invalidSchema = async (fetchEnd: TypeScriptConfigInvalidSchema) => {
            const { prettifiedErrors, resource } = fetchEnd;

            debug(`parse::typescript-config::error::schema received`);

            for (const error of prettifiedErrors) {
                await context.report(resource, null, error);
            }
        };

        context.on('parse::typescript-config::error::json', invalidJSONFile);
        context.on('parse::typescript-config::error::schema', invalidSchema);
    }
}
