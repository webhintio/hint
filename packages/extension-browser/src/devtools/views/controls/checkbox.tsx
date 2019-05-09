import * as React from 'react';

import { useCurrentDesign } from '../../utils/themes';
import { ElementProps, Omit } from '../../utils/types';

import * as fluent from './checkbox.fluent.css';
import * as photon from './checkbox.photon.css';

type Props = Omit<'type', ElementProps<'input'>>;

/**
 * Checkbox input with common styles.
 */
const Checkbox = ({ className, ...props }: Props) => {
    const styles = useCurrentDesign({ fluent, photon });

    return (
        <input type="checkbox" className={`${styles.root} ${className || ''}`} {...props} />
    );
};

export default Checkbox;
