import { useEffect, useState } from 'react';

import { browser } from '../../shared/globals';

/** Supported design systems. */
type DesignSystems<T> = {
    fluent: T;
    photon?: T;
};

/** Current design system. */
declare const DESIGN_SYSTEM: keyof DesignSystems<any>;

/**
 * Select styles to use based on the current design system.
 * Falls back to the default design system if no matching styles were found.
 *
 * ```ts
 * import * as fluent from 'component.fluent.css';
 * import * as photon from 'component.photon.css';
 *
 * const styles = useCurrentDesign({ fluent, photon });
 * ```
 */
export const useCurrentDesign = <T>(designs: DesignSystems<T>): T => {
    return designs[DESIGN_SYSTEM] || designs.fluent;
};

/** Align active styles with the current devtools theme. */
export const useCurrentTheme = () => {
    const [theme, setTheme] = useState(browser.devtools.panels.themeName);

    useEffect(() => {
        const onThemeChanged = browser.devtools.panels.onThemeChanged;

        if (onThemeChanged) {
            onThemeChanged.addListener(setTheme);
        }

        return () => {
            if (onThemeChanged) {
                onThemeChanged.removeListener(setTheme);
            }
        };
    }, []); // Only register on mount and cleanup on unmount.

    return theme.startsWith('dark') ? 'dark' : 'light';
};
