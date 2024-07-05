// background.js
let activeTabId = null;
let activeTabStartTime = null;
const websiteData = {};

// Function to categorize websites using regular expressions
function categorizeWebsite(hostname) {
  const patterns = {
    Productive: /docs|wikipedia|research|study|tutorial/,
    Entertainment: /youtube|netflix|games|fun|social/,
    Utilities: /email|bank|shopping|utility|weather/
  };

  for (const category in patterns) {
    if (patterns[category].test(hostname)) {
      return category;
    }
  }
  return "Others";
}

function updateActiveTabTime() {
  if (activeTabId && activeTabStartTime) {
    const now = Date.now();
    const duration = (now - activeTabStartTime) / 1000;

    chrome.tabs.get(activeTabId, (tab) => {
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        if (!websiteData[hostname]) {
          websiteData[hostname] = { time: 0, category: categorizeWebsite(hostname) };
        }
        websiteData[hostname].time += duration;
        saveData();
      }
    });
  }
  activeTabStartTime = Date.now();
}

function saveData() {
  chrome.storage.local.set({ websiteData });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateActiveTabTime();
  activeTabId = activeInfo.tabId;
  activeTabStartTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === "complete") {
    updateActiveTabTime();
  }
});

chrome.windows.onFocusChanged.addListener(() => {
  updateActiveTabTime();
});

chrome.tabs.onRemoved.addListener(() => {
  updateActiveTabTime();
  activeTabId = null;
});
