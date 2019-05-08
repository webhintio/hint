import * as React from 'react';

import { ElementProps } from '../../utils/types';

import * as styles from './label.css';

export type Props = ElementProps<'label'>;

/**
 * Label configuration inputs with common styles.
 */
const Label = ({ className, ...props }: Props) => {
    return (
        <label className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Label;
