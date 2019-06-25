/**
 * @fileoverview `babel-config/is-valid` warns against providing an invalid babel configuration file.
 */
import { debug as d } from '@hint/utils';
import { HintContext, IHint } from 'hint';
import { BabelConfigEvents, BabelConfigExtendsError, BabelConfigInvalidJSON, BabelConfigInvalidSchema } from '@hint/parser-babel-config';

import meta from './meta/is-valid';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */
export default class BabelConfigIsValidHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<BabelConfigEvents>) {
        const invalidJSONFile = (babelConfigInvalid: BabelConfigInvalidJSON, event: string) => {
            const { error, resource } = babelConfigInvalid;

            debug(getMessage('eventReceived', context.language, event));

            context.report(resource, error.message);
        };

        const invalidExtends = (babelConfigInvalid: BabelConfigExtendsError, event: string) => {
            const { error, resource, getLocation } = babelConfigInvalid;

            debug(getMessage('eventReceived', context.language, event));

            context.report(resource, error.message, { location: getLocation('extends') });
        };

        const invalidSchema = (fetchEnd: BabelConfigInvalidSchema) => {
            const { groupedErrors, resource } = fetchEnd;

            debug(getMessage('eventReceived', context.language, 'parse::error::babel-config::schema'));

            for (let i = 0; i < groupedErrors.length; i++) {
                const groupedError = groupedErrors[i];

                context.report(resource, groupedError.message, { location: groupedError.location });
            }
        };

        context.on('parse::error::babel-config::json', invalidJSONFile);
        context.on('parse::error::babel-config::extends', invalidExtends);
        context.on('parse::error::babel-config::schema', invalidSchema);
    }
}
