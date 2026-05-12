/**
 * content.js — Job Tracker Chrome Extension
 *
 * Runs automatically on matched job portal pages (see manifest.json content_scripts).
 * Detects job listing metadata from the page DOM and stores it in chrome.storage.local
 * so popup.js can pre-populate the save form when the user clicks the extension icon.
 *
 * Each portal uses different DOM selectors; this file owns portal-specific extraction.
 * If a portal updates its layout, update only the relevant detect*() function.
 *
 * Detection is best-effort — missing fields are returned as empty strings,
 * and the popup allows manual override before saving.
 */

/**
 * Extracts the first non-empty text content from a list of CSS selectors.
 * @param {...string} selectors
 * @returns {string}
 */
const firstText = (...selectors) => {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return '';
};

/**
 * Detects job data on LinkedIn job description pages.
 * Covers both the new unified card layout and the legacy topcard layout.
 * @returns {{ company, jobTitle, jobUrl, source } | null}
 */
const detectLinkedIn = () => {
  const jobTitle = firstText(
    '.job-details-jobs-unified-top-card__job-title h1',
    '.job-details-jobs-unified-top-card__job-title',
    'h1.topcard__title'
  );
  const company = firstText(
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    'a.topcard__org-name-link',
    '.topcard__flavor'
  );

  if (!jobTitle && !company) return null;

  return { jobTitle, company, jobUrl: window.location.href, source: 'LinkedIn' };
};

/**
 * Detects job data on Naukri.com job description pages.
 * @returns {{ company, jobTitle, jobUrl, source } | null}
 */
const detectNaukri = () => {
  const jobTitle = firstText(
    '.jd-header-title',
    'h1.jobTitle',
    '[class*="jd-header"] h1'
  );
  const company = firstText(
    '.jd-header-comp-name a',
    '.jd-header-comp-name',
    '.org-name',
    '[class*="comp-name"]'
  );

  if (!jobTitle && !company) return null;

  return { jobTitle, company, jobUrl: window.location.href, source: 'Naukri' };
};

/**
 * Detects job/internship data on Internshala listing pages.
 * @returns {{ company, jobTitle, jobUrl, source } | null}
 */
const detectInternshala = () => {
  const jobTitle = firstText(
    '.profile',
    'h1.heading_4_5',
    '.internship_meta h1',
    '.job_detail_head h1'
  );
  const company = firstText(
    '.company_name a',
    '.company_name',
    '.company-name',
    '[class*="company"] a'
  );

  if (!jobTitle && !company) return null;

  return { jobTitle, company, jobUrl: window.location.href, source: 'Internshala' };
};

/**
 * Dispatches to the correct portal detector based on the current hostname.
 * @returns {{ company, jobTitle, jobUrl, source } | null}
 */
const detectJobData = () => {
  const host = window.location.hostname;

  if (host.includes('linkedin.com'))    return detectLinkedIn();
  if (host.includes('naukri.com'))      return detectNaukri();
  if (host.includes('internshala.com')) return detectInternshala();

  return null;
};

// Run detection and persist the result; clear stale data when no listing is found.
const jobData = detectJobData();

if (jobData) {
  chrome.storage.local.set({ detectedJob: jobData });
  console.log('[Job Tracker] Detected:', jobData);
} else {
  chrome.storage.local.remove('detectedJob');
}
