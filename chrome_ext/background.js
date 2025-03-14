let timeTracker = {};
let activeTabId = null;
let lastUpdateTime = Date.now();

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateTimeForPreviousTab();
  activeTabId = activeInfo.tabId;
  lastUpdateTime = Date.now();
  if (tab.url) {
    const domain = new URL(tab.url).hostname;
    initializeTracker(domain);
  }
});

// Track URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    updateTimeForPreviousTab();
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      initializeTracker(domain);
    }
    lastUpdateTime = Date.now();
    activeTabId = tabId;
  }
});

function initializeTracker(domain) {
  if (!timeTracker[domain]) {
    timeTracker[domain] = {
      totalTime: 0,
      lastVisit: Date.now()
    };
  }
}

function updateTimeForPreviousTab() {
  if (activeTabId) {
    chrome.tabs.get(activeTabId, (tab) => {
      if (chrome.runtime.lastError) return;
      
      if (tab && tab.url) {
        const domain = new URL(tab.url).hostname;
        const now = Date.now();
        const timeSpent = Math.floor((now - lastUpdateTime) / 1000); // Convert to seconds
        
        if (timeTracker[domain]) {
          timeTracker[domain].totalTime += timeSpent;
          chrome.storage.local.set({ timeData: timeTracker });
        }
      }
    });
  }
}

// Update time every 1 second for active tab
setInterval(() => {
  updateTimeForPreviousTab();
  lastUpdateTime = Date.now();
}, 1000);