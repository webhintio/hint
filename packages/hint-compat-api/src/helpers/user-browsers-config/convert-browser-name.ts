//Assigned to type any since we can't know the browsers the user will use

const convertToMdnName = (name: string) => {
    switch (name.toLowerCase()) {
        case ''
    }
}

const convertBrowserName = (userBrowsersWithBrowserListNames: any) => {
    const userBrowsersWithMdnNames: any = {};
    Object.keys(userBrowsersWithBrowserListNames).forEach((browserListName: string) => {
        userBrowsersWithMdnNames[convertToMdnName(browserListName)];
    })
    return userBrowsersWithMdnNames;
} 