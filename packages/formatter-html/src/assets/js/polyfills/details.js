/* eslint-disable no-var,prefer-arrow-callback */
(function () {
    var supportDetails = 'open' in document.createElement('details');

    var shim = function () {
        var detailButtons = document.querySelectorAll('summary');

        for (var i = 0, li = detailButtons.length; i < li; i++) {
            var button = detailButtons[i];

            if (!supportDetails) {
                button.setAttribute('tabindex', '0');
            }
            button.setAttribute('role', 'button');
            button.parentElement.setAttribute('role', 'group');
        }
    };

    var onToggleDetail = function (e, target) {
        var ariaExpanded = target.getAttribute('aria-expanded');
        var keydown = e.type === 'keydown';
        var key;

        if (keydown) {
            key = e.which || e.keyCode;

            if (key !== 32 && key !== 13) {
                return;
            }
        }

        e.preventDefault();

        if (ariaExpanded === 'false' || !ariaExpanded) {
            target.setAttribute('aria-expanded', 'true');
            target.parentElement.setAttribute('open', '');
        } else {
            target.setAttribute('aria-expanded', 'false');
            target.parentElement.removeAttribute('open');
        }
    };

    var findSummary = function (element) {
        if (element.nodeName === 'SUMMARY' && element.getAttribute('role') === 'button') {
            return element;
        }

        if (element.parentElement) {
            return findSummary(element.parentElement);
        }

        return null;
    };

    var registerEvents = function () {
        document.addEventListener('click', function (evt) {
            var target = evt.target || evt.srcElement;
            var source = findSummary(target);

            if (source) {
                onToggleDetail(evt, source);
            }
        }, false);

        document.addEventListener('keydown', function (evt) {
            var target = evt.target || evt.srcElement;
            var source = findSummary(target);

            if (source) {
                onToggleDetail(evt, source);
            }
        }, false);
    };

    window.addEventListener('load', function () {
        shim();
        if (!supportDetails) {
            registerEvents();
        }
    });
}());
