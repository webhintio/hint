import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events } from 'hint/dist/src/lib/types';

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, ICompatLibrary } from '../types';
import { CompatNamespace } from '../enums';
import { CompatHTML } from './compat-html';
import { CompatCSS } from './compat-css';
import { StyleEvents } from '@hint/parser-css/dist/src/types';

export class CompatLibraryFactory {

    public static create<T extends Events>(
        namespaceName: CompatNamespace,
        hintContext: HintContext<T>,
        mdnData: MDNTreeFilteredByBrowsers,
        testFunction: TestFeatureFunction
    ): ICompatLibrary {

        if (namespaceName === CompatNamespace.HTML) {
            return new CompatHTML(hintContext, mdnData, testFunction);
        }

        // WORKAROUND: https://github.com/Microsoft/TypeScript/issues/28067#issuecomment-433952156
        return new CompatCSS(<unknown>hintContext as HintContext<StyleEvents>, mdnData, testFunction);
    }
}
