import { Problem } from 'hint/dist/src/lib/types/problems';

import browser from '../../../../shared/browser';
import html from '../../../../shared/html-literal';

import './problem.css';

/*
 * Import highlight.js/styles such that they can be turned on/off.
 * See `webpack.config.js` for the loader configuration enabling this.
 * https://webpack.js.org/loaders/style-loader/#useable
 */
import darkSyntaxTheme = require('highlight.js/styles/solarized-dark.css');
import lightSyntaxTheme = require('highlight.js/styles/solarized-light.css');

import hljs = require('highlight.js/lib/highlight');

// Explictly register languages so only those needed get bundled.
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));

/** Align active styles with the current devtools theme. */
const syncTheme = () => {
    let currentSyntaxTheme: typeof darkSyntaxTheme;

    // Swap syntax-highlighting themes for highlight.js when the devtools theme changes.
    const onThemeChanged = (theme: string) => {
        if (currentSyntaxTheme) {
            currentSyntaxTheme.unuse();
        }

        const nextSyntaxTheme = theme === 'dark' ? darkSyntaxTheme : lightSyntaxTheme;

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

export default function view(problem: Problem, index: number) {
    const { line, column } = problem.location;
    const url = `${problem.resource}${line > -1 ? `:${line + 1}:${column + 1}` : ''}`;

    const onViewSourceClick = (event: Event) => {
        if (browser.devtools.panels.openResource) {
            event.preventDefault();
            browser.devtools.panels.openResource(problem.resource, problem.location.line, () => {});
        }
    };

    const codeBlock = problem.sourceCode ?
        html`<pre class="problem__code">${problem.sourceCode}</pre>` :
        '';

    if (codeBlock && codeBlock.firstElementChild) {
        hljs.highlightBlock(codeBlock.firstElementChild);
    }

    return html`
        <div class="problem">
            <div class="problem__message">
                <span class="problem__number">hint ${(index + 1)}:</span>
                ${problem.message}
            </div>
            <a class="problem__resource" href="view-source:${problem.resource}" target="_blank" onclick=${onViewSourceClick}>
                ${url}
            </a>
            ${codeBlock}
        </div>
    `;
}
