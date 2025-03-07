// Function to monitor fingerprinting attempts
function monitorFingerprinting() {
    // Detect navigator object access
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
        get: function() {
            const attempt = {
                method: 'navigator Object Access',
                timestamp: Date.now()
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalNavigator;
        }
    });

    // Detect Canvas API usage
    const originalCanvas = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
        const attempt = {
            method: 'Canvas API Usage',
            timestamp: Date.now()
        };
        chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
        return originalCanvas.apply(this, arguments);
    };

    // Detect Screen API usage
    const originalScreen = window.screen;
    Object.defineProperty(window, 'screen', {
        get: function() {
            const attempt = {
                method: 'Screen API Access',
                timestamp: Date.now()
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalScreen;
        }
    });

    // Monitor MediaDevices API
    if (navigator.mediaDevices) {
        // Monitor getUserMedia
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
        navigator.mediaDevices.getUserMedia = function(constraints) {
            const attempt = {
                method: 'WebRTC getUserMedia',
                timestamp: Date.now(),
                details: `Requested: ${JSON.stringify(constraints)}`,
                category: 'Media Access'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalGetUserMedia.apply(this, arguments);
        };

        // Monitor getDisplayMedia (screen capture)
        if (navigator.mediaDevices.getDisplayMedia) {
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
            navigator.mediaDevices.getDisplayMedia = function(constraints) {
                const attempt = {
                    method: 'WebRTC getDisplayMedia',
                    timestamp: Date.now(),
                    details: 'Screen Capture Attempt',
                    category: 'Screen Capture'
                };
                chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
                return originalGetDisplayMedia.apply(this, arguments);
            };
        }

        // Monitor enumerateDevices
        const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
        navigator.mediaDevices.enumerateDevices = function() {
            const attempt = {
                method: 'WebRTC enumerateDevices',
                timestamp: Date.now(),
                details: 'Device Enumeration Attempt',
                category: 'Device Discovery'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalEnumerateDevices.apply(this, arguments);
        };

        // Monitor devicechange event
        navigator.mediaDevices.addEventListener('devicechange', () => {
            const attempt = {
                method: 'WebRTC devicechange',
                timestamp: Date.now(),
                details: 'Device Change Detection',
                category: 'Device Discovery'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
        });
    }

    // Monitor RTCPeerConnection
    if (window.RTCPeerConnection || window.webkitRTCPeerConnection) {
        const RTCPeerConnectionClass = window.RTCPeerConnection || window.webkitRTCPeerConnection;
        
        // Monitor createOffer
        const originalCreateOffer = RTCPeerConnectionClass.prototype.createOffer;
        RTCPeerConnectionClass.prototype.createOffer = function() {
            const attempt = {
                method: 'WebRTC createOffer',
                timestamp: Date.now(),
                details: 'Potential IP address leak attempt',
                category: 'Connection'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalCreateOffer.apply(this, arguments);
        };

        // Monitor createDataChannel
        const originalCreateDataChannel = RTCPeerConnectionClass.prototype.createDataChannel;
        RTCPeerConnectionClass.prototype.createDataChannel = function() {
            const attempt = {
                method: 'WebRTC createDataChannel',
                timestamp: Date.now(),
                details: 'Potential network configuration detection',
                category: 'Data Channel'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalCreateDataChannel.apply(this, arguments);
        };

        // Monitor getStats
        const originalGetStats = RTCPeerConnectionClass.prototype.getStats;
        RTCPeerConnectionClass.prototype.getStats = function() {
            const attempt = {
                method: 'WebRTC getStats',
                timestamp: Date.now(),
                details: 'Potential network statistics gathering',
                category: 'Statistics'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalGetStats.apply(this, arguments);
        };

        // Monitor addTrack
        const originalAddTrack = RTCPeerConnectionClass.prototype.addTrack;
        RTCPeerConnectionClass.prototype.addTrack = function() {
            const attempt = {
                method: 'WebRTC addTrack',
                timestamp: Date.now(),
                details: 'Media track addition attempt',
                category: 'Media'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
            return originalAddTrack.apply(this, arguments);
        };

        // Monitor onicecandidate
        const originalSetOnIceCandidate = Object.getOwnPropertyDescriptor(RTCPeerConnectionClass.prototype, 'onicecandidate');
        Object.defineProperty(RTCPeerConnectionClass.prototype, 'onicecandidate', {
            set: function(cb) {
                const attempt = {
                    method: 'WebRTC ICE Candidate',
                    timestamp: Date.now(),
                    details: 'ICE candidate gathering attempt',
                    category: 'Network Discovery'
                };
                chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
                return originalSetOnIceCandidate.set.call(this, cb);
            },
            get: function() {
                return originalSetOnIceCandidate.get.call(this);
            }
        });
    }
}

// Initialize monitoring
monitorFingerprinting();

// Helper function to detect WebRTC leaks
function detectWebRTCLeaks() {
    const pc = new (window.RTCPeerConnection || window.webkitRTCPeerConnection)();
    
    pc.onicecandidate = (e) => {
        if (e.candidate) {
            const attempt = {
                method: 'WebRTC IP Leak',
                timestamp: Date.now(),
                details: `Detected IP candidate: ${e.candidate.candidate}`,
                category: 'Privacy Leak'
            };
            chrome.runtime.sendMessage({ type: 'fingerprintDetected', data: attempt });
        }
    };
    
    // Create empty data channel to trigger candidate gathering
    pc.createDataChannel('');
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => console.error(err));
}

// Run leak detection periodically
setInterval(detectWebRTCLeaks, 30000);// Check every 30 seconds