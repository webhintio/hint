import * as React from 'react';

import * as styles from './example.css';

type Props = {
    children: any;
}

/**
 * Reference examples of valid configuration inputs with common styles.
 */
const ConfigExample = ({ children }: Props) => {
    return (
        <div className={styles.root}>
            {children}
        </div>
    );
};

export default ConfigExample;
