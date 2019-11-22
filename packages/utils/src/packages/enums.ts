export enum ResourceErrorStatus {
    DependencyError = 'DependencyError',
    NotCompatible = 'NotCompatible',
    NotFound = 'NotFound',
    Unknown = 'Unknown'
}

/** The type of resource */
export enum ResourceType {
    configuration = 'configuration',
    connector = 'connector',
    formatter = 'formatter',
    parser = 'parser',
    hint = 'hint'
}
