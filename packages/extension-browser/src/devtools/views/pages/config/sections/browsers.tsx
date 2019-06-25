import * as React from 'react';
import { useCallback, FormEvent } from 'react';
import browserslist = require('browserslist');

import { getMessage } from '../../../../utils/i18n';
import { useUniqueId } from '../../../../utils/ids';

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

    const groupLabelId = useUniqueId(),
        defaultLabelId = useUniqueId(),
        defaultDescId = useUniqueId(),
        customLabelId = useUniqueId();

    return (
        <ConfigSection className={className} title={getMessage('targetBrowsersTitle')} titleId={groupLabelId}>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${defaultLabelId}`}
                    aria-describedby={defaultDescId}
                    checked={!query}
                    name="browsers"
                    onChange={onDefaultSelected}
                />
                <LabelText id={defaultLabelId}>
                    {getMessage('recommendedSettingsLabel')}
                </LabelText>
                <ConfigExample id={defaultDescId}>
                    &gt; 0.5%, last 2 versions, Firefox ESR, not dead
                </ConfigExample>
            </ConfigLabel>
            <ConfigLabel>
                <span id={customLabelId} hidden>
                    {getMessage('customBrowsersLabel')}
                </span>
                <Radio
                    aria-labelledby={`${groupLabelId} ${customLabelId}`}
                    checked={!!query}
                    name="browsers"
                    onChange={onCustomSelected}
                />
                <ValidInput
                    aria-label={getMessage('customBrowsersValueLabel')}
                    onChange={onCustomChange}
                    onFocus={onCustomFocus}
                    placeholder={placeholder}
                    tabIndex={query ? 0 : -1}
                    type="text"
                    validate={validate}
                    value={query || ''}
                />
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
