import * as React from 'react';
import { useCallback, FormEvent } from 'react';

import { getMessage } from '../../../utils/i18n';

import Button from '../../controls/button';
import Label from '../../controls/label';
import LabelText from '../../controls/label-text';
import Toggle from '../../controls/toggle';
import Feedback from '../../controls/feedback';

import * as styles from './header.css';

type Props = {
    onConfigureClick: () => void;
    setShowPassed: (showPassed: boolean) => void;
    showPassed: boolean;
    url: string;
};

const ResultsHeader = ({ onConfigureClick, showPassed, setShowPassed, url }: Props) => {

    const onShowPassedChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        const input = (event.target as HTMLInputElement);

        setShowPassed(input.checked);
    }, [setShowPassed]);

    return (
        <header className={styles.root}>
            <div className={`${styles.title} ${styles.headerText}`}>
                {getMessage('scanResultTitle')}
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
                    <LabelText>
                        {getMessage('showPassedHintsLabel')}
                    </LabelText>
                </Label>
                <Feedback></Feedback>
            </div>
        </header>
    );
};

export default ResultsHeader;
