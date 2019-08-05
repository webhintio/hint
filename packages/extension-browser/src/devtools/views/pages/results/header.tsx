import * as React from 'react';
import { useCallback, FormEvent } from 'react';

import { getMessage } from '../../../utils/i18n';

import Button from '../../controls/button';
import FeedbackLink from '../../controls/feedback-link';
import Label from '../../controls/label';
import LabelText from '../../controls/label-text';
import Toggle from '../../controls/toggle';
import { Config } from '../../../../shared/types';

import * as styles from './header.css';

type Props = {
    config: Config;
    onConfigureClick: () => void;
    setShowPassed: (showPassed: boolean) => void;
    showPassed: boolean;
    url: string;
};

const ResultsHeader = ({ config, onConfigureClick, showPassed, setShowPassed, url }: Props) => {

    const onShowPassedChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        const input = (event.target as HTMLInputElement);

        setShowPassed(input.checked);
    }, [setShowPassed]);

    return (
        <header className={styles.root}>
            <div className={styles.top}>
                <h1 className={`${styles.title} ${styles.headerText}`}>
                    {getMessage('scanResultTitle')}
                </h1>
                <FeedbackLink config={config}/>
            </div>
            <div className={styles.headerText}>
                {getMessage('targetUrl', url)}
            </div>
            <div className={styles.actions}>
                <Button type="submit" primary={true}>
                    {getMessage('scanAgainButtonLabel')}
                </Button>
                <Button type="button" onClick={onConfigureClick}>
                    {getMessage('newScanButtonLabel')}
                </Button>
                <Label className={styles.showPassedHints}>
                    <Toggle checked={showPassed} onChange={onShowPassedChange} />
                    <LabelText className={styles.showPassedHintsLabel}>
                        {getMessage('showPassedHintsLabel')}
                    </LabelText>
                </Label>
            </div>
        </header>
    );
};

export default ResultsHeader;
