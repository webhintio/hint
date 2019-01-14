import html from '../../../../shared/html-literal';

import headerView from '../partials/header';

import '../partials/page.css';
import './configuration.css';

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
        <form class="configuration page" onsubmit=${onSubmit}>
            ${headerView({ analyzeText: 'Analyze website' })}
            <h1 class="page__header">
                Configuration
            </h1>
            <button type="button" class="page__button configuration__restore-button" onclick=${onRestoreClick}>Restore defaults</button>
            <section class="configuration__section">
                <h1 class="configuration__header">
                    Categories:
                </h1>
                ${categories.map((category) => (html`
                    <label class="configuration__label">
                        <input type="checkbox" class="configuration__category" name="category-${category.toLowerCase()}" value="${category.toLowerCase()}" checked />
                        ${category}
                    </label>
                `))}
            </section>
            <section class="configuration__section">
                <h1 class="configuration__header">
                    Your target browsers:
                </h1>
                <label class="configuration__label">
                    <input type="checkbox" name="recommended-browsers" checked oninput="${onBrowsersListChange}" />
                    Recommended settings
                    <div class="configuration__example">&gt; 0.5%, last 2 versions, Firefox ESR, not dead</div>
                </label>
                <label class="configuration__label">
                    <input type="checkbox" name="custom-browsers" oninput="${onBrowsersListChange}" />
                    <input type="text" class="configuration__input" name="custom-browsers-list" placeholder="&gt; 1% in US, IE 10" oninput="${onBrowsersListChange}" />
                    <div class="configuration__example">
                        <a href="https://github.com/browserslist/browserslist#full-list" target="_blank">
                            See query instructions
                        </a>
                    </div>
                </label>
            </section>
            <section class="configuration__section">
                <h1 class="configuration__header">
                    Ignored resources:
                </h1>
                <label class="configuration__label">
                    <input type="radio" name="resources" value="none" checked oninput="${onResourcesChange}" />
                    None
                </label>
                <label class="configuration__label">
                    <input type="radio" name="resources" value="third-party" oninput="${onResourcesChange}" />
                    Different origin
                </label>
                <label class="configuration__label">
                    <input type="radio" name="resources" value="custom" oninput="${onResourcesChange}" />
                    <input type="text" class="configuration__input" name="custom-resources" placeholder="google-analytics\.com" oninput="${onResourcesChange}" />
                    <div class="configuration__example">
                        <a href="https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/" target="_blank">
                            See expression instructions
                        </a> 
                    </div>
                </label>
            </section>
        </form>
    `;
}
