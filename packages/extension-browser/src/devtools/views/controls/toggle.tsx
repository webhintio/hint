import * as React from 'react';
import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import * as styles from './toggle.css';

type BaseProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
type Props = Pick<BaseProps, Exclude<keyof BaseProps, 'type'>>;

/**
 * Toggle input with common styles.
 */
const Toggle = ({ className, ...props }: Props) => {
    return (
        <input type="checkbox" className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Toggle;
