import * as React from 'react';
import { useCallback, useState } from 'react';

import * as styles from './notification.css';

import Button from './button';

import { getMessage } from '../../utils/i18n';

type Props = {
    actions: JSX.Element[];
    children: any;
    show: boolean;
}

const Notification = ({ actions, children, show }: Props) => {
    const [dismissed, setDismissed] = useState(false);
    const closeMessage = getMessage('close');

    const onDismissNotification = useCallback(() => {
        setDismissed(true);
    }, []);

    return (<div className={`${styles.root}`} hidden={!show || dismissed}>
        <div>
            {children}
        </div>
        <Button className={styles.close} title={closeMessage} onClick={onDismissNotification} />
        {actions && <div className={styles.actions}>{actions}</div>}
    </div>);
};

export default Notification;
