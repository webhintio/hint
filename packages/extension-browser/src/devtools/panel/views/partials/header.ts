import html from '../../../../shared/html-literal';

import './page.css';
import './header.css';

type Props = {
    analyzeDisabled?: boolean;
    analyzeText: string;
    onAnalyzeClick?: Function;
};

export default function view({ analyzeDisabled, analyzeText, onAnalyzeClick }: Props) {
    return html`
        <header class="header">
            <div class="header__actions">
                <button
                    type="button"
                    class="page__button page__button--primary header__analyze-button"
                    ${analyzeDisabled ? 'disabled' : ''}
                    onclick=${onAnalyzeClick}
                >
                    ${analyzeText}
                </button>
            </div>
            <div class="header__help">
                Check for best practices and common errors with your site's accessibility, speed, security and more.
                <span class="header__powered-by">
                    Powered by <a href="https://webhint.io" target="_blank">webhint</a>.
                </span>
            </div>
        </header>
    `;
}
