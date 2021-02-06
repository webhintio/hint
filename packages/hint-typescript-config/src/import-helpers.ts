/**
 * @fileoverview `typescript-config/import-helpers` checks if the property `importHelpers`
 * is enabled in the TypeScript configuration file (i.e `tsconfig.json`) to reduce the
 * output size.
 */
import * as path from 'path';

import { TypeScriptConfigEvents } from '@hint/parser-typescript-config';
import { Severity } from '@hint/utils-types';
import { HintContext, IHint, ScanEnd } from 'hint';
import { debug as d } from '@hint/utils-debug';
import { loadPackage } from '@hint/utils';

import { configChecker } from './helpers/config-checker';

import meta from './meta/import-helpers';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigImportHelpers implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<TypeScriptConfigEvents>) {
        const validate = configChecker('compilerOptions.importHelpers', true, 'importHelpers', context, Severity.warning);

        const validateTslibInstalled = (evt: ScanEnd) => {
            const { resource } = evt;

            try {
                const pathToTslib = path.dirname(require.resolve('tslib', { paths: [resource] }));

                debug(`Searching "tslib" relative to ${resource}`);
                loadPackage(pathToTslib);
                debug(`"tslib" found`);
            } catch (e) {
                debug(e);

                context.report(
                    resource,
                    getMessage('couldNotFindTSLib', context.language),
                    { severity: Severity.error }
                );
            }
        };

        context.on('parse::end::typescript-config', validate);
        context.on('parse::end::typescript-config', validateTslibInstalled);
    }
}
