import * as React from 'react';
import { useCallback, FormEvent } from 'react';
import browserslist = require('browserslist');

import { getMessage } from '../../../utils/i18n';

import ConfigExample from './config-example';
import ConfigLabel from './config-label';
import ConfigSection from './config-section';
import ValidInput from './valid-input';

type Props = {
    query?: string;
    onChange: (query?: string) => void;
};

const placeholder = '> 1%, IE 10';

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
const BrowsersSection = ({ query, onChange }: Props) => {

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
        <ConfigSection title={getMessage('yourTargetBrowsersTitle')}>
            <ConfigLabel>
                <input type="radio" name="browsers" checked={!query} onChange={onDefaultSelected} />
                {getMessage('recommendedSettingsLabel')}
                <ConfigExample>&gt; 0.5%, last 2 versions, Firefox ESR, not dead</ConfigExample>
            </ConfigLabel>
            <ConfigLabel>
                <input type="radio" name="browsers" checked={!!query} onChange={onCustomSelected} />
                <ValidInput type="text" placeholder={placeholder} value={query || ''} validate={validate} onChange={onCustomChange} onFocus={onCustomFocus} />
                <ConfigExample>
                    <a href="https://github.com/browserslist/browserslist#full-list" target="_blank">
                        {getMessage('seeQueryInstructionsLabel')}
                    </a>
                </ConfigExample>
            </ConfigLabel>
        </ConfigSection>
    );
};

export default BrowsersSection;
