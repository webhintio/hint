import * as React from 'react';

import * as styles from './banner.css';

type Props = {
    show: boolean;
    children?: any;
}

const Banner = ({show, children}: Props) => {
    return (<div className={`${styles.root} ${!show ? styles.hidden : ''}`}>
        {children}
    </div>);
};

export default Banner;
