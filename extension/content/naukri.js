// Content script — runs on naukri.com pages

function firstText(...selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const t  = el?.textContent?.trim();
    if (t) return t;
  }
  return '';
}

function scrapeNaukriJob() {
  try {
    const role = firstText(
      '.jd-header-title',
      '[class*="jd-header-title"]',
      'h1.jobTitle',
      'h1.title',
      '[class*="jd-header"] h1'
    );

    const company = firstText(
      '.jd-header-comp-name a',
      '.jd-header-comp-name',
      '[class*="comp-name"] a',
      '[class*="comp-name"]',
      '.org-name'
    );

    const locationRaw = firstText(
      '.location-container',
      '[class*="location-container"]',
      '[class*="location"] span',
      '[class*="location"]'
    );
    const location = locationRaw.split('\n')[0].trim();

    const salary = firstText(
      '.salary-container',
      '[class*="salary-container"]',
      '[class*="salary"] span',
      '[class*="salary"]'
    );

    return {
      role,
      company,
      location,
      salary,
      jobUrl: window.location.href.split('?')[0],
      source: 'Naukri',
    };
  } catch (err) {
    console.error('[Job Tracker] Naukri scrape error:', err);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    sendResponse({ success: true, data: scrapeNaukriJob() });
  }
  return true;
});

(function cacheOnLoad() {
  const data = scrapeNaukriJob();
  if (data?.company || data?.role) {
    chrome.storage.local.set({ jt_current_job: data });
  }
})();
