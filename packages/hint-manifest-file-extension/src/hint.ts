/**
 * @fileoverview Check if `.webmanifest` is used as the file extension
 * for the web app manifest file.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { normalizeString } from '@hint/utils-string';
import { fileExtension as getFileExtension } from '@hint/utils-fs';
import { ElementFound, IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestFileExtensionHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const standardManifestFileExtension = 'webmanifest';

        const validate = ({ element, resource }: ElementFound) => {
            if (normalizeString(element.getAttribute('rel')) === 'manifest') {
                const href = element.resolveUrl(element.getAttribute('href') || /* istanbul ignore next */ '');
                const fileExtension: string = getFileExtension(normalizeString(href) || /* istanbul ignore next */ '');

                if (fileExtension !== standardManifestFileExtension) {
                    const message = getMessage('shouldHaveFileExtension', context.language, standardManifestFileExtension);
                    const severity = fileExtension === 'json' ? Severity.hint : Severity.warning;

                    context.report(resource, message, { content: fileExtension, element, severity });
                }
            }
        };

        context.on('element::link', validate);
    }
}
