import escapeRegExp = require('lodash/escaperegexp');

import browser from '../../../../shared/browser';
import { Config } from '../../../../shared/types';

import configurationHtmlView from './configuration.html';

type Props = {
    onAnalyzeClick: (config: Config) => void;
};

type SavedConfiguration = {
    [key: string]: string | boolean;
};

const configKey = 'config';

// TODO: Read from packaged hint metadata.
const categories = [
    'Accessibility',
    'Interoperability',
    'PWA',
    'Performance',
    'Security'
];

export default function view({ onAnalyzeClick }: Props) {
    const fragment = configurationHtmlView({
        categories,
        onAnalyzeClick: async () => {
            saveConfiguration(); // eslint-disable-line
            onAnalyzeClick(await getConfiguration()); // eslint-disable-line
        },
        onRestoreClick: () => {
            resetConfiguration(); // eslint-disable-line
        }
    });

    const configRoot = fragment.querySelector('.configuration')!;

    const findInput = (s: string): HTMLInputElement => {
        return configRoot.querySelector(s) as HTMLInputElement;
    };

    const findAllInputs = (s: string): HTMLInputElement[] => {
        return Array.from(configRoot.querySelectorAll(s));
    };

    /** Extract selected browsers from the form and convert to the `Config` format. */
    const getBrowsersList = (): string => {
        const browsersQuery: string[] = [];

        if (findInput('[name="recommended-browsers"]').checked) {
            browsersQuery.push('defaults');
        }

        if (findInput('[name="custom-browsers"]').checked) {
            browsersQuery.push(findInput('[name="custom-browsers-list"]').value);
        }

        return browsersQuery.join(', ');
    };

    /** Extract selected categories from the form and convert to the `Config` format. */
    const getCategories = (): string[] => {
        return findAllInputs('.configuration__category:checked').map((input) => {
            return input.value;
        });
    };

    /** Create a regular expression to exclude URLs not part of the current origin. */
    const buildIgnoreThirdParty = (): Promise<string> => {
        return new Promise((resolve) => {
            browser.devtools.inspectedWindow.eval('location.origin', (origin: string) => {
                resolve(`^(?!${escapeRegExp(origin)})`);
            });
        });
    };

    /** Extract ignored URLs from the form and convert to the `Config` format. */
    const getIgnoredUrls = async (): Promise<string> => {
        const type = findInput('[name="resources"]:checked').value;

        switch (type) {
            case 'none':
                return '';
            case 'third-party':
                return await buildIgnoreThirdParty();
            case 'custom':
                return findInput('[name="custom-resources"]').value;
            default:
                throw new Error(`Unrecognized resource filter: '${type}'`);
        }
    };

    /** Extract all user provided configuration from the form as a `Config` object. */
    const getConfiguration = async (): Promise<Config> => {
        return {
            browserslist: getBrowsersList(),
            categories: getCategories(),
            ignoredUrls: await getIgnoredUrls()
        };
    };

    const readConfiguration = () => {
        return findAllInputs('.configuration input').reduce((o, input) => {
            if (!o[input.name] || input.checked) {
                o[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            }

            return o;
        }, {} as SavedConfiguration);
    };

    const restoreConfiguration = () => {
        const configStr = localStorage.getItem(configKey);

        try {
            const config: SavedConfiguration = configStr ? JSON.parse(configStr) : defaultConfig; // eslint-disable-line

            Object.keys(config).forEach((name) => {
                const inputs = findAllInputs(`.configuration input[name='${name}']`);
                const value = config[name];

                if (inputs.length > 1) {
                    inputs.forEach((input) => {
                        input.checked = input.value === value;
                    });
                } else if (typeof value === 'boolean') {
                    inputs[0].checked = value;
                } else {
                    inputs[0].value = value;
                }
            });
        } catch (e) {
            // Existing configuration is malformed, ignoring.
            console.warn(`Ignoring malformed configuration: ${configStr}`);
        }
    };

    const resetConfiguration = () => {
        localStorage.removeItem(configKey);
        restoreConfiguration();
    };

    const saveConfiguration = () => {
        const config = readConfiguration();

        localStorage.setItem(configKey, JSON.stringify(config));
    };

    const defaultConfig = readConfiguration();

    restoreConfiguration();

    return fragment;
}
