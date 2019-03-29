import { useEffect, useState } from 'react';

import { browser } from '../../shared/globals';

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

    return theme;
};
