import escapeRegExp = require('lodash/escapeRegExp');
import browserslist = require('browserslist');

import { browser } from '../../../../shared/globals';
import { Config } from '../../../../shared/types';
import metas from '../../../../shared/metas.import';

import configurationHtmlView from './configuration.html';

type Props = {
    onAnalyzeClick: (config: Config) => void;
};

type SavedConfiguration = {
    [key: string]: string | boolean;
};

const configKey = 'config';

// Generate uppercase category names from bundled hint metadata.
const categories = [...new Set(metas.map((meta) => {
    // TODO: Create a helper in `hint` to get uppercased category names.
    return (meta.docs && meta.docs.category || 'other')
        .replace(/^pwa$/, 'PWA')
        .replace(/^(.)/, (char) => {
            return char.toUpperCase();
        });
}))].sort();

export default function view({ onAnalyzeClick }: Props) {
    /* eslint-disable no-use-before-define, typescript/no-use-before-define */
    const fragment = configurationHtmlView({
        categories,
        onAnalyzeClick: async () => {
            saveConfiguration();
            onAnalyzeClick(await getConfiguration());
        },
        onBrowsersListChange: () => {
            validateCustomBrowsersList();
        },
        onResourcesChange: () => {
            validateIgnoredUrls();
        },
        onRestoreClick: () => {
            resetConfiguration();
        }
    });
    /* eslint-enable no-use-before-define, typescript/no-use-before-define */

    const configRoot = fragment.firstElementChild!;

    const findInput = (s: string): HTMLInputElement => {
        return configRoot.querySelector(s) as HTMLInputElement;
    };

    const findAllInputs = (s: string): HTMLInputElement[] => {
        return Array.from(configRoot.querySelectorAll(s));
    };

    const validityTimeouts = new Map<HTMLInputElement, NodeJS.Timeout>();

    /** Assign a custom validity to the provided input and display the status. */
    const updateValidationStatus = (input: HTMLInputElement, error = '') => {
        // Cancel any previously scheduled validity reports for this input.
        clearTimeout(validityTimeouts.get(input)!);

        // Immediately clear validity to avoid spamming the user during input.
        input.setCustomValidity('');
        input.reportValidity();

        // Then wait a bit before reporting the actual validity.
        validityTimeouts.set(input, setTimeout(() => {
            validityTimeouts.delete(input);
            input.setCustomValidity(error);
            input.reportValidity();
        }, 500));
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

    /** Check if a user's custom `browserslist` query is valid, notifying them if it is not. */
    const validateCustomBrowsersList = () => {
        let error = '';

        try {
            browserslist(getBrowsersList());
        } catch (e) {
            // Report errors, stripping messages about "old" browserslist since the user won't have control over that.
            error = e.message.replace(' Maybe you are using old Browserslist or made typo in query.', '');
        }

        updateValidationStatus(findInput('[name="custom-browsers-list"]'), error);
    };

    /** Extract selected categories from the form and convert to the `Config` format. */
    const getCategories = (): string[] => {
        return findAllInputs('[name^="category-"]:checked').map((input) => {
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

    /** Check if a user's custom `browserslist` query is valid, notifying them if it is not. */
    const validateIgnoredUrls = async () => {
        let error = '';

        try {
            new RegExp(await getIgnoredUrls()); // eslint-disable-line no-new
        } catch (e) {
            error = e.message;
        }

        updateValidationStatus(findInput('[name="custom-resources"]'), error);
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
        return findAllInputs('input').reduce((o, input) => {
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
                const inputs = findAllInputs(`input[name='${name}']`);
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

        // Ensure previously saved lists of custom browsers and ignored URLs are validated on load.
        validateCustomBrowsersList();
        validateIgnoredUrls();
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
