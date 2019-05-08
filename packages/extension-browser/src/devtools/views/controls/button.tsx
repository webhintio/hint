import * as React from 'react';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import * as styles from './button.css';

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    primary?: boolean;
};

const Button = ({className, primary, type, ...props}: Props) => {

    const classes = [styles.button];

    if (primary) {
        classes.push(styles.primary);
    }

    if (className) {
        classes.push(className);
    }

    return (
        <button type={type || 'button'} className={classes.join(' ')} {...props} />
    );
};

export default Button;
