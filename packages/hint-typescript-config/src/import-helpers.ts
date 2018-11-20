/**
 * @fileoverview `typescript-config/import-helpers` checks if the property `importHelpers`
 * is enabled in the TypeScript configuration file (i.e `tsconfig.json`) to reduce the
 * output size.
 */
import * as path from 'path';

import { TypeScriptConfigEvents } from '@hint/parser-typescript-config';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ScanEnd } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import loadPackage from 'hint/dist/src/lib/utils/packages/load-package';

import { configChecker } from './helpers/config-checker';

import meta from './meta/import-helpers';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigImportHelpers implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<TypeScriptConfigEvents>) {
        const validate = configChecker('compilerOptions.importHelpers', true, 'The compiler option "importHelpers" should be enabled to reduce the output size.', context);

        const validateTslibInstalled = async (evt: ScanEnd): Promise<void> => {
            const { resource } = evt;

            const pathToTslib = path.join(process.cwd(), 'node_modules', 'tslib');

            debug(`Searching "tslib" in ${pathToTslib}`);

            try {
                loadPackage(pathToTslib);
                debug(`"tslib" found`);
            } catch (e) {
                debug(e);

                await context.report(resource, `Couldn't find package "tslib".`);
            }
        };

        context.on('parse::end::typescript-config', validate);
        context.on('parse::end::typescript-config', validateTslibInstalled);
    }
}
