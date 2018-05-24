import * as path from 'path';

import test from 'ava';
import * as Excel from 'exceljs';
import * as fs from 'fs-extra';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import * as problems from './fixtures/list-of-problems';

test.beforeEach(async (t) => {
    delete require.cache[require.resolve('lodash')];
    delete require.cache[path.resolve(__dirname, '../src/formatter.js')];

    const groupBy = await import('lodash.groupby');
    const spy = sinon.spy(groupBy);

    proxyquire('../src/formatter', { 'lodash.groupby': spy });

    const ExcelFormatter = (await import('../src/formatter')).default;

    t.context.ExcelFormatter = ExcelFormatter;
    t.context.spy = spy;
});

test.serial(`Excel formatter doesn't print anything if no values`, async (t) => {
    const formatter = new t.context.ExcelFormatter();
    const spy = t.context.spy;

    await formatter.format(problems.noproblems, '');

    t.is(spy.callCount, 0);
});

test.serial(`Excel formatter generates the right number of sheets with the good content`, async (t) => {
    const formatter = new t.context.ExcelFormatter();

    await formatter.format(problems.multipleproblems, 'http://myresource.com:8080/');

    const workbook = new Excel.Workbook();
    const filePath = path.join(process.cwd(), 'http-myresource-com-8080.xlsx');

    await workbook.xlsx.readFile(filePath);

    const summary = workbook.getWorksheet(1);
    const report = workbook.getWorksheet(2);

    t.is(summary.name, 'summary', 'Title is not summary');
    t.is(summary.actualColumnCount, 2, `summary.actualColumnCount isn't 2`);
    t.is(summary.actualRowCount, 3, `summary.actualRowCount isn't 3`);

    t.true(report.name.startsWith('resource-'), `Title doesn't start with resource-`);
    t.is(report.actualColumnCount, 2, `report.actualColumnCount isn't 2`);
    t.is(report.actualRowCount, 6, `report.actualRowCount isn't 3`);

    await fs.remove(filePath);
});
