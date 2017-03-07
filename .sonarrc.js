module.exports = {
    // "extends": "recommend",
    // "plugins": [
    //     "import"
    // ],
    "collector": {
        "name": "jsdom",
        "options": {
            "waitFor": 100
        }
    },
    "formatter": "json",
    "rules": {
        "no-double-slash": "warning"
    }
};
