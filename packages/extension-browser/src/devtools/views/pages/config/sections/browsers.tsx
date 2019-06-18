import * as React from 'react';
import { useCallback, FormEvent } from 'react';
import browserslist = require('browserslist');

import { getMessage } from '../../../../utils/i18n';

import ExternalLink from '../../../controls/external-link';
import LabelText from '../../../controls/label-text';
import Radio from '../../../controls/radio';
import ValidInput from '../../../controls/valid-input';

import ConfigExample from '../example';
import ConfigLabel from '../label';
import ConfigSection from '../section';

type Props = {
    className?: string;
    query?: string;
    onChange: (query?: string) => void;
};

const placeholder = 'defaults, not IE 11';

/** Check if a user's custom `browserslist` query is valid, notifying them if it is not. */
const validate = (value?: string): string => {
    try {
        browserslist(value && value.trim());

        return '';
    } catch (e) {
        /*
         * Report errors, stripping suffix about "old" browserslist since the user won't have control over that.
         * E.g. "Unknown browser query `IE `. Maybe you are using old Browserslist or made typo in query."
         */
        return e.message.replace(' Maybe you are using old Browserslist or made typo in query.', '');
    }
};

/**
 * Display options ot include/exclude issues pertaining to
 * specific browsers from a scan.
 */
const BrowsersSection = ({ className, query, onChange }: Props) => {

    const onDefaultSelected = useCallback(() => {
        onChange();
    }, [onChange]);

    const onCustomSelected = useCallback(() => {
        onChange(placeholder);
    }, [onChange]);

    const onCustomChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        onChange((event.target as HTMLInputElement).value);
    }, [onChange]);

    const onCustomFocus = useCallback(() => {
        if (!query) {
            onChange(placeholder);
        }
    }, [onChange, query]);

    return (
        <ConfigSection className={className} title={getMessage('targetBrowsersTitle')}>
            <ConfigLabel>
                <Radio name="browsers" checked={!query} onChange={onDefaultSelected} />
                <LabelText>{getMessage('recommendedSettingsLabel')}</LabelText>
                <ConfigExample>&gt; 0.5%, last 2 versions, Firefox ESR, not dead</ConfigExample>
            </ConfigLabel>
            <ConfigLabel>
                <Radio name="browsers" checked={!!query} onChange={onCustomSelected} />
                <ValidInput type="text" tabIndex={query ? 0 : -1} placeholder={placeholder} value={query || ''} validate={validate} onChange={onCustomChange} onFocus={onCustomFocus} />
                <ConfigExample>
                    <ExternalLink href="https://github.com/browserslist/browserslist#full-list">
                        {getMessage('seeQueryInstructionsLabel')}
                    </ExternalLink>
                </ConfigExample>
            </ConfigLabel>
        </ConfigSection>
    );
};

export default BrowsersSection;
