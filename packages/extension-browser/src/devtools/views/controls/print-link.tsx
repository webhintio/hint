import * as React from 'react';

import * as styles from './print-link.css';

const onPrintHandler = () => {
    window.print();
};

const PrintLink = () => {
    return (
        <span className={styles.root} onClick={onPrintHandler}>
            Print
        </span>
    );
};

export default PrintLink;
