import * as React from 'react';

import Label, { Props } from '../../controls/label';

import * as styles from './label.css';

/**
 * Label configuration inputs with common styles.
 */
const ConfigLabel = ({ className, ...props }: Props) => {
    return (
        <Label className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default ConfigLabel;
