import * as React from 'react';

import { ElementProps, Omit } from '../../utils/types';

import * as styles from './external-link.css';

type Props = Omit<'rel' | 'target', ElementProps<'a'>>;

/**
 * Radio input with common styles.
 */
const ExternalLink = ({ className, ...props }: Props) => {
    return (
        <a className={`${styles.root} ${className || ''}`} rel="noopener noreferrer" target="_blank" {...props} />
    );
};

export default ExternalLink;
