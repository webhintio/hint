/**
 * Uploads a file to the webhintio/hint "dist" release.
 * `node scripts/upload-dist.js fileName.zip`
 *
 * A valid GitHub auth token needs to be set in
 * `process.env.GITHUB_TOKEN`
 */

const path = require('path');
const fs = require('fs');

const Octokit = require('@octokit/rest');
const throttling = require('@octokit/plugin-throttling');

const Client = Octokit.plugin(throttling);

const octokitOptions = {
    auth: `token ${process.env.GITHUB_TOKEN}`, // eslint-disable-line no-process-env
    throttle: {
        onAbuseLimit: (retryAfter, options) => {
            // does not retry, only logs a warning
            console.log(`Abuse detected for request ${options.method} ${options.url}`);
        },
        onRateLimit: (retryAfter, options) => {
            console.log(`Request quota exhausted for request ${options.method} ${options.url}`);

            if (options.request.retryCount <= 4) { // retry 5 times
                console.log(`Retrying after ${retryAfter} seconds!`);

                return true;
            }

            return false;
        }
    },
    userAgent: 'Nellie The Narwhal'
};

const kit = new Client(octokitOptions);
const name = process.argv[2];

const data = fs.readFileSync(path.join(process.cwd(), name)); // eslint-disable-line no-sync

const upload = async () => {
    console.log('Uploading');

    await kit.repos.uploadReleaseAsset({
        file: data,
        headers: {
            'content-length': data.length,
            'content-type': 'application/zip'
        },
        name,
        url: 'https://uploads.github.com/repos/webhintio/hint/releases/20378720/assets{?name,label}'
    });

    console.log('File uploaded');
};

upload();
