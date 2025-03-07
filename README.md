# 🛡️ SHEILDEYE - Privacy Inspector Chrome Extension  
**A powerful and comprehensive privacy inspection tool to monitor and protect online privacy.**  

[![Chrome](https://img.shields.io/badge/Chrome-Extension-%234285F4?logo=googlechrome)](https://chrome.google.com/webstore)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-%23F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](https://opensource.org/licenses/MIT)


---
## 🚀 Features  
### 🕵️ Tracker Detection  
✅ Detects and blocks **50+ known tracking patterns** from social media, analytics, and ads.  
✅ Monitors network requests, scripts, cookies, and storage for tracking activities.  
✅ Real-time updates on detected trackers with detailed insights.  

### 🖐️ Fingerprinting Monitoring  
🔍 Tracks fingerprinting attempts via:  
- **Navigator object access**  
- **Canvas API usage**  
- **Screen API access**  
- **WebRTC leaks & vulnerabilities**  

### 🍪 Cookie Management  
🍪 View, delete, and analyze cookies per website.  
🔎 Identify tracking cookies and potential risks.  
📊 Granular control over cookie permissions.  

### 🔐 Permission Insights  
📌 Displays and monitors website permissions:  
- Location, Camera, Microphone, Notifications, Clipboard, etc.  
🚨 Highlights risky permissions and their privacy impact.  

### 🛠️ Advanced Privacy Tools  
⚔️ Blocks trackers using **declarativeNetRequest rules**.  
🔍 Monitors **localStorage & sessionStorage** for tracking activities.  
🔗 Detects suspicious **URL parameters & inline scripts**.  

---
## ⚙️ Tech Stack  
**Core Technologies**  
- 🟡 **Manifest V3** - Latest Chrome extension architecture  
- ⚡ **JavaScript** - Advanced monitoring techniques  
- 🔵 **Chrome APIs** - `chrome.storage`, `chrome.cookies`, `chrome.declarativeNetRequest`, etc.  

**Key Components**  
📜 `TrackerScript.js` - Detects trackers via network requests and scripts.  
🔎 `FingerprintScript.js` - Monitors fingerprinting attempts & WebRTC leaks.  
🔐 `PermissionScript.js` - Analyzes and reports website permissions.  
🖥️ `Background.js` - Manages storage, updates metrics, and handles communication.  

---
## 🛠️ Installation  
1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/SHEILDEYE.git
   cd SHEILDEYE
   ```  
2. **Load the extension in Chrome**  
   - Open Chrome and navigate to `chrome://extensions/`  
   - Enable **Developer Mode**  
   - Click **Load unpacked** and select the cloned folder  
   - SHEILDEYE is now ready to use! 🎉  

---
## 🌍 How It Works  
1. **Install the Extension** - Add SHEILDEYE to Chrome.  
2. **Open the Popup** - Click the extension icon for the dashboard.  
3. **Monitor Privacy** - View trackers, fingerprinting attempts, and cookies.  
4. **Take Control** - Delete cookies, block trackers, and manage permissions.  

---
## 🤝 Contributing  
🎯 Contributions are welcome! To improve SHEILDEYE:  
1. **Fork the repository**  
2. **Create a feature branch** (`git checkout -b feature/YourFeature`)  
3. **Commit your changes** (`git commit -m 'Add new feature'`)  
4. **Push to the branch** (`git push origin feature/YourFeature`)  
5. **Open a Pull Request** 🚀  

---
## 📜 License  
Distributed under the **MIT License**. See `LICENSE` for more information.  

---
Made with ❤️ to enhance privacy by Smitesh  
🌍 Stay secure, stay private! 🔒
