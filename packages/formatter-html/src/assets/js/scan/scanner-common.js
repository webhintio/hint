/* global hljs */
/* eslint-disable no-var,prefer-arrow-callback,prefer-template,no-self-assign */
(function () {
    /** Polyfill for 'Element.closest()' */
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this; // eslint-disable-line consistent-this

            if (!document.documentElement.contains(el)) {
                return null;
            }
            do {
                if (el.matches(s)) {
                    return el;
                }
                el = el.parentElement;
            } while (el !== null);

            return null;
        };
    }

    var expandDetails = function (item) {
        item.setAttribute('aria-expanded', 'true');
    };

    var collapseDetails = function (item) {
        item.setAttribute('aria-expanded', 'false');
    };

    var childRulesExpanded = function (element) {
        var parent = element.closest('.rule-result');
        var details = Array.prototype.slice.apply(parent.querySelectorAll('.rule-result--details'));

        return details.some(function (detail) {
            return (detail.getAttribute('aria-expanded') === 'true');
        });
    };

    var updateExpandAllButton = function (element, closeAll) {
        var expanded = typeof closecloseAll !== 'undefined' ? closeAll : childRulesExpanded(element);

        if (expanded) {
            element.innerHTML = '- close all';
            element.classList.remove('closed');
            element.classList.add('expanded');
        } else {
            element.innerHTML = '+ expand all';
            element.classList.remove('expanded');
            element.classList.add('closed');
        }
    };

    var toggleExpandRule = function (element, closeAll) {
        var parent = element.closest('.rule-result--details');
        var expanded = typeof closeAll !== 'undefined' ? closeAll : parent.getAttribute('aria-expanded') === 'true';
        var name = element.getAttribute('data-rule');
        var expandAllButton = parent.closest('.rule-result').querySelector('.button-expand-all');

        if (expanded) {
            collapseDetails(parent);
            element.innerHTML = 'open details';
            element.setAttribute('title', 'show ' + name + '\'s result details');
        } else {
            expandDetails(parent);
            element.innerHTML = 'close details';
            element.setAttribute('title', 'close ' + name + '\'s result details');
        }

        updateExpandAllButton(expandAllButton);
        /*
         * if all rules are closed, toggle button to '- open all'.
         * if any rule is open, toggle button to '- close all'.
         */
    };

    var toggleExpandAll = function (element) {
        var parent = element.closest('.rule-result');
        var detailButtons = Array.prototype.slice.apply(parent.querySelectorAll('.button--details'));
        var expanded = element.classList.contains('expanded');

        for (var i = 0; i < detailButtons.length; i++) {
            if (expanded) {
                toggleExpandRule(detailButtons[i], true);
            } else {
                toggleExpandRule(detailButtons[i], false);
            }
        }

        updateExpandAllButton(element, !expanded);
    };

    var toggleExpand = function (evt) {
        var element = evt.target;

        if (element.className.indexOf('button--details') !== -1) {
            toggleExpandRule(element);
        }

        if (element.className.indexOf('button-expand-all') !== -1) {
            toggleExpandAll(element);
        }
    };

    var registerToggleExpandListener = function () {
        var container = document.getElementById('results-container');

        if (container) {
            container.addEventListener('click', toggleExpand, false);
        }
    };

    var endsWith = function (searchStr, str) {
        var length = str.length;
        var searchLength = searchStr.length;
        var position = str.indexOf(searchStr);

        return (length - searchLength) === position;
    };

    var onPopState = function () {
        if (endsWith('/scanner/', window.location.href)) {
            window.location.href = window.location.href;
        }
    };

    var setClipboardText = function (text) {
        var id = 'hidden-clipboard';
        var hiddenTextArea = document.getElementById(id);

        if (!hiddenTextArea) {
            var newTextArea = document.createElement('textarea');

            newTextArea.id = id;
            newTextArea.style.position = 'fixed';
            newTextArea.style.top = 0;
            newTextArea.style.left = 0;

            newTextArea.style.width = '1px';
            newTextArea.style.height = '1px';
            newTextArea.style.padding = 0;

            newTextArea.style.border = 'none';
            newTextArea.style.outline = 'none';
            newTextArea.style.boxShadow = 'none';

            newTextArea.style.background = 'transparent';
            document.querySelector('body').appendChild(newTextArea);
            hiddenTextArea = document.getElementById(id);
        }

        hiddenTextArea.value = text;
        hiddenTextArea.select();

        document.execCommand('copy');
    };

    var highlightCodeBlocks = function () {
        var codeBlocks = document.querySelectorAll('code');

        for (var i = 0; i < codeBlocks.length; i++) {
            hljs.highlightBlock(codeBlocks[i]);
        }
    };

    var copyButton = document.querySelector('.permalink-copy');
    var copyPermalinkToClipboard = function () {
        var permalink = document.querySelector('.scan-overview__body__permalink').textContent;

        setClipboardText(permalink.trim());
    };

    if (copyButton) {
        copyButton.addEventListener('click', copyPermalinkToClipboard);
    }

    window.addEventListener('popstate', onPopState, false);

    registerToggleExpandListener();
    highlightCodeBlocks();
}());
