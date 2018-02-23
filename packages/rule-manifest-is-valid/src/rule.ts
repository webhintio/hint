/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IFetchEnd, IResponse, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestIsValid implements IRule {
    private _id: string;

    public get id() {
        return this._id;
    }

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require valid web app manifest'
        },
        schema: [],
        scope: RuleScope.any
    }

    public constructor(id: string, context: RuleContext) {

        this._id = id;

        const manifestIsValid = async (data: IFetchEnd) => {
            const { resource, response: { body: { content }, statusCode } }: { resource: string, response: IResponse } = data;

            if (statusCode !== 200) {
                return;
            }

            // null, empty string, etc. are not valid manifests
            if (!content) {
                await context.report(resource, null, `Manifest file is not a text file`);
                debug('Manifest file is not a text file');

                return;
            }

            try {
                // TODO: Add more complex web app manifest file validation.
                JSON.parse(content);
            } catch (e) {
                debug('Failed to parse the manifest file');
                await context.report(resource, null, `Manifest file doesn't contain valid JSON`);
            }
        };

        context.on(this.id, 'fetch::end::manifest', manifestIsValid);
    }
}
