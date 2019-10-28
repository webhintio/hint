(function() {
    window.browser = {
        devtools: {
            inspectedWindow: {
                eval() {},
                tabId: 1 },
            network: {
                getHAR: () => {},
                onRequestFinished: {
                    addListener: () => {},
                    removeListener: () => {}
                }
            },
            panels: { themeName: 'dark' }
        },
        i18n: {
            getMessage: (key) => {
                return key;
            }
        },
        runtime: {
            // Used by the panel to listen for results.
            connect: () => {
                return {
                    onMessage: {
                        addListener: () => {},
                        removeListener: () => {}
                    }
                };
            },
            // Used by the panel to initiate a scan.
            sendMessage: () => {}
        }
    };
})();
