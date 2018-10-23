//Assigned to type any since we can't know the browsers the user will use

const convertToMdnName = (name: string):string => {
    switch (name.toLowerCase()) {
        case 'chrome':
        case 'edge': 
        case 'opera':
        case 'safari':
        case 'ie':
            return name.toLowerCase()
        case 'android':
            return 'webview_android'
        case 'chromeandroid':
        case 'and_chr':
            return 'chrome_android'
        case 'edge_mob':
            return 'edge_mobile'
        case 'explorer':
        case 'firefox':
        case 'ff':
            return 'firefox'
        case 'iOS':
        case 'ios_saf':
            return 'safari_ios'
        case 'node':
            return 'nodejs'
        case 'qqandroid':
        case 'and_qq':
            return 'qq_android'
        case 'samsung':
            return 'samsunginternet_android'
        case 'ucandroid':
        case 'and_uc':
            return 'uc_android'
        default: 
            return ''
    }
}

const convertBrowserNames = (userBrowsersWithBrowserListNames: any) => {
    const userBrowsersWithMdnNames: any = {};
    Object.keys(userBrowsersWithBrowserListNames).forEach((browserListName) => {
        userBrowsersWithMdnNames[convertToMdnName(browserListName)] = userBrowsersWithBrowserListNames[browserListName];
    })
    return userBrowsersWithMdnNames;
} 

export { convertBrowserNames }