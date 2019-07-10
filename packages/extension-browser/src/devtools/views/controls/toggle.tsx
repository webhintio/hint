import * as React from 'react';
import { ElementProps, Omit } from '../../utils/types';

import * as styles from './toggle.css';

type Props = Omit<'type', ElementProps<'input'>>;

/**
 * Toggle input with common styles.
 */
const Toggle = ({ className, ...props }: Props) => {
    return (
        <input type="checkbox" className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Toggle;
