/**
 * @fileoverview `babel-config/is-valid` warns against providing an invalid babel configuration file.
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

import { BabelConfigInvalidJSON, BabelConfigInvalidSchema } from '@sonarwhal/parser-babel-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */
export default class BabelConfigIsValidRule implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: `'babel-config/is-valid' warns against providing an invalid babel configuration file \`.babelrc\``
        },
        id: 'babel-config/is-valid',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {
        const invalidJSONFile = async (babelConfigInvalid: BabelConfigInvalidJSON) => {
            const { error, resource } = babelConfigInvalid;

            debug(`parse::babel-config::error::json received`);

            await context.report(resource, null, error.message);
        };

        const invalidSchema = async (fetchEnd: BabelConfigInvalidSchema) => {
            const { prettifiedErrors, resource } = fetchEnd;

            debug(`parse::babel-config::error::schema received`);

            for (const error of prettifiedErrors) {
                await context.report(resource, null, error);
            }
        };

        context.on('parse::babel-config::error::json', invalidJSONFile);
        context.on('parse::babel-config::error::schema', invalidSchema);
    }
}
