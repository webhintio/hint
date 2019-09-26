import * as puppeteer from 'puppeteer-core';
import { ConnectorOptions } from '../connector';

export type HTTPAuthConfig = {
    user: string;
    password: string;
}

export type AuthConfig = {
    user: {
        selector: string;
        value: string;
    };
    next?: {
        selector: string;
    };
    password: {
        selector: string;
        value: string;
    };
    submit: {
        selector: string;
    };
};

/**
 * `connector-puppeteer` action to authenticate on a website using Basic HTTP Auth.
 * To be used on `beforeTargetNavigation`.
 */
export const basicHTTPAuth = async (page: puppeteer.Page, config: ConnectorOptions) => {
    if (!(config && config.auth &&
        typeof config.auth.user === 'string' &&
        typeof config.auth.password === 'string')) {

        return;
    }

    await page.authenticate({ password: config.auth.password, username: config.auth.user });
};

/**
 * `connector-puppeteer` action to authenticate on a website using a form.
 * To be used on `afterTargetNavigation`.
 */
export const formAuth = async (page: puppeteer.Page, config: ConnectorOptions) => {
    if (!(config && config.auth &&
        typeof config.auth.user !== 'string' &&
        typeof config.auth.password !== 'string')) {

        return;
    }

    const auth = config.auth as AuthConfig;
    const { user, password, submit, next } = auth;

    await page.type(user.selector, user.value);

    /**
     * Some services do the authentication in 2 steps.
     * E.g.: Azure Pipelines
     *
     * 1. Enter username/phone
     * 2. Click next
     * 3. Enter password (or 2FA)
     * 4. Submit
     *
     * For automation purposes only the password scenario
     * is covered with no redirect to other login pages.
     */
    if (next) {
        /**
         * Example on how to do it available in:
         * https://pptr.dev/#?product=Puppeteer&version=v1.16.0&show=api-pagewaitfornavigationoptions
         */
        await Promise.all([
            page.waitForNavigation({ waitUntil: config.waitUntil }),
            page.click(next.selector)
        ]);
    }

    await page.type(password.selector, password.value);

    await Promise.all([
        page.waitForNavigation({ waitUntil: config.waitUntil }),
        page.click(submit.selector)
    ]);

};
