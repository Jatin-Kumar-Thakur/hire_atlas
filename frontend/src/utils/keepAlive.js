export const startKeepAlive = (apiUrl) => {
  if (!apiUrl) return;
  setInterval(async () => {
    try {
      await fetch(`${apiUrl}/api/health`);
    } catch (_) {}
  }, 14 * 60 * 1000);
};
