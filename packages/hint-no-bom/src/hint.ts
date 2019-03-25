/**
 * @fileoverview Warns against having the BOM character at the beginning of a text file
 */
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { FetchEnd, IHint, NetworkData } from 'hint/dist/src/lib/types';
import { asyncTry, debug as d, network } from '@hint/utils';
import { isTextMediaType } from 'hint/dist/src/lib/utils/content-type';

import meta from './meta';

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
                context.report(resource, 'Content could not be fetched.', { element });

                debug(`Error requesting the resource: ${resource}`);

                return;
            }

            const content = request.response.body.rawContent;

            if (content[0] === 0xEF &&
                content[1] === 0xBB &&
                content[2] === 0xBF
            ) {
                context.report(resource, `Text-based resource should not start with BOM character.`, { element });
            }

        };

        context.on('fetch::end::*', validateFetchEnd);
    }
}
