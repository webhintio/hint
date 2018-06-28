/**
 * @fileoverview `typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { RuleScope } from 'hint/dist/src/lib/enums/rulescope';
import { RuleContext } from 'hint/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { TypeScriptConfigInvalidJSON, TypeScriptConfigInvalidSchema } from '@hint/parser-typescript-config/dist/src/types';

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
            description: '`typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`'
        },
        id: 'typescript-config/is-valid',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {

        const invalidJSONFile = async (typeScriptConfigInvalid: TypeScriptConfigInvalidJSON, event: string) => {
            const { error, resource } = typeScriptConfigInvalid;

            debug(`${event} received`);

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
        context.on('parse::typescript-config::error::circular', invalidJSONFile);
        context.on('parse::typescript-config::error::extends', invalidJSONFile);
        context.on('parse::typescript-config::error::schema', invalidSchema);
    }
}
