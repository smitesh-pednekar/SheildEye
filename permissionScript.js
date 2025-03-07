class PermissionDetector {
    constructor() {
      this.checkAndReportPermissions();
    }
  
    async checkAndReportPermissions() {
      const permissions = {};
      
      // Check Notifications
      if ('Notification' in window) {
        permissions.notifications = Notification.permission;
      }
  
      // Check Geolocation
      try {
        const geolocation = await navigator.permissions.query({ name: 'geolocation' });
        permissions.geolocation = geolocation.state;
      } catch (e) {
        permissions.geolocation = 'not-supported';
      }
  
      // Check Camera and Microphone
      if (navigator.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const audioDevices = devices.filter(device => device.kind === 'audioinput');
  
          // If we have device labels, it means permission was granted
          permissions.camera = videoDevices.some(device => device.label) ? 'granted' : 'prompt';
          permissions.microphone = audioDevices.some(device => device.label) ? 'granted' : 'prompt';
        } catch (e) {
          permissions.camera = 'denied';
          permissions.microphone = 'denied';
        }
      }
  
      // Check Clipboard
      if (navigator.clipboard) {
        try {
          const clipboardRead = await navigator.permissions.query({ name: 'clipboard-read' });
          const clipboardWrite = await navigator.permissions.query({ name: 'clipboard-write' });
          permissions['clipboard-read'] = clipboardRead.state;
          permissions['clipboard-write'] = clipboardWrite.state;
        } catch (e) {
          permissions['clipboard-read'] = 'not-supported';
          permissions['clipboard-write'] = 'not-supported';
        }
      }
  
      // Check Storage Permission
      if (navigator.storage && navigator.storage.persist) {
        try {
          const isPersisted = await navigator.storage.persist();
          permissions['persistent-storage'] = isPersisted ? 'granted' : 'denied';
        } catch (e) {
          permissions['persistent-storage'] = 'not-supported';
        }
      }
  
      // Report permissions to background script
      chrome.runtime.sendMessage({
        type: 'permissionStatus',
        data: permissions
      });
    }
  }
  
  // Initialize PermissionDetector
  window.permissionDetector = new PermissionDetector();
  
  // Listen for permission check requests
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'checkPermissions') {
      window.permissionDetector.checkAndReportPermissions();
    }
  });