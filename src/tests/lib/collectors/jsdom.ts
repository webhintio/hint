import * as fileUrl from 'file-url';
import * as path from 'path';

import { test, ContextualTestContext } from 'ava'; // eslint-disable-line no-unused-vars
import * as sinon from 'sinon';


import { Collector, CollectorBuilder } from '../../../lib/types';
import * as builder from '../../../lib/collectors/jsdom';
import { Sonar } from '../../../lib/sonar'; // eslint-disable-line no-unused-vars

test.beforeEach((t) => {
    const server = { emitAsync() { } };
    const collector = (<CollectorBuilder>builder)(server, {});

    sinon.spy(server, 'emitAsync');
    t.context.collector = collector;
    t.context.emitAsync = server.emitAsync;
});

test.afterEach((t) => {
    t.context.emitAsync.restore();
});


test(async (t) => {
    const collector = <Collector>t.context.collector;
    const filePath = fileUrl(path.resolve(__dirname, './fixtures/file-protocol.txt'));
    const content = await collector.fetchContent(filePath);

    t.is(content.body, 'This is a file read using file://', 'jsdom collector can read file://');
    t.falsy(content.headers, 'no headers are returned for file:// target');
});
