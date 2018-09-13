/* eslint-disable no-var, strict, prefer-arrow-callback, object-shorthand */
/* eslint-env browser */
(function () {
    'use strict';

    if (!window.matchMedia) {
        return;
    }

    var active = true;
    var anchorTops = document.querySelectorAll('.anchor-top');

    if (anchorTops.length === 0) {
        return;
    }

    var anchors = [];

    for (var i = 0; i < anchorTops.length; i++) {
        var height = anchorTops[i].dataset.scroll || 2;

        height = parseInt(height, 10);
        anchors.push({
            element: anchorTops[i],
            height: height
        });
    }

    var queued = false;
    var onScroll = function () {
        var scroll = window.scrollY / window.innerHeight;

        anchors.forEach(function (anchor) {
            if (scroll >= anchor.height) {
                anchor.element.removeAttribute('hidden');
            } else {
                anchor.element.setAttribute('hidden', '');
            }
        });
        queued = false;
    };

    var queueScroll = function () {
        if (!active) {
            return;
        }

        if (!queued) {
            queued = true;
            requestAnimationFrame(onScroll);
        }
    };

    window.addEventListener('scroll', queueScroll, false);
}());
