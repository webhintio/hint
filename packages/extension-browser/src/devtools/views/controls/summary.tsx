import * as React from 'react';

import { ElementProps } from '../../utils/types';

import * as styles from './summary.css';

export type Props = ElementProps<'summary'>;

/**
 * Summary configuration inputs with common styles.
 */

const Summary = ({ className, ...props }: Props) => {
    return (
        <summary className={styles.summary}{...props} />
    );
};

export default Summary;
