chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveUrl",
        title: "Save this page to Quick Open URLs",
        contexts: ["page"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveUrl") {
        const url = tab.url;
        const alias = tab.title;

        chrome.storage.sync.get("urls", (data) => {
            const urls = data.urls || [];
            urls.push({url, alias});
            chrome.storage.sync.set({urls});
        });
    }
});
