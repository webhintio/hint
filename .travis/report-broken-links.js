const fs = require('fs');

const request= require('request');
const shell = require('shelljs/global'); // eslint-disable-line no-unused-vars

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const createIssue = (report) => {
    request({
        body: {
            body: report,
            labels: ['type:bug'],
            title: 'Fix broken links'
        },
        headers: {
            Authorization: `token ${process.env.GITHUB_API_TOKEN}`, // eslint-disable-line no-process-env
            'User-Agent': 'Nellie The Narwhal'
        },
        json: true,
        method: 'POST',
        url: ' https://api.github.com/repos/webhintio/hint/issues'
    }, (err, httpResponse) => {

        if (err || (![200, 201].includes(httpResponse.statusCode))) {
            console.error('Request failed: ', (err || httpResponse.statusCode));
            process.exit(1); // eslint-disable-line no-process-exit
        }
    });
};

const generateMarkdownReport = () => {

    const files = find('.').filter((file) => {
        return file.match(/^ab-results-.*-filtered.json$/i);
    });

    let result = '';

    files.forEach((file) => {
        const fileName = (file.match(/^ab-results-(.*)-filtered.json$/)[1] || '').replace(/-/gi, '/');
        const fileContent = JSON.parse(fs.readFileSync(file)); // eslint-disable-line no-sync

        result += `\n#### [${fileName}](../tree/${process.env.TRAVIS_BRANCH}/${fileName})\n\n`; // eslint-disable-line no-process-env


        fileContent.forEach((e) => {
            result += `- [ ] [${e.link}](${e.link}) => ${e.status} ${e.error ? `(${e.error})`: ''}\n`;
        });

    });

    if (result) {
        result += `\n----\nSee also: https://travis-ci.org/webhintio/hint/jobs/${process.env.TRAVIS_JOB_ID}`; // eslint-disable-line no-process-env
    }

    return result;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = () => {
    const report = generateMarkdownReport();

    if (report) {
        createIssue(report);
    }
};

main();
