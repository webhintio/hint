import * as React from 'react';

import { ElementProps } from '../../utils/types';

import * as styles from './progress-bar.css';

type Props = ElementProps<'progress'>;

/**
 * Progress bar with common styles.
 */
const ProgressBar = ({ className, ...props }: Props) => {
    return (
        <progress className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default ProgressBar;
