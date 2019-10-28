/**
 * @fileoverview Warns against having the BOM character at the beginning of a text file
 */
import { FetchEnd, HintContext, IHint, NetworkData } from 'hint';
import { asyncTry, contentType, debug as d, network } from '@hint/utils';

import meta from './meta';
import { getMessage } from './i18n.import';

const { isTextMediaType } = contentType;
const { isRegularProtocol } = network;
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const validateFetchEnd = async (fetchEnd: FetchEnd) => {
            debug(`Validating hint no-bom`);

            const { resource, element } = fetchEnd;

            if (!isRegularProtocol(resource) || !isTextMediaType(fetchEnd.response.mediaType)) {
                return;
            }

            /*
             * Chrome strips the BOM so we need to request the asset again using `fetchContent`
             * that will use the `request` module
             */
            const safeFetch = asyncTry<NetworkData>(context.fetchContent.bind(context));
            const request = await safeFetch(resource);

            if (!request) {
                context.report(resource, getMessage('couldNotBeFetched', context.language), { element });

                debug(`Error requesting the resource: ${resource}`);

                return;
            }

            const content = request.response.body.rawContent;

            if (content[0] === 0xEF &&
                content[1] === 0xBB &&
                content[2] === 0xBF
            ) {
                context.report(resource, getMessage('textBased', context.language), { element });
            }

        };

        context.on('fetch::end::*', validateFetchEnd);
    }
}
