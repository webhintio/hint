import * as React from 'react';
import { useCallback, FormEvent } from 'react';
import escapeRegExp = require('lodash/escapeRegExp');

import { getMessage } from '../../../../utils/i18n';
import { useUniqueId } from '../../../../utils/ids';
import { evaluate } from '../../../../utils/inject';

import ExternalLink from '../../../controls/external-link';
import LabelText from '../../../controls/label-text';
import Radio from '../../../controls/radio';
import ValidInput from '../../../controls/valid-input';

import ConfigExample from '../example';
import ConfigLabel from '../label';
import ConfigSection from '../section';

const enum Ignore {
    ThirdParty = '--webhint-third-party'
}

type Props = {
    className?: string;
    query?: string;
    onChange: (query?: string) => void;
};

const placeholder = 'google-analytics.com';

/** Create a regular expression to exclude URLs not part of the current origin. */
const buildIgnoreThirdParty = (): Promise<string> => {
    return new Promise((resolve, reject) => {

        evaluate('location.origin', (origin: string, err) => {
            if (err) {
                reject(err);
            } else {
                resolve(`^(?!${escapeRegExp(origin)})`);
            }
        });

    });
};

/** Check if a user's custom ignore regex is valid, notifying them if it is not. */
const validate = (value?: string): string => {
    if (!value) {
        return '';
    }

    try {
        new RegExp(value); // eslint-disable-line no-new

        return '';
    } catch (e) {
        return e.message;
    }
};

/**
 * Convert any special query values from the `Ignore` enum to actual
 * ignored URL query strings to pass to the analyzer.
 *
 * Certain ignore queries are saved as special keys since the actual
 * query string used varies depending on which site is being analyzed
 * (e.g. `Ignore.ThirdParty` uses the current domain name).
 */
export const resolveIgnoreQuery = async (query?: string): Promise<string | undefined> => {
    if (query === Ignore.ThirdParty) {
        return await buildIgnoreThirdParty();
    }

    return query;
};

/**
 * Display options to exclude resources matching a given query from a scan.
 */
const ResourcesSection = ({ className, query, onChange }: Props) => {
    const customValue = query && query !== Ignore.ThirdParty ? query : '';

    const onDefaultSelected = useCallback(() => {
        onChange();
    }, [onChange]);

    const onThirdPartySelected = useCallback(() => {
        onChange(Ignore.ThirdParty);
    }, [onChange]);

    const onCustomSelected = useCallback(() => {
        onChange(placeholder);
    }, [onChange]);

    const onCustomChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        onChange((event.target as HTMLInputElement).value);
    }, [onChange]);

    const onCustomFocus = useCallback(() => {
        if (!customValue) {
            onChange(placeholder);
        }
    }, [customValue, onChange]);

    const groupLabelId = useUniqueId(),
        noneLabelId = useUniqueId(),
        originLabelId = useUniqueId(),
        customLabelId = useUniqueId();

    return (
        <ConfigSection className={className} title={getMessage('ignoredResourcesTitle')} titleId={groupLabelId}>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${noneLabelId}`}
                    name="resources"
                    checked={!query}
                    onChange={onDefaultSelected}
                />
                <LabelText id={noneLabelId}>
                    {getMessage('noneLabel')}
                </LabelText>
            </ConfigLabel>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${originLabelId}`}
                    checked={query === Ignore.ThirdParty}
                    name="resources"
                    onChange={onThirdPartySelected}
                />
                <LabelText id={originLabelId}>
                    {getMessage('differentOriginLabel')}
                </LabelText>
            </ConfigLabel>
            <ConfigLabel>
                <span id={customLabelId} hidden>
                    {getMessage('customResourcesLabel')}
                </span>
                <Radio
                    aria-labelledby={`${groupLabelId} ${customLabelId}`}
                    checked={!!customValue}
                    name="resources"
                    onChange={onCustomSelected}
                />
                <ValidInput
                    aria-label={getMessage('customResourcesValueLabel')}
                    onChange={onCustomChange}
                    onFocus={onCustomFocus}
                    placeholder={placeholder}
                    tabIndex={customValue ? 0 : -1}
                    type="text"
                    validate={validate}
                    value={customValue}
                />
                <ConfigExample>
                    <ExternalLink href="https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/">
                        {getMessage('seeExpressionInstructionsLabel')}
                    </ExternalLink>
                </ConfigExample>
            </ConfigLabel>
        </ConfigSection>
    );
};

export default ResourcesSection;
