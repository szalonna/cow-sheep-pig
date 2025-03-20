const CSP_HEADERS = [
    `content-security-policy`,
    `content-security-policy-report-only`,
    `x-webkit-csp`,
    `x-content-security-policy`,
];

const { RuleActionType, HeaderOperation, ResourceType } =
    chrome.declarativeNetRequest;

const createRule = (tabIds: number[], index: number): chrome.declarativeNetRequest.Rule => ({
    id: index,
    action: {
        type: RuleActionType.MODIFY_HEADERS,
        responseHeaders: CSP_HEADERS.map((header) => ({
            operation: HeaderOperation.REMOVE,
            header,
        })),
    },
    condition: {
        tabIds,
        resourceTypes: [ResourceType.MAIN_FRAME, ResourceType.SUB_FRAME],
    },
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId });

    if (changeInfo.status === "loading") {
        chrome.storage.session.get(`tab-${tabId}`, (result) => {
            if (result[`tab-${tabId}`]) {
                chrome.action.setBadgeText({ text: "ON", tabId });
            } else {
                chrome.action.setBadgeText({ text: "", tabId });
            }
        });
    }
});

chrome.storage.session.onChanged.addListener(async (changes: {
    [key: string]: chrome.storage.StorageChange;
}) => {
    const tabIds: number[] = [];
    for (const key in changes) {
        if (key.startsWith("tab-")) {
            const tabId = parseInt(key.replace("tab-", ""));
            const enabled = changes[key].newValue;
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId });
            if (enabled) {
                chrome.action.setBadgeText({ text: "ON", tabId });
                tabIds.push(tabId);
            } else {
                chrome.action.setBadgeText({ text: "", tabId });
            }
        }
    }

    if (tabIds.length === 0) {
        chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: (await chrome.declarativeNetRequest.getSessionRules()).map((rule) => rule.id),
        });
        return;
    }

    const rule = createRule(tabIds, 1);

    chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: (await chrome.declarativeNetRequest.getSessionRules()).map((rule) => rule.id),
        addRules: [rule],
    });
});

chrome.storage.session.getKeys(async (keys) => {
    for (const key of keys) {
        if (key.startsWith("tab-")) {
            const tabId = parseInt(key.replace("tab-", ""));

            chrome.storage.session.get(key, (result) => {
                chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId });
                if (result[key]) {
                    chrome.action.setBadgeText({ text: "ON", tabId });
                } else {
                    chrome.action.setBadgeText({ text: "", tabId });
                }
            });
        }
    }

}
);