let timeData = {};
let isTracking = false;
let currentTab = null;
let startTime = null;

// Initialize or load saved data
chrome.storage.local.get(['timeData', 'lastResetDate'], (result) => {
    if (result.timeData) {
        timeData = result.timeData;
    }
    
    // Check for day reset
    const today = new Date().toDateString();
    if (!result.lastResetDate || result.lastResetDate !== today) {
        timeData = {};
        chrome.storage.local.set({ 
            timeData: timeData,
            lastResetDate: today
        });
    }
});

// Track active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        handleTabChange(tab);
    } catch (error) {
        console.error('Error getting tab:', error);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        handleTabChange(tab);
    }
});

function handleTabChange(tab) {
    if (currentTab) {
        updateTimeForDomain(currentTab);
    }
    
    currentTab = tab;
    startTime = Date.now();
    isTracking = true;
}

function updateTimeForDomain(tab) {
    if (!startTime || !isTracking) return;

    const url = new URL(tab.url);
    const domain = url.hostname;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    if (!timeData[domain]) {
        timeData[domain] = { totalTime: 0 };
    }
    timeData[domain].totalTime += timeSpent;

    chrome.storage.local.set({ timeData });
    startTime = Date.now();
}

// Update time every minute
setInterval(() => {
    if (currentTab) {
        updateTimeForDomain(currentTab);
    }
}, 60000);

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        isTracking = false;
        if (currentTab) {
            updateTimeForDomain(currentTab);
        }
    } else {
        isTracking = true;
        startTime = Date.now();
    }
});