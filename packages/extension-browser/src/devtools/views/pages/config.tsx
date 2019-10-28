import * as React from 'react';
import { useCallback, useState } from 'react';

import { Config as ConfigData } from '../../../shared/types';

import { getMessage } from '../../utils/i18n';
import { getItem, setItem } from '../../utils/storage';

import Button from '../controls/button';

import PoweredBy from '../powered-by';
import Page from '../page';

import BrowsersConfig from './config/sections/browsers';
import CategoriesConfig from './config/sections/categories';
import ResourcesConfig from './config/sections/resources';
import ConfigHeader from './config/header';
import Settings from '../controls/settings';

import { resolveIgnoreQuery } from './config/sections/resources';

import * as styles from './config.css';

const configKey = 'webhint-config';

/** Get a saved configuration from a previous session. */
const loadConfig = (): ConfigData => {
    return getItem(configKey) || {};
};

/** Persist the provided configuration for future sessions. */
const saveConfig = (config: ConfigData) => {
    setItem(configKey, config);
};

type Props = {
    disabled?: boolean;

    isTelemetryEnabled: boolean;

    /** Listener for when the user decides to run a scan. */
    onStart: (config: ConfigData) => void;

    onTelemetryChange: (enable: boolean) => void;
};

/**
 * Display options to configure and initialize a scan.
 */
const ConfigPage = ({ disabled, onStart, onTelemetryChange, isTelemetryEnabled }: Props) => {
    const [config, setConfig] = useState(loadConfig);

    const onAnalyzeClick = useCallback(async () => {
        saveConfig(config);

        const ignoredUrls = await resolveIgnoreQuery(config.ignoredUrls);

        onStart({ ...config, ignoredUrls });
    }, [config, onStart]);

    const onCategoriesChange = useCallback((disabledCategories?: string[]) => {
        setConfig({ ...config, disabledCategories });
    }, [config]);

    const onBrowsersChange = useCallback((browserslist?: string) => {
        setConfig({ ...config, browserslist });
    }, [config]);

    const onResourcesChange = useCallback((ignoredUrls?: string) => {
        setConfig({ ...config, ignoredUrls });
    }, [config]);

    const onRestoreClick = useCallback(() => {
        setConfig({});
    }, []);

    return (
        <Page className={styles.root} disabled={disabled} onAction={onAnalyzeClick}>
            <ConfigHeader config={config} />
            <main className={styles.main}>
                <div className={styles.categories}>
                    <CategoriesConfig disabled={config.disabledCategories} onChange={onCategoriesChange} />
                    <BrowsersConfig query={config.browserslist} onChange={onBrowsersChange} />
                    <ResourcesConfig query={config.ignoredUrls} onChange={onResourcesChange} />
                </div>
                <Button className={styles.button} onClick={onRestoreClick}>
                    {getMessage('restoreDefaultsLabel')}
                </Button>
                <Settings isTelemetryEnabled={isTelemetryEnabled} onTelemetryChange={onTelemetryChange}/>
            </main>
            <footer>
                <PoweredBy className={styles.poweredBy} />
            </footer>
        </Page>
    );
};

export default ConfigPage;
