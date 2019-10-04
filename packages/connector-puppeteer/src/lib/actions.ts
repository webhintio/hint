import { resolve } from 'path';

import * as puppeteer from 'puppeteer-core';
import { ConnectorOptions } from '../connector';

export type ActionConfig = {
    file: string;
    on: 'beforeTargetNavigation' | 'afterTargetNavigation';
    options?: object;
}

type Action = (page: puppeteer.Page, config: ConnectorOptions) => Promise<void>;

export type UserActions = {
    afterTargetNavigation: Action[];
    beforeTargetNavigation: Action[];
};

/**
 * Loads and groups user provided actions by the moment they need
 * to be executed (`beforeTargetNavigation` or `afterTargetNavigation`).
 * @param actions The user configuration with the actions
 */
export const group = (actions: ActionConfig[] = []): UserActions => {
    const beforeTargetNavigation: Action[] = [];
    const afterTargetNavigation: Action[] = [];

    for (const actionConfig of actions) {
        let loadedAction: { action: Action };
        const pathToUserAction = resolve(process.cwd(), actionConfig.file);

        try {
            loadedAction = require(pathToUserAction);
        } catch (e) {
            throw new Error(`Couldn't load user action in "${pathToUserAction}". ${e.message}`);
        }

        if (typeof loadedAction.action !== 'function') {
            throw new Error(`User action "${pathToUserAction}" doesn't export a member "action".`);
        }

        const action = loadedAction.action;

        switch (actionConfig.on) {
            case 'afterTargetNavigation': afterTargetNavigation.push(action);
                break;
            case 'beforeTargetNavigation': beforeTargetNavigation.push(action);
                break;
            default: break;
        }
    }

    return {
        afterTargetNavigation,
        beforeTargetNavigation
    };
};
