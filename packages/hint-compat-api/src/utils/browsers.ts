import * as semver from 'semver';

const coerce = (version: string): semver.SemVer | string => {
    return semver.coerce(version) || /* istanbul ignore next */ version;
};

/**
 * Serialize condensed version ranges for provided browsers.
 *
 * ```js
 * joinBrowsers(['chrome 74', 'chrome 75', 'chrome 76', 'edge 15', 'edge 16', 'firefox 67']);
 * // returns 'chrome 74-76, edge 15-16, firefox 67';
 * ```
 */
export const joinBrowsers = (browsers: string[]): string => {
    const versionsByName = new Map<string, string[]>();

    // Group browser versions by browser name.
    for (const browser of browsers) {
        const [name, version] = browser.split(' ');

        if (!versionsByName.has(name)) {
            versionsByName.set(name, []);
        }

        versionsByName.get(name)!.push(version);
    }

    const results: string[] = [];

    // Sort and serialize version ranges for each browser name.
    for (const [name, versions] of versionsByName) {
        versions.sort((v1, v2) => {
            return semver.compare(coerce(v1), coerce(v2));
        });

        const ranges: string[] = [];

        for (let i = 0, start = versions[0]; i < versions.length; i++) {
            if (parseInt(versions[i + 1]) - parseInt(versions[i]) <= 1) {
                continue; // Continue until the end of a range.
            }

            // Format current range as either `start` or `start-end`.
            if (start === versions[i]) {
                ranges.push(start);
            } else {
                ranges.push(`${start}-${versions[i]}`);
            }

            // Remember the start of the next range.
            start = versions[i + 1];
        }

        results.push(`${name} ${ranges.join(', ')}`);
    }

    return results.join(', ');
};
