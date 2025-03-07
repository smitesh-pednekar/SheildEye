document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
      tab.addEventListener('click', () => {
          // Remove active class from all tabs and contents
          tabs.forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(content => {
              content.classList.remove('active');
          });
          
          // Add active class to clicked tab and corresponding content
          tab.classList.add('active');
          const contentId = tab.getAttribute('data-tab');
          document.getElementById(contentId).classList.add('active');
      });
  });

  // Initialize metrics
  updateMetrics();

  // Cookie management
  document.getElementById('viewCookies').addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      
      chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
          const cookiesList = document.getElementById('cookiesList');
          cookiesList.innerHTML = '';
          
          if (cookies.length === 0) {
              cookiesList.innerHTML = '<div class="list-item">No cookies found</div>';
              return;
          }
          
          cookies.forEach(cookie => {
              const cookieDiv = document.createElement('div');
              cookieDiv.className = 'list-item';
              cookieDiv.innerHTML = `
                  <strong>Name:</strong> ${cookie.name}<br>
                  <strong>Domain:</strong> ${cookie.domain}<br>
                  <strong>Expiration:</strong> ${cookie.expirationDate ? 
                      new Date(cookie.expirationDate * 1000).toLocaleDateString() : 
                      'Session Cookie'}
              `;
              cookiesList.appendChild(cookieDiv);
          });
      });
  });

  document.getElementById('deleteAllCookies').addEventListener('click', () => {
      chrome.cookies.getAll({}, (cookies) => {
          cookies.forEach(cookie => {
              const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
              chrome.cookies.remove({ url, name: cookie.name });
          });
          document.getElementById('cookiesList').innerHTML = 
              '<div class="list-item">All cookies deleted</div>';
      });
  });

  document.getElementById('setCookie').addEventListener('click', () => {
    const domain = document.getElementById('cookieDomain').value.trim();
    const name = document.getElementById('cookieName').value.trim();
    const value = document.getElementById('cookieValue').value.trim();
    const secure = document.getElementById('secureFlag').checked;
    const messageDiv = document.getElementById('cookieMessage');

    if (!domain || !name || !value) {
        showCookieMessage('Please fill in all fields', 'error');
        return;
    }

    // Validate domain format
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-._]+[a-zA-Z0-9]$/.test(domain)) {
        showCookieMessage('Invalid domain format', 'error');
        return;
    }

    const protocol = secure ? 'https://' : 'http://';
    const url = protocol + domain;

    const cookieDetails = {
        url: url,
        name: name,
        value: value,
        path: '/',
        secure: secure,
        domain: '.' + domain.replace(/^\./, ''), // Ensure domain starts with a dot
        expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // 1 year from now
    };

    chrome.cookies.set(cookieDetails, (result) => {
        if (result) {
            // Verify the cookie was set
            chrome.cookies.get({
                url: url,
                name: name
            }, (cookie) => {
                if (cookie) {
                    showCookieMessage('Cookie set successfully!', 'success');
                    clearCookieInputs();
                    // Refresh cookie list if it's currently displayed
                    if (document.getElementById('cookiesList').children.length > 0) {
                        document.getElementById('viewCookies').click();
                    }
                } else {
                    showCookieMessage('Cookie set failed verification. Check domain permissions.', 'error');
                }
            });
        } else {
            const error = chrome.runtime.lastError;
            showCookieMessage(`Failed to set cookie: ${error ? error.message : 'Unknown error'}`, 'error');
        }
    });
});

function showCookieMessage(message, type) {
    const messageDiv = document.getElementById('cookieMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

function clearCookieInputs() {
    document.getElementById('cookieDomain').value = '';
    document.getElementById('cookieName').value = '';
    document.getElementById('cookieValue').value = '';
}


  // Load and display trackers
  loadTrackers();
  // Load and display fingerprinting attempts
  loadFingerprinting();
  // Load and display permissions
  loadPermissions();
});

// Update metrics function
async function updateMetrics() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
      const url = new URL(tab.url);
      
      // Get cookies count for current site
      chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
          document.getElementById('cookiesCount').textContent = cookies.length;
      });
      
      // Get trackers count
      chrome.storage.local.get(['trackersDetected'], (result) => {
          document.getElementById('trackersDetected').textContent = 
              result.trackersDetected || '0';
      });
  } else {
      document.getElementById('cookiesCount').textContent = '--';
      document.getElementById('trackersDetected').textContent = '--';
  }
}

// Load trackers function
async function loadTrackers() {
  const trackersList = document.getElementById('trackersList');
  chrome.storage.local.get(['detectedTrackers'], (result) => {
      const trackers = result.detectedTrackers || [];
      if (trackers.length === 0) {
          trackersList.innerHTML = '<div class="list-item">No trackers detected</div>';
          return;
      }
      
      trackersList.innerHTML = trackers.map(tracker => `
          <div class="list-item">
              <strong>Domain:</strong> ${tracker.domain}<br>
              <strong>Type:</strong> ${tracker.type}<br>
              <strong>Status:</strong> <span class="risk-low">Detected</span>
          </div>
      `).join('');
  });
}

// Load fingerprinting attempts
async function loadFingerprinting() {
  const fingerprintList = document.getElementById('fingerprintList');
  chrome.storage.local.get(['fingerprintAttempts'], (result) => {
      const attempts = result.fingerprintAttempts || [];
      if (attempts.length === 0) {
          fingerprintList.innerHTML = '<div class="list-item">No fingerprinting detected</div>';
          return;
      }
      
      fingerprintList.innerHTML = attempts.map(attempt => `
          <div class="list-item">
              <strong>Method:</strong> ${attempt.method}<br>
              <strong>Time:</strong> ${new Date(attempt.timestamp).toLocaleTimeString()}<br>
              <strong>Risk Level:</strong> <span class="risk-medium">Medium</span>
          </div>
      `).join('');
  });
}

//permissions functionality
  
  
    async function ensureContentScript(tabId) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['permissionScript.js']
          });
        } catch (error) {
          console.error('Error injecting content script:', error);
        }
      }
      
      async function loadPermissions() {
        const permissionsList = document.getElementById('permissionsList');
        permissionsList.innerHTML = '<div class="list-item">Loading permissions...</div>';
      
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab?.url) {
            permissionsList.innerHTML = '<div class="list-item">Cannot check permissions for this page.</div>';
            return;
          }
      
          if (tab?.id) {
            await ensureContentScript(tab.id);
            chrome.tabs.sendMessage(tab.id, { type: 'checkPermissions' });
          }
      
          setTimeout(() => {
            chrome.storage.local.get(['currentPermissions', 'lastChecked'], (result) => {
              console.log('Permissions:', result.currentPermissions);
              console.log('Last Checked:', result.lastChecked);
      
              const permissions = result.currentPermissions || {};
              const lastChecked = result.lastChecked || 0;
      
              if (Date.now() - lastChecked > 30000) {
                permissionsList.innerHTML = '<div class="list-item error">Permissions outdated. Refresh the page.</div>';
                return;
              }
      
              permissionsList.innerHTML = '';
  
          const permissionDisplayData = {
            geolocation: {
              name: 'Location',
              icon: '📍',
              risk: 'high',
              description: 'Access to your location'
            },
            notifications: {
              name: 'Notifications',
              icon: '🔔',
              risk: 'medium',
              description: 'Permission to send notifications'
            },
            microphone: {
              name: 'Microphone',
              icon: '🎤',
              risk: 'high',
              description: 'Access to your microphone'
            },
            camera: {
              name: 'Camera',
              icon: '📷',
              risk: 'high',
              description: 'Access to your camera'
            },
            'clipboard-read': {
              name: 'Clipboard Read',
              icon: '📋',
              risk: 'medium',
              description: 'Read from your clipboard'
            },
            'clipboard-write': {
              name: 'Clipboard Write',
              icon: '✍️',
              risk: 'medium',
              description: 'Write to your clipboard'
            },
            'persistent-storage': {
              name: 'Storage',
              icon: '💾',
              risk: 'low',
              description: 'Persistent storage access'
            }
          };
  
          // Create permission elements
          Object.entries(permissions).forEach(([permission, state]) => {
            if (permissionDisplayData[permission]) {
              const { name, icon, risk, description } = permissionDisplayData[permission];
              const permissionDiv = createPermissionElement(name, state, icon, risk, description);
              permissionsList.appendChild(permissionDiv);
            }
          });
  
          if (permissionsList.children.length === 0) {
            permissionsList.innerHTML = '<div class="list-item">No permissions detected for this site.</div>';
          }
        });
      }, 500); // Wait for permission check to complete
  
    } catch (error) {
      permissionsList.innerHTML = `<div class="list-item error">Error checking permissions: ${error.message}</div>`;
    }
  }
  

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function createPermissionElement(name, state, icon, risk, description) {
    const div = document.createElement('div');
    div.className = 'permission-item';
    
    const stateClass = getStateClass(state);
    const riskClass = getRiskClass(risk);
    
    div.innerHTML = `
      <div class="permission-header">
        <span class="permission-icon">${icon}</span>
        <div class="permission-info">
          <span class="permission-name">${name}</span>
          <span class="permission-description">${description}</span>
        </div>
        <span class="permission-state ${stateClass}">${capitalizeFirst(state)}</span>
      </div>
      <div class="permission-details">
        <span class="risk-level ${riskClass}">Risk Level: ${capitalizeFirst(risk)}</span>
        <span class="last-checked">Last checked: ${new Date().toLocaleTimeString()}</span>
      </div>
    `;
    
    return div;
  }
  
  function getStateClass(state) {
    const stateClasses = {
      'granted': 'state-granted',
      'denied': 'state-denied',
      'prompt': 'state-prompt',
      'not-supported': 'state-not-supported'
    };
    return stateClasses[state] || 'state-unknown';
  }
  
  function getRiskClass(risk) {
    return `risk-${risk}`;
  }
  
  // Add to popup.js - Update permissions periodically
  document.addEventListener('DOMContentLoaded', function() {
    // Initial load
    loadPermissions();
    
    // Refresh permissions every 5 seconds
    // setInterval(loadPermissions, 5000);
  });

  async function ensureContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['permissionScript.js']
      });
    } catch (e) {
      console.error('Failed to inject content script:', e);
    }
  }
  
// Update metrics every 5 seconds
setInterval(updateMetrics, 5000);


