import * as React from 'react';

import * as styles from './config-section.css';

type Props = {
    children: any;
    title: string;
}

/**
 * Wrap related configuration items with a common container and styles.
 */
const ConfigSection = ({ children, title }: Props) => {
    return (
        <section className={styles.root}>
            <h1 className={styles.header}>
                {title}
            </h1>
            {children}
        </section>
    );
};

export default ConfigSection;
