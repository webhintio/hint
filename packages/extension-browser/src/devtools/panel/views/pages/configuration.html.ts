import html from '../../../../shared/html-literal';

import headerView from '../partials/header';

import * as styles from './configuration.css';

type Props = {
    categories: string[];
    onAnalyzeClick: () => void;
    onBrowsersListChange: () => void;
    onResourcesChange: () => void;
    onRestoreClick: () => void;
};

/* eslint-disable */
export default function view({ categories, onAnalyzeClick, onBrowsersListChange, onResourcesChange, onRestoreClick }: Props) {
    const onSubmit = (event: Event) => {
        event.preventDefault();
        onAnalyzeClick();
    };

    return html`
        <form class="${styles.configuration}" onsubmit=${onSubmit}>
            ${headerView({ analyzeText: 'Analyze website' })}
            <h1 class="${styles.header}">
                Configuration
            </h1>
            <button type="button" class="${styles.restoreButton}" onclick=${onRestoreClick}>Restore defaults</button>
            <section class="${styles.section}">
                <h1 class="${styles.sectionHeader}">
                    Categories:
                </h1>
                ${categories.map((category) => (html`
                    <label class="${styles.label}">
                        <input type="checkbox" name="category-${category.toLowerCase()}" value="${category.toLowerCase()}" checked />
                        ${category}
                    </label>
                `))}
            </section>
            <section class="${styles.section}">
                <h1 class="${styles.sectionHeader}">
                    Your target browsers:
                </h1>
                <label class="${styles.label}">
                    <input type="checkbox" name="recommended-browsers" checked oninput="${onBrowsersListChange}" />
                    Recommended settings
                    <div class="${styles.example}">&gt; 0.5%, last 2 versions, Firefox ESR, not dead</div>
                </label>
                <label class="${styles.label}">
                    <input type="checkbox" name="custom-browsers" oninput="${onBrowsersListChange}" />
                    <input type="text" class="${styles.input}" name="custom-browsers-list" placeholder="&gt; 1% in US, IE 10" oninput="${onBrowsersListChange}" />
                    <div class="${styles.example}">
                        <a href="https://github.com/browserslist/browserslist#full-list" target="_blank">
                            See query instructions
                        </a>
                    </div>
                </label>
            </section>
            <section class="${styles.section}">
                <h1 class="${styles.sectionHeader}">
                    Ignored resources:
                </h1>
                <label class="${styles.label}">
                    <input type="radio" name="resources" value="none" checked oninput="${onResourcesChange}" />
                    None
                </label>
                <label class="${styles.label}">
                    <input type="radio" name="resources" value="third-party" oninput="${onResourcesChange}" />
                    Different origin
                </label>
                <label class="${styles.label}">
                    <input type="radio" name="resources" value="custom" oninput="${onResourcesChange}" />
                    <input type="text" class="${styles.input}" name="custom-resources" placeholder="google-analytics\.com" oninput="${onResourcesChange}" />
                    <div class="${styles.example}">
                        <a href="https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/" target="_blank">
                            See expression instructions
                        </a> 
                    </div>
                </label>
            </section>
        </form>
    `;
}
