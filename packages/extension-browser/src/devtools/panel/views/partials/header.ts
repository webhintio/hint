import html from '../../../../shared/html-literal';

import './page.css';
import './header.css';

type Props = {
    analyzeDisabled?: boolean;
    analyzeText: string;
    onAnalyzeClick?: Function;
};

// eslint-disable-next-line
export default function view({ analyzeDisabled, analyzeText, onAnalyzeClick }: Props) {
    return html`
        <header class="header">
            <div class="header__help">
                <h1 class="header__title">webhint</h1>
                <a href="https://webhint.io" target="_blank">Learn more</a>
            </div>
            <div class="header__actions">
                <button class="page__button header__analyze-button" ${analyzeDisabled ? 'disabled' : ''} onclick=${onAnalyzeClick}>
                    ${analyzeText}
                </button>
            </div>
        </header>
    `;
}
