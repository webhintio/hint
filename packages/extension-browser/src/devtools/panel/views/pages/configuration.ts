import { Config } from '../../../../shared/types';

import configurationHtmlView from './configuration.html';

type Props = {
    onAnalyzeClick: (config: Config) => void;
};

type SavedConfiguration = {
    [key: string]: string | boolean;
};

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
        onAnalyzeClick: () => {
            saveConfiguration(); // eslint-disable-line
            onAnalyzeClick(getConfiguration()); // eslint-disable-line
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

    /** Extract ignored URLs from the form and convert to the `Config` format. */
    const getIgnoredUrls = (): string => {
        const type = findInput('[name="resources"]:checked').value;

        switch (type) {
            case 'none':
                return '';
            case 'third-party':
                throw new Error('Not yet implemented');
            case 'custom':
                return findInput('[name="custom-resources"]').value;
            default:
                throw new Error(`Unrecognized resource filter: '${type}'`);
        }
    };

    /** Extract all user provided configuration from the form as a `Config` object. */
    const getConfiguration = (): Config => {
        return {
            browserslist: getBrowsersList(),
            categories: getCategories(),
            ignoredUrls: getIgnoredUrls()
        };
    };

    const restoreConfiguration = () => {
        const configStr = localStorage.getItem('config') || '{}';

        try {
            const config: SavedConfiguration = JSON.parse(configStr);

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

    const saveConfiguration = () => {
        const config = findAllInputs('.configuration input').reduce((o, input) => {
            if (!o[input.name] || input.checked) {
                o[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            }

            return o;
        }, {} as SavedConfiguration);

        localStorage.setItem('config', JSON.stringify(config));
    };

    restoreConfiguration();

    return fragment;
}
