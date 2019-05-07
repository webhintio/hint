export enum ResourceErrorStatus {
    DependencyError = 'DependencyError',
    NotCompatible = 'NotCompatible',
    NotFound = 'NotFound',
    Unknown = 'Unknown'
}

export enum AnalyzerErrorStatus {
    AnalyzeError = 'AnalyzeError',
    ConfigurationError = 'ConfigurationError',
    ConnectorError = 'ConnectorError',
    HintError = 'HintError',
    ResourceError = 'ResourceError'
}
