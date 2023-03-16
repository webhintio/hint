import * as React from 'react';
import { useCallback } from 'react';

import { getMessage } from '../../../../utils/i18n';
import { useUniqueId } from '../../../../utils/ids';

import Radio from '../../../controls/radio';

import ConfigLabel from '../label';
import ConfigSection from '../section';
import { Severity } from '@hint/utils-types';

type Props = {
    className?: string;
    query?: string;
    onChange: (query?: string) => void;
};

/**
 * Display options to exclude resources matching a given query from a scan.
 */
const SeveritySection = ({ className, query, onChange }: Props) => {
    const onErrorSelected = useCallback(() => {
        onChange(Severity.error.toString());
    }, [onChange]);

    const onWarningSelected = useCallback(() => {
        onChange(Severity.warning.toString());
    }, [onChange]);

    const onInformationSelected = useCallback(() => {
        onChange(Severity.information.toString());
    }, [onChange]);

    const onHintSelected = useCallback(() => {
        onChange(Severity.hint.toString());
    }, [onChange]);

    const groupLabelId = useUniqueId();
    const errorLabelId = useUniqueId();
    const warningLabelId = useUniqueId();
    const informationLabelId = useUniqueId();
    const hintLabelId = useUniqueId();

    return (
        <ConfigSection className={className} title={getMessage('severityTitle')} titleId={groupLabelId}>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${errorLabelId}`}
                    name="severity"
                    checked={query === Severity.error.toString()}
                    onChange={onErrorSelected}
                />
                <span id={errorLabelId}>
                    {getMessage('errorLabel')}
                </span>
            </ConfigLabel>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${warningLabelId}`}
                    checked={!query || query === Severity.warning.toString()}
                    name="severity"
                    onChange={onWarningSelected}
                />
                <span id={warningLabelId}>
                    {getMessage('warningLabel')}
                </span>
            </ConfigLabel>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${hintLabelId}`}
                    checked={query === Severity.hint.toString()}
                    name="severity"
                    onChange={onHintSelected}
                />
                <span id={hintLabelId}>
                    {getMessage('hintLabel')}
                </span>
            </ConfigLabel>
            <ConfigLabel>
                <Radio
                    aria-labelledby={`${groupLabelId} ${informationLabelId}`}
                    checked={query === Severity.information.toString()}
                    name="severity"
                    onChange={onInformationSelected}
                />
                <span id={informationLabelId}>
                    {getMessage('informationLabel')}
                </span>
            </ConfigLabel>
        </ConfigSection>
    );
};

export default SeveritySection;
