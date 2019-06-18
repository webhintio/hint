const { hostUI } = require('../dist/tests/helpers/host-ui');

const main = async () => {
    await hostUI();
    console.log('Press CTRL+C to stop.');
};

main();
