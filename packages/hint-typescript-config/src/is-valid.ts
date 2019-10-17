/**
 * @fileoverview `typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import {
    TypeScriptConfigEvents,
    TypeScriptConfigExtendsError,
    TypeScriptConfigInvalidJSON,
    TypeScriptConfigInvalidSchema
} from '@hint/parser-typescript-config';

import meta from './meta/is-valid';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigIsValid implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<TypeScriptConfigEvents>) {

        const invalidJSONFile = (typeScriptConfigInvalid: TypeScriptConfigInvalidJSON, event: string) => {
            const { error, resource } = typeScriptConfigInvalid;

            debug(`${event} received`);

            context.report(resource, error.message);
        };

        const invalidExtends = (typeScriptConfigInvalid: TypeScriptConfigExtendsError, event: string) => {
            const { error, resource, getLocation } = typeScriptConfigInvalid;

            debug(`${event} received`);

            context.report(resource, error.message, { location: getLocation('extends', { at: 'value' }) });
        };

        const invalidSchema = (fetchEnd: TypeScriptConfigInvalidSchema) => {
            const { groupedErrors, resource } = fetchEnd;

            debug(`'parse::error::typescript-config::schema' received`);

            groupedErrors.forEach((groupedError: any) => {
                context.report(resource, groupedError.message, { location: groupedError.location });
            });
        };

        context.on('parse::error::typescript-config::json', invalidJSONFile);
        context.on('parse::error::typescript-config::extends', invalidExtends);
        context.on('parse::error::typescript-config::schema', invalidSchema);
    }
}
