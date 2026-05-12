/**
 * popup.js — Job Tracker Chrome Extension
 *
 * Responsibilities:
 *  1. On open: check chrome.storage.local for a saved JWT token.
 *  2. If no token: show "not logged in" UI with a link to the web app.
 *  3. If token exists: read any job data detected by content.js on the current tab.
 *  4. Render a save form (pre-populated if data was detected).
 *  5. On submit: POST to the backend API and report success / error.
 */

const API_BASE = 'http://localhost:5000/api';

/** Reads the JWT token saved by the web app (or a previous login). */
const getToken = () =>
  new Promise((resolve) =>
    chrome.storage.local.get('token', ({ token }) => resolve(token || null))
  );

/** Reads job data scraped by content.js on the current page. */
const getDetectedJob = () =>
  new Promise((resolve) =>
    chrome.storage.local.get('detectedJob', ({ detectedJob }) =>
      resolve(detectedJob || null)
    )
  );

/**
 * Renders the "not logged in" state.
 * Prompts the user to open the web app and log in first,
 * which will store the JWT in chrome.storage.local (Phase 6 wires this up).
 */
const renderNotLoggedIn = () => {
  document.getElementById('main-content').innerHTML = `
    <div class="not-logged-in">
      <div class="lock-icon">🔒</div>
      <p>You're not signed in.<br/>Log in from the Job Tracker web app first.</p>
      <button class="btn btn-primary" id="open-app-btn">Open Job Tracker</button>
    </div>
  `;
  document.getElementById('open-app-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/login' });
  });
};

/**
 * Renders the save-application form.
 * Pre-populates fields when content.js has detected job data on the page.
 * @param {Object|null} jobData - Scraped job info from content.js, or null.
 */
const renderSaveForm = (jobData) => {
  const detected = jobData ? 'detected' : '';
  const statusMsg = jobData
    ? '✓ Job listing detected on this page!'
    : 'No job detected. Fill in the details below.';

  document.getElementById('main-content').innerHTML = `
    <div class="status ${detected}">${statusMsg}</div>
    <form id="save-form">
      <div class="field">
        <label>Company *</label>
        <input type="text" id="company" value="${jobData?.company || ''}" placeholder="e.g. Google" required />
      </div>
      <div class="field">
        <label>Job Title *</label>
        <input type="text" id="jobTitle" value="${jobData?.jobTitle || ''}" placeholder="e.g. Frontend Engineer" required />
      </div>
      <div class="field">
        <label>Job URL</label>
        <input type="url" id="jobUrl" value="${jobData?.jobUrl || ''}" placeholder="https://…" />
      </div>
      <div class="field">
        <label>Source</label>
        <select id="source">
          <option value="LinkedIn"    ${jobData?.source === 'LinkedIn'    ? 'selected' : ''}>LinkedIn</option>
          <option value="Naukri"      ${jobData?.source === 'Naukri'      ? 'selected' : ''}>Naukri</option>
          <option value="Internshala" ${jobData?.source === 'Internshala' ? 'selected' : ''}>Internshala</option>
          <option value="Other"       ${!jobData?.source                  ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" id="save-btn">Save Application</button>
      <div id="message"></div>
    </form>
  `;

  document.getElementById('save-form').addEventListener('submit', handleSave);
};

/**
 * Submits the form data to the backend API.
 * Shows inline success / error feedback without page reload.
 * @param {SubmitEvent} e
 */
const handleSave = async (e) => {
  e.preventDefault();

  const saveBtn  = document.getElementById('save-btn');
  const msgEl    = document.getElementById('message');

  const company  = document.getElementById('company').value.trim();
  const jobTitle = document.getElementById('jobTitle').value.trim();
  const jobUrl   = document.getElementById('jobUrl').value.trim();
  const source   = document.getElementById('source').value;

  if (!company || !jobTitle) {
    msgEl.textContent = 'Company and Job Title are required.';
    msgEl.className = 'error';
    return;
  }

  saveBtn.disabled    = true;
  saveBtn.textContent = 'Saving…';
  msgEl.className     = '';

  try {
    const token = await getToken();

    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify({ company, jobTitle, jobUrl, source }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Save failed');

    msgEl.textContent   = '✓ Application saved successfully!';
    msgEl.className     = 'success';
    saveBtn.textContent = 'Saved!';
    chrome.storage.local.remove('detectedJob');
  } catch (err) {
    msgEl.textContent   = err.message || 'Error — is the backend running?';
    msgEl.className     = 'error';
    saveBtn.disabled    = false;
    saveBtn.textContent = 'Save Application';
  }
};

/** Entry point — runs once when the popup is opened. */
const init = async () => {
  const token = await getToken();
  if (!token) {
    renderNotLoggedIn();
    return;
  }

  const jobData = await getDetectedJob();
  renderSaveForm(jobData);
};

document.addEventListener('DOMContentLoaded', init);
