import * as React from 'react';

import { getMessage } from '../../utils/i18n';

import * as styles from './print-link.css';

const onPrintHandler = () => {
    window.print();
};

const PrintLink = () => {
    return (
        <button className={styles.root} onClick={onPrintHandler}>
            {getMessage('print')}
        </button>
    );
};

export default PrintLink;
