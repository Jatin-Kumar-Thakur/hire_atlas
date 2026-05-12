// Content script — runs on linkedin.com/jobs/* pages

function firstText(...selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const t  = el?.textContent?.trim();
    if (t) return t;
  }
  return '';
}

function scrapeLinkedInJob() {
  try {
    const role = firstText(
      '.job-details-jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title h1',
      'h1.topcard__title',
      '.job-details-jobs-unified-top-card__job-title',
      '[data-test-id="job-title"]'
    );

    const company = firstText(
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name a',
      '.topcard__org-name-link',
      '.job-details-jobs-unified-top-card__company-name',
      '.topcard__flavor'
    );

    const location = firstText(
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet',
      '.topcard__flavor--bullet'
    );

    return {
      role,
      company,
      location,
      jobUrl: window.location.href.split('?')[0],
      source: 'LinkedIn',
    };
  } catch (err) {
    console.error('[Job Tracker] LinkedIn scrape error:', err);
    return null;
  }
}

// Respond to popup's scrapeJob message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    sendResponse({ success: true, data: scrapeLinkedInJob() });
  }
  return true;
});

// Cache immediately so popup can read even before message exchange
(function cacheOnLoad() {
  const data = scrapeLinkedInJob();
  if (data?.company || data?.role) {
    chrome.storage.local.set({ jt_current_job: data });
  }
})();
