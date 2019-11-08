/**
 * @fileoverview `typescript-config/strict` checks if the property `strict`
 * is enabled in the TypeScript configuration file (i.e `tsconfig.json`).
 */
import { HintContext, IHint } from 'hint';
import { Severity } from '@hint/utils-types';
import { TypeScriptConfigEvents } from '@hint/parser-typescript-config';

import { configChecker } from './helpers/config-checker';

import meta from './meta/strict';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigStrict implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<TypeScriptConfigEvents>) {
        const validate = configChecker('compilerOptions.strict', true, 'strict', context, Severity.error);

        context.on('parse::end::typescript-config', validate);
    }
}
