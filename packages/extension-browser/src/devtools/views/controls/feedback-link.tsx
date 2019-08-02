import * as React from 'react';
import { useState, useEffect } from 'react';

import { Category } from 'hint/dist/src/lib/enums/category';

import { getMessage } from '../../utils/i18n';
import { Config, ErrorData } from '../../../shared/types';
import metas from '../../../shared/metas.import';

import ExternalLink from './external-link';
import { evaluate } from '../../utils/inject';
import escapeRegExp = require('lodash/escapeRegExp');

const categories = [...new Set(metas.map((meta) => {
    return (meta.docs && meta.docs.category || Category.other);
}))];
const { version } = require('../../../manifest.json');
const template = require('../../../../../../../.github/ISSUE_TEMPLATE/2-bug-report-browser.md').default.replace(/---([\s\S]*)---/gm, '').trim();

type Props = {
    config: Config;
    error?: ErrorData;
    altText?: string;
}

const webhintVersionRegex = /__webhint\sversion:__/g;
const browserVersionRegex = /__Browser\sversion:__/g;
const urlRegex = /__URL\sfor\swhich\swebhint\sfailed:__/g;

const labels = 'type:bug';
const title = '[Bug] Bug description';

const getRegex = (value: string) => {
    const baseRegexString = `\\*\\s\\[(x|\\s)]\\s({{value}})$`;

    return new RegExp(baseRegexString.replace('{{value}}', value), 'gmi');
};

/**
 * Link to github to give feedback.
 */
const FeedbackLink = ({ config, error, altText }: Props) => {
    const [issueUrl, setIssueUrlUrl] = useState('');

    const getLocation = () => {
        const disabledCategories = config.disabledCategories || [];
        const browserslists = config.browserslist === undefined ? '' : config.browserslist;
        const ignoredUrls = config.ignoredUrls;

        let body = template
            .replace(webhintVersionRegex, `__webhint version:__ ${version}`)
            .replace(browserVersionRegex, `__Browser version:__ ${navigator.userAgent}`)
            .replace(getRegex('Recommended settings'), `* [${!browserslists ? 'x' : ' '}] $2`)
            .replace(getRegex('Custom: <!-- Custom target browsers -->'), `* [${browserslists ? 'x' : ' '}] Custom: ${browserslists ? browserslists : ''} <!-- Custom target browsers -->`);

        for (const category of categories) {
            body = body.replace(getRegex(category), `* [${disabledCategories.includes(category) ? ' ' : 'x'}] $2`);
        }

        if (error) {
            body = body.replace(/(<!-- ✍️ Paste the error details here -->)/gim, `$1\n${error.message}\n${error.stack}`);
        }

        evaluate('window.location', (loc) => {
            const origin = loc.origin;
            const noIgnored = ignoredUrls === undefined;
            const isSameOrigin = !noIgnored && (ignoredUrls === '--webhint-third-party' || ignoredUrls === `^(?!${escapeRegExp(origin)})`);
            const isCustom = !noIgnored && !isSameOrigin;

            body = body.replace(getRegex('None'), `* [${noIgnored ? 'x' : ' '}] $2`)
                .replace(getRegex('Different origin'), `* [${isSameOrigin ? 'x' : ' '}] $2`)
                .replace(getRegex('Custom: <!-- Custom ignored resources -->'), `* [${isCustom ? 'x' : ' '}] Custom: ${isCustom ? ignoredUrls : ''} <!-- Custom ignored resources -->`);
            body = body.replace(urlRegex, `__URL for which webhint failed:__ ${loc.href}`);

            setIssueUrlUrl(`https://github.com/webhintio/hint/issues/new?labels=${encodeURIComponent(labels)}&template=2-bug-report-browser.md&body=${encodeURIComponent(body)}&title=${encodeURIComponent(title)}`);
        });
    };

    useEffect(getLocation);

    return (
        <ExternalLink href={issueUrl}>
            {altText ? altText : getMessage('feedback')}
        </ExternalLink>
    );
};

export default FeedbackLink;
