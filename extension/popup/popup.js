// popup.js — depends on Storage and API globals loaded before this script

// ─── Screen management ────────────────────────────────────────────────────────

const SCREENS = {
  auth:         document.getElementById('authScreen'),
  notJob:       document.getElementById('notJobScreen'),
  alreadySaved: document.getElementById('alreadySavedScreen'),
  main:         document.getElementById('mainScreen'),
  success:      document.getElementById('successScreen'),
};

function showScreen(name) {
  Object.values(SCREENS).forEach((s) => (s.style.display = 'none'));
  if (SCREENS[name]) SCREENS[name].style.display = 'block';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isJobPage(url) {
  if (!url) return false;
  return (
    url.includes('linkedin.com/jobs') ||
    url.includes('naukri.com') ||
    url.includes('internshala.com/jobs') ||
    url.includes('internshala.com/internships')
  );
}

function getTrackerUrl(apiUrl) {
  // Convert backend port to frontend port for local dev;
  // fall back to replacing common patterns
  try {
    const u = new URL(apiUrl);
    u.port = '5173';
    u.pathname = '/applications';
    return u.toString();
  } catch {
    return apiUrl.replace(':5000', ':5173') + '/applications';
  }
}

function fillForm(jobData) {
  if (!jobData) return;
  document.getElementById('company').value  = jobData.company  || '';
  document.getElementById('role').value     = jobData.role     || '';
  document.getElementById('location').value = jobData.location || '';
  document.getElementById('notes').value    = '';

  if (jobData.source) {
    const sel = document.getElementById('source');
    for (const opt of sel.options) {
      if (opt.value === jobData.source) { sel.value = jobData.source; break; }
    }
  }

  const badge = document.getElementById('sourceName');
  if (badge) badge.textContent = jobData.source || 'Job';
}

// ─── Cached job data (shared across handlers) ─────────────────────────────────
let _cachedJobData = null;

// ─── Initialisation ───────────────────────────────────────────────────────────

async function init() {
  const [token, apiUrl] = await Promise.all([
    Storage.getToken(),
    Storage.getApiUrl(),
  ]);

  document.getElementById('apiUrl').value = apiUrl || 'http://localhost:5000';

  if (!token) {
    showScreen('auth');
    return;
  }

  // Verify token still valid
  try {
    const result = await API.verifyToken(token, apiUrl);
    if (!result.success) {
      await Storage.removeToken();
      showScreen('auth');
      return;
    }
  } catch {
    // Network error — token may still be valid, continue
    // (avoids locking users out when backend is temporarily unreachable)
  }

  document.getElementById('logoutBtn').style.display = 'block';

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !isJobPage(tab.url)) {
    showScreen('notJob');
    return;
  }

  // Try live scrape first, fall back to cached storage value
  let jobData = null;
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeJob' });
    jobData = response?.data || null;
  } catch {
    // Content script not yet injected (e.g. page loaded before extension was enabled)
    jobData = await Storage.getCurrentJob();
  }

  _cachedJobData = jobData;

  // Duplicate check (only when we have a URL)
  if (jobData?.jobUrl) {
    try {
      const isDuplicate = await API.checkDuplicate(token, apiUrl, jobData.jobUrl);
      if (isDuplicate) {
        showScreen('alreadySaved');
        return;
      }
    } catch {
      // If duplicate check fails, proceed to main form
    }
  }

  showScreen('main');
  fillForm(jobData);
}

// ─── Login ────────────────────────────────────────────────────────────────────

document.getElementById('loginBtn').addEventListener('click', async () => {
  const apiUrl   = document.getElementById('apiUrl').value.trim() || 'http://localhost:5000';
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('authError');
  const btn      = document.getElementById('loginBtn');

  errorEl.textContent = '';
  if (!email || !password) {
    errorEl.textContent = 'Email and password are required';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Logging in…';

  try {
    const data = await API.login(apiUrl, email, password);
    if (data.success) {
      await Storage.setToken(data.token);
      await Storage.setUser(data.user);
      await Storage.setApiUrl(apiUrl);
      document.getElementById('password').value = '';
      await init();
    } else {
      errorEl.textContent = data.message || 'Login failed';
    }
  } catch {
    errorEl.textContent = 'Cannot reach server. Check the API URL.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Login';
  }
});

// ─── Save application ─────────────────────────────────────────────────────────

document.getElementById('saveBtn').addEventListener('click', async () => {
  const [token, apiUrl] = await Promise.all([Storage.getToken(), Storage.getApiUrl()]);
  const btn     = document.getElementById('saveBtn');
  const errorEl = document.getElementById('saveError');

  const company  = document.getElementById('company').value.trim();
  const role     = document.getElementById('role').value.trim();

  errorEl.textContent = '';
  if (!company || !role) {
    errorEl.textContent = 'Company and Role are required';
    return;
  }

  btn.disabled    = true;
  btn.textContent = '⏳ Saving…';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const payload = {
    company,
    role,
    source:   document.getElementById('source').value,
    status:   document.getElementById('status').value,
    location: document.getElementById('location').value.trim(),
    notes:    document.getElementById('notes').value.trim(),
    jobUrl:   tab?.url?.split('?')[0] || '',
    addedVia: 'extension',
  };

  try {
    const result = await API.saveApplication(token, apiUrl, payload);
    if (result.success) {
      document.getElementById('successMessage').textContent =
        `${company} → ${role}`;
      showScreen('success');
    } else {
      errorEl.textContent = result.message || 'Failed to save. Try again.';
    }
  } catch {
    errorEl.textContent = 'Network error. Is the backend running?';
  } finally {
    btn.disabled    = false;
    btn.textContent = '💾 Save to Tracker';
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await Storage.clearAll();
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('apiUrl').value = 'http://localhost:5000';
  showScreen('auth');
});

// ─── View in Tracker ──────────────────────────────────────────────────────────

async function openTracker() {
  const apiUrl = await Storage.getApiUrl();
  chrome.tabs.create({ url: getTrackerUrl(apiUrl) });
}

document.getElementById('viewApplicationBtn').addEventListener('click', openTracker);
document.getElementById('viewTrackerBtn').addEventListener('click', openTracker);

// ─── Save anyway (override duplicate warning) ─────────────────────────────────

document.getElementById('saveAnywayBtn').addEventListener('click', () => {
  showScreen('main');
  fillForm(_cachedJobData);
});

// ─── Save another (clear form after success) ──────────────────────────────────

document.getElementById('saveAnotherBtn').addEventListener('click', () => {
  ['company', 'role', 'location', 'notes'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  showScreen('main');
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

init();
