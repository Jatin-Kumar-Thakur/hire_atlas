// Content script — runs on internshala.com/jobs/* and /internships/* pages

function firstText(...selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const t  = el?.textContent?.trim();
    if (t) return t;
  }
  return '';
}

function scrapeInternshalaJob() {
  try {
    const role = firstText(
      '.job-internship-name',
      'h1.heading_4_5',
      '.profile',
      '.internship_meta h1',
      '.job_detail_head h1',
      'h1'
    );

    const company = firstText(
      '.company-name a',
      '.company-name',
      '#company-name',
      '[class*="company"] a',
      '[class*="company-name"]'
    );

    const location = firstText(
      '.location_link',
      '[class*="location_link"]',
      '[class*="location"] a',
      '[class*="location"]'
    );

    const salary = firstText(
      '.stipend',
      '[class*="stipend"]',
      '[class*="salary"]'
    );

    return {
      role,
      company,
      location,
      salary,
      jobUrl: window.location.href.split('?')[0],
      source: 'Internshala',
    };
  } catch (err) {
    console.error('[Job Tracker] Internshala scrape error:', err);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    sendResponse({ success: true, data: scrapeInternshalaJob() });
  }
  return true;
});

(function cacheOnLoad() {
  const data = scrapeInternshalaJob();
  if (data?.company || data?.role) {
    chrome.storage.local.set({ jt_current_job: data });
  }
})();
