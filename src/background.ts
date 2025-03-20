const CSP_HEADERS = [
	`content-security-policy`,
	`content-security-policy-report-only`,
	`x-webkit-csp`,
	`x-content-security-policy`,
];

const { RuleActionType, HeaderOperation, ResourceType } =
	chrome.declarativeNetRequest;

const getActiveTab = async () => {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tabs.length === 0 || tabs[0].id === undefined) {
		throw new Error("No active tab found");
	}
	const activeTab = tabs[0];

	return activeTab.id;
};

const updateIcon = (tabId: number, state: "off" | "on" | "processing") => {
	if (state === "processing") {
		chrome.action.setBadgeText({ text: "...", tabId });
		chrome.action.setBadgeBackgroundColor({ color: "#FFA500", tabId });
		return;
	}

	chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId });
	if (state === "on") {
		chrome.action.setBadgeText({ text: "ON", tabId });
	} else {
		chrome.action.setBadgeText({ text: "", tabId });
	}
};

const createRule = (tabId: number): chrome.declarativeNetRequest.Rule => ({
	id: tabId,
	action: {
		type: RuleActionType.MODIFY_HEADERS,
		responseHeaders: CSP_HEADERS.map((header) => ({
			operation: HeaderOperation.REMOVE,
			header,
		})),
	},
	condition: {
		tabIds: [tabId],
		resourceTypes: [ResourceType.MAIN_FRAME, ResourceType.SUB_FRAME],
	},
});

let updating = false;
const toggleCSPRuleForCurrentTab = async () => {
	if (updating) {
		return;
	}

	updating = true;
	const tabId = await getActiveTab();
	if (!tabId) {
		updating = false;
		return;
	}
	updateIcon(tabId, "processing");

	const rules = await chrome.declarativeNetRequest.getSessionRules();
	const isEnabled = rules.some((rule) => rule.id === tabId);

	if (isEnabled) {
		await chrome.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [tabId],
		});
		updateIcon(tabId, "off");
	} else {
		const rule = createRule(tabId);
		await chrome.declarativeNetRequest.updateSessionRules({
			addRules: [rule],
		});
		updateIcon(tabId, "on");
	}
	updating = false;
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	if (changeInfo.status === "loading") {
		updateIcon(tabId, "processing");
		const rules = await chrome.declarativeNetRequest.getSessionRules();
		const isEnabled = rules.some((rule) => rule.id === tabId);
		updateIcon(tabId, isEnabled ? "on" : "off");
	}
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
	updateIcon(tabId, "processing");
	const rules = await chrome.declarativeNetRequest.getSessionRules();
	const isEnabled = rules.some((rule) => rule.id === tabId);
	updateIcon(tabId, isEnabled ? "on" : "off");
});

chrome.action.onClicked.addListener(toggleCSPRuleForCurrentTab);
