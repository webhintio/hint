/** A specialized builder of plugins to be used by Sonar */
export interface IPluginBuilder {
    /** Creates an instance of the Plugin. */
    create(config: any): IPlugin;
}

/** A plugin that expands the connector's functionality */
export interface IPlugin {
    // TBD
    any;
}
