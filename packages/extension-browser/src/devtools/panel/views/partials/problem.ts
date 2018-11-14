import { Problem } from 'hint/dist/src/lib/types/problems';

import browser from '../../../../shared/browser';
import html from '../../../../shared/html-literal';

// TODO: Pick a better looking theme from highlight.js/styles.
import 'highlight.js/styles/default.css';
import './problem.css';

import hljs = require('highlight.js/lib/highlight');
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));

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
