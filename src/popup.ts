// import { storage, STORAGE_KEY } from "./storage";

// const addButton = document.getElementById('add-button') as HTMLButtonElement;
// const input = document.getElementById('url') as HTMLInputElement;

// const getHostname = async (raw: string) => {
//     const url = new URL(raw);
//     return url.hostname;
// }

// addButton.addEventListener('click', () => {
//     if (input.value.length === 0) {
//         return;
//     }

//     storage.get(STORAGE_KEY, async (result) => {
//         console.log(result);

//         let set: string[];

//         if (result && result[STORAGE_KEY]) {
//             set = result[STORAGE_KEY];
//         } else {
//             set = [];
//         }

//         console.log(result, input.value);

//         const hostname = await getHostname(input.value);

//         if (!hostname || set.includes(hostname)) {
//             return
//         }

//         set.push(hostname);
//         storage.set({ [STORAGE_KEY]: set });
//     });
// })


// // const toggle = document.getElementById('sidebar-toggle') as HTMLInputElement;


// // storage.get(STORAGE_KEY, async (result) => {
// //     const hostname = await getHostname();

// //     if (!result.enabledSites || !hostname || !result.enabledSites.includes(hostname)) {
// //         toggle.checked = false;
// //     } else {
// //         toggle.checked = true;
// //     }
// // });

// // toggle.addEventListener('change', async () => {
// //     const hostname = await getHostname();

// //     if (!hostname) {
// //         return;
// //     }

// //     storage.get(STORAGE_KEY, (result) => {
// //         if (!result.enabledSites) {
// //             result.enabledSites = [];
// //         }

// //         if (!toggle.checked) {
// //             result.enabledSites = result.enabledSites.filter((site) => site !== hostname);
// //         } else {
// //             result.enabledSites.push(hostname);
// //         }
// //         storage.set({ enabledSites: result.enabledSites });
// //     });
// // });

// src/popup.ts

// Some helper to query the current active tab:
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



// async function fetchAndDisplayHostnames() {
//     try {
//         const { tabId, hostname } = await getActiveTabId();

//         console.log(tabId, hostname);
//         // Send message to the background script:
//         const hosts: string[] = await chrome.runtime.sendMessage({
//             type: "GET_HOSTS_FOR_TAB",
//             tabId,
//             hostname
//         });

//         // Display them in our popup (you can do this however you like)
//         const listEl = document.getElementById("hostname-list");
//         if (listEl) {
//             listEl.innerHTML = ""; // clear existing
//             hosts.forEach((host) => {
//                 const li = document.createElement("li");
//                 li.textContent = host;
//                 listEl.appendChild(li);
//             });
//         }
//     } catch (err) {
//         console.error("Error fetching hostnames", err);
//     }
// }

// // On popup load, fetch hostnames:
// document.addEventListener("DOMContentLoaded", () => {
//     fetchAndDisplayHostnames();
// });


document.addEventListener("DOMContentLoaded", async () => {
    const checkbox = document.getElementById("enable-filtering")! as HTMLInputElement;
    const { tabId } = await getActiveTabData();

    // chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId });

    checkbox.addEventListener("change", async (e) => {
        const checkbox = e.target as HTMLInputElement;

        // if (checkbox.checked) {
        //     chrome.action.setBadgeText({ text: "ON", tabId });
        // } else {
        //     chrome.action.setBadgeText({ text: "", tabId });
        // }
        chrome.storage.session.set({ [`tab-${tabId}`]: checkbox.checked });

        // const { tabId, hostname } = await getActiveTabData();

        // // Send message to the background script:
        // await chrome.runtime.sendMessage({
        //     type: "TOGGLE_FILTERING",
        //     tabId,
        //     hostname,
        //     enabled: checkbox.checked
        // });
    });

    chrome.storage.session.get(`tab-${tabId}`, (result) => {
        if (result[`tab-${tabId}`]) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false
        }
    });
});