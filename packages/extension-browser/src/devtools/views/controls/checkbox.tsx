import * as React from 'react';

import { ElementProps, Omit } from '../../utils/types';

import * as styles from './checkbox.css';

type Props = Omit<'type', ElementProps<'input'>>;

/**
 * Checkbox input with common styles.
 */
const Checkbox = ({ className, ...props }: Props) => {
    return (
        <input type="checkbox" className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Checkbox;
