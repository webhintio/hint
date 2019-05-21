import { browser } from '../shared/globals';
import { getMessage } from './utils/i18n';

browser.devtools.panels.create(
    getMessage('hintsTitle'),
    `/tab-icon.${browser.devtools.panels.themeName}.svg`,
    '/devtools/panel.html'
);
