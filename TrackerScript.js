

class PrivacyInspector {
  constructor() {
    
    this.trackers = new Map();
    this.currentUrl = window.location.href;
    this.observedScripts = new Set();
    this.knownTrackerPatterns = [

       // Social Media Trackers
       { pattern: 'facebook.com', name: 'Facebook Tracker', type: 'Social Media' },
       { pattern: 'connect.facebook.net', name: 'Facebook Connect', type: 'Social Integration' },
       { pattern: 'facebook.net', name: 'Facebook CDN', type: 'Social Media' },
       { pattern: 'twitter.com', name: 'Twitter Tracker', type: 'Social Media' },
       { pattern: 'platform.twitter', name: 'Twitter Platform', type: 'Social Integration' },
       { pattern: 'syndication.twitter', name: 'Twitter Syndication', type: 'Social Media' },
       { pattern: 'linkedin.com', name: 'LinkedIn Tracker', type: 'Social Media' },
       { pattern: 'platform.linkedin', name: 'LinkedIn Platform', type: 'Professional Network' },
       { pattern: 'instagram.com', name: 'Instagram Tracker', type: 'Social Media' },
       { pattern: 'pinterest.com', name: 'Pinterest Tracker', type: 'Social Media' },
       
       // Analytics Services
       { pattern: 'google-analytics', name: 'Google Analytics', type: 'Analytics' },
       { pattern: 'analytics.google', name: 'Google Analytics', type: 'Analytics' },
       { pattern: 'googletagmanager', name: 'Google Tag Manager', type: 'Tag Management' },
       { pattern: 'gtag', name: 'Google Tag', type: 'Analytics' },
       { pattern: 'mixpanel', name: 'Mixpanel', type: 'Analytics' },
       { pattern: 'segment.io', name: 'Segment', type: 'Analytics' },
       { pattern: 'segment.com', name: 'Segment', type: 'Analytics' },
       { pattern: 'hotjar', name: 'Hotjar', type: 'User Behavior' },
       { pattern: 'clarity.ms', name: 'Microsoft Clarity', type: 'User Behavior' },
       
       // Advertising Networks
       { pattern: 'doubleclick', name: 'DoubleClick', type: 'Advertising' },
       { pattern: 'googlesyndication', name: 'Google Ads', type: 'Advertising' },
       { pattern: 'adnxs.com', name: 'AppNexus', type: 'Advertising' },
       { pattern: 'criteo', name: 'Criteo', type: 'Advertising' },
       { pattern: 'outbrain', name: 'Outbrain', type: 'Advertising' },
       { pattern: 'taboola', name: 'Taboola', type: 'Advertising' },
       { pattern: 'amazon-adsystem', name: 'Amazon Ads', type: 'Advertising' },
       
       // Marketing & CRM
       { pattern: 'marketo', name: 'Marketo', type: 'Marketing' },
       { pattern: 'hubspot', name: 'HubSpot', type: 'Marketing' },
       { pattern: 'salesforce', name: 'Salesforce', type: 'CRM' },
       { pattern: 'pardot', name: 'Pardot', type: 'Marketing' },
       { pattern: 'mailchimp', name: 'Mailchimp', type: 'Marketing' },
       
       // CDNs & Third-party Services (that might track)
       { pattern: 'cloudfront.net', name: 'CloudFront', type: 'CDN' },
       { pattern: 'cloudflare', name: 'Cloudflare', type: 'CDN' },
       { pattern: 'jsdelivr', name: 'JSDelivr', type: 'CDN' },
       { pattern: 'unpkg.com', name: 'UNPKG', type: 'CDN' },
       
       // Customer Support & Chat
       { pattern: 'intercom', name: 'Intercom', type: 'Customer Support' },
       { pattern: 'zendesk', name: 'Zendesk', type: 'Customer Support' },
       { pattern: 'drift.com', name: 'Drift', type: 'Customer Support' },
       { pattern: 'olark', name: 'Olark', type: 'Customer Support' },
       
       // Generic Tracking Patterns
       { pattern: 'analytics', name: 'Analytics Service', type: 'Analytics' },
       { pattern: 'tracking', name: 'Tracking Service', type: 'Tracking' },
       { pattern: 'telemetry', name: 'Telemetry Service', type: 'Tracking' },
       { pattern: 'metric', name: 'Metrics Service', type: 'Analytics' },
       { pattern: 'pixel', name: 'Tracking Pixel', type: 'Tracking' },
       { pattern: 'beacon', name: 'Web Beacon', type: 'Tracking' }
    ];
     // Send initial clear message
     chrome.runtime.sendMessage({
      type: 'trackersUpdate',
      data: []
    });
    
    this.setupAllMonitors();
  }



  setupAllMonitors() {
    this.setupNetworkMonitor();
    this.setupScriptMonitor();
    this.setupStorageMonitor();
    this.setupAPIMonitor();
    this.setupBeaconMonitor();
    this.setupCookieMonitor();
    this.setupUrlMonitor();  // monitoring URL changes
  }

  setupUrlMonitor() {
    // Create a MutationObserver to watch for URL changes
    const observer = new MutationObserver(() => {
      if (window.location.href !== this.currentUrl) {
        this.handleUrlChange(window.location.href);
      }
    });

    // Observe changes to the URL by watching the document title
    observer.observe(document.querySelector('title'), {
      subtree: true,
      characterData: true,
      childList: true
    });

    // Also watch for popstate events
    window.addEventListener('popstate', () => {
      if (window.location.href !== this.currentUrl) {
        this.handleUrlChange(window.location.href);
      }
    });
  }

  handleUrlChange(newUrl) {
    console.log(`URL changed from ${this.currentUrl} to ${newUrl}`);
    this.currentUrl = newUrl;
    
    // Clear all tracking data
    this.trackers.clear();
    this.observedScripts.clear();
    
    // Send empty trackers array to reset the display
    chrome.runtime.sendMessage({
      type: 'trackersUpdate',
      data: []
    });
    
    // Reset the background script's tracker count
    chrome.runtime.sendMessage({
      type: 'resetTrackers'
    });

    
  }

  setupNetworkMonitor() {
    // Monitor all network requests
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.initiatorType && ['script', 'img', 'xmlhttprequest', 'fetch'].includes(entry.initiatorType)) {
          this.analyzeRequest(entry.name, entry.initiatorType);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });

    // Intercept XHR
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      this.addEventListener('load', () => {
        this._url = args[1];
        this._method = args[0];
        inspector.analyzeRequest(this._url, 'xhr');
      });
      return originalXHR.apply(this, args);
    };

    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      inspector.analyzeRequest(url, 'fetch');
      return originalFetch.apply(this, arguments);
    };
  }

  setupScriptMonitor() {
    // Monitor dynamic script additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'SCRIPT') {
            this.analyzeScript(node);
          }
          if (node.tagName === 'IFRAME') {
            this.analyzeRequest(node.src, 'iframe');
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Analyze existing scripts
    document.querySelectorAll('script').forEach(script => this.analyzeScript(script));
  }

  setupStorageMonitor() {
    // Monitor localStorage
    const storageHandler = {
      set: (target, prop, value) => {
        this.analyzeStorageOperation(prop, value);
        return Reflect.set(target, prop, value);
      }
    };

    if (window.localStorage) {
      window.localStorage = new Proxy(window.localStorage, storageHandler);
    }
  }

  setupAPIMonitor() {
    // Monitor sensitive browser APIs
    const apis = [
      { obj: navigator, props: ['userAgent', 'platform', 'language'] },
      { obj: screen, props: ['width', 'height', 'colorDepth'] },
      { obj: document, props: ['referrer'] }
    ];

    apis.forEach(({ obj, props }) => {
      props.forEach(prop => {
        if (obj && obj[prop]) {
          const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
          if (descriptor && descriptor.get) {
            Object.defineProperty(obj, prop, {
              get: () => {
                this.reportTracker({
                  domain: window.location.hostname,
                  type: 'API Access',
                  name: `${prop} Access`,
                  url: window.location.href
                });
                return descriptor.get.call(obj);
              }
            });
          }
        }
      });
    });
  }

  setupBeaconMonitor() {
    // Monitor navigator.sendBeacon
    if (navigator.sendBeacon) {
      const original = navigator.sendBeacon;
      navigator.sendBeacon = (url, data) => {
        this.analyzeRequest(url, 'beacon');
        return original.apply(navigator, arguments);
      };
    }
  }

  setupCookieMonitor() {
    // Monitor cookie changes
    const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', {
      get: () => originalCookie.get.call(document),
      set: (value) => {
        this.analyzeCookie(value);
        return originalCookie.set.call(document, value);
      }
    });
  }

  analyzeRequest(url, type) {
    if (!url || url === 'about:blank') return;
    
    try {
      const urlObj = new URL(url);
      this.knownTrackerPatterns.forEach(pattern => {
        if (urlObj.href.toLowerCase().includes(pattern.pattern)) {
          this.reportTracker({
            domain: urlObj.hostname,
            type: pattern.type,
            name: pattern.name,
            url: urlObj.href,
            method: type
          });
        }
      });

      // Check for tracking parameters
      const suspiciousParams = ['utm_', 'ref', 'affiliate', 'tracking', 'campaign'];
      urlObj.searchParams.forEach((value, key) => {
        if (suspiciousParams.some(param => key.toLowerCase().includes(param))) {
          this.reportTracker({
            domain: urlObj.hostname,
            type: 'URL Tracking',
            name: 'URL Parameter Tracker',
            url: urlObj.href,
            method: 'parameter'
          });
        }
      });
    } catch (e) {
      // Invalid URL, skip
    }
  }

  analyzeScript(scriptNode) {
    if (scriptNode.src && !this.observedScripts.has(scriptNode.src)) {
      this.observedScripts.add(scriptNode.src);
      this.analyzeRequest(scriptNode.src, 'script');
    }

    // Analyze inline scripts
    if (scriptNode.text) {
      const trackingKeywords = ['tracking', 'analytics', 'gtag', 'fbq', 'pixel'];
      if (trackingKeywords.some(keyword => scriptNode.text.toLowerCase().includes(keyword))) {
        this.reportTracker({
          domain: window.location.hostname,
          type: 'Inline Script',
          name: 'Inline Tracker',
          url: window.location.href,
          method: 'inline'
        });
      }
    }
  }

  analyzeCookie(cookie) {
    const trackingCookies = ['_ga', '_gid', '_fbp', '__utma', 'sid', 'uid'];
    if (trackingCookies.some(tracker => cookie.includes(tracker))) {
      this.reportTracker({
        domain: window.location.hostname,
        type: 'Cookie Tracking',
        name: 'Tracking Cookie',
        url: window.location.href,
        method: 'cookie'
      });
    }
  }

  analyzeStorageOperation(key, value) {
    const trackingKeys = ['tracking', 'analytics', 'uid', 'userid', 'session'];
    if (trackingKeys.some(tracker => key.toLowerCase().includes(tracker))) {
      this.reportTracker({
        domain: window.location.hostname,
        type: 'Storage Tracking',
        name: 'Local Storage Tracker',
        url: window.location.href,
        method: 'storage'
      });
    }
  }

  reportTracker(trackerInfo) {
    // Only track if it's for the current URL's domain
    const currentDomain = new URL(this.currentUrl).hostname;
    const trackerDomain = trackerInfo.domain;
    
    // Create a unique key that includes the URL to ensure proper tracking per site
    const key = `${this.currentUrl}-${trackerInfo.domain}-${trackerInfo.name}-${trackerInfo.method}`;
    
    if (!this.trackers.has(key) && currentDomain === trackerDomain) {
      this.trackers.set(key, {
        ...trackerInfo,
        timestamp: Date.now()
      });
      
      chrome.runtime.sendMessage({
        type: 'trackerDetected',
        data: {
          ...trackerInfo,
          timestamp: Date.now()
        }
      });
    }
  }

  startInspection() {
    // Reduce update frequency to avoid excessive messages
    setInterval(() => {
      const currentDomain = new URL(this.currentUrl).hostname;
      
      // Filter trackers to only include those from current domain
      const trackersArray = Array.from(this.trackers.values())
        .filter(tracker => tracker.domain === currentDomain);
      
      if (trackersArray.length > 0) {
        chrome.runtime.sendMessage({
          type: 'trackersUpdate',
          data: trackersArray
        });
      }
    }, 2000); // Increased to 2 seconds for better performance
  }
}

// Initialize and start the inspector
const inspector = new PrivacyInspector();
inspector.startInspection();     



