const messages = [
    `78.6% of websites use a JS library with known vulnerabilities`,
    `The average load time for mobile sites is 19 seconds over 3G connections`,
    `53% of mobile site visits are abandoned if pages take longer than 3 seconds to load`,
    `84% of websites perform a redirect for at least one resource`,
    `97.5% of sites forget to compress one or more resources`,
    `72.8% of sites compress at least one resource they shouldn't`,
    `52% of resources aren't cacheable`,
    `The median site size is 1,731KB`,
    `1MB of JavaScript takes more time to process than 1MB of a JPEG file`
];

let remaining = [...messages];

const inspire = (): string => {
    if (!remaining.length) {
        remaining = [...messages];
    }

    const index = Math.floor(Math.random() * remaining.length);

    return remaining.splice(index, 1)[0];
};

export default inspire;
