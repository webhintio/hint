/**
 * @fileoverview Check if a single web app manifest file is specified,
 * and if that specified file is accessible.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import {
    ElementFound,
    FetchError,
    IHint,
    HintMetadata,
    ScanEnd
} from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestExistsHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require a web app manifest'
        },
        id: 'manifest-exists',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        let manifestIsSpecified = false;

        const checkIfManifestWasSpecified = async (scanEndEvent: ScanEnd) => {
            if (!manifestIsSpecified) {
                await context.report(scanEndEvent.resource, null, 'Web app manifest not specified');
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
                await context.report(resource, element, 'A web app manifest file was already specified');

                return;
            }

            manifestIsSpecified = true;

            const href = normalizeString(element.getAttribute('href'));

            if (!href) {
                await context.report(resource, element, `Should have non-empty 'href'`);
            }
        };

        const handleFetchErrors= async (fetchErrorEvent: FetchError) => {
            const { resource, element, error } = fetchErrorEvent;

            await context.report(resource, element, error.message);
        };

        context.on('element::link', checkIfManifest);
        context.on('fetch::error::manifest', handleFetchErrors);
        context.on('scan::end', checkIfManifestWasSpecified);
    }
}
