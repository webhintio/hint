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
    const { line, column } = problem.location;
    const url = `${problem.resource}${line > -1 ? `:${line + 1}:${column + 1}` : ''}`;

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
            {problem.sourceCode &&
                <SyntaxHighlighter className={styles.code} useInlineStyles="false">
                    {problem.sourceCode}
                </SyntaxHighlighter>
            }
        </div>
    );
};

export default Problem;
