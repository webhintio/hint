// https://github.com/sindresorhus/boxen
declare module 'boxen' {

    type BorderStylePresets = 'single' | 'double' | 'round' | 'single-double' | 'double-single' | 'classic';

    interface IBorderStyles {
        topLeft: string;
        topRight: string;
        bottomLeft: string;
        bottomRight: string;
        horizontal: string;
        vertical: string;
    }

    interface ISides {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }

    interface IBoxenOptions {
        borderColor?: string;
        borderStyle?: BorderStylePresets | IBorderStyles;
        dimBorder?: boolean;
        padding?: number | ISides;
        margin?: number | ISides;
        float?: 'left' | 'center' | 'right';
        backgroundColor?: 'string';
        align?: 'left' | 'center' | 'right';
    }

    function boxen(input: string, options?: IBoxenOptions): string;
    export = boxen;
}
