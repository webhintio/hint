import * as React from 'react';
import { useCallback } from 'react';

import { getMessage } from '../../utils/i18n';
import { evaluate } from '../../utils/inject';

import * as styles from './inspect-button.css';

type Props = {
    target: number;
};

const InspectButton = ({ target }: Props) => {

    const onClick = useCallback(() => {
        // Verify target is actually a number since it originates from untrusted snapshot data.
        if (typeof target === 'number') {
            evaluate(`inspect(__webhint.findNode(${target}))`);
        }
    }, [target]);

    return (
        <button type="button" className={styles.root} title={getMessage('inspectElement')} onClick={onClick} />
    );
};

export default InspectButton;
