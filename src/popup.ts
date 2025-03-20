async function getActiveTabData(): Promise<{ hostname: string, tabId: number }> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || tabs[0].id === undefined) {
        throw new Error("No active tab found");
    }
    const activeTab = tabs[0];

    return {
        tabId: activeTab.id!,
        hostname: new URL(activeTab.url!).hostname
    };
}

document.addEventListener("DOMContentLoaded", async () => {
    const checkbox = document.getElementById("enable-filtering")! as HTMLInputElement;
    const { tabId } = await getActiveTabData();

    checkbox.addEventListener("change", async (e) => {
        const checkbox = e.target as HTMLInputElement;
        chrome.storage.session.set({ [`tab-${tabId}`]: checkbox.checked });
    });

    chrome.storage.session.get(`tab-${tabId}`, (result) => {
        if (result[`tab-${tabId}`]) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false
        }
    });
});
