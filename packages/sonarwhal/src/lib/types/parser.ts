import { Sonarwhal } from '../sonarwhal';

/** A `Parser` that understands a file content. */
export abstract class Parser {
    protected sonarwhal: Sonarwhal;

    /* istanbul ignore next */
    public constructor(sonarwhal: Sonarwhal) {
        this.sonarwhal = sonarwhal;
    }
}
