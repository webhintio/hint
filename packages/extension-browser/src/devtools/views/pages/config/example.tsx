import * as React from 'react';

import * as styles from './example.css';

type Props = {
    children: any;
    id?: string;
}

/**
 * Reference examples of valid configuration inputs with common styles.
 */
const ConfigExample = ({ children, id }: Props) => {
    return (
        <div id={id} className={styles.root}>
            {children}
        </div>
    );
};

export default ConfigExample;
