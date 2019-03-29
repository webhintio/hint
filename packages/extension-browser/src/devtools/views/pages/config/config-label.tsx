import * as React from 'react';
import { DetailedHTMLProps, LabelHTMLAttributes } from 'react';

import * as styles from './config-label.css';

type Props = DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;

/**
 * Label configuration inputs with common styles.
 */
const ConfigLabel = ({ className, ...props }: Props) => {
    return (
        <label className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default ConfigLabel;
