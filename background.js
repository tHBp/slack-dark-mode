const setPageInfo = (isSlackDarkMode, tabId) => {
    chrome.pageAction.setTitle({
        title: isSlackDarkMode ? "Set Light Mode" : "Set Dark Mode",
        tabId
    });
    chrome.pageAction.setIcon({
        path: isSlackDarkMode ? "icons/icon128_dark.png" : "icons/icon128.png",
        tabId
    });
}

const getSlackTabs = () => {
    return new Promise(resolve => chrome.storage.sync.get(["slackTabsOpened"], storage => resolve(storage.slackTabsOpened)));
}

const getCurrentTab = () => {
    return new Promise(resolve => chrome.tabs.getCurrent(resolve));
}

const saveTabInfo = tab => {
    chrome.storage.sync.get(["slackTabsOpened"], storage => {
        storage.slackTabsOpened = storage.slackTabsOpened || [];
        storage.slackTabsOpened.push(tab.id);
        chrome.storage.sync.set({
            slackTabsOpened: storage.slackTabsOpened
        });
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.pageAction.onClicked.addListener(() => getSlackTabs().then(tabs => tabs.forEach(tabId => chrome.tabs.sendMessage(tabId, {}, isSlackDarkMode => setPageInfo(isSlackDarkMode, tabId)))));
    chrome.runtime.onMessage.addListener((message, sender) => {
        if (message.type === "applyDarkMode") getSlackTabs().then(tabs => tabs.forEach(tabId => setPageInfo(true, tabId)));
        if (message.type === "newTabOpened") saveTabInfo(sender.tab);
    });
    chrome.tabs.onRemoved.addListener(tabId => {
        chrome.storage.sync.get(["slackTabsOpened"], storage => {
            if (!storage.slackTabsOpened || !storage.slackTabsOpened.length) return;
            storage.slackTabsOpened.splice(storage.slackTabsOpened.findIndex(element => element === tabId), 1);
            chrome.storage.sync.set({
                slackTabsOpened: storage.slackTabsOpened
            });
        });
    });
    chrome.declarativeContent.onPageChanged.removeRules(void 0, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostContains: ".slack.com"
                },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});