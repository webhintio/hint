/**
 * @fileoverview `typescript-config/no-comments` checks if the
 * property `removeComments` is enabled in your TypeScript configuration
 * file (i.e `tsconfig.json`).
 */
import { HintContext, IHint } from 'hint';
import { configChecker } from './helpers/config-checker';

import { TypeScriptConfigEvents } from '@hint/parser-typescript-config';

import meta from './meta/no-comments';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigNoComments implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<TypeScriptConfigEvents>) {
        const validate = configChecker('compilerOptions.removeComments', true, 'removeComments', context);

        context.on('parse::end::typescript-config', validate);
    }
}
