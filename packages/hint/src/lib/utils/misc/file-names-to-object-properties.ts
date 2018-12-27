export type ConfigFile = '.hintrc'|'.hintrc.js'|'.hintrc.json'|'package.json'
export type ObjectProperty = 'hintrc'|'hintrcJs'|'hintrcJson'|'packageJson'

export const fileNamesToObjectProperties = (fileName: ConfigFile | string) => {
    switch (fileName) {
        case '.hintrc': 
            return 'hintrc';
        case '.hintrc.js': 
            return 'hintrcJs';
        case '.hintrc.json': 
            return 'hintrcJson';
        case 'package.json': 
            return 'packageJson';
        default:
            return;
    }
};

export const objectPropertiesToFileNames = (ObjectProp: ObjectProperty | string) => {
    switch (ObjectProp) {
        case 'hintrc':
            return '.hintrc';
        case 'hintrcJs':
            return '.hintrc.js';
        case 'hintrcJson':
            return '.hintrc.json';
        case 'packageJson':
            return 'package.json';
        case 'hintConfig':
            return 'hintConfig';
        default:
            return;
    }
};