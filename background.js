chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendMessage(tab.id, {}, function (mode) {
        chrome.browserAction.setBadgeText({
            text: mode === "dark" ? "Dark" : "",
            tabId: tab.id
        });
        chrome.browserAction.setTitle({
            title: mode === "dark" ? "Set Light Mode" : "Set Dark Mode",
            tabId: tab.id
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: mode === "dark" ? "#000" : "",
            tabId: tab.id
        });
    });
});