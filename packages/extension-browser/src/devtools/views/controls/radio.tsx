import * as React from 'react';

import { useCurrentDesignStyles } from '../../utils/themes';
import { ElementProps, Omit } from '../../utils/types';

import * as fluent from './radio.fluent.css';
import * as photon from './radio.photon.css';

type Props = Omit<'type', ElementProps<'input'>>;

/**
 * Radio input with common styles.
 */
const Radio = ({ className, ...props }: Props) => {
    const styles = useCurrentDesignStyles({ fluent, photon });

    return (
        <input type="radio" className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Radio;
