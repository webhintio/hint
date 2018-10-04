// See https://github.com/gkz/optionator#settings-format
declare module 'optionator' {

    // eslint-disable-next-line
    module optionator {

        interface IOpinionatorHeading {
            heading: string;
        }

        interface IOptionatorOption {
            option: string;
            alias?: string | string[];
            type: string;
            enum?: string[];
            default?: string | boolean;
            restPositional?: boolean;
            required?: boolean;
            overrideRequired?: boolean;
            dependsOn?: string | string[];
            concatRepeatedArrays?: boolean | [boolean, object];
            mergeRepeatedObjects?: boolean;
            description?: string;
            longDescription?: string;
            example?: string | string[];
        }

        interface IOptionatorHelpStyle {
            aliasSeparator?: string;
            typeSeparator?: string;
            descriptionSeparator?: string;
            initialIndent?: number;
            secondaryIndent?: number;
            maxPadFactor?: number;
        }

        interface IOptionatorArgs {
            prepend?: string;
            append?: string;
            options: (IOpinionatorHeading | IOptionatorOption)[];
            helpStyle?: IOptionatorHelpStyle;
            mutuallyExclusive?: (string | string[])[];
            positionalAnywhere?: boolean;
            typeAliases?: object;
            defaults?: Partial<IOptionatorOption>;
        }

        interface IOptionator {
            parse(input: string | string[] | object, parseOptions?: { slice?: number }): any;
            parseArgv(input: string[]): any;
            generateHelp(helpOptions?: { showHidden?: boolean; interpolate?: any }): string;
            generateHelpForOption(optionName: string): string;
        }
    }

    function optionator(args: optionator.IOptionatorArgs): optionator.IOptionator;
    export = optionator;
}
