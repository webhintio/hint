/* global hljs, ejsPartials */
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

    var getMessage = window.getMessage;
    var categoriesListElement = document.getElementById('categories-list');
    var showMenuElement = document.getElementById('show-categories');
    var header = document.querySelector('.header');
    var mql = window.matchMedia('(min-width: 48em)');

    var expandDetails = function (item) {
        item.setAttribute('aria-expanded', 'true');
        item.setAttribute('open', '');
    };

    var collapseDetails = function (item) {
        item.setAttribute('aria-expanded', 'false');
        item.removeAttribute('open');
    };

    var childRulesExpanded = function (element) {
        var parent = element.closest('.rule-result');
        var details = Array.prototype.slice.apply(parent.querySelectorAll('.rule-result--details'));

        return details.some(function (detail) {
            return detail.getAttribute('open') !== null;
        });
    };

    /**
     * if all rules are closed, toggle button to 'expand all'.
     * if any rule is open, toggle button to 'close all'.
     */
    var updateExpandAllButton = function (element, closeAll) {
        var expanded = typeof closeAll !== 'undefined' ? closeAll : childRulesExpanded(element);

        if (expanded) {
            element.textContent = getMessage('closeAll');
            element.classList.remove('closed');
            element.classList.add('expanded');
        } else {
            element.textContent = getMessage('expandAll');
            element.classList.remove('expanded');
            element.classList.add('closed');
        }
    };

    var expandRule = function (element, closeAll) {
        var expanded = typeof closeAll !== 'undefined' ? closeAll : element.getAttribute('aria-expanded') === 'true';
        var name = element.id;

        if (expanded) {
            collapseDetails(element);
            element.setAttribute('title', 'show ' + name + '\'s result details');
        } else {
            expandDetails(element);
            element.setAttribute('title', 'close ' + name + '\'s result details');
        }
    };

    var toggleExpandAll = function (element) {
        var parent = element.closest('.rule-result');
        var detailButtons = Array.prototype.slice.apply(parent.querySelectorAll('.rule-result--details'));
        var expanded = element.classList.contains('expanded');

        for (var i = 0; i < detailButtons.length; i++) {
            if (expanded) {
                expandRule(detailButtons[i], true);
            } else {
                expandRule(detailButtons[i], false);
            }
        }

        updateExpandAllButton(element, !expanded);
    };

    var toggleExpandRule = function (element) {
        var parent = element.closest('.rule-result');
        var expandAll = parent.querySelector('.button-expand-all');

        setTimeout(function () {
            updateExpandAllButton(expandAll);
        }, 0);
    };

    var getCurrentCategoryMenuHeight = function () {
        if (header) {
            return 'calc(100% - 5rem - ' + header.clientHeight + 'px)';
        }

        return 'calc(100% - 5rem)';
    };

    var toggleCategoryMenu = function () {
        var parent = showMenuElement.closest('.module--categories');
        var menu = parent.querySelector('.rule-categories');

        if (menu.classList.contains('open')) {
            showMenuElement.textContent = 'Jump to category';
            menu.setAttribute('aria-expanded', 'false');
            menu.classList.remove('open');
            document.body.classList.remove('menu-open');
        } else {
            categoriesListElement.style.height = getCurrentCategoryMenuHeight();
            showMenuElement.textContent = 'Hide categories';
            menu.setAttribute('aria-expanded', 'true');
            menu.classList.add('open');
            document.body.classList.add('menu-open');
        }
    };

    var scrollTo = function (element) {
        setTimeout(function () {
            window.scrollTo(0, element.offsetTop - 50);
        }, 0);
    };

    var scrollToElementLink = function (element) {
        var href = element.getAttribute('href');
        /*
         * id should be:
         *    type-name[-index]
         * e.g.:
         *    category-performance
         *    hint-axe-3
         */
        var id = href.substr(1);

        if (id.indexOf('category') === 0) {
            // The browser will scroll automatically.
            return;
        }

        /*
         * The user clicks a hint.
         *
         * When the user clicks a hint, we need to add an offset
         * to the default position, if not, the documenation links
         * will cover the hint message.
         */

        var title = document.getElementById(id);

        scrollTo(title);
    };

    var categoryClasses = ['rule-tile--wrapper', 'rule-tile', 'rule-icon', 'rule-tile__category', 'rule-tile__sub-category', 'rule-tile__passed', 'rule-tile__info', 'rule-tile__results'];

    var onContainerClick = function (evt) {
        var element = evt.target;

        if (element.classList.contains('hint-link')) {
            return scrollToElementLink(element);
        }

        if (element.classList.contains('button-expand-all')) {
            return toggleExpandAll(element);
        }

        if (element.classList.contains('rule-title')) {
            return toggleExpandRule(element);
        }

        if (element.classList.contains('show-categories')) {
            return toggleCategoryMenu();
        }

        if (!mql.matches) {
            categoryClasses.some(function (className) {
                if (element.classList.contains(className)) {
                    toggleCategoryMenu();

                    return true;
                }

                return false;
            });
        }

        return true;
    };

    var registerToggleExpandListener = function () {
        var container = document.getElementById('results-container');

        if (container) {
            container.addEventListener('click', onContainerClick, false);
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
            newTextArea.style.top = '-10px';
            newTextArea.style.left = '-10px';

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

    var checkClipboard = function (element) {
        var parentElement = element.querySelector('.permalink-copy');
        var permalinkImageElement = parentElement.querySelector('img');

        if (!window.ejsPartials) {
            permalinkImageElement.src = '/images/scan/results-passed-icon.svg';
        } else {
            parentElement.removeChild(permalinkImageElement);

            parentElement.innerHTML += ejsPartials['check-mark']();
        }
    };

    var copyButtons = Array.prototype.slice.apply(document.querySelectorAll('.permalink-copy'));
    var copyPermalinkToClipboard = function (evt) {
        var element = evt.currentTarget;
        var parent = element.parentElement;
        var permalinkElement = parent.querySelector('.permalink-content');
        var permalink = permalinkElement.textContent;

        setClipboardText(permalink.trim());

        checkClipboard(parent);
    };

    copyButtons.forEach(function (copyButton) {
        copyButton.addEventListener('click', copyPermalinkToClipboard);
    });

    window.addEventListener('popstate', onPopState, false);

    var validateMediaQuery = function () {
        if (mql.matches) {
            categoriesListElement.removeAttribute('aria-expanded');

            document.body.classList.remove('menu-open');
        } else {
            var isOpen = categoriesListElement.classList.contains('open');

            categoriesListElement.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            if (isOpen) {
                categoriesListElement.style.height = getCurrentCategoryMenuHeight();
                document.body.classList.add('menu-open');
            }
        }
    };

    var registerMediaQuery = function () {
        validateMediaQuery();
        mql.addListener(validateMediaQuery);
    };

    var pad = function (time) {
        return time < 10 ? ('0' + time) : time;
    };

    var updateDate = function () {
        var dateElement = document.getElementById('scan-date');

        if (!dateElement) {
            return;
        }

        var isoDateString = dateElement.getAttribute('data-date');

        if (!isoDateString) {
            return;
        }

        var isoDate = new Date(isoDateString);

        dateElement.textContent = isoDate.getFullYear() + '-' + pad(isoDate.getMonth() + 1) + '-' + pad(isoDate.getDate()) + ' ' + pad(isoDate.getHours()) + ':' + pad(isoDate.getMinutes());
    };

    var contractDetails = function () {
        var elements = Array.prototype.slice.apply(document.querySelectorAll('details[open]'));
        var expandAllButtons = Array.prototype.slice.apply(document.querySelectorAll('.button-expand-all'));

        elements.forEach(function (element) {
            element.removeAttribute('open');
            element.setAttribute('aria-expanded', 'false');
        });

        expandAllButtons.forEach(function (element) {
            element.textContent = getMessage('expandAll');
            element.classList.add('closed');
            element.classList.remove('expanded');
        });
    };

    var scrollToLink = function () {
        var hash = location.hash;

        if (!hash) {
            return;
        }

        var id = hash.substr(1);

        if (id.indexOf('category') === 0) {
            // The browser will scroll automatically.
            return;
        }

        /*
         * When the link is pointing to a hint, we need to
         * open the details/summary that contains the hint
         * and then scroll to that hint.
         */
        var title = document.getElementById(id);
        var detail = title.closest('.rule-result--details');

        detail.setAttribute('open', 'open');
        detail.setAttribute('aria-expanded', 'true');

        scrollTo(title);
    };

    updateDate();

    if (categoriesListElement) {
        contractDetails();
        scrollToLink();
        registerToggleExpandListener();
        registerMediaQuery();
        highlightCodeBlocks();
    }
}());
