const Storage = {
  setToken: (token) =>
    chrome.storage.local.set({ jt_token: token }),

  getToken: () =>
    new Promise((resolve) => {
      chrome.storage.local.get(['jt_token'], (r) => resolve(r.jt_token || null));
    }),

  removeToken: () =>
    chrome.storage.local.remove(['jt_token']),

  setUser: (user) =>
    chrome.storage.local.set({ jt_user: user }),

  getUser: () =>
    new Promise((resolve) => {
      chrome.storage.local.get(['jt_user'], (r) => resolve(r.jt_user || null));
    }),

  setApiUrl: (url) =>
    chrome.storage.local.set({ jt_api_url: url }),

  getApiUrl: () =>
    new Promise((resolve) => {
      chrome.storage.local.get(['jt_api_url'], (r) =>
        resolve(r.jt_api_url || 'https://hireatlas-api.onrender.com')
      );
    }),

  setCurrentJob: (job) =>
    chrome.storage.local.set({ jt_current_job: job }),

  getCurrentJob: () =>
    new Promise((resolve) => {
      chrome.storage.local.get(['jt_current_job'], (r) =>
        resolve(r.jt_current_job || null)
      );
    }),

  clearAll: () => chrome.storage.local.clear(),
};
