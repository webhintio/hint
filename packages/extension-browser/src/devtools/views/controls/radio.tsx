import * as React from 'react';

import { ElementProps, Omit } from '../../utils/types';

import * as styles from './radio.css';

type Props = Omit<'type', ElementProps<'input'>>;

/**
 * Radio input with common styles.
 */
const Radio = ({ className, ...props }: Props) => {
    return (
        <input type="radio" className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Radio;
