import * as path from 'path';

import test from 'ava';
import { Engine, Events } from 'hint';

import Connector from '../src/connector';

const name = 'puppeteer';

test(`[${name}] Connector throws an exception if action is not found`, (t) => {

    t.plan(1);

    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        on(): Engine {
            return null as any;
        },
        timeout: 10000
    } as any;

    try {

        const connector = new Connector(engine, {
            actions: [{
                file: `fake-file`,
                on: 'beforeTargetNavigation'
            }],
            detached: true
        });

        connector.close();
    } catch (e) {
        t.true((e.message as string).startsWith(`Couldn't load user action in "`));
    }
});

test(`[${name}] Connector loads an action and throws if it does not have the right signature`, (t) => {

    t.plan(1);

    const actionPath = path.join(__dirname, './fixtures/invalid-action.js');

    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        on(): Engine {
            return null as any;
        },
        timeout: 10000
    } as any;

    try {

        const connector = new Connector(engine, {
            actions: [{
                file: actionPath,
                on: 'beforeTargetNavigation'
            },
            {
                file: actionPath,
                on: 'afterTargetNavigation'
            }],
            detached: true
        });

        connector.close();
    } catch (e) {
        t.is(e.message, `User action "${actionPath}" doesn't export a member "action".`);
    }
});


test(`[${name}] Connector loads an action and doesn't throw if it has the right signature`, (t) => {

    t.plan(0);

    const actionPath = path.join(__dirname, './fixtures/action.js');

    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        on(): Engine {
            return null as any;
        },
        timeout: 10000
    } as any;

    try {

        const connector = new Connector(engine, {
            actions: [{
                file: actionPath,
                on: 'beforeTargetNavigation'
            },
            {
                file: actionPath,
                on: 'afterTargetNavigation'
            }],
            detached: true
        });

        connector.close();
    } catch (e) {
        t.fail(e.message);
    }
});
