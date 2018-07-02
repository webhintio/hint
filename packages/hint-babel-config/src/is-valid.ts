/**
 * @fileoverview `babel-config/is-valid` warns against providing an invalid babel configuration file.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

import { BabelConfigInvalidJSON, BabelConfigInvalidSchema } from '@hint/parser-babel-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */
export default class BabelConfigIsValidHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: `'babel-config/is-valid' warns against providing an invalid babel configuration file \`.babelrc\``
        },
        id: 'babel-config/is-valid',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {
        const invalidJSONFile = async (babelConfigInvalid: BabelConfigInvalidJSON, event: string) => {
            const { error, resource } = babelConfigInvalid;

            debug(`${event} received`);

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
        context.on('parse::babel-config::error::circular', invalidJSONFile);
        context.on('parse::babel-config::error::extends', invalidJSONFile);
        context.on('parse::babel-config::error::schema', invalidSchema);
    }
}
