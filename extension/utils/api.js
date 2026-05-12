const API = {
  verifyToken: async (token, apiUrl) => {
    const res = await fetch(`${apiUrl}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  login: async (apiUrl, email, password) => {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  saveApplication: async (token, apiUrl, data) => {
    const res = await fetch(`${apiUrl}/api/applications/quick-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  checkDuplicate: async (token, apiUrl, jobUrl) => {
    const params = new URLSearchParams({ search: jobUrl, limit: 1 });
    const res = await fetch(`${apiUrl}/api/applications?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return (data.data?.applications?.length ?? 0) > 0;
  },
};
