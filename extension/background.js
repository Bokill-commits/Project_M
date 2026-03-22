// background.js

const notifiedUrls = new Set();
const NOTIFICATION_COOLDOWN = 60 * 1000;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NEW_SCAN_RESULT" && message.payload.verdict === "MALICIOUS") {
    const url = message.payload.url;
    
    if (notifiedUrls.has(url)) {
      console.log("[Notice] 중복된 URL 알림 건너뜀:", url);
      return;
    }

    notifiedUrls.add(url);
    setTimeout(() => {
      notifiedUrls.delete(url);
    }, NOTIFICATION_COOLDOWN);

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon128.png",
      title: "🚨 보안 경고: 악성 코드 탐지",
      message: `의심스러운 활동이 감지되었습니다.\nURL: ${url.substring(0, 50)}...`,
      priority: 2
    });
  }
});
