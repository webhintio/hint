import { createContext, createElement, useContext, useEffect, useState, ComponentType } from 'react';

import { browser } from '../../shared/globals';

/** Supported design systems. */
enum DesignSystems {
    fluent = 'fluent',
    photon = 'photon'
}

type DesignSystem = keyof typeof DesignSystems;

/** Mapping of design systems to associated styles. */
type DesignStyles<T> = {
    [design in DesignSystems]: T;
};

/** Build-specified design system. */
declare const DESIGN_SYSTEM: DesignSystem;

/** List of all supported design systems. */
const designs = Object.keys(DesignSystems) as DesignSystem[];

/** React `Context` representing the current design system. */
const DesignContext = createContext(DESIGN_SYSTEM);

/**
 * React higher-order component which incorporates state representing
 * the currently active design system. This state is consumed via
 * `useCurrentDesignStyles` to choose between alternate stylesheets
 * for a given component based on the current design system.
 *
 * Defaults to the build-specified design, but allows iterating through
 * all supported designs by pressing CTRL+ALT+D.
 */
export const withCurrentDesign = <P extends object>(Component: ComponentType<P>) => {
    return (props: P) => {
        const [design, setDesign] = useState(DESIGN_SYSTEM);

        useEffect(() => {
            const onKeyUp = (event: KeyboardEvent) => {
                if (!event.ctrlKey || !event.altKey || event.key !== 'd') {
                    return;
                }

                setDesign((design) => {
                    const index = (designs.indexOf(design) + 1) % designs.length;

                    return designs[index];
                });
            };

            document.addEventListener('keyup', onKeyUp);

            return () => {
                document.removeEventListener('keyup', onKeyUp);
            };
        }, []);

        return createElement(DesignContext.Provider, { value: design },
            createElement(Component, props)
        );
    };
};

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
export const useCurrentDesignStyles = <T>(styles: DesignStyles<T>): T => {
    const currentDesign = useContext(DesignContext);

    return styles[currentDesign];
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
