import html from '../../../../shared/html-literal';
import { Config } from '../../../../shared/types';

import headerView from '../partials/header';

import '../partials/page.css';
import './configuration.css';

type Props = {
    categories: string[];
    onAnalyzeClick: (config: Config) => void;
    onRestoreClick: () => void;
};

/* eslint-disable */
export default function view({ categories, onAnalyzeClick, onRestoreClick }: Props) {
    return html`
        ${headerView({ analyzeText: 'Analyze website', onAnalyzeClick })}
        <section class="configuration page">
            <h1 class="page__header">
                Configuration
            </h1>
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
                    <input type="checkbox" name="recommended-browsers" checked />
                    Recommended settings
                    <div class="configuration__example">&gt; 0.5%, last 2 versions, Firefox ESR, not dead</div>
                </label>
                <label class="configuration__label">
                    <input type="checkbox" name="custom-browsers" />
                    <input type="text" name="custom-browsers-list" placeholder="&gt; 1% in US, IE 10" />
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
                    <input type="radio" name="resources" value="none" checked />
                    None
                </label>
                <label class="configuration__label">
                    <input type="radio" name="resources" value="third-party" />
                    Third party
                </label>
                <label class="configuration__label">
                    <input type="radio" name="resources" value="custom" />
                    <input type="text" name="custom-resources" placeholder="google-analytics\.com" />
                    <div class="configuration__example">
                        <a href="https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/" target="_blank">
                            See expression instructions
                        </a> 
                    </div>
                </label>
            </section>
            <button type="button" class="page__button configuration__restore-button" onclick=${onRestoreClick}>Restore defaults</button>
        </section>
    `;
}
