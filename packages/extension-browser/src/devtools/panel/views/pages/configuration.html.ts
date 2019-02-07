import { Category } from 'hint/dist/src/lib/enums/category';

import html from '../../../../shared/html-literal';

import { getMessage } from '../../utils/i18n';

import headerView from '../partials/header';

import * as styles from './configuration.css';

type Props = {
    categories: Category[];
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
            ${headerView({ analyzeText: getMessage('analyzeButtonLabel') })}
            <h1 class="${styles.header}">
                ${getMessage('configurationTitle')}
            </h1>
            <button type="button" class="${styles.restoreButton}" onclick=${onRestoreClick}>
                ${getMessage('restoreDefaultsLabel')}
            </button>
            <section class="${styles.section}">
                <h1 class="${styles.sectionHeader}">
                    ${getMessage('categoriesTitle')}
                </h1>
                ${categories.map((category) => (html`
                    <label class="${styles.label}">
                        <input type="checkbox" name="category-${category}" value="${category}" checked />
                        ${getMessage(category)}
                    </label>
                `))}
            </section>
            <section class="${styles.section}">
                <h1 class="${styles.sectionHeader}">
                    ${getMessage('yourTargetBrowsersTitle')}
                </h1>
                <label class="${styles.label}">
                    <input type="checkbox" name="recommended-browsers" checked oninput="${onBrowsersListChange}" />
                    ${getMessage('recommendedSettingsLabel')}
                    <div class="${styles.example}">&gt; 0.5%, last 2 versions, Firefox ESR, not dead</div>
                </label>
                <label class="${styles.label}">
                    <input type="checkbox" name="custom-browsers" oninput="${onBrowsersListChange}" />
                    <input type="text" class="${styles.input}" name="custom-browsers-list" placeholder="&gt; 1% in US, IE 10" oninput="${onBrowsersListChange}" />
                    <div class="${styles.example}">
                        <a href="https://github.com/browserslist/browserslist#full-list" target="_blank">
                            ${getMessage('seeQueryInstructionsLabel')}
                        </a>
                    </div>
                </label>
            </section>
            <section class="${styles.section}">
                <h1 class="${styles.sectionHeader}">
                    ${getMessage('ignoredResourcesTitle')}
                </h1>
                <label class="${styles.label}">
                    <input type="radio" name="resources" value="none" checked oninput="${onResourcesChange}" />
                    ${getMessage('noneLabel')}
                </label>
                <label class="${styles.label}">
                    <input type="radio" name="resources" value="third-party" oninput="${onResourcesChange}" />
                    ${getMessage('differentOriginLabel')}
                </label>
                <label class="${styles.label}">
                    <input type="radio" name="resources" value="custom" oninput="${onResourcesChange}" />
                    <input type="text" class="${styles.input}" name="custom-resources" placeholder="google-analytics\.com" oninput="${onResourcesChange}" />
                    <div class="${styles.example}">
                        <a href="https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/" target="_blank">
                            ${getMessage('seeExpressionInstructionsLabel')}
                        </a> 
                    </div>
                </label>
            </section>
        </form>
    `;
}
