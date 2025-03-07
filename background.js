// Initialize storage on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
     
      trackersDetected: 0,
      detectedTrackers: []
    });
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'resetTrackers') {
      chrome.storage.local.set({
        trackersDetected: 0,
        detectedTrackers: [],
      
      });
    }
    else if (message.type === 'trackerDetected') {
      updateTrackerMetrics(message.data);
    } else if (message.type === 'trackersUpdate') {
      updateTrackersArray(message.data);
    }
  });
  
  function updateTrackerMetrics(trackerData) {
    chrome.storage.local.get(['detectedTrackers'], (result) => {
        const trackers = result.detectedTrackers || [];

        const trackerExists = trackers.some(t =>
            t.domain === trackerData.domain &&
            t.type === trackerData.type &&
            t.url === trackerData.url
        );

        if (!trackerExists) {
            trackers.unshift({
                domain: trackerData.domain,
                type: trackerData.type,
                name: trackerData.name,
                url: trackerData.url,
                timestamp: trackerData.timestamp
            });

            const currentDomain = new URL(trackerData.url).hostname;
            const filteredTrackers = trackers.filter(t => t.domain === currentDomain);

            chrome.storage.local.set({
                trackersDetected: filteredTrackers.length,
                detectedTrackers: filteredTrackers.slice(0, 50)
            });
        }
    });
}

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fingerprintDetected') {
        updateFingerprintMetrics(message.data);
    }
   
})
  
function updateFingerprintMetrics(fingerprintData) {
  chrome.storage.local.get(['fingerprintAttempts'], (result) => {
      let attempts = result.fingerprintAttempts || [];
      attempts.unshift({
          method: fingerprintData.method,
          timestamp: fingerprintData.timestamp
      });
      attempts = attempts.slice(0, 50); // Keep last 50 attempts
      chrome.storage.local.set({ fingerprintAttempts: attempts });
  });
}



  chrome.runtime.onInstalled.addListener(() => {
    chrome.action.onClicked.addListener((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['permissionScript.js']
      });
    });
  });

  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'permissionStatus') {
        chrome.storage.local.set({
            currentPermissions: message.data,
            lastChecked: Date.now() // Add timestamp for freshness
        });
    }
    else if (message.type === 'permissionChange') {
        chrome.storage.local.get('currentPermissions', (result) => {
            const permissions = result.currentPermissions || {};
            permissions[message.data.permission] = message.data.state;
            chrome.storage.local.set({ currentPermissions: permissions });
        });
    }
});

  