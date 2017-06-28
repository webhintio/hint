/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

import test from 'ava';

import { builders } from '../../helpers/collectors';
import { createServer } from '../../helpers/test-server';
import { ICollector, ICollectorBuilder, INetworkData } from '../../../src/lib/types'; // eslint-disable-line no-unused-vars

test.beforeEach(async (t) => {
    const sonar = {
        emit() { },
        emitAsync() { }
    };

    const server = createServer();

    await server.start();

    t.context = {
        server,
        sonar
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.collector.close();
});

const testCollectorEvaluate = (collectorInfo) => {
    const collectorBuilder: ICollectorBuilder = collectorInfo.builder;
    const name: string = collectorInfo.name;

    test(`[${name}] Fetch Content`, async (t) => {
        const { sonar } = t.context;
        const collector: ICollector = await (collectorBuilder)(sonar, {});
        const server = t.context.server;

        t.plan(1);
        t.context.collector = collector;

        server.configure({ '/edge.png': fs.readFileSync(path.join(__dirname, './fixtures/common/edge.png')) });

        const result: INetworkData = await collector.fetchContent(url.parse(`http://localhost:${server.port}/edge.png`));

        t.is(result.response.statusCode, 200);
    });

};

builders.forEach((collector) => {
    testCollectorEvaluate(collector);
});
