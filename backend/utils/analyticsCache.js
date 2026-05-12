// Per-user in-memory analytics cache with 5-minute TTL
const _cache = {};

const getCached = (userId) => {
  const entry = _cache[userId];
  if (!entry) return null;
  if (Date.now() - entry.ts > 300_000) { delete _cache[userId]; return null; }
  return entry.data;
};

const setCache = (userId, data) => {
  _cache[userId] = { data, ts: Date.now() };
};

const invalidateCache = (userId) => {
  delete _cache[userId];
};

module.exports = { getCached, setCache, invalidateCache };
