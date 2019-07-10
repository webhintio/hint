import * as React from 'react';

import { getMessage } from '../utils/i18n';

import ExternalLink from './controls/external-link';

type Props = {
    className?: string;
};

const { version } = require('../../manifest.json');

const PoweredBy = ({ className }: Props) => {
    return (
        <div className={className || ''}>
            {getMessage('poweredByLabel')}
            {' '}
            <ExternalLink href="https://webhint.io">
                webhint
            </ExternalLink>
            {' '}
            v{version}
        </div>
    );
};

export default PoweredBy;
