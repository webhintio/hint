const os = require('os');
const minVersion = 15063;

const printError = (message) => {
    console.error(`${message} @sonarwhal/connector-edge will not be installed.`);
};

if (os.platform() !== 'win32') {
    printError('Not the right platform.');

    return 1;
}

const versionRegex = /^10\.0\.(\d+)$/i;
const results = os.release().match(versionRegex);

if (!Array.isArray(results)) {
    printError('Not running on Windows 10.');

    return 1;
}

const version = parseInt(results[1]);

if (version <= minVersion) {
    printError(`Running on Win10 build ${version}, minimum required is ${minVersion}.`);

    return 1;
}

console.log(`Running on Win10 build ${version}`);

return 0;
