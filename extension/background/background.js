// Background service worker — manages badge state on job pages

const JOB_PAGE_PATTERNS = [
  'linkedin.com/jobs',
  'naukri.com',
  'internshala.com/jobs',
  'internshala.com/internships',
];

function isJobPage(url) {
  if (!url) return false;
  return JOB_PAGE_PATTERNS.some((p) => url.includes(p));
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  if (isJobPage(tab.url)) {
    chrome.action.setBadgeText({ text: '✓', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getActiveTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] || null });
    });
    return true; // keep channel open for async sendResponse
  }
});
