import { Context } from '../@types/custom';

export const skipIfSameVersion = (pkgName: string) => {
    return ({ packages }: Context) => {
        const pkg = packages && packages.get(pkgName);
        const version = pkg && pkg.content.version;
        const oldVersion = pkg && pkg.oldVersion;

        if (version === oldVersion) {
            return `Package '${pkgName}' is unchanged`;
        }

        return '';
    };
};

export const skipReasons = (...args: Function[]) => {
    return (ctx: Context) => {
        let reason = '';

        args.some((skip) => {
            reason = skip(ctx);

            return !!reason;
        });

        return reason;
    };
};

export const skipInstallation = (ctx: Context) => {
    const { skipInstall } = ctx.argv;

    return typeof skipInstall === 'undefined' ?
        '' :
        '--skipInstall';
};

export const skipIfError = (ctx: Context) => {
    return ctx.error ?
        `Something happened: ${ctx.error.message}` :
        '';
};

export const skipIfAborted = (ctx: Context) => {

    return ctx.abort ?
        'Process aborted' :
        '';
};

const skipArgument = (argument: string) => {
    return (ctx: Context) => {
        return ctx.argv[argument] ?
            `--${argument}` :
            '';
    };
};

export const skipIfForced = skipArgument('force');
export const skipIfJustRelease = skipArgument('justRelease');
