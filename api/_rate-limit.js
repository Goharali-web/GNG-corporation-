// Simple In-Memory IP Rate Limiter for Serverless Functions
const tracker = new Map();

// Cleanup stale entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, history] of tracker.entries()) {
    const validHistory = history.filter(time => now - time < 300000); // 5 mins
    if (validHistory.length === 0) {
      tracker.delete(ip);
    } else {
      tracker.set(ip, validHistory);
    }
  }
}, 600000).unref(); // unref permits the Node process to exit if needed

function rateLimit(ip, limit = 10, windowMs = 300000) {
  const now = Date.now();
  const history = tracker.get(ip) || [];
  
  // Filter history outside of target window
  const recentHistory = history.filter(time => now - time < windowMs);
  
  if (recentHistory.length >= limit) {
    return false;
  }
  
  recentHistory.push(now);
  tracker.set(ip, recentHistory);
  return true;
}

module.exports = { rateLimit };
