/**
 * @fileoverview Check if a single web app manifest file is specified,
 * and if that specified file is accessible.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import {
    ElementFound,
    FetchError,
    IRule,
    RuleMetadata,
    ScanEnd
} from 'sonarwhal/dist/src/lib/types';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestExistsRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require a web app manifest'
        },
        id: 'manifest-exists',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

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
