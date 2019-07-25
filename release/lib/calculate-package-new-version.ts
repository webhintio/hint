import * as semver from 'semver';

import { Bump, Package } from '../@types/custom';
import { debug } from './utils';

export default (pkg: Package, bump: Bump): string => {

    if (pkg.ignore) {
        return pkg.content.version;
    }

    if (!pkg.publishedVersion) {
        debug(`${pkg.name} will be published with initial version ${pkg.content.version}`);

        return pkg.content.version;
    }

    const newVersion = semver.inc(pkg.oldVersion, Bump[bump] as semver.ReleaseType)!;

    debug(`Bumping ${pkg.name} from ${pkg.oldVersion} to ${newVersion}`);

    return newVersion;
};
