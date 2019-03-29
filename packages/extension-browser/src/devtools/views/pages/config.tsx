import * as React from 'react';
import { useCallback, useState } from 'react';

import { Config as ConfigData } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';

import AppButton from '../app-button';
import Page from '../page';

import BrowsersConfig from './config/browsers';
import CategoriesConfig from './config/categories';
import ResourcesConfig from './config/resources';

import { resolveIgnoreQuery } from './config/resources';

import * as styles from './config.css';

const configKey = 'webhint-config';

/** Get a saved configuration from a previous session. */
const loadConfig = (): ConfigData => {
    const configStr = localStorage.getItem(configKey);

    try {
        return configStr ? JSON.parse(configStr) : {};
    } catch (e) {
        console.warn(`Ignoring malformed configuration: ${configStr}`);

        return {};
    }
};

/** Persist the provided configuration for future sessions. */
const saveConfig = (config: ConfigData) => {
    localStorage.setItem(configKey, JSON.stringify(config));
};

type Props = {
    /** Listener for when the user decides to run a scan. */
    onStart: (config: ConfigData) => void;
};

/**
 * Display options to configure and initialize a scan.
 */
const ConfigPage = ({ onStart }: Props) => {
    const [config, setConfig] = useState(loadConfig);

    const onAnalyzeClick = useCallback(async () => {
        saveConfig(config);

        const ignoredUrls = await resolveIgnoreQuery(config.ignoredUrls);

        onStart({...config, ignoredUrls});
    }, [config, onStart]);

    const onCategoriesChange = useCallback((disabledCategories?: string[]) => {
        setConfig({...config, disabledCategories});
    }, [config]);

    const onBrowsersChange = useCallback((browserslist?: string) => {
        setConfig({...config, browserslist});
    }, [config]);

    const onResourcesChange = useCallback((ignoredUrls?: string) => {
        setConfig({...config, ignoredUrls});
    }, [config]);

    const onRestoreClick = useCallback(() => {
        setConfig({});
    }, []);

    return (
        <Page title={getMessage('configurationTitle')} className={styles.root} actionName={getMessage('analyzeButtonLabel')} onAction={onAnalyzeClick}>
            <AppButton className={styles.restoreButton} onClick={onRestoreClick}>
                {getMessage('restoreDefaultsLabel')}
            </AppButton>
            <CategoriesConfig disabled={config.disabledCategories} onChange={onCategoriesChange}/>
            <BrowsersConfig query={config.browserslist} onChange={onBrowsersChange}/>
            <ResourcesConfig query={config.ignoredUrls} onChange={onResourcesChange}/>
        </Page>
    );
};

export default ConfigPage;
