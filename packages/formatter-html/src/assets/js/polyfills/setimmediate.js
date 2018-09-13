/* eslint-disable no-var */

(function () {
    var polyfillSetImmediate = function () {
        window.setImmediate = window.setImmediate || function (func) {
            setTimeout(func, 0);
        };
    };

    polyfillSetImmediate();
}());
