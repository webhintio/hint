import * as puppeteer from 'puppeteer-core';
// import * as fs from 'fs';

// fs.writeFileSync('debug.txt', 'started\n', 'utf-8'); // eslint-disable-line

process.on('message', async (options: any) => {
    // fs.appendFileSync('debug.txt', JSON.stringify(options, null, 2), 'utf-8'); // eslint-disable-line

    const browser = await puppeteer.launch(options);

    browser.on('disconnected', () => {
        process.exit(); // eslint-disable-line
    });

    process.send!({ browserWSEndpoint: browser.wsEndpoint() });
});
