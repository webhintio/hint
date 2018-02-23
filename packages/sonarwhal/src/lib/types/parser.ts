import { Sonarwhal } from '../sonarwhal';

export interface IParserConstructor {
    new(sonarwhal: Sonarwhal): IParser;
}

export interface IParser { }

/** A `Parser` that understands a file content. */
export abstract class Parser implements IParser {
    protected sonarwhal: Sonarwhal;

    /* istanbul ignore next */
    public constructor(sonarwhal: Sonarwhal) {
        this.sonarwhal = sonarwhal;
    }
}
