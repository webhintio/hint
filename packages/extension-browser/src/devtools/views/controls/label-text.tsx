import * as React from 'react';

import { ElementProps } from '../../utils/types';

import * as styles from './label-text.css';

type Props = ElementProps<'span'>;

/**
 * Checkbox input with common styles.
 */
const LabelText = ({ className, ...props }: Props) => {
    return (
        <span className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default LabelText;
