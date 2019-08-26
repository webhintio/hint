import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import * as styles from './notification.css';

import Button from './button';

import { getMessage } from '../../utils/i18n';

type Props = {
    show: boolean;
    children?: any;
}

const Notification = ({ show, children }: Props) => {
    const [showNotification, setShow] = useState(false);
    const [discarted, setDiscarted] = useState(false);
    const closeMessage = getMessage('close');

    const onDiscardNotification = useCallback(() => {
        setShow(false);
        setDiscarted(true);
    }, []);

    useEffect(() => {
        if (!show) {
            setShow(show);
        } else if (!discarted) {
            setTimeout(() => {
                setShow(show);
            }, 1000);
        }
    }, [show, discarted]);

    return (<div className={`${styles.root} ${showNotification ? styles.visible : ''}`}>
        <Button className={styles.close} title={closeMessage} aria-label={closeMessage} onClick={onDiscardNotification} />
        {children}
    </div>);
};

export default Notification;
