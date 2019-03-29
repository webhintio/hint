import * as React from 'react';
import { useCallback, FormEvent } from 'react';
import escapeRegExp = require('lodash/escapeRegExp');

import { browser } from '../../../../shared/globals';

import { getMessage } from '../../../utils/i18n';

import ConfigExample from './config-example';
import ConfigLabel from './config-label';
import ConfigSection from './config-section';
import ValidInput from './valid-input';

const enum Ignore {
    ThirdParty = '--webhint-third-party'
}

type Props = {
    query?: string;
    onChange: (query?: string) => void;
};

const placeholder = 'google-analytics.com';

/** Create a regular expression to exclude URLs not part of the current origin. */
const buildIgnoreThirdParty = (): Promise<string> => {
    return new Promise((resolve) => {
        browser.devtools.inspectedWindow.eval('location.origin', (origin: string) => {
            resolve(`^(?!${escapeRegExp(origin)})`);
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
const ResourcesSection = ({ query, onChange }: Props) => {
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

    return (
        <ConfigSection title={getMessage('ignoredResourcesTitle')}>
            <ConfigLabel>
                <input type="radio" name="resources" checked={!query} onChange={onDefaultSelected} />
                {getMessage('noneLabel')}
            </ConfigLabel>
            <ConfigLabel>
                <input type="radio" name="resources" checked={query === Ignore.ThirdParty} onChange={onThirdPartySelected} />
                {getMessage('differentOriginLabel')}
            </ConfigLabel>
            <ConfigLabel>
                <input type="radio" name="resources" checked={!!customValue} onChange={onCustomSelected} />
                <ValidInput type="text" placeholder={placeholder} value={customValue} validate={validate} onChange={onCustomChange} onFocus={onCustomFocus} />
                <ConfigExample>
                    <a href="https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/" target="_blank">
                        {getMessage('seeExpressionInstructionsLabel')}
                    </a>
                </ConfigExample>
            </ConfigLabel>
        </ConfigSection>
    );
};

export default ResourcesSection;
