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
    FetchEnd,
    FetchError,
    HintContext,
    IHint
} from 'hint';
import { Severity } from '@hint/utils-types';
import { normalizeString } from '@hint/utils-string';
import { ManifestEvents } from '@hint/parser-manifest';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestExistsHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ManifestEvents>) {

        let manifestIsSpecified = false;

        const checkIfManifest = (data: ElementFound) => {
            const { element, resource } = data;

            if (normalizeString(element.getAttribute('rel')) !== 'manifest') {
                return;
            }

            /*
             * Check if we encounter more than one
             * <link rel="manifest"...> declaration.
             */

            if (manifestIsSpecified) {
                context.report(
                    resource,
                    getMessage('manifestDuplicated', context.language),
                    {
                        element,
                        severity: Severity.warning
                    });

                return;
            }

            manifestIsSpecified = true;

            const href = normalizeString(element.getAttribute('href'));

            if (!href) {
                context.report(
                    resource,
                    getMessage('manifestNonEmptyHref', context.language),
                    {
                        element,
                        severity: Severity.error
                    });
            }
        };

        const handleFetchEnd = ({ element, resource, response }: FetchEnd) => {
            if (response.statusCode >= 400) {
                context.report(
                    resource,
                    getMessage('manifestNotFetchedStatus', context.language, `${response.statusCode}`),
                    {
                        element,
                        severity: Severity.error
                    });
            }
        };

        const handleFetchErrors = (fetchErrorEvent: FetchError) => {
            const { resource, element } = fetchErrorEvent;

            context.report(
                resource,
                getMessage('manifestNotFetched', context.language),
                {
                    element,
                    severity: Severity.error
                });
        };

        context.on('element::link', checkIfManifest);
        context.on('fetch::end::manifest', handleFetchEnd);
        context.on('fetch::error::manifest', handleFetchErrors);
    }
}
