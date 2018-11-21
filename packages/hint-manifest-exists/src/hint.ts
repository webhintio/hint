/**
 * @fileoverview Check if a single web app manifest file is specified,
 * and if that specified file is accessible.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import {
    ElementFound,
    FetchError,
    IHint,
    ScanEnd
} from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ManifestEvents } from '@hint/parser-manifest';

import meta from './meta';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestExistsHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ManifestEvents>) {

        let manifestIsSpecified = false;

        const checkIfManifestWasSpecified = async (scanEndEvent: ScanEnd) => {
            if (!manifestIsSpecified) {
                await context.report(scanEndEvent.resource, `'manifest' link element was not specified.`);
            }
        };

        const checkIfManifest = async (data: ElementFound) => {
            const { element, resource } = data;

            if (normalizeString(element.getAttribute('rel')) !== 'manifest') {
                return;
            }

            /*
             * Check if we encounter more than one
             * <link rel="manifest"...> declaration.
             */

            if (manifestIsSpecified) {
                await context.report(resource, `'manifest' link element is not needed as one was already specified.`, { element });

                return;
            }

            manifestIsSpecified = true;

            const href = normalizeString(element.getAttribute('href'));

            if (!href) {
                await context.report(resource, `'manifest' link element should have non-empty 'href' attribute.`, { element });
            }
        };

        const handleFetchErrors= async (fetchErrorEvent: FetchError) => {
            const { resource, element, error } = fetchErrorEvent;

            await context.report(resource, error.message, { element });
        };

        context.on('element::link', checkIfManifest);
        context.on('fetch::error::manifest', handleFetchErrors);
        context.on('scan::end', checkIfManifestWasSpecified);
    }
}
