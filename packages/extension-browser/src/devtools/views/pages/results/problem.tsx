import * as React from 'react';
import { useCallback, MouseEvent } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';

import { Problem as ProblemData } from 'hint/dist/src/lib/types/problems';

import { browser } from '../../../../shared/globals';

import { getMessage } from '../../../utils/i18n';

import * as styles from './problem.css';

/*
 * Import highlight.js/styles such that they can be turned on/off.
 * See `webpack.config.js` for the loader configuration enabling this.
 * https://webpack.js.org/loaders/style-loader/#useable
 */
import * as darkSyntaxTheme from 'highlight.js/styles/solarized-dark.css';
import * as lightSyntaxTheme from 'highlight.js/styles/solarized-light.css';

// Explictly register languages so only those needed get bundled.
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('xml', xml);

/** Align active styles with the current devtools theme. */
const syncTheme = () => {
    let currentSyntaxTheme: typeof darkSyntaxTheme;

    // Swap syntax-highlighting themes for highlight.js when the devtools theme changes.
    const onThemeChanged = (theme: string) => {
        if (currentSyntaxTheme) {
            currentSyntaxTheme.unuse();
        }

        const nextSyntaxTheme = theme.startsWith('dark') ? darkSyntaxTheme : lightSyntaxTheme;

        nextSyntaxTheme.use();
        currentSyntaxTheme = nextSyntaxTheme;
    };

    // Watch for notification of theme changes.
    if (browser.devtools.panels.onThemeChanged) {
        browser.devtools.panels.onThemeChanged.addListener(onThemeChanged);
    }

    // Set the initial theme.
    onThemeChanged(browser.devtools.panels.themeName);
};

syncTheme();

type Props = {
    problem: ProblemData;
    index: number;
};

const Problem = ({ problem, index }: Props) => {
    const { line, column, elementId } = problem.location;
    const url = `${problem.resource}${line > -1 ? `:${line + 1}:${column + 1}` : ''}`;

    const onInspectElementClick = useCallback(() => {
        // Verify elementId is actually a number since it originates from untrusted snapshot data.
        if (typeof elementId === 'number') {
            browser.devtools.inspectedWindow.eval(`inspect(__webhint.findNode(${elementId}))`);
        }
    }, [elementId]);

    const onViewSourceClick = useCallback((event: MouseEvent) => {
        if (browser.devtools.panels.openResource) {
            event.preventDefault();
            browser.devtools.panels.openResource(problem.resource, line, () => {});
        }
    }, [line, problem.resource]);

    return (
        <div className={styles.root}>
            <div>
                <span className={styles.number}>
                    {getMessage('hintCountLabel', [(index + 1).toString()])}
                </span>
                {' '}
                {problem.message}
            </div>
            <a href={`view-source:${problem.resource}`} target="_blank" onClick={onViewSourceClick}>
                {url}
            </a>
            {' '}
            {elementId &&
                <button className={styles.button} type="button" title="Inspect Element" onClick={onInspectElementClick}>
                    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.51 30.51">
                        <path d="M1.83 22.54v-21h21v11.38l1 .41V.54h-23v23h17.39l-.42-1z"/>
                        <path d="M21.71 29.35l3.84-6.95.14-.25.25-.14 6.95-3.84-19.09-7.91z"/>
                    </svg>
                </button>
            }
            {problem.sourceCode &&
                <SyntaxHighlighter className={styles.code} useInlineStyles="false">
                    {problem.sourceCode}
                </SyntaxHighlighter>
            }
        </div>
    );
};

export default Problem;
