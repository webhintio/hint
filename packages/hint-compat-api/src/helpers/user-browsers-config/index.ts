const getUserBrowsers = ( targetedBrowsers: string[] ) => {
    //MDN's browser-compat-data does not cover certain browsers on browserlist
    //These are: baidu, blackberry, electron, ie_mob and opera_mini
    
    //Android WebView
    const androidWebView = (browser: string) => {
        //Android
        //webview_android
    }

    //Google Chrome
    const chrome = (browser: string) => {
        //chrome
        //chrome
    }

    //Chrome for Android
    const chromeAndroid = (browser: string) => {
        //ChromeAndroid or and_chr
        //chrome_android
    }

    //MS Edge
    const edge = (browser: string) => {
        //edge
        //edge
    }

    //Edge Mobile - this was not specified in browserlist but used in mdn's browser-compat-data api
    const edgeMobile = (browser: string) => {
        //edge_mob
        //edge_mobile
    }

    //Internet Explorer
    const explorer = (browser: string) => {
        //Explorer or ie
        //ie
    }

    //Explorer Mobile
    const explorerMobile = (browser: string) => {
        //ExplorerMobile or ie_mob
    }

    //Mozilla Firefox
    const firefox = (browser: string) => {
        //Firefox or ff
        //firefox
    }

    //Firefox for Android
    const firefoxAndroid = (browser: string) => {
        //FirefoxAndroid or and_ff
        //firefox_android
    }

    //iOS Safari
    const iOS = (browser: string) => {
        //iOS or ios_saf 
        //safari_ios
    }

    //Node.js
    const node = (browser: string) => {
        //Node
        //nodejs
    }

    //Opera
    const opera = (browser: string) => {
        //Opera
        //opera
    }

    //Opera Mini
    const operaMini = (browser: string) => {
        //OperaMini or op_mini
    }

    //Opera Mobile
    const operaMobile = (browser: string) => {
        //OperaMobile or op_mob
    }

    //QQ Browser for Android
    const qqAndroid = (browser: string) => {
        //QQAndroid or and_qq for
        //qq_android
    }

    //Desktop Safari
    const safari = (browser: string) => {
        //Safari
        //safari
    }

    //Samsung Internet
    const samsung = (browser: string) => {
        //Samsung
        //samsunginternet_android
    }
    
    //UC Browser for Android
    const ucAndroid = (browser: string) => {
        //UCAndroid or and_uc
        //uc_android
    }
    return
}

export { getUserBrowsers }
