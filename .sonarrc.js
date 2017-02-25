module.exports = {
    // "extends": "recommend",
    // "plugins": [
    //     "import"
    // ],
    "collector": {
        "jsdom": {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.8,es;q=0.6,fr;q=0.4",
                "Pragma": "no-cache",
                "DNT": 1
            },
            waitFor: 5000
        }
    },
    "formatter": "json",
    "rules": {
        "no-double-slash": "warning"
    }
};