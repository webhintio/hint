/* eslint-disable */

const extraData = {
    css: {
        properties: {
            transform: {
                '3d': {
                    __compat: {
                        match: {
                            keywords: [
                                'matrix3d',
                                'translate3d',
                                'translateZ',
                                'scale3d',
                                'scaleZ',
                                'rotate3d',
                                'rotateX',
                                'rotateY',
                                'rotateZ',
                                'perspective',
                            ]
                        }
                    }
                }
            },
            'transform-origin': {
                three_value_syntax: {
                    __compat: {
                        match: {
                            regex_value: '^([\\d\\w%-]+|calc\\(.+\\))\\s+([\\d\\w%-]+|calc\\(.+\\))\\s+([\\d\\w-]+|calc\\(.+\\))$'
                        }
                    }
                }
            }
        },
        types: {
            color: {
                alpha_hexadecimal_notation: {
                    __compat: {
                        match: {
                            regex_token: '^#[0-9a-fA-F]{4}(?:[0-9a-fA-F]{4})?$'
                        }
                    }
                }
            }
        }
    }
};

module.exports = extraData;
