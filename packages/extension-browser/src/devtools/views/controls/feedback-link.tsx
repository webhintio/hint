import * as React from 'react';
import { useState, useEffect } from 'react';

import { getMessage } from '../../utils/i18n';
import { Config, ErrorData } from '../../../shared/types';

import ExternalLink from './external-link';
import { evaluate } from '../../utils/inject';
import { getCategories } from '../../utils/categories';
import escapeRegExp = require('lodash/escapeRegExp');
import { getCategoryName } from '@hint/utils/dist/src/i18n';

const categories = getCategories();

const { version } = require('../../../manifest.json');
let template = require('../../../../../../../.github/ISSUE_TEMPLATE/2-bug-report-browser.md').default;

// Remove frontMatter from template.
template = template.replace(/---([\s\S]*)---/gm, '').trim();

type Props = {
    config: Config;
    error?: ErrorData;
    children?: any;
}

const labels = 'type:bug';
const title = '[Bug] Bug description';

/**
 * Link to github to give feedback.
 */
const FeedbackLink = ({ config, error, children }: Props) => {
    const [issueUrl, setIssueUrl] = useState('');

    useEffect(() => {
        const disabledCategories = config.disabledCategories || [];
        const browserslists = config.browserslist || '';
        const ignoredUrls = config.ignoredUrls;

        let body = template
            .replace('__webhint version:__', `__webhint version:__ ${version}`)
            .replace('__Browser version:__', `__Browser version:__ ${navigator.userAgent}`)
            .replace('[x] Recommended settings', `[${!browserslists ? 'x' : ' '}] Recommended settings`)
            .replace('[ ] Custom: <!-- Custom target browsers -->', `[${browserslists ? 'x' : ' '}] Custom: ${browserslists ? browserslists : ''} <!-- Custom target browsers -->`);

        for (const category of categories) {
            body = body.replace(`[x] ${getCategoryName(category)}`, `[${disabledCategories.includes(category) ? ' ' : 'x'}] ${getCategoryName(category)}`);
        }

        if (error) {
            body = body.replace('<!-- ✍️ Paste the error details here -->', `${error.message}\n${error.stack}`);
        }

        const getLocation = async () => {
            const loc = await evaluate('window.location');
            const origin = loc.origin;
            const noIgnored = ignoredUrls === undefined;
            const isSameOrigin = !noIgnored && (ignoredUrls === '--webhint-third-party' || ignoredUrls === `^(?!${escapeRegExp(origin)})`);
            const isCustom = !noIgnored && !isSameOrigin;

            body = body.replace('[x] None', `* [${noIgnored ? 'x' : ' '}] None`)
                .replace('[ ] Different origin', `* [${isSameOrigin ? 'x' : ' '}] Different origin`)
                .replace('[ ] Custom: <!-- Custom ignored resources -->', `* [${isCustom ? 'x' : ' '}] Custom: ${isCustom ? ignoredUrls : ''} <!-- Custom ignored resources -->`);
            body = body.replace('`__URL for which webhint failed:__', `__URL for which webhint failed:__ ${loc.href}`);

            setIssueUrl(`https://github.com/webhintio/hint/issues/new?labels=${encodeURIComponent(labels)}&template=2-bug-report-browser.md&body=${encodeURIComponent(body)}&title=${encodeURIComponent(title)}`);
        };

        getLocation();
    });

    return (
        <ExternalLink href={issueUrl}>
            {children ? children : getMessage('feedback')}
        </ExternalLink>
    );
};

export default FeedbackLink;
