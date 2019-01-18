import { browser, document } from '../../../shared/globals';

/** Align active styles with the current devtools theme. */
export const syncTheme = () => {
    const onThemeChanged = (theme: string) => {
        document.body!.setAttribute('data-theme', theme);
    };

    // Watch for notification of theme changes.
    if (browser.devtools.panels.onThemeChanged) {
        browser.devtools.panels.onThemeChanged.addListener(onThemeChanged);
    }

    // Set the initial theme.
    onThemeChanged(browser.devtools.panels.themeName);
};
